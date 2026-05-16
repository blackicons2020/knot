import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from '../ai/ai.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AIService,
  ) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profileImages: true },
    });
    if (!user) throw new NotFoundException('User not found.');
    return user;
  }

  async updateProfile(id: string, dto: any) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
    });
  }

  async completeOnboarding(id: string, transcript: Array<{ role: string; text: string }>) {
    const user = await this.findOne(id);

    // Call Python FastAPI AI microservice to extract structured psychological profiles
    const aiData = await this.aiService.extractInterviewData(transcript);
    if (!aiData) {
      throw new Error('AI failed to process conversational onboarding transcript.');
    }

    // Save extracted parameters into PostgreSQL database
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        occupation: aiData.occupation || user.occupation,
        education: aiData.education || user.education,
        religion: aiData.religion || user.religion,
        maritalStatus: aiData.maritalStatus || user.maritalStatus,
        willingToRelocate: aiData.willingToRelocate || user.willingToRelocate,
        marriageTimeline: aiData.marriageTimeline || user.marriageTimeline,
        childrenPreference: aiData.childrenPreference || user.childrenPreference,
        smoking: aiData.smoking || user.smoking,
        drinking: aiData.drinking || user.drinking,
        
        // AI Metrics
        personalityArchetype: aiData.personalityArchetype,
        attachmentStyle: aiData.attachmentStyle,
        readinessScore: aiData.readinessScore || 70,
        seriousnessLevel: aiData.seriousnessLevel || 80,
        trustScore: 85, // Set base trust score upon verified conversational completion
        personalValues: aiData.values || [],
        isVerified: true, // Auto verify upon conversational AI verification
      },
    });

    return updatedUser;
  }

  async submitSelfie(id: string, selfieUrl: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        selfieUrl,
        selfieVerified: true,
        trustScore: {
          increment: 10, // Increment trust score by 10 points upon selfie upload
        },
      },
    });
  }

  async getInsights(id: string) {
    const user = await this.findOne(id);
    return {
      trustScore: user.trustScore,
      readinessScore: user.readinessScore,
      seriousnessLevel: user.seriousnessLevel,
      personalityArchetype: user.personalityArchetype,
      attachmentStyle: user.attachmentStyle,
      personalValues: user.personalValues,
    };
  }
}
