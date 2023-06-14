import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength } from 'class-validator';
import { CreateCustomerDto } from './create-customer.dto';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
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
