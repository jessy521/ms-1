import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

export interface UserOtp extends mongoose.Document {
  userId: string;
  email: string;
  otp: string;
  type: string;
  // rId: string;
}

const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    createdAt: { type: Date, expires: '5m', default: Date.now },
  },
  {
    timestamps: {
      updatedAt: 'updatedAt',
    },
    collection: 'user_otp',
  },
);
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });
otpSchema.pre('save', async function (next) {
  let self = this as UserOtp;
  self.otp = await bcrypt.hash(self.otp, 10);
  // console.log(this);
  next();
});

export default otpSchema;
