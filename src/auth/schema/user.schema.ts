import * as mongoose from 'mongoose';
import { Property } from 'src/property/interface/property.interface';
const Schema = mongoose.Schema;

export const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  phone: String,
  password: {
    type: String,
    required: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    default: 'user',
  },
  propertyId: {
    type: Schema.Types.ObjectId,
    ref: Property,
  },
  status: { type: String, enum: ['active', 'inActive'] },
});
