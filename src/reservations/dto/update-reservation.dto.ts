import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateReservationDto } from './create-reservation.dto';

export class UpdateReservationDto {
  @ApiProperty({
    type: String,
    description: 'Room id',
    default: '',
  })
  roomId;

  // @ApiProperty({
  //   type: 'number',
  //   description: 'number of rooms',
  //   default: 2,
  // })
  // rooms: 'number';

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

  @ApiProperty({
    type: String,
    description: 'Booking date',
    default: '',
  })
  bookingDate: Date;

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
    description: 'Phone of the customer',
    default: '',
  })
  phone: string;

  @ApiProperty({
    type: String,
    description: 'payment status',
    default: '',
  })
  paymentStatus: string;

  @ApiProperty({
    type: String,
    description: 'booking status',
    default: '',
  })
  status: string;

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

  @ApiProperty({
    type: Object,
    description: 'Screenshot of the payment',
    default: {},
  })
  screenShot: Object;

  @ApiPropertyOptional({
    type: Object,
    description: 'feedback',
    default: {},
  })
  feedback: {
    rating: number;
    review: string;
    guestName: string;
  };

  @ApiProperty({
    type: String,
    description: 'booking mode offline/online',
    default: 'offline/online',
  })
  mode: string;
  @ApiProperty({
    type: String,
    description: 'user role : Admin/Property-Admin/Agent/User',
    default: '',
  })
  type: string;

  @ApiProperty({
    type: String,
    description: 'enter the name who booked the reservation',
    default: '',
  })
  bookedBy: string;
}
