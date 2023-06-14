import { Connection } from 'mongoose';
import { customerReviewSchema } from '../schema/customer-review.schema';

export const customerReviewProviders = [
  {
    provide: 'CUSTOMER_REVIEW_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('CustomerReviews', customerReviewSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
