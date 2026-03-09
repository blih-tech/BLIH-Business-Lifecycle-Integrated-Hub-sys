import { Controller, Post, Body, Get, Param, UseInterceptors, UploadedFile, Request, UseGuards, BadRequestException } from '@nestjs/common';
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
async analyzeCv(@Body() body: { cvText: string; jobDescription: string, keycloakId: string}) {
  return this.brainService.runCvAnalysis(body.cvText, body.jobDescription, body.keycloakId);
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
  @Body('jobPostingId') jobPostingId: string,
  @Request() req: any
) {

  if(!file){
    throw new BadRequestException('CV file is required')
  }
  const keycloakId = req?.user?.sub?? 'ai-system';
    
  const result = await this.brainService.processCvUpload(
    file.buffer,
    candidateId,
    jobPostingId,
    keycloakId
  );

  return result;
}

@Post('screen-candidates')
async screenCandidates(
  @Body() body: { jobPostingId: string; candidates: any[] },
  @Request() req: any 
) {

  const keycloakId = req?.user?.sub?? 'ai-system';

  return this.brainService.screenCandidatesForJob(
    body.jobPostingId,
    keycloakId
  );
}
}


