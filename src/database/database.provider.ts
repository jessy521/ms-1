import * as mongoose from 'mongoose';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect(
        'mongodb+srv://jessy521:OadW5zpr4n2p2LEF@cluster0.vhty7kb.mongodb.net/?retryWrites=true&w=majority',
      ),
  },
];
