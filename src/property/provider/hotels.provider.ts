import { Connection } from 'mongoose';
import { propertySchema } from '../schema/property.schema';

export const propertyProviders = [
  {
    provide: 'PROPERTY_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Property', propertySchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
