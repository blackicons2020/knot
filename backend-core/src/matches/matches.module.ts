import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from '../ai/ai.service';
import { NotificationsService } from '../services/notifications.service';

@Module({
  controllers: [MatchesController],
  providers: [MatchesService, PrismaService, AIService, NotificationsService],
  exports: [MatchesService],
})
export class MatchesModule {}
