import { Controller, Post, Body } from '@nestjs/common';
import { AIService } from './ai.service';

@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('coach')
  async coachResponse(
    @Body() body: { 
      conversationHistory: Array<{ role: string; text: string }>; 
      userProfile: any; 
      currentMessage: string;
    }
  ) {
    const { conversationHistory, userProfile, currentMessage } = body;
    const response = await this.aiService.getCoachResponse(
      conversationHistory || [],
      userProfile || {},
      currentMessage || ""
    );
    return { response };
  }
}
