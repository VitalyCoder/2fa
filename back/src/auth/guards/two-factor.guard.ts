import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SKIP_TWO_FACTOR_KEY } from '../decorators/skip-two-factor.decorator';
import { RequestWithUser } from '../types/authenticated-user.types';

@Injectable()
export class TwoFactorGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const skipTwoFactor = this.reflector.getAllAndOverride<boolean>(
      SKIP_TWO_FACTOR_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipTwoFactor) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (user?.isTwoFactorEnabled && !user.isTwoFactorAuthenticated) {
      throw new ForbiddenException('Требуется двухфакторная аутентификация');
    }

    return true;
  }
}
