import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as qrcode from 'qrcode';
import * as speakeasy from 'speakeasy';

@Injectable()
export class TwoFactorService {
  constructor(private configService: ConfigService) {}

  generateSecret(userEmail: string) {
    const appName = this.configService.get<string>('APP_NAME', '2FA Demo App');

    const secret = speakeasy.generateSecret({
      name: userEmail,
      issuer: appName,
      length: 20,
    });

    return {
      secret: secret.base32,
      otpauth_url: secret.otpauth_url,
    };
  }

  async generateQRCode(otpauth_url: string): Promise<string> {
    try {
      return await qrcode.toDataURL(otpauth_url);
    } catch {
      throw new Error('Не удалось сгенерировать QR-код');
    }
  }

  verifyToken(token: string, secret: string): boolean {
    try {
      return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2, // Позволяет коды на ±2 временных окна (60 секунд)
      });
    } catch {
      return false;
    }
  }

  generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }
}
