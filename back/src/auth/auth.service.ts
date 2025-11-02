import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import { UsersService } from '../users/users.service';
import {
  Enable2FaDto,
  LoginDto,
  LoginWith2FaDto,
  RegisterDto,
  Verify2FaDto,
} from './dto';
import { TwoFactorService } from './two-factor.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private twoFactorService: TwoFactorService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const user = await this.usersService.create(registerDto);

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      },
      accessToken,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (user.isTwoFactorEnabled) {
      return {
        requiresTwoFactor: true,
        message: 'Требуется двухфакторная аутентификация',
      };
    }

    await this.usersService.updateLastLogin(user.id);

    const payload = {
      sub: user.id,
      email: user.email,
      isTwoFactorAuthenticated: false,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      },
      accessToken,
      requiresTwoFactor: false,
    };
  }

  async loginWith2FA(loginWith2FaDto: LoginWith2FaDto) {
    const user = await this.validateUser(
      loginWith2FaDto.email,
      loginWith2FaDto.password,
    );

    if (!user.isTwoFactorEnabled) {
      throw new BadRequestException('2FA не включена для этого пользователя');
    }

    if (!user.twoFactorSecret) {
      throw new BadRequestException('2FA секрет не установлен');
    }

    const isValidToken = this.twoFactorService.verifyToken(
      loginWith2FaDto.totpCode,
      user.twoFactorSecret,
    );

    if (!isValidToken) {
      throw new UnauthorizedException('Неверный TOTP код');
    }

    await this.usersService.updateLastLogin(user.id);

    const payload = {
      sub: user.id,
      email: user.email,
      isTwoFactorAuthenticated: true,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      },
      accessToken,
    };
  }

  async generate2FASecret(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    }

    if (user.isTwoFactorEnabled) {
      throw new BadRequestException('2FA уже включена');
    }

    const { secret, otpauth_url } = this.twoFactorService.generateSecret(
      user.email,
    );

    // Сохраняем секрет в БД (пока не подтвержден)
    await this.usersService.updateTwoFactorSecret(userId, secret);

    const qrCodeDataURL = await this.twoFactorService.generateQRCode(
      otpauth_url || '',
    );

    return {
      secret,
      qrCode: qrCodeDataURL,
    };
  }

  async enable2FA(userId: string, enable2FaDto: Enable2FaDto) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    }

    if (user.isTwoFactorEnabled) {
      throw new BadRequestException('2FA уже включена');
    }

    if (!user.twoFactorSecret) {
      throw new BadRequestException('Сначала сгенерируйте секрет 2FA');
    }

    const isValidToken = this.twoFactorService.verifyToken(
      enable2FaDto.totpCode,
      user.twoFactorSecret,
    );

    if (!isValidToken) {
      throw new UnauthorizedException('Неверный TOTP код');
    }

    // Включаем 2FA
    await this.usersService.enableTwoFactor(userId);

    // Генерируем резервные коды
    const backupCodes = this.twoFactorService.generateBackupCodes();

    return {
      message: '2FA успешно включена',
      backupCodes,
    };
  }

  async disable2FA(userId: string, verify2FaDto: Verify2FaDto) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    }

    if (!user.isTwoFactorEnabled) {
      throw new BadRequestException('2FA не включена');
    }

    if (!user.twoFactorSecret) {
      throw new BadRequestException('2FA секрет не найден');
    }

    const isValidToken = this.twoFactorService.verifyToken(
      verify2FaDto.totpCode,
      user.twoFactorSecret,
    );

    if (!isValidToken) {
      throw new UnauthorizedException('Неверный TOTP код');
    }

    // Отключаем 2FA
    await this.usersService.disableTwoFactor(userId);

    return {
      message: '2FA успешно отключена',
    };
  }

  async verify2FA(userId: string, verify2FaDto: Verify2FaDto) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    }

    if (!user.isTwoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestException('2FA не настроена');
    }

    const isValidToken = this.twoFactorService.verifyToken(
      verify2FaDto.totpCode,
      user.twoFactorSecret,
    );

    if (!isValidToken) {
      throw new UnauthorizedException('Неверный TOTP код');
    }

    return {
      message: 'TOTP код верифицирован',
      valid: true,
    };
  }

  private async validateUser(email: string, password: string): Promise<User> {
    const user: User | null = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    // Возвращаем проверенного пользователя
    return user;
  }
}
