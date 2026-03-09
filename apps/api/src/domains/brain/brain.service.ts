import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { parseCv } from './utils/cv-parser';
import { ScreeningRecommendation } from "../../platform/prisma/generated/client";

const recommendationMap = {
  SHORTLIST: ScreeningRecommendation.SELECT,
  REVIEW: ScreeningRecommendation.PAUSE,
  REJECT: ScreeningRecommendation.DECLINE
};

@Injectable()
export class BrainService {

  private readonly logger = new Logger(BrainService.name);
  private readonly ragUrl = process.env.RAG_SERVICE_URL || 'http://localhost:3005';

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
          metadata: { module }
        })
      );

      this.logger.log(`Document ${fileName} ingested`);

      return {
        text: extractedText,
        vectorData: response.data
      };

    } catch (error) {

      this.logger.error(`Ingestion failed: ${error.message}`);
      throw new BadRequestException('Failed to process document');

    }

  }


  /*
  CV UPLOAD + PARSE
  */

  async processCvUpload(fileBuffer: Buffer, candidateId: string, jobPostingId: string) {

    const extractedText = await parseCv(fileBuffer);

    this.logger.log(`CV parsed for candidate ${candidateId}. Starting auto-score...`);

       /*
    in the future I will add:
    Store fileUrl in CandidateDocument
    */

    await this.prisma.candidate.update({
      where: { id: candidateId },
      data: { career: extractedText } 
    });

    try {
      const aiResult = await this.runCvAnalysis(candidateId, jobPostingId);

      return {
        candidateId,
        score: aiResult.score,
        recommendation: aiResult.recommendation,
        status: 'Success: CV Uploaded and AI Screened'
      };
    } catch (aiError) {
      this.logger.error(`Auto-screening failed for ${candidateId}: ${aiError.message}`);
      return {
        candidateId,
        cvText: extractedText,
        status: 'Warning: CV Uploaded but AI screening failed. Please retry manually.'
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
        must: [{key: 'metadata.module', match: { value: module } }]
      }
    };

    const response = await firstValueFrom(
      this.httpService.post(`${this.ragUrl}/rag/ask`, payload)
    );

    return {
      answer: response.data.answer,
      sources: response.data.sources
    };

  }

  /*
  SINGLE CV ANALYSIS
  */

  async runCvAnalysis(candidateId: string, jobPostingId: string) {

    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId }
    });

    if (!candidate) {
      throw new BadRequestException('Candidate not found');
    }

    const job = await this.prisma.jobPosting.findUnique({
      where: { id: jobPostingId }
    });

    if (!job) {
      throw new BadRequestException('Job posting not found');
    }

    const cvText = JSON.stringify(candidate.career || candidate.applicationResponses || "");

    const jobDescription = JSON.stringify(
      job.description || job.prerequisites || job.kpis
    );


    const aiResponse = await firstValueFrom(
      this.httpService.post(`${this.ragUrl}/rag/analyze-cv`, {
        cvText,
        jobDescription
      })
    );

    const result = aiResponse.data;

    const finalRecommendation =
    recommendationMap[result.recommendation] ||
    ScreeningRecommendation.PAUSE;

    await this.prisma.cvScreening.upsert({

      where: {
        candidateId_jobPostingId: {
          candidateId,
          jobPostingId
        }
      },

      update: {
        aggregateRating: result.score || 0,
        recommendation: finalRecommendation,
        assessments: result
      },

      create: {
        candidateId,
        jobPostingId,
        aggregateRating: result.score || 0,
        recommendation: finalRecommendation,
        assessments: result,
        screenedById: "00000000-0000-0000-0000-000000000000",
        screenedAt: new Date()
      }

    });


    return result;

  }

  /*
  MASS CV SCREENING (100+ CANDIDATES)
  */

  async screenCandidatesForJob(jobPostingId: string) {
  const job = await this.prisma.jobPosting.findUnique({ where: { id: jobPostingId } });
  if (!job) throw new BadRequestException('Job not found');

  const candidates = await this.prisma.candidate.findMany({ where: { jobPostingId } });
  const jobDescription = JSON.stringify(job.description);

  const screeningPromises = candidates.map(async (candidate) => {
    try {
      const cvText = JSON.stringify(candidate.career || candidate.applicationResponses || "");
      const aiResponse = await firstValueFrom(
        this.httpService.post(`${this.ragUrl}/rag/analyze-cv`, { cvText, jobDescription })
      );
      
      const result = aiResponse.data;

      const finalRecommendation =
      recommendationMap[result.recommendation] ||
      ScreeningRecommendation.PAUSE;

      await this.prisma.cvScreening.upsert({
        where: { candidateId_jobPostingId: { candidateId: candidate.id, jobPostingId } },
        update: { aggregateRating: result.score, recommendation: finalRecommendation, assessments: result },
        create: { 
          candidateId: candidate.id, 
          jobPostingId, 
          aggregateRating: result.score || 0, 
          recommendation: finalRecommendation, 
          assessments: result,
          screenedById: "00000000-0000-0000-0000-000000000000",
          screenedAt: new Date()
        }
      });

      return { candidateId: candidate.id, score: result.score, recommendation: result.recommendation };
    } catch (err) {
      this.logger.error(`Failed screening for ${candidate.id}: ${err.message}`);
      return null;
    }
  });

  const results = (await Promise.all(screeningPromises)).filter(r => r !== null);
  results.sort((a, b) => b.score - a.score);

  return { totalCandidates: results.length, rankedCandidates: results };
}

  /*
  EMPLOYEE PERFORMANCE AI
  */

  async getEmployeeInsights(employeeId: string) {

    this.logger.log(`Generating insights for ${employeeId}`);

    const reviews = await this.prisma.performanceReview.findMany({
      where: { employeeId }
    });

    const aiPayload = {

      employeeId,

      reviews,

      task: "PERFORMANCE_ANALYSIS"

    };

    const response = await firstValueFrom(
      this.httpService.post(`${this.ragUrl}/ai/analyze-performance`, aiPayload)
    );

    return {

      employeeId,

      insights: response.data.insights,

      recommendations: response.data.recommendations,

      createdAt: new Date()

    };

  }

}