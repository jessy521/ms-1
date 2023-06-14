import { Module } from '@nestjs/common';
import { CustomerReviewsService } from './customer-reviews.service';
import { CustomerReviewsController } from './customer-reviews.controller';
import { customerReviewProviders } from './provider/customer-review.provider';
import { DatabaseModule } from 'src/database/database.module';
import { customerProviders } from 'src/customers/provider/customer.provider';
import { AuthModule } from 'src/auth/auth.module';
import { CaslModule } from 'src/casl/casl.module';
import { roomProviders } from 'src/rooms/provider/room.provider';

@Module({
  imports: [DatabaseModule, AuthModule, CaslModule],
  controllers: [CustomerReviewsController],
  providers: [
    ...customerReviewProviders,
    CustomerReviewsService,
    ...customerProviders,
    ...roomProviders,
  ],
})
export class CustomerReviewsModule {}
