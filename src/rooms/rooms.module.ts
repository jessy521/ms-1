import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { DatabaseModule } from 'src/database/database.module';
import { roomProviders } from './provider/room.provider';
import { AuthModule } from 'src/auth/auth.module';
import { CaslModule } from 'src/casl/casl.module';
import { propertyProviders } from 'src/property/provider/hotels.provider';

@Module({
  imports: [DatabaseModule, AuthModule, CaslModule],
  controllers: [RoomsController],
  providers: [...roomProviders, RoomsService, ...propertyProviders],
})
export class RoomsModule {}
