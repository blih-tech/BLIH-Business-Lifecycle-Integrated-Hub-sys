import { Controller, Post, Body, Get, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { BrainService } from './brain.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('brain')
export class BrainController {
    constructor(private readonly brainService: BrainService) {} 

@Post('chat')
async chat(@Body() body: {userId: string; question: string; module: string}) {
    return this.brainService.handleChat(body.userId, body.question, body.module);
}

@Post('analyze-cv')
async analyzeCv(@Body() body: { cvText: string; jobDescription: string }) {
  return this.brainService.runCvAnalysis(body.cvText, body.jobDescription);
}

@Get('insights/performance/:employeeId')
async getPerformanceInsights(@Param('employeeId') employeeId: string) {
 return this.brainService.getEmployeeInsights(employeeId);
 }

@Post('upload-cv')
@UseInterceptors(FileInterceptor('file'))
async uploadCv(
  @UploadedFile() file: Express.Multer.File,
  @Body('candidateId') candidateId: string,
  @Body('jobPostingId') jobPostingId: string
    ) {
    const result = await this.brainService.processCvUpload(
        file.buffer,
        candidateId,
        jobPostingId,
    );

    return result;
}

@Post('screen-candidates')
async screenCandidates(
  @Body() body: { jobPostingId: string; candidates: any[] }
) {
  return this.brainService.screenCandidatesForJob(
    body.jobPostingId
  );
}
}


