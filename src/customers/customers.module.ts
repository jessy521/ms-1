import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { customerProviders } from './provider/customer.provider';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from 'src/auth/auth.module';
import { CaslModule } from 'src/casl/casl.module';
import { reservationProviders } from 'src/reservations/providers/reservation.provider';

@Module({
  imports: [AuthModule, DatabaseModule, CaslModule],
  controllers: [CustomersController],
  providers: [...customerProviders, CustomersService, ...reservationProviders],
})
export class CustomersModule {}
