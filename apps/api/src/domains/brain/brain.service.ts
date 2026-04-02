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
import { ScreeningRecommendation } from '@repo/database';
import FormData from 'form-data';

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

  private detectDocumentType(fileName: string, content: string): string {
    const lower = (fileName + ' ' + content).toLowerCase();

    if (lower.includes('cv') || lower.includes('resume')) return 'candidate_cv';
    if (lower.includes('policy') || lower.includes('handbook')) return 'policy';
    if (lower.includes('report')) return 'report';
    if (lower.includes('invoice') || lower.includes('finance'))
      return 'finance';

    return 'general';
  }

  private extractTags(content: string): string[] {
    const tags: string[] = [];
    const lower = content.toLowerCase();

    if (lower.includes('leave')) tags.push('leave');
    if (lower.includes('salary')) tags.push('salary');
    if (lower.includes('performance')) tags.push('performance');

    return tags;
  }

  async processAndIngest(
    fileBuffer: Buffer,
    fileName: string,
    module: string,
    userId: string,
  ) {
    try {
      const extractedText = await parseCv(fileBuffer);
      const detectedType = this.detectDocumentType(fileName, extractedText);

      const response = await firstValueFrom(
        this.httpService.post(`${this.ragUrl}/rag/ingest-text`, {
          text: extractedText,
          source: fileName,
          metadata: {
            module: module,
            userId: userId,
            type: detectedType,
            tags: this.extractTags(extractedText),
            date_ingested: new Date().toISOString(),
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

  private detectQueryType(question: string): string {
    const q = question.toLowerCase();

    if (q.includes('policy') || q.includes('rule')) return 'policy';
    if (q.includes('cv') || q.includes('candidate')) return 'candidate_cv';
    if (q.includes('employee')) return 'employee';
    if (q.includes('report')) return 'report';
    if (q.includes('salary') || q.includes('finance')) return 'finance';

    return 'general';
  }

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
        await this.processAndIngest(
          file.buffer,
          file.originalname,
          module,
          userId,
        );
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

    const detectedType = this.detectQueryType(processedQuestion);

    const intentCheckResponse = await firstValueFrom(
      this.httpService.post(`${this.ragUrl}/rag/ask`, {
        question: `
    Classify this question:
    "${processedQuestion}"

    Return ONLY one:
    - SINGLE_MODULE
    - CROSS_MODULE
    `,
        history: [],
        filter: {},
      }),
    );

    const reasoningMode = intentCheckResponse.data.answer.includes(
      'CROSS_MODULE',
    )
      ? 'cross-module'
      : 'single-module';

    const payload = {
      userId,
      question: `${contextExtension}${processedQuestion}`.trim(),
      history: session.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      reasoningMode,
      detectedType,
      queryVariants:
        reasoningMode === 'cross-module'
          ? [
              processedQuestion,
              `HR perspective: ${processedQuestion}`,
              `Finance perspective: ${processedQuestion}`,
              `Project perspective: ${processedQuestion}`,
            ]
          : [processedQuestion],

      filter:
        reasoningMode === 'cross-module'
          ? {
              must: [{ key: 'isAI', match: { value: false } }],
              should: [{ key: 'userId', match: { value: userId } }],
            }
          : {
              must: [
                { key: 'module', match: { value: module.toLowerCase() } },
                { key: 'isAI', match: { value: false } },
              ],
              should: [
                { key: 'userId', match: { value: userId } },
                { key: 'type', match: { value: detectedType } },
              ],
            },
    };
    const response = await firstValueFrom(
      this.httpService.post(`${this.ragUrl}/rag/ask`, payload),
    );

    const aiAnswer = response.data.answer;

    try {
      await firstValueFrom(
        this.httpService.post(`${this.ragUrl}/rag/ingest-text`, {
          text: `
          Question: ${processedQuestion}

          Answer: ${aiAnswer}
          `,
          source: 'ai-generated',
          metadata: {
            module: reasoningMode === 'cross-module' ? 'global' : module,
            userId,
            type: 'insight',
            tags: ['ai-generated', detectedType],
            isAI: true,
          },
        }),
      );
    } catch {
      this.logger.warn('Failed to store AI memory');
    }

    await this.prisma.aiChatMessage.createMany({
      data: [
        {
          sessionId: session.id,
          role: 'user',
          content:
            question || `[File Upload: ${file?.originalname || 'unknown'}]`,
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

    formData.append('file', imageBuffer, {
      filename: 'image.jpg',
      contentType: 'image/jpeg',
    });

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.ragUrl}/rag/ai/vision`, formData, {
          headers: {
            ...formData.getHeaders(),
          },
        }),
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
        this.httpService.post(`${this.ragUrl}/rag/ai/transcribe`, formData),
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

    return { totalApplicants: results.length, rankedApplicants: results };
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

  async createPolicy(data: {
    title: string;
    content: string;
    module: string;
    tags?: string[];
    userId: string;
  }) {
    const policy = await this.prisma.policy.create({
      data: {
        title: data.title,
        description: data.content,
      },
    });

    const version = await this.prisma.policyVersion.create({
      data: {
        policyId: policy.id,
        content: data.content,
        version: 1,
        isActive: true,
      },
    });

    await this.prisma.policy.update({
      where: { id: policy.id },
      data: {
        currentVersionId: version.id,
      },
    });
    try {
      await firstValueFrom(
        this.httpService.post(`${this.ragUrl}/rag/ingest-text`, {
          text: data.content,
          source: `policy:${policy.id}`,
          metadata: {
            module: data.module,
            type: 'policy',
            policyId: policy.id,
            version: 1,
            tags: data.tags || [],
            isAI: false,
          },
        }),
      );
    } catch (error) {
      this.logger.error(`RAG Sync failed: ${error.message}`);
    }

    return policy;
  }

  async getPolicies() {
    return this.prisma.policy.findMany({
      where: {
        isActive: true,
      },
      include: {
        currentVersion: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updatePolicy(id: string, content: string) {
    const policy = await this.prisma.policy.findUnique({
      where: { id },
      include: { currentVersion: true },
    });

    if (!policy) {
      throw new NotFoundException('Policy not found');
    }

    const newVersionNumber = (policy.currentVersion?.version || 0) + 1;

    const newVersion = await this.prisma.policyVersion.create({
      data: {
        policyId: id,
        content,
        version: newVersionNumber,
        isActive: true,
      },
    });

    const updated = await this.prisma.policy.update({
      where: { id },
      data: {
        currentVersionId: newVersion.id,
      },
    });

    await firstValueFrom(
      this.httpService.post(`${this.ragUrl}/rag/ingest-text`, {
        text: content,
        source: `policy:${updated.id}`,
        metadata: {
          type: 'policy',
          policyId: updated.id,
          version: newVersionNumber,
          isAI: false,
        },
      }),
    );

    return updated;
  }
}
