import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CreateAuthDto } from './create-auth.dto';

export class UpdateAuthDto extends PartialType(CreateAuthDto) {
  @ApiProperty({
    type: String,
    description:
      'Name of the User ,should be not less than 5 or not longer than 20 also should be unique',
    default: 'abcdef',
  })
  @MinLength(5)
  @MaxLength(20)
  @IsString()
  username: string;

  @ApiProperty({
    type: String,
    description: 'Email of the user',
    default: 'abc@email.com',
  })
  @IsEmail()
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

export class ApproveDto {
  @IsBoolean()
  @ApiProperty({
    type: Boolean,
    default: true,
  })
  isApproved: Boolean;
}
