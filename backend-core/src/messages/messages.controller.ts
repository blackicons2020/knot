import { Controller, Get, Query, Param, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
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

  @Get(':matchId')
  async getMessagesForMatch(@Param('matchId') matchId: string, @Query('userId') userId: string) {
    // Basic mock implementation for the prototype to avoid 404
    // Usually userId is extracted from a JWT token.
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: matchId },
          { senderId: matchId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    }).catch(() => []);
  }

  @Post(':matchId')
  async sendMessage(
    @Param('matchId') matchId: string,
    @Body() body: { text: string; senderId?: string }
  ) {
    // If senderId isn't provided, use a dummy one (in reality, use JWT)
    const senderId = body.senderId || 'user-1';

    // Check if sender is premium
    const sender = await this.prisma.user.findUnique({ where: { id: senderId } });
    if (!sender?.isPremium) {
      // Get distinct users the sender has already messaged
      const previousMessages = await this.prisma.message.findMany({
        where: { senderId },
        select: { receiverId: true },
        distinct: ['receiverId'],
      });
      
      const distinctReceivers = previousMessages.map(m => m.receiverId);
      
      // If they have messaged someone, and it's NOT this match, block them!
      if (distinctReceivers.length >= 1 && !distinctReceivers.includes(matchId)) {
        throw new HttpException({ success: false, error: 'FREE_TIER_LIMIT' }, HttpStatus.FORBIDDEN);
      }
    }

    return this.prisma.message.create({
      data: {
        content: body.text,
        senderId,
        receiverId: matchId,
      }
    }).catch(() => ({ success: false }));
  }
}
