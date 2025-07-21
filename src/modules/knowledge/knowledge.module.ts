import { Module } from '@nestjs/common';
import { DomainKnowledgeController } from './domain-knowledge.controller';
import { DomainKnowledgeService } from './domain-knowledge.service';
import { PrismaModule } from '@shared/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [DomainKnowledgeController],
  providers: [DomainKnowledgeService],
  exports: [DomainKnowledgeService],
})
export class KnowledgeModule {}