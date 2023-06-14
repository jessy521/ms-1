import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateCustomerReviewDto } from './create-customer-review.dto';

export class UpdateCustomerReviewDto extends PartialType(
  CreateCustomerReviewDto,
) {
  @ApiProperty({
    type: String,
    description: 'Id of thr customer,who is giving the review',
    default: '',
  })
  customerId: string;

  // @ApiProperty({
  //   type: String,
  //   description: 'Id of the hotel ,reviewing the customer',
  //   default: '',
  // })
  // hotelId: string;

  @ApiProperty({
    type: String,
    description: 'Id of the room of the hotel',
    default: '',
  })
  roomId: string;

  @ApiProperty({
    type: String,
    description: 'Customer name',
    default: '',
  })
  customerName: string;

  @ApiProperty({
    type: String,
    description: 'Comment for the hotel & room',
    default: '',
  })
  comment: string;

  @ApiProperty({
    type: Number,
    description: 'rating for the hotel',
    default: '',
  })
  rate: number;
}
