import { Connection } from 'mongoose';
import { reservationSchema } from '../schema/reservation.schema';

export const reservationProviders = [
  {
    provide: 'RESERVATION_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Reservation', reservationSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
