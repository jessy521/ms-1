import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

export const customerSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    unique: true,
  },
  phoneNumber: {
    type: String,
    unique: true,
  },
});
