import * as mongoose from 'mongoose';
import { Property } from 'src/property/interface/property.interface';
const Schema = mongoose.Schema;

export const roomSchema = new mongoose.Schema({
  propertyId: {
    type: Schema.Types.ObjectId,
    ref: Property,
  },
  type: String,
  beds: String,
  facilities: [String],
  price: {
    single: 'number',
    couple: 'number',
    child: 'number',
  },
  count: 'number',
  images: [Object],
});
