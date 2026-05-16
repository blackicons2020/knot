import { Controller, Get, Post, Body, Param, Put, Query } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchStatus } from '@prisma/client';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get('daily')
  async getDaily(@Query('userId') userId: string) {
    return this.matchesService.getDailyMatches(userId);
  }

  @Post(':id/respond')
  async respond(@Param('id') id: string, @Body('status') status: MatchStatus) {
    return this.matchesService.respondToMatch(id, status);
  }

  @Get('connected')
  async getConnected(@Query('userId') userId: string) {
    return this.matchesService.getConnectedMatches(userId);
  }
}
