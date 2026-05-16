import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from '../ai/ai.service';
import { MatchStatus } from '@prisma/client';

@Injectable()
export class MatchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AIService,
  ) {}

  async getDailyMatches(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found.');

    // In a real-world scenario, we filter by gender preferences, locations, etc.
    // For matchmaking excellence, we select up to 5 potentially highly-aligned candidates
    const candidates = await this.prisma.user.findMany({
      where: {
        id: { not: userId },
        isVerified: true, // Only match with verified real humans
      },
      take: 5,
    });

    const matchesList = [];

    for (const cand of candidates) {
      // Check if we already have calculated their compatibility
      let match = await this.prisma.match.findUnique({
        where: {
          userAId_userBId: {
            userAId: userId < cand.id ? userId : cand.id,
            userBId: userId < cand.id ? cand.id : userId,
          },
        },
      });

      if (!match) {
        // Run deep Gemini AI mathematical compatibility calculations
        const aiScore = await this.aiService.calculateCompatibility(user, cand);

        match = await this.prisma.match.create({
          data: {
            userAId: userId < cand.id ? userId : cand.id,
            userBId: userId < cand.id ? cand.id : userId,
            compatibilityScore: aiScore.compatibilityScore,
            emotionalAlignment: aiScore.emotionalAlignment,
            communicationStyle: aiScore.communicationStyle,
            valuesAlignment: aiScore.valuesAlignment,
            lifestyleCompatibility: aiScore.lifestyleCompatibility,
            aiExplanation: aiScore.aiExplanation,
            status: MatchStatus.PENDING,
          },
        });
      }

      const partner = cand;
      matchesList.push({
        matchId: match.id,
        partner: {
          id: partner.id,
          name: partner.name,
          age: partner.age,
          bio: partner.bio,
          occupation: partner.occupation,
          religion: partner.religion,
          personalityArchetype: partner.personalityArchetype,
          attachmentStyle: partner.attachmentStyle,
          trustScore: partner.trustScore,
        },
        scores: {
          compatibilityScore: match.compatibilityScore,
          emotionalAlignment: match.emotionalAlignment,
          communicationStyle: match.communicationStyle,
          valuesAlignment: match.valuesAlignment,
          lifestyleCompatibility: match.lifestyleCompatibility,
        },
        aiExplanation: match.aiExplanation,
        status: match.status,
      });
    }

    return matchesList;
  }

  async respondToMatch(matchId: string, status: MatchStatus) {
    return this.prisma.match.update({
      where: { id: matchId },
      data: { status },
    });
  }

  async getConnectedMatches(userId: string) {
    const matches = await this.prisma.match.findMany({
      where: {
        OR: [
          { userAId: userId, status: MatchStatus.CONNECTED },
          { userBId: userId, status: MatchStatus.CONNECTED },
        ],
      },
      include: {
        userA: true,
        userB: true,
      },
    });

    return matches.map((m) => {
      const partner = m.userAId === userId ? m.userB : m.userA;
      return {
        matchId: m.id,
        partner: {
          id: partner.id,
          name: partner.name,
          age: partner.age,
          bio: partner.bio,
          occupation: partner.occupation,
          trustScore: partner.trustScore,
        },
        scores: {
          compatibilityScore: m.compatibilityScore,
          emotionalAlignment: m.emotionalAlignment,
          communicationStyle: m.communicationStyle,
          valuesAlignment: m.valuesAlignment,
        },
        aiExplanation: m.aiExplanation,
      };
    });
  }
}
