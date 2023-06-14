import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { Reservation } from 'src/reservations/interface/reservation.interface';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { GetFilterDto } from './filters/get-filter.dto';
import { Customer } from './interface/customer.interface';

@Injectable()
export class CustomersService {
  constructor(
    @Inject('CUSTOMER_MODEL')
    private customerModel: Model<Customer>,
    @Inject('RESERVATION_MODEL')
    private readonly reservationModel: Model<Reservation>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    try {
      const newCustomer = new this.customerModel(createCustomerDto);
      await newCustomer.save();
      return newCustomer;
    } catch (err) {
      console.log(err.message);
      throw new ForbiddenException();
    }
  }

  async findAll(): Promise<Customer[]> {
    try {
      return this.customerModel.find({});
    } catch (err) {
      console.log(err.message);
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: err.message,
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async findOne(filterDto: GetFilterDto): Promise<Customer> {
    try {
      return this.customerModel.findById({ _id: filterDto });
    } catch (err) {
      console.log(err.message);
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: err.message,
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    try {
      return this.customerModel.findByIdAndUpdate(
        { _id: id },
        updateCustomerDto,
        { new: true },
      );
    } catch (err) {
      console.log(err.message);
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: err.message,
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  remove(id: string) {
    try {
      return this.customerModel.findByIdAndDelete({ _id: id }, { new: true });
    } catch (err) {
      console.log(err.message);
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: err.message,
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async bookingHistory(id: string) {
    const list = await this.reservationModel.find({
      customerId: id,
      bookingDate: { $lte: new Date() },
    });
    if (list.length > 0) {
      return list;
    } else {
      return 'no booking history found';
    }
  }
}
