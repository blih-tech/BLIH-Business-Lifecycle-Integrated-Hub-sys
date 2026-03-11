import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { parseCv } from './utils/cv-parser';
import { ScreeningRecommendation } from '../../platform/prisma/prisma-client';

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

  async processAndIngest(
    fileBuffer: Buffer,
    fileName: string,
    module: string,
    userId?: string,
  ) {
    try {
      const extractedText = await parseCv(fileBuffer);

      const response = await firstValueFrom(
        this.httpService.post(`${this.ragUrl}/rag/ingest-text`, {
          text: extractedText,
          source: fileName,
          metadata: {
            module,
            userId,
          },
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

  async handleChat(
    userId: string,
    question: string,
    module: string,
    sessionId?: string,
    file?: Express.Multer.File,
  ) {
    let processedQuestion = question || '';
    let contextExtension = '';

    if (file && file.size > 0) {
      const mimeType = file.mimetype;
      if (mimeType.startsWith('image/')) {
        const visionDescription = await this.analyzeImage(file.buffer);
        contextExtension = `[User uploaded an image. Description: ${visionDescription}] `;
      } else if (mimeType.startsWith('audio/')) {
        const transcription = await this.transcribeAudio(file.buffer);
        processedQuestion = `${transcription} ${question || ''}`.trim();
      } else if (mimeType === 'application/pdf') {
        await this.processAndIngest(file.buffer, file.originalname, module);
        contextExtension = `[Context added from: ${file.originalname}] `;
      }
    }

    let session = await this.prisma.aiChatSession.findFirst({
      where: { id: sessionId, userId: userId },
      include: { messages: { orderBy: { createdAt: 'asc' }, take: 10 } },
    });

    if (!session) {
      session = await this.prisma.aiChatSession.create({
        data: {
          userId,
          module,
          title: processedQuestion.substring(0, 50) || 'New Chat',
        },
        include: { messages: true },
      });
      this.generateSmartTitle(session.id, processedQuestion).catch((err) =>
        this.logger.error(`Title generation failed: ${err.message}`),
      );
    }

    const payload = {
      userId,
      question: `${contextExtension}${processedQuestion}`.trim(),
      history: session.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      filter: {
        must: [
          { key: 'metadata.module', match: { value: module } },
          {
            should: [
              { key: 'metadata.userId', match: { value: module } },
              { key: 'metadate.isPublic', match: { value: true } },
            ],
          },
        ],
      },
    };

    const response = await firstValueFrom(
      this.httpService.post(`${this.ragUrl}/rag/ask`, payload),
    );

    const aiAnswer = response.data.answer;

    await this.prisma.aiChatMessage.createMany({
      data: [
        {
          sessionId: session.id,
          role: 'user',
          content: question || '[File Upload]',
        },
        { sessionId: session.id, role: 'assistant', content: aiAnswer },
      ],
    });

    return {
      sessionId: session.id,
      answer: aiAnswer,
      sources: response.data.sources,
    };
  }

  private async analyzeImage(imageBuffer: Buffer): Promise<string> {
    const formData = new FormData();
    const uint8Array = new Uint8Array(imageBuffer);
    const fileValue = new Blob([uint8Array], { type: 'image/jpeg' });
    formData.append('file', fileValue, 'image.jpg');

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.ragUrl}/ai/vision`, formData),
      );
      return response.data.description;
    } catch (error) {
      this.logger.error(`Vision analysis failed: ${error.message}`);
      return 'Unable to analyze image at this time.';
    }
  }

  private async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    const formData = new FormData();
    const uint8Array = new Uint8Array(audioBuffer);
    const fileValue = new Blob([uint8Array], { type: 'audio/wav' });
    formData.append('file', fileValue, 'voice.wav');

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.ragUrl}/ai/transcribe`, formData),
      );
      return response.data.text;
    } catch (error) {
      this.logger.error(`Transcription failed: ${error.message}`);
      return '[Voice message - transcription failed]';
    }
  }

  async getUserChatSessions(userId: string, module?: string) {
    return this.prisma.aiChatSession.findMany({
      where: {
        userId,
        ...(module && { module }),
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        module: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    });
  }

  async getChatHistory(sessionId: string) {
    const session = await this.prisma.aiChatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Chat session not found');
    }

    return session;
  }

  private async generateSmartTitle(sessionId: string, firstQuestion: string) {
    try {
      const payload = {
        question: `Summarize this user request into a 3-5 word title. 
                 Return ONLY the title text, no quotes or periods. 
                 Request: "${firstQuestion}"`,
        history: [],
        filter: { must: [] },
      };

      const response = await firstValueFrom(
        this.httpService.post(`${this.ragUrl}/rag/ask`, payload),
      );

      const smartTitle = response.data.answer.replace(/[".]/g, '').trim();

      await this.prisma.aiChatSession.update({
        where: { id: sessionId },
        data: { title: smartTitle },
      });

      this.logger.log(`Session ${sessionId} renamed to: ${smartTitle}`);
    } catch (error) {
      this.logger.error(`Failed to generate smart title: ${error.message}`);
    }
  }

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
        confidence: result.confidence || 0,
        modelVersion: result.modelVersion || '',
      },
    });

    return result;
  }

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
            confidence: result.confidence || 0,
            modelVersion: result.modelVersion || '',
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
