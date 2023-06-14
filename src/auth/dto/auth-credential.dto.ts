import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AuthCredentials {
  @ApiProperty({
    type: String,
    description:
      'Name of the User ,should be not less than 5 or not longer than 20 also should be unique',
    default: 'abc@email.com',
  })
  @MinLength(6)
  @IsString()
  email: string;

  @ApiProperty({
    type: String,
    description:
      'Password should not be lesser than 8 or longer than 20 and also use uppercase & lowercase & specialCharecter combination',
    default: 'Abc@@123#',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be atleast 8 characters' })
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is very weak',
  })
  password: string;
}

export class signInWithOTP {
  @ApiPropertyOptional({
    type: String,
    description: 'Enter the phone number of length 10 or email Id',
    default: '1234567890',
  })
  @IsOptional()
  @IsString()
  phoneOrEmail: string;
}
