import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { Customer } from 'src/customers/interface/customer.interface';
import { Room } from 'src/rooms/interface/room.interface';
import { CreateCustomerReviewDto } from './dto/create-customer-review.dto';
import { UpdateCustomerReviewDto } from './dto/update-customer-review.dto';
import { GetFilterDto } from './filters/get-filter.dto';
import { CustomerReviews } from './interface/customer-review.interface';

@Injectable()
export class CustomerReviewsService {
  constructor(
    @Inject('CUSTOMER_REVIEW_MODEL')
    private cusromerReviewModel: Model<CustomerReviews>,
    @Inject('CUSTOMER_MODEL')
    private customerModel: Model<Customer>,
    @Inject('ROOM_MODEL')
    private roomModel: Model<Room>,
  ) {}

  async create(
    createCustomerReviewDto: CreateCustomerReviewDto,
  ): Promise<CustomerReviews> {
    try {
      const { customerId, roomId } = createCustomerReviewDto;
      const customer = await this.customerModel.findById({ _id: customerId });
      const room = await this.roomModel.findOne({ _id: roomId });

      const customer_review = new this.cusromerReviewModel(
        createCustomerReviewDto,
      );
      customer_review.customerName = await customer.firstName;
      customer_review.propertyId = await room.propertyId;
      await customer_review.save();

      return customer_review;
    } catch (error) {
      console.log(error.message);
      throw new ForbiddenException();
    }
  }

  async findAll(documentsToSkip?: string, limitOfDocuments?: string) {
    try {
      const query = this.cusromerReviewModel
        .find()
        .sort({ _id: -1 })
        .skip(parseInt(documentsToSkip));
      // .populate('comment')
      // .populate('rate');

      if (limitOfDocuments) {
        query.limit(parseInt(limitOfDocuments));
      }

      const results = await query;
      const count = await this.cusromerReviewModel.count();
      return { results, count };
    } catch (error) {
      console.log(error.message);
      throw new BadRequestException();
    }
  }

  async find(id, hotelid, customerid, skipNo?: string, limitNo?: string) {
    try {
      if (id && hotelid === undefined && customerid === undefined) {
        const reviews = await this.cusromerReviewModel.findById({ _id: id });
        return reviews;
      } else if (hotelid && id === undefined && customerid === undefined) {
        let reviews = await this.cusromerReviewModel
          .find({
            hotelId: hotelid,
          })
          .sort({ _id: -1 });
        if (skipNo) {
          reviews = reviews.slice(parseInt(skipNo));
        }
        if (limitNo) {
          reviews = reviews.slice(0, parseInt(limitNo));
        }
        return reviews;
      } else if (customerid && id === undefined && hotelid === undefined) {
        let reviews = await this.cusromerReviewModel
          .find({
            customerId: customerid,
          })
          .sort({ _id: -1 });
        if (skipNo) {
          reviews = reviews.slice(parseInt(skipNo));
        }
        if (limitNo) {
          reviews = reviews.slice(0, parseInt(limitNo));
        }
        return reviews;
      }
    } catch (error) {
      console.log(error.message);
      throw new BadRequestException();
    }
  }

  async update(
    id: string,
    updateCustomerReviewDto: UpdateCustomerReviewDto,
  ): Promise<CustomerReviews> {
    try {
      const updatedReview = await this.cusromerReviewModel.findByIdAndUpdate(
        { _id: id },
        updateCustomerReviewDto,
        { new: true },
      );

      return updatedReview;
    } catch (error) {
      console.log(error.message);
      throw new ForbiddenException();
    }
  }

  async remove(id: string): Promise<CustomerReviews> {
    try {
      const oldReview = await this.cusromerReviewModel.findById({ _id: id });
      const deletedReview = await this.cusromerReviewModel.findByIdAndDelete({
        _id: id,
      });

      return deletedReview;
    } catch (error) {
      console.log(error.message);
      throw new BadRequestException();
    }
  }
}
