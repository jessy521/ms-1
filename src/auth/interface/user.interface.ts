import { ObjectId, Schema } from 'mongoose';

export class User {
  _id: Schema.Types.ObjectId;
  username: String;
  email: string;
  phone: String;
  password: String;
  role: String;
  isApproved: Boolean;
  propertyId: ObjectId;
  status: String;
}
