import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { SkipTwoFactor } from './decorators/skip-two-factor.decorator';
import {
  Enable2FaDto,
  LoginDto,
  LoginWith2FaDto,
  RegisterDto,
  Verify2FaDto,
} from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TwoFactorGuard } from './guards/two-factor.guard';
import { AuthenticatedUser } from './types/authenticated-user.types';

@ApiTags('Аутентификация')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация пользователя' })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно зарегистрирован',
    schema: {
      example: {
        user: {
          id: 'cuid123',
          email: 'user@example.com',
          name: 'Иван Иванов',
          isTwoFactorEnabled: false,
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Пользователь уже существует' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход в систему' })
  @ApiResponse({
    status: 200,
    description: 'Успешная аутентификация',
    schema: {
      example: {
        user: {
          id: 'cuid123',
          email: 'user@example.com',
          name: 'Иван Иванов',
          isTwoFactorEnabled: false,
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        requiresTwoFactor: false,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Требуется 2FA',
    schema: {
      example: {
        requiresTwoFactor: true,
        message: 'Требуется двухфакторная аутентификация',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Неверные учетные данные' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('login-2fa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход с двухфакторной аутентификацией' })
  @ApiResponse({
    status: 200,
    description: 'Успешная аутентификация с 2FA',
    schema: {
      example: {
        user: {
          id: 'cuid123',
          email: 'user@example.com',
          name: 'Иван Иванов',
          isTwoFactorEnabled: true,
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Неверный TOTP код или учетные данные',
  })
  async loginWith2FA(@Body() loginWith2FaDto: LoginWith2FaDto) {
    return this.authService.loginWith2FA(loginWith2FaDto);
  }

  @Get('2fa/generate')
  @UseGuards(JwtAuthGuard)
  @SkipTwoFactor()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Генерация секрета для 2FA' })
  @ApiResponse({
    status: 200,
    description: 'Секрет и QR-код сгенерированы',
    schema: {
      example: {
        secret: 'JBSWY3DPEHPK3PXP',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
      },
    },
  })
  @ApiResponse({ status: 400, description: '2FA уже включена' })
  async generate2FASecret(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.generate2FASecret(user.id);
  }

  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  @SkipTwoFactor()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Включение 2FA' })
  @ApiBody({ type: Enable2FaDto })
  @ApiResponse({
    status: 200,
    description: '2FA успешно включена',
    schema: {
      example: {
        message: '2FA успешно включена',
        backupCodes: ['A1B2C3D4', 'E5F6G7H8', '...'],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Неверный TOTP код' })
  async enable2FA(
    @CurrentUser() user: AuthenticatedUser,
    @Body() enable2FaDto: Enable2FaDto,
  ) {
    return this.authService.enable2FA(user.id, enable2FaDto);
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard, TwoFactorGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отключение 2FA' })
  @ApiBody({ type: Verify2FaDto })
  @ApiResponse({
    status: 200,
    description: '2FA успешно отключена',
    schema: {
      example: {
        message: '2FA успешно отключена',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Неверный TOTP код' })
  async disable2FA(
    @CurrentUser() user: AuthenticatedUser,
    @Body() verify2FaDto: Verify2FaDto,
  ) {
    return this.authService.disable2FA(user.id, verify2FaDto);
  }

  @Post('2fa/verify')
  @UseGuards(JwtAuthGuard)
  @SkipTwoFactor()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Верификация TOTP кода' })
  @ApiBody({ type: Verify2FaDto })
  @ApiResponse({
    status: 200,
    description: 'TOTP код верифицирован',
    schema: {
      example: {
        message: 'TOTP код верифицирован',
        valid: true,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Неверный TOTP код' })
  async verify2FA(
    @CurrentUser() user: AuthenticatedUser,
    @Body() verify2FaDto: Verify2FaDto,
  ) {
    return this.authService.verify2FA(user.id, verify2FaDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, TwoFactorGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получение профиля пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Профиль пользователя',
    schema: {
      example: {
        id: 'cuid123',
        email: 'user@example.com',
        name: 'Иван Иванов',
        isTwoFactorEnabled: true,
      },
    },
  })
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
    };
  }
}
