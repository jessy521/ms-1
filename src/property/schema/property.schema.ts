import * as mongoose from 'mongoose';
import { User } from 'src/auth/interface/user.interface';
const Schema = mongoose.Schema;

export const Price = new mongoose.Schema({
  facility: String,
  price: 'number',
  single: Boolean,
});

export const propertySchema = new mongoose.Schema({
  name: String,
  location: {
    type: new mongoose.Schema(
      {
        city: String,
        state: String,
        mapLink: String,
      },
      { _id: false },
    ),
  },
  description: String,
  contactNo: String,
  email: String,
  facilities: [String],
  averageRating: 'number',
  ratingCount: 'number',
  extra: [Price],
  ownedBy: {
    type: Schema.Types.ObjectId,
    ref: User,
  },
  images: [Object],
  map: String,
});
