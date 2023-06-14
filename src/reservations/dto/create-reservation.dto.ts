import { ApiProperty } from '@nestjs/swagger';

export class CreateReservationDto {
  @ApiProperty({
    type: String,
    description: 'Room id',
    default: '',
  })
  roomId: string;

  @ApiProperty({
    type: 'number',
    description: 'number of rooms',
    default: 2,
  })
  rooms: 'number';

  @ApiProperty({
    type: String,
    description: 'User id',
    default: '',
  })
  userId;

  // @ApiProperty({
  //   type: String,
  //   description: 'Customer details',
  //   default: '',
  // })
  // customer: Object;

  // @ApiProperty({
  //   type: String,
  //   description: 'Booking date',
  //   default: '',
  // })
  // bookingDate: Date;

  // @ApiProperty({
  //   type: String,
  //   description: 'members',
  //   default: '',
  // })
  // members: string;

  @ApiProperty({
    type: String,
    description: 'Check-in date',
    default: '',
  })
  checkIn: Date;

  @ApiProperty({
    type: String,
    description: 'Check-out date',
    default: '',
  })
  checkOut: Date;

  @ApiProperty({
    type: String,
    description: 'guestDetails for the reservation',
    default: {
      firstName: '',
      lastName: '',
      title: '',
    },
  })
  guestDetails: {
    firstName: String;
    lastName: String;
    title: String;
  };

  @ApiProperty({
    type: String,
    description: 'Email of thr customer',
    default: '',
  })
  email: string;

  @ApiProperty({
    type: String,
    description: 'Phone of thr customer',
    default: '',
  })
  phone: string;

  // @ApiProperty({
  //   type: String,
  //   description: 'payment status',
  //   default: '',
  // })
  // paymentStatus: string;

  @ApiProperty({
    type: String,
    description: 'booking mode offline/online',
    default: 'offline/online',
  })
  mode: string;

  @ApiProperty({
    type: Object,
    description: 'price breakdown from room price api',
    default: {},
  })
  priceBreakdown: {
    roomId;
    adult: number;
    child: number;
    extra: [Object];
    totalPeople: number;
    totalDays: number;
    totalRooms: number;
    price: number;
    totalPerDay: number;
    grandTotal: number;
  };
}
