import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from '../ai/ai.service';

@Module({
  controllers: [MatchesController],
  providers: [MatchesService, PrismaService, AIService],
  exports: [MatchesService],
})
export class MatchesModule {}
