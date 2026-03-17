import {
  Controller,
  Post,
  Body,
  Get,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { RagService } from './rag.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('ingest-text')
  async ingestText(
    @Body()
    data: {
      text: string;
      source: string;
      metadata?: Record<string, any>;
    },
  ) {
    console.log(`Received document from source: ${data.source}`);
    return await this.ragService.ingest(data.text, data.source, data.metadata);
  }

  @Post('ai/vision')
  @UseInterceptors(FileInterceptor('file'))
  async analyzeImage(@UploadedFile() file: Express.Multer.File) {
    console.log("FILE RECIVED", file);
    if (!file) throw new Error('No image file provided');
    return await this.ragService.analyzeImage(file.buffer);
  }

  @Post('ai/transcribe')
  @UseInterceptors(FileInterceptor('file'))
  async transcribeAudio(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new Error('No audio file provided');
    return await this.ragService.transcribeAudio(file.buffer);
  }

  @Post('ask')
  async ask(
    @Body()
    body: {
      question: string;
      history?: { role: string; content: string }[];
      filter?: Record<string, unknown>;
    },
  ) {
    return await this.ragService.askQuestion(
      body.question,
      body.history || [],
      body.filter,
    );
  }

  @Post('analyze-cv')
  async analyzeCv(
    @Body()
    body: {
      cvText: string;
      jobDescription: string;
    },
  ) {
    return this.ragService.analyzeCv(body.cvText, body.jobDescription);
  }

  @Get('status')
  status() {
    return this.ragService.status();
  }

  @Post('clear')
  async clear() {
    return await this.ragService.clearCollection();
  }
}
