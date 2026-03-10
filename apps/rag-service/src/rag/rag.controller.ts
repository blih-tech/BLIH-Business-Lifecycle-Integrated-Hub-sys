import { Controller, Post, Body, Get } from '@nestjs/common';
import { RagService } from './rag.service';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('ingest-text')
  async ingestText(@Body() data: { text: string; source: string; metadata?: any }) {
    console.log(`Received document from source: ${data.source}`);
    return await this.ragService.ingest(data.text, data.source, data.metadata);
  }

  @Post('ask')
  async ask(
    @Body()
    body: {
      question: string;
      history?: { role: string; content: string }[];
      filter?: any;
    },
  ) {
    return await this.ragService.askQuestion(body.question, body.history || [], body.filter);
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
