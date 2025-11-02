import { ConfigService } from '@nestjs/config';
import type { JwtModuleOptions } from '@nestjs/jwt';

export function getJwtConfig(configService: ConfigService): JwtModuleOptions {
  return {
    global: true,
    secret: configService.getOrThrow<string>('JWT_SECRET_KEY'),
    signOptions: {
      algorithm: 'HS256',
    },
    verifyOptions: {
      algorithms: ['HS256'],
      ignoreExpiration: false,
    },
  };
}
