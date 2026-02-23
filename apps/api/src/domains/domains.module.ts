import { Module } from '@nestjs/common';
import { AiModule } from './ai/ai.module';
import { BrainModule } from './brain/brain.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { CrmModule } from './crm/crm.module';
import { FinanceModule } from './finance/finance.module';
import { HrModule } from './hr/hr.module';
import { ProjectModule } from './project/project.module';

@Module({
  imports: [
    AiModule,
    BrainModule,
    ChatbotModule,
    HrModule,
    FinanceModule,
    CrmModule,
    ProjectModule,
  ],
})
export class DomainsModule {}
