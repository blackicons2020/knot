import { Controller, Get, Query, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('history')
  async getChatHistory(@Query('userAId') userAId: string, @Query('userBId') userBId: string) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userAId, receiverId: userBId },
          { senderId: userBId, receiverId: userAId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
