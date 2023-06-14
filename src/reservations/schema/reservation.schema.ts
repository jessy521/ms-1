import * as mongoose from 'mongoose';
import { User } from 'src/auth/interface/user.interface';
const Schema = mongoose.Schema;
import { Customer } from 'src/customers/interface/customer.interface';
import { Property } from 'src/property/interface/property.interface';
import { Room } from 'src/rooms/interface/room.interface';

const roomAvailability = new mongoose.Schema({
  bookedDate: Date,
  availability: {
    type: String,
    default: 'booked',
  },
});

export const reservationSchema = new mongoose.Schema({
  propertyId: {
    type: Schema.Types.ObjectId,
    ref: Property,
  },
  roomId: { type: Schema.Types.ObjectId, ref: Room },
  rooms: 'number',
  userId: {
    type: Schema.Types.ObjectId,
    ref: User,
  },
  // customerId: {
  //   type: Schema.Types.ObjectId,
  //   ref: Customer,
  // },
  // customer: Object,
  bookingDate: {
    type: Date,
    default: new Date(),
  },
  // members: String,
  checkIn: Date,
  checkOut: Date,
  guestDetails: {
    firstName: String,
    lastName: String,
    title: String,
  },
  email: String,
  phone: String,
  paymentStatus: {
    type: String,
    default: 'due',
  },
  status: {
    type: String,
    default: 'booked',
  },
  // availability: roomAvailability,
  availability: 'number',
  bookedDates: [Date],
  priceBreakdown: Object,

  screenShot: Object,
  mode: {
    type: String,
    enum: ['online', 'offline'],
  },
  type: String,
  bookedBy: String,

  feedback: {
    type: new mongoose.Schema(
      {
        rating: {
          type: 'number',
          min: [0, 'Rating should be greater than or equal to 0'],
          max: [5, 'Rating should be less than or equal to 5'],
          required: true,
        },
        review: String,
        guestName: String,
      },
      { _id: false },
    ),
    required: false,
    default: null,
  },
});
