import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength } from 'class-validator';
export class CreateCustomerDto {
  @ApiProperty({
    type: String,
    description: 'First name of the customer',
    default: '',
  })
  firstName: String;

  @ApiProperty({
    type: String,
    description: 'Last name of the customer',
    default: '',
  })
  lastName: String;

  @ApiProperty({
    type: String,
    description: 'Email of the customer',
    default: '',
  })
  @IsEmail()
  email: String;

  @MaxLength(10)
  @ApiProperty({
    type: String,
    description: 'Phone number name of the customer',
    default: '',
  })
  phoneNumber: String;
}
