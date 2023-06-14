import { Connection } from 'mongoose';
import { customerSchema } from '../schema/customer.schema';

export const customerProviders = [
  {
    provide: 'CUSTOMER_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Customer', customerSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
