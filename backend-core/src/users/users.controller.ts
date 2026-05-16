import { Controller, Get, Post, Body, Param, Put, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Request() req: any) {
    // Note: Request would normally carry authenticated user id via Guard. 
    // For prototype simplicity, we allow id in queries/body or default fallback.
    return this.usersService.findOne(req.query.id);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.usersService.updateProfile(id, dto);
  }

  @Post(':id/onboarding')
  async completeOnboarding(@Param('id') id: string, @Body('transcript') transcript: any) {
    return this.usersService.completeOnboarding(id, transcript);
  }

  @Post(':id/selfie')
  async submitSelfie(@Param('id') id: string, @Body('selfieUrl') selfieUrl: string) {
    return this.usersService.submitSelfie(id, selfieUrl);
  }

  @Get(':id/insights')
  async getInsights(@Param('id') id: string) {
    return this.usersService.getInsights(id);
  }
}
