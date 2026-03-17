import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  Request,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { BrainService } from './brain.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('brain')
export class BrainController {
  constructor(private readonly brainService: BrainService) {}

  @Post('chat')
  @UseInterceptors(FileInterceptor('file'))
  async chat(
    @Body()
    body: {
      userId: string;
      question: string;
      module: string;
      sessionId?: string;
    },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.brainService.handleChat(
      body.userId,
      body.question,
      body.module,
      body.sessionId,
      file,
    );
  }

  @Get('sessions/:userId')
  async getSessions(
    @Param('userId') userId: string,
    @Query('module') module?: string,
  ) {
    return this.brainService.getUserChatSessions(userId, module);
  }

  @Get('history/:sessionId')
  async getHistory(@Param('sessionId') sessionId: string) {
    return this.brainService.getChatHistory(sessionId);
  }

  @Post('analyze-cv')
  async analyzeCv(
    @Body()
    body: {
      cvText: string;
      jobDescription: string;
      keycloakId: string;
    },
  ) {
    return this.brainService.runCvAnalysis(
      body.cvText,
      body.jobDescription,
      body.keycloakId,
    );
  }

  @Get('insights/performance/:employeeId')
  async getPerformanceInsights(@Param('employeeId') employeeId: string) {
    return this.brainService.getEmployeeInsights(employeeId);
  }

  @Post('upload-cv')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCv(
    @UploadedFile() file: Express.Multer.File,
    @Body('applicantId') applicantId: string,
    @Body('jobId') jobId: string,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('CV file is required');
    }
    const keycloakId = req?.user?.sub ?? 'ai-system';

    const result = await this.brainService.processCvUpload(
      file.buffer,
      applicantId,
      jobId,
      keycloakId,
    );

    return result;
  }

  @Post('screen-candidates')
  async screenCandidates(
    @Body() body: { jobId: string; applicants: any[] },
    @Request() req: any,
  ) {
    const keycloakId = req?.user?.sub ?? 'ai-system';

    return this.brainService.screenCandidatesForJob(body.jobId, keycloakId);
  }
}
