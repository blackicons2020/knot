import { Controller, Get, Post, Body, Param, Put, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.usersService.findOne(req.user.id);
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

  @Post('onboarding/validate-answer')
  async validateAnswer(@Body('question') question: string, @Body('answer') answer: string) {
    return this.usersService.validateOnboardingAnswer(question, answer);
  }

  @Post('onboarding/verify')
  async verifyDocuments(
    @Body('selfieUrl') selfieUrl: string,
    @Body('idUrl') idUrl: string,
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
    @Body('dateOfBirth') dateOfBirth: string,
  ) {
    return this.usersService.verifyOnboardingDocuments(selfieUrl, idUrl, firstName, lastName, dateOfBirth);
  }
}
