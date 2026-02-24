import { Controller, Post, Body, Get } from '@nestjs/common';
import { RagService } from './rag.service';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('ingest-text')
  async ingest(@Body() body: { text: string; source: string }) {
    return this.ragService.ingest(body.text, body.source);
  }

  @Post('ask')
  async askQuestion(@Body('question') question: string) {
    return await this.ragService.askQuestion(question);
  }

  @Get('status')
  status() {
    return this.ragService.status();
  }

  @Post('clear')
  async clearCollection() {
    return await this.ragService.clearCollection();
  }
}
