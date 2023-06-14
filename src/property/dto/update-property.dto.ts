import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { ObjectId } from 'mongoose';
import { CreatePropertyDto } from './create-property.dto';

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {
  @ApiProperty({
    type: String,
    description: 'Hotel name',
    default: '',
  })
  name: string;

  @ApiProperty({
    type: Object,
    description: "Hotel's location",
    default: {
      city: '',
      state: '',
      mapLink: '',
    },
  })
  location: Object;

  @ApiProperty({
    type: String,
    description: "Hotel's description ",
    default: '',
  })
  description: string;

  @ApiProperty({
    type: String,
    description: "Hotel's contact  number",
    default: '',
  })
  contactNo: string;

  @ApiProperty({
    type: String,
    description: "Hotel's email address",
    default: '',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    type: [Object],
    description: 'Room facilities',
    default: ['', ''],
  })
  facilities: [string];

  @ApiProperty({
    type: [Object],
    description: 'Price breakdown',
    default: [
      {
        facility: 'bed',
        price: 2000,
        single: false,
      },
      {
        facility: 'child',
        price: 1000,
        single: false,
      },
    ],
  })
  extra: [
    {
      facility: string;
      price: 'number';
      single: boolean;
    },
  ];

  @ApiProperty({
    type: String,
    description: "Hotel's owner's Id",
    default: '',
  })
  ownedBy: ObjectId;

  @ApiProperty({
    type: String,
    description: 'Url of the map of the property',
    default: '',
  })
  map: string;
}
