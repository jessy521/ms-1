import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { propertyProviders } from './provider/hotels.provider';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from 'src/auth/auth.module';
import { CaslModule } from 'src/casl/casl.module';
import { customerReviewProviders } from 'src/customer-reviews/provider/customer-review.provider';
import { reservationProviders } from 'src/reservations/providers/reservation.provider';
import { roomProviders } from 'src/rooms/provider/room.provider';

@Module({
  imports: [AuthModule, DatabaseModule, CaslModule],
  controllers: [PropertyController],
  providers: [
    ...propertyProviders,
    PropertyService,
    ...customerReviewProviders,
    ...reservationProviders,
    ...roomProviders,
  ],
})
export class PropertyModule {}
