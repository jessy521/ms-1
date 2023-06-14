import { Connection } from 'mongoose';
import otpSchema from './UserOtp';

export const otpProviders = [
  {
    provide: 'OTP_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('UserOtp', otpSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
