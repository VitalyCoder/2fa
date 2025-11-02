import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class Enable2FaDto {
  @ApiProperty({
    example: '123456',
    description: 'TOTP код для подтверждения настройки 2FA',
  })
  @IsString({ message: 'TOTP код должен быть строкой' })
  @IsNotEmpty({ message: 'TOTP код не может быть пустым' })
  @Length(6, 6, { message: 'TOTP код должен содержать 6 символов' })
  totpCode: string;
}

export class Verify2FaDto {
  @ApiProperty({
    example: '123456',
    description: 'TOTP код для верификации',
  })
  @IsString({ message: 'TOTP код должен быть строкой' })
  @IsNotEmpty({ message: 'TOTP код не может быть пустым' })
  @Length(6, 6, { message: 'TOTP код должен содержать 6 символов' })
  totpCode: string;
}

export class LoginWith2FaDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Адрес электронной почты пользователя',
  })
  @IsString({ message: 'Email должен быть строкой' })
  @IsNotEmpty({ message: 'Email не может быть пустым' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Пароль пользователя',
  })
  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль не может быть пустым' })
  password: string;

  @ApiProperty({
    example: '123456',
    description: 'TOTP код для двухфакторной аутентификации',
  })
  @IsString({ message: 'TOTP код должен быть строкой' })
  @IsNotEmpty({ message: 'TOTP код не может быть пустым' })
  @Length(6, 6, { message: 'TOTP код должен содержать 6 символов' })
  totpCode: string;
}
