import { Injectable, Logger } from '@nestjs/common';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

@Injectable()
export class NotificationsService {
  private expo: Expo;
  private readonly logger = new Logger(NotificationsService.name);

  constructor() {
    this.expo = new Expo();
  }

  async sendPushNotification(pushToken: string, title: string, body: string, data?: any) {
    if (!Expo.isExpoPushToken(pushToken)) {
      this.logger.error(`Push token ${pushToken} is not a valid Expo push token`);
      return;
    }

    const message: ExpoPushMessage = {
      to: pushToken,
      sound: 'default',
      title: title,
      body: body,
      data: data || {},
    };

    try {
      const tickets = await this.expo.sendPushNotificationsAsync([message]);
      this.logger.log(`Sent push notification to ${pushToken}, ticket: ${JSON.stringify(tickets)}`);
      return tickets;
    } catch (error) {
      this.logger.error(`Error sending push notification: ${error}`);
    }
  }

  async sendMultiplePushNotifications(messages: ExpoPushMessage[]) {
    const validMessages = messages.filter(msg => {
      const to = Array.isArray(msg.to) ? msg.to[0] : msg.to;
      if (!Expo.isExpoPushToken(to)) {
        this.logger.error(`Push token ${to} is not a valid Expo push token`);
        return false;
      }
      return true;
    });

    const chunks = this.expo.chunkPushNotifications(validMessages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        this.logger.error(`Error sending push notification chunk: ${error}`);
      }
    }

    return tickets;
  }
}
