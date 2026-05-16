import { Module } from '@nestjs/common';
import { MessagesGateway } from './messages.gateway';
import { MessagesController } from './messages.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from '../ai/ai.service';

@Module({
  controllers: [MessagesController],
  providers: [MessagesGateway, PrismaService, AIService],
})
export class MessagesModule {}
