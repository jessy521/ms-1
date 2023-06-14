import { Module } from '@nestjs/common';
import { CustomersModule } from './customers/customers.module';
import { CustomerReviewsModule } from './customer-reviews/customer-reviews.module';
import { ReservationModule } from './reservations/reservation.module';
import { RoomsModule } from './rooms/rooms.module';
import { PropertyModule } from './property/property.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    CustomersModule,
    CustomerReviewsModule,
    ReservationModule,
    PropertyModule,
    RoomsModule,
  ],
})
export class AppModule {}
