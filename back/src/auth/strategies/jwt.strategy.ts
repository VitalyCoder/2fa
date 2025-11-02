import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

export interface JwtPayload {
  sub: string;
  email: string;
  isTwoFactorAuthenticated?: boolean;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET не установлен в переменных окружения');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    try {
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Пользователь не найден');
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
        isTwoFactorAuthenticated: payload.isTwoFactorAuthenticated || false,
      };
    } catch {
      throw new UnauthorizedException('Ошибка валидации токена');
    }
  }
}
