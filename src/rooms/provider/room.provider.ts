import { Connection } from 'mongoose';
import { roomSchema } from '../schema/room.schema';

export const roomProviders = [
  {
    provide: 'ROOM_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Room', roomSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
