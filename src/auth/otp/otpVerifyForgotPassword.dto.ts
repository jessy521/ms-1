import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class otpVerifyForgotPasswordDto {
  @ApiPropertyOptional({
    type: String,
    default: '',
  })
  userId: string;
  @ApiPropertyOptional({
    type: String,
    default: '',
  })
  email: string;

  @ApiPropertyOptional({
    type: String,
    default: '',
  })
  otp: string;
}

export class passwordDto {
  @ApiProperty({
    type: String,
    default: '',
  })
  password: string;

  @ApiProperty({
    type: String,
    default: '',
  })
  confirmPassword: string;
}

export class emailDto {
  @ApiProperty({
    type: String,
    default: '',
  })
  email: string;
}
