import * as mongoose from 'mongoose';
import { Customer } from 'src/customers/interface/customer.interface';
import { Property } from 'src/property/interface/property.interface';
import { Room } from 'src/rooms/interface/room.interface';
const Schema = mongoose.Schema;

export const customerReviewSchema = new mongoose.Schema({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: Customer,
  },
  propertyId: {
    type: Schema.Types.ObjectId,
    ref: Property,
  },
  roomId: {
    type: Schema.Types.ObjectId,
    ref: Room,
  },
  customerName: String,
  comment: String,
  rate: 'number',
  reviewDate: {
    type: Date,
    default: new Date(),
  },
});
