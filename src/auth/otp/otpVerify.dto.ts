import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class otpVerifyDto {
  @ApiPropertyOptional({
    type: String,
    default: '',
  })
  @IsString()
  userId: string;

  @ApiPropertyOptional({
    type: String,
    default: '',
  })
  @IsString()
  email: string;

  @ApiPropertyOptional({
    type: String,
    default: '',
  })
  @IsString()
  phone: string;

  @ApiPropertyOptional({
    type: String,
    default: '',
  })
  @IsString()
  otp: string;

  @ApiPropertyOptional({
    type: String,
    default: '',
  })
  @IsOptional()
  @IsString()
  type: string;
}
