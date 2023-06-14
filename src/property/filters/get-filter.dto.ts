import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetFilterDto {
  @ApiPropertyOptional({
    type: String,
    description: 'search by id',
    default: '',
  })
  id: string;

  @ApiPropertyOptional({
    type: String,
    description: 'search by check-in date',
    default: '',
  })
  checkIn: string;

  @ApiPropertyOptional({
    type: String,
    description: 'search by check-out date',
    default: '',
  })
  checkOut: string;

  @ApiPropertyOptional({
    type: String,
    description: 'search by city',
    default: '',
  })
  city: string;

  @ApiPropertyOptional({
    type: String,
    description: 'search by state',
    default: '',
  })
  state: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'search by min-price',
    default: 1000,
  })
  minPrice: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'search by max-price',
    default: 2000,
  })
  maxPrice: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'search by rating',
    default: 2,
  })
  rating: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'search by room amount',
    default: 2,
  })
  room: number;

  @ApiPropertyOptional({
    type: [String],
    description: 'search by facilities',
    default: ['', ''],
  })
  facilities: [string];
}
