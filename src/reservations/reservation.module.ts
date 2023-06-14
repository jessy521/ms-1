import { Module } from '@nestjs/common';
import { ReservationService } from './reservaiton.service';
import { ReservationController } from './reservation.controller';
import { reservationProviders } from './providers/reservation.provider';
import { DatabaseModule } from 'src/database/database.module';
import { customerProviders } from 'src/customers/provider/customer.provider';
import { AuthModule } from 'src/auth/auth.module';
import { CaslModule } from 'src/casl/casl.module';
import { roomProviders } from 'src/rooms/provider/room.provider';
import { propertyProviders } from 'src/property/provider/hotels.provider';
import { MailModule } from 'src/mail/mail.module';
import { reservationCreatedListener } from './listeners/reservation.listener';

@Module({
  imports: [DatabaseModule, AuthModule, CaslModule, MailModule],
  controllers: [ReservationController],
  providers: [
    ...reservationProviders,
    ReservationService,
    ...customerProviders,
    ...propertyProviders,
    ...roomProviders,
    reservationCreatedListener,
  ],
})
export class ReservationModule {}
