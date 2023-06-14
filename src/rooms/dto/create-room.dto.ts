import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  // @ApiProperty({
  //   type: String,
  //   description: 'Hotel Id',
  //   default: '',
  // })
  // hotelId;

  @ApiProperty({
    type: String,
    description: 'Room Type',
    default: '',
  })
  type: string;

  @ApiProperty({
    type: String,
    description: 'beds in the room',
    default: '',
  })
  beds: string;

  @ApiProperty({
    type: [String],
    description: 'Room facilities',
    default: ['', ''],
  })
  facilities: [string];

  @ApiProperty({
    type: Object,
    description: 'Room rent price',
    default: {
      single: 3000,
      couple: 4000,
      child: 1500,
    },
  })
  price: {
    single: number;
    couple: number;
    child: number;
  };

  @ApiProperty({
    type: 'number',
    description: 'Room rent price',
    default: 0,
  })
  count: number;
}
