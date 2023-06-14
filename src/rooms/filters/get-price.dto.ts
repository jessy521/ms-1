import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetPriceDto {
  @ApiPropertyOptional({
    type: String,
    description: 'put room Id here',
    default: '',
  })
  roomId: string;

  @ApiPropertyOptional({
    type: 'number',
    description: 'put adult number',
    default: 2,
  })
  adult: number;
  @ApiPropertyOptional({
    type: 'number',
    description: 'put child number',
    default: 1,
  })
  child: number;

  @ApiPropertyOptional({
    type: String,
    description: 'put the array of facilities that',
    default: [
      {
        facility: 'bed',
        price: 2,
        single: true,
      },
    ],
  })
  extra: [
    {
      facility: string;
      price: number;
      single: boolean;
    },
  ];

  @ApiPropertyOptional({
    type: 'number',
    description: 'put totalPeople number',
    default: 3,
  })
  totalPeople: number;

  @ApiPropertyOptional({
    type: 'number',
    description: 'put total days of booking',
    default: 5,
  })
  totalDays: number;

  @ApiPropertyOptional({
    type: 'number',
    description: 'put the number of booked rooms',
    default: 2,
  })
  totalRooms: number;
}
