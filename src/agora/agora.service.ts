// calls/calls.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RtcTokenBuilder, RtcRole } from 'agora-token';
import { createHash } from 'crypto';


@Injectable()
export class AgoraService {
  constructor(private config: ConfigService) {}

  uidFromUserId(userId: string): number {
    // Hash the UUID and take first 8 hex chars → convert to unsigned 32-bit int
    const hash = createHash('md5').update(userId).digest('hex');
    return parseInt(hash.substring(0, 8), 16) >>> 0; // >>> 0 forces unsigned 32-bit
  }

  generateToken(channelName: string, uid: number) {
    const appId = this.config.get<string>('AGORA_APP_ID');
    const appCertificate = this.config.get<string>('AGORA_APP_CERTIFICATE');
    const expiry = 3600; // 1 hour
    const now = Math.floor(Date.now() / 1000);

    if (!appId)
      throw new NotFoundException('Agora App ID not found in configuration');
    if (!appCertificate)
      throw new NotFoundException(
        'Agora App Certificate not found in configuration',
      );

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      RtcRole.PUBLISHER,
      now + expiry,
      now + expiry,
    );

    return { token, appId, channelName, uid };
  }
}
