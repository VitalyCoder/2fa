import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Адрес электронной почты пользователя',
  })
  @IsEmail({}, { message: 'Неверный формат email' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Пароль пользователя (минимум 6 символов)',
  })
  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password: string;

  @ApiProperty({
    example: 'Иван Иванов',
    description: 'Полное имя пользователя',
    required: false,
  })
  @IsString({ message: 'Имя должно быть строкой' })
  name?: string;
}
