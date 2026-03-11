import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from 'src/platform/prisma/prisma.service';
import { parseCv } from './utils/cv-parser';
import { ScreeningRecommendation } from '@repo/database';

const recommendationMap = {
  SHORTLIST: ScreeningRecommendation.STRONG_RECOMMEND,
  REVIEW: ScreeningRecommendation.RECOMMEND,
  REJECT: ScreeningRecommendation.REJECT,
};

@Injectable()
export class BrainService {
  private readonly logger = new Logger(BrainService.name);
  private readonly ragUrl =
    process.env.RAG_SERVICE_URL || 'http://localhost:3005';

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  /*
  DOCUMENT INGESTION
  */

  async processAndIngest(fileBuffer: Buffer, fileName: string, module: string) {
    try {
      const extractedText = await parseCv(fileBuffer);

      const response = await firstValueFrom(
        this.httpService.post(`${this.ragUrl}/rag/ingest-text`, {
          text: extractedText,
          source: fileName,
          metadata: { module },
        }),
      );

      this.logger.log(`Document ${fileName} ingested`);

      return {
        text: extractedText,
        vectorData: response.data,
      };
    } catch (error) {
      this.logger.error(`Ingestion failed: ${error.message}`);
      throw new BadRequestException('Failed to process document');
    }
  }

  /*
  CV UPLOAD + PARSE
  */

  async processCvUpload(
    fileBuffer: Buffer,
    applicantId: string,
    jobId: string,
    keycloakId: string,
  ) {
    const extractedText = await parseCv(fileBuffer);

    this.logger.log(
      `CV parsed for candidate ${applicantId}. Starting auto-score...`,
    );

    /*
    in the future I will add:
    Store fileUrl in CandidateDocument
    */

    await this.prisma.applicant.update({
      where: { id: applicantId },
      data: { coverLetter: extractedText },
    });

    try {
      const aiResult = await this.runCvAnalysis(applicantId, jobId, keycloakId);

      return {
        applicantId,
        score: aiResult.score,
        recommendation: aiResult.recommendation,
        status: 'Success: CV Uploaded and AI Screened',
      };
    } catch (aiError) {
      this.logger.error(
        `Auto-screening failed for ${applicantId}: ${aiError.message}`,
      );
      return {
        applicantId,
        cvText: extractedText,
        status:
          'Warning: CV Uploaded but AI screening failed. Please retry manually.',
      };
    }
  }

  /*
  RAG CHAT
  */

  async handleChat(userId: string, question: string, module: string) {
    const payload = {
      userId,
      question,
      filter: {
        must: [{ key: 'metadata.module', match: { value: module } }],
      },
    };

    const response = await firstValueFrom(
      this.httpService.post(`${this.ragUrl}/rag/ask`, payload),
    );

    return {
      answer: response.data.answer,
      sources: response.data.sources,
    };
  }

  /*
  SINGLE CV ANALYSIS
  */

  async runCvAnalysis(applicantId: string, jobId: string, keycloakId: string) {
    await this.getInternalUserId(keycloakId || 'ai-system');

    const applicant = await this.prisma.applicant.findUnique({
      where: { id: applicantId },
    });

    if (!applicant) {
      throw new BadRequestException('Applicant not found');
    }

    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new BadRequestException('Job posting not found');
    }

    const cvText = JSON.stringify(
      applicant.coverLetter || applicant.sourceSnapshot || '',
    );

    const jobDescription = JSON.stringify(job.description);

    const aiResponse = await firstValueFrom(
      this.httpService.post(`${this.ragUrl}/rag/analyze-cv`, {
        cvText,
        jobDescription,
      }),
    );

    const result = aiResponse.data;
    this.logger.debug(`Raw AI Output: ${JSON.stringify(result)}`);

    const finalRecommendation =
      recommendationMap[result.recommendation] ||
      ScreeningRecommendation.CONSIDER;

    await this.prisma.aiCvAnalysis.create({
      data: {
        applicantId: applicant.id,
        jobId: jobId,
        score: result.score || 0,
        recommendation: finalRecommendation,
        strengths: result.strengths || [],
        weaknesses: result.weaknesses || [],
        aiSummary: result.summary || '',
        confidence:
          typeof result.confidence === 'number' ? result.confidence : 0,
        modelVersion:
          result.modelVersion || process.env.RAG_MODEL_VERSION || 'llama3',
      },
    });

    return result;
  }
  /*
  MASS CV SCREENING (100+ CANDIDATES)
  */

  async screenCandidatesForJob(jobId: string, keycloakId: string) {
    await this.getInternalUserId(keycloakId || 'ai-system');

    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new BadRequestException('Job not found');

    const applicant = await this.prisma.applicant.findMany({
      where: { jobId },
    });
    const jobDescription = JSON.stringify(job.description);

    const screeningPromises = applicant.map(async (applicant) => {
      try {
        const cvText = JSON.stringify(
          applicant.coverLetter || applicant.sourceSnapshot || '',
        );
        const aiResponse = await firstValueFrom(
          this.httpService.post(`${this.ragUrl}/rag/analyze-cv`, {
            cvText,
            jobDescription,
          }),
        );

        const result = aiResponse.data;
        this.logger.debug(`Raw AI Output: ${JSON.stringify(result)}`);

        const finalRecommendation =
          recommendationMap[result.recommendation] ||
          ScreeningRecommendation.CONSIDER;

        await this.prisma.aiCvAnalysis.create({
          data: {
            applicantId: applicant.id,
            jobId: jobId,
            score: result.score || 0,
            recommendation: finalRecommendation,
            strengths: result.strengths || [],
            weaknesses: result.weaknesses || [],
            aiSummary: result.summary || '',
            confidence:
              typeof result.confidence === 'number' ? result.confidence : 0,
            modelVersion:
              result.modelVersion || process.env.RAG_MODEL_VERSION || 'llama3',
          },
        });

        return {
          candidateId: applicant.id,
          score: result.score,
          recommendation: result.recommendation,
        };
      } catch (err) {
        this.logger.error(
          `Failed screening for ${applicant.id}: ${err.message}`,
        );
        return null;
      }
    });

    const results = (await Promise.all(screeningPromises)).filter(
      (r) => r !== null,
    );
    results.sort((a, b) => b.score - a.score);

    return { totalCandidates: results.length, rankedCandidates: results };
  }

  /*
  EMPLOYEE PERFORMANCE AI
  */

  async getEmployeeInsights(employeeId: string) {
    this.logger.log(`Generating insights for ${employeeId}`);

    const reviews = await this.prisma.performanceReview.findMany({
      where: { employeeId },
    });

    const aiPayload = {
      employeeId,

      reviews,

      task: 'PERFORMANCE_ANALYSIS',
    };

    const response = await firstValueFrom(
      this.httpService.post(`${this.ragUrl}/ai/analyze-performance`, aiPayload),
    );

    return {
      employeeId,

      insights: response.data.insights,

      recommendations: response.data.recommendations,

      createdAt: new Date(),
    };
  }

  private async getInternalUserId(keycloakId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { keycloakId },
      select: { id: true },
    });

    if (user) {
      return user.id;
    }

    const aiUser = await this.prisma.user.findUnique({
      where: { keycloakId: 'ai-system' },
      select: { id: true },
    });

    if (!aiUser) {
      throw new UnauthorizedException(
        `User ${keycloakId} not found and fallback 'ai-system' is missing. Please seed the database.`,
      );
    }

    return aiUser.id;
  }
}
