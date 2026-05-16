import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from '../ai/ai.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, AIService],
  exports: [UsersService],
})
export class UsersModule {}
