// src/fcm/fcm.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FcmService implements OnModuleInit {
  onModuleInit() {
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
  }

  async sendCallNotification(
    fcmToken: string,
    payload: {
      callId: string;
      callerName: string;
      callerUserId: string;
      conversationId: string;
      callType: string;
      bookingId: string;
    },
  ) {
    return admin.messaging().send({
      token: fcmToken,
      data: {
        type: 'incoming_call',
        callId: payload.callId,
        callerName: payload.callerName,
        callerUserId: payload.callerUserId,
        conversationId: payload.conversationId,
        callType: payload.callType,
        bookingId: payload.bookingId,
      },
      android: {
        priority: 'high',
      },
    });
  }
}
