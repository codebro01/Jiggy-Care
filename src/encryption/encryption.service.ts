import { Injectable } from '@nestjs/common';
import crypto from 'crypto'

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor() {
    const encryptionKey = process.env.ENCRYPTION_KEY;

    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY must be set in environment variables');
    }

    // Key should be 32 bytes for AES-256
    this.key = crypto.scryptSync(encryptionKey, 'salt', 32);
  }

  encrypt(text: string): string {
    if (!text) return text;

    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

   
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(encryptedText: string): string {
    if (!encryptedText) return encryptedText;

    try {
      const parts = encryptedText.split(':');

      if (parts.length !== 3) {
        throw new Error('Invalid encrypted text format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  // Bulk encryption for multiple fields
  encryptObject<T extends Record<string, any>>(
    obj: T,
    fieldsToEncrypt: (keyof T)[],
  ): T {
    const encrypted = { ...obj };

    for (const field of fieldsToEncrypt) {
      if (encrypted[field]) {
        encrypted[field] = this.encrypt(String(encrypted[field])) as any;
      }
    }

    return encrypted;
  }

  // Bulk decryption for multiple fields
  decryptObject<T extends Record<string, any>>(
    obj: T,
    fieldsToDecrypt: (keyof T)[],
  ): T {
    const decrypted = { ...obj };

    for (const field of fieldsToDecrypt) {
      if (decrypted[field]) {
        decrypted[field] = this.decrypt(String(decrypted[field])) as any;
      }
    }

    return decrypted;
  }
}

