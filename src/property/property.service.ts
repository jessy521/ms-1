import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { CustomerReviews } from 'src/customer-reviews/interface/customer-review.interface';
import { Reservation } from 'src/reservations/interface/reservation.interface';
import { Room } from 'src/rooms/interface/room.interface';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { GetFilterDto } from './filters/get-filter.dto';
import { Property } from './interface/property.interface';
import * as moment from 'moment';
import { stringify } from 'querystring';
import { PropertyReview } from './interface/property-review.interface';
import { User } from 'src/auth/interface/user.interface';
import { NotFoundError } from 'rxjs';

@Injectable()
export class PropertyService {
  constructor(
    @Inject('PROPERTY_MODEL')
    private readonly hotelModel: Model<Property>,
    @Inject('CUSTOMER_REVIEW_MODEL')
    private readonly customerReviewsModel: Model<CustomerReviews>,
    @Inject('RESERVATION_MODEL')
    private readonly reservationModel: Model<Reservation>,
    @Inject('ROOM_MODEL')
    private readonly roomModel: Model<Room>,
  ) {}

  async create(createHotelDto: CreatePropertyDto, file): Promise<Property> {
    try {
      const newHotel = new this.hotelModel(createHotelDto);
      if (file) {
        newHotel.images = file;
      }
      await newHotel.save();
      return newHotel;
    } catch (error) {
      console.log(error.message);
      throw new ForbiddenException();
    }
  }

  async uploadImages(id: string, file) {
    try {
      const property = await this.hotelModel.findById({ _id: id });
      if (property && property.images.length >= 0) {
        property.images = property.images.concat(file);
        await property.save();
        return property;
      } else if (property && !property.images) {
        property.images = file;
        await property.save();
        return property;
      } else {
        throw new NotFoundException('Invalid Id');
      }
    } catch (err) {
      throw new ForbiddenException({ message: err.message });
    }
  }

  async findAll(): Promise<Property[]> {
    try {
      return this.hotelModel.find({});
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async findOwner(user: User) {
    try {
      // console.log(user);
      if (user.role === 'Property-Admin') {
        return this.hotelModel.find({ ownedBy: user._id });
      } else if (user.role === 'Admin') {
        return this.hotelModel.aggregate([
          {
            $group: { _id: '$ownedBy', properties: { $push: '$$ROOT' } },
          },
        ]);
      } else {
        throw new BadRequestException();
      }
    } catch (err) {
      throw new BadRequestException();
    }
  }

  async getReviewsForProperty(propertyId): Promise<PropertyReview[]> {
    try {
      const reservations: Reservation['feedback'][] =
        await this.reservationModel
          .find(
            { propertyId, 'feedback.rating': { $exists: true } },
            {
              rating: '$feedback.rating',
              review: '$feedback.review',
              guestName: '$feedback.guestName',
              _id: 0,
            },
          )
          .lean();

      return reservations;
    } catch (error) {
      console.log(error.message);
      throw new BadRequestException();
    }
  }

  async findWithFilters(filterDto) {
    const dateList = await this.getDates(filterDto);

    const dateQuery =
      filterDto?.checkIn || filterDto?.checkOut
        ? {
            $or: [
              {
                checkIn: {
                  $gte: new Date(filterDto.checkIn),
                  $lte: new Date(filterDto.checkOut),
                },
              },
              {
                checkOut: {
                  $gte: new Date(filterDto.checkIn),
                  $lte: new Date(filterDto.checkOut),
                },
              },
            ],
          }
        : {};

    let query = {};
    if (filterDto.city || filterDto.state) {
      if (filterDto.city)
        query['location.city'] = new RegExp(filterDto.city, 'i');
      if (filterDto.state)
        query['location.state'] = new RegExp(filterDto.state, 'i');
    }

    const fac = [];
    if (filterDto.facilities?.length < 2) {
      fac.push(filterDto.facilities);
      query['facilities'] = { $all: fac };
    }
    if (filterDto.facilities?.length >= 2) {
      const fac2 = fac.concat(filterDto.facilities);
      query['facilities'] = { $all: fac2 };
    }

    let priceQuery = {};
    if (filterDto?.minPrice || filterDto?.maxPrice) {
      const min: number =
        filterDto.minPrice != undefined ? parseInt(filterDto.minPrice) : 0;
      const max: number =
        filterDto.maxPrice != undefined
          ? parseInt(filterDto.maxPrice)
          : 100000000;
      priceQuery = {
        'price.single': {
          $gte: min,
          $lte: max,
        },
      };
    }

    if (filterDto?.rating) {
      query['averageRating'] = { $gte: parseInt(filterDto.rating) };
    }

    const finalQuery = { ...dateQuery, ...query };
    const propertiesList = await this.hotelModel.find({});
    const reservations = await this.reservationModel.find(finalQuery, {
      roomId: 1,
      rooms: 1,
      _id: 1,
      propertyId: 1,
    });

    if (reservations.length === 0) {
      return this.hotelModel.aggregate([
        {
          $lookup: {
            from: 'rooms',
            localField: '_id',
            foreignField: 'propertyId',
            as: 'rooms',
            pipeline: [
              {
                $match: priceQuery,
              },
            ],
          },
        },
        { $match: query },
      ]);
    }

    const maxRoomCount = await this.reservationModel.aggregate([
      { $match: finalQuery },
      {
        $unwind: { path: '$bookedDates' },
      },
      {
        $group: {
          _id: {
            date: '$bookedDates',
            roomId: '$roomId',
          },
          count: { $sum: '$rooms' },
        },
      },
      {
        $sort: { date: -1 },
      },
      {
        $group: {
          _id: {
            id: '$_id.roomId',
          },
          maxCount: { $max: '$count' },
        },
      },
    ]);

    const arrayToReturn = await this.hotelModel.aggregate([
      {
        $lookup: {
          from: 'rooms',
          localField: '_id',
          foreignField: 'propertyId',
          as: 'rooms',
          pipeline: [
            {
              $match: priceQuery,
            },
          ],
        },
      },
      { $match: query },
    ]);

    for (let i = 0; i < arrayToReturn.length; i++) {
      for (let j = 0; j < arrayToReturn[i].rooms.length; j++) {
        // if(arrayToReturn[i].rooms[j]);
        let roomOccupied = 0;
        for (let k = 0; k < maxRoomCount.length; k++) {
          if (
            arrayToReturn[i].rooms[j]._id.toString() ===
            maxRoomCount[k]._id.id.toString()
          ) {
            roomOccupied = maxRoomCount[k].maxCount;
          }
        }
        arrayToReturn[i].rooms[j].roomOccupied = roomOccupied;
      }
    }

    if (filterDto?.room) {
      return arrayToReturn
        .filter((property) =>
          property.rooms.some(
            (room) =>
              room.count - room.roomOccupied >= parseInt(filterDto?.room),
          ),
        )
        .map((property) => {
          return Object.assign({}, property, {
            rooms: property.rooms.filter(
              (room) =>
                room.count - room.roomOccupied >= parseInt(filterDto?.room),
            ),
          });
        });
    }

    return arrayToReturn;
  }

  async find(filterDto: GetFilterDto) {
    try {
      if (filterDto.checkIn) {
        const arr = this.findWithFilters(filterDto);
        const property = (await arr).find(
          (element) => element._id.toString() === filterDto.id,
        );
        return property;
      } else if (filterDto.checkIn === undefined) {
        // return this.hotelModel.findById({ _id: filterDto.id });

        const propertyList = await this.hotelModel.aggregate([
          {
            $lookup: {
              from: 'rooms',
              localField: '_id',
              foreignField: 'propertyId',
              as: 'rooms',
              // pipeline: [{ $sort: { price: 1 } }],
            },
          },
        ]);
        const property = propertyList.find(
          (element) => element._id.toString() === filterDto.id,
        );
        return property;
      }
    } catch (error) {
      console.log(error.message);
      throw new BadRequestException();
    }
  }

  async checkAccess(id: string, user: User) {
    const property: Property = await this.hotelModel.findById({ _id: id });
    console.log(property);
    if (user.role === 'Admin') {
      return true;
    } else if (
      property.ownedBy.toString() === user._id.toString() &&
      user.role === 'Property-Admin'
    ) {
      return true;
    } else {
      return false;
    }
  }

  async update(
    id: string,
    updateHotelDto: UpdatePropertyDto,
    user: User,
    files: Array<File>,
  ): Promise<Property> {
    try {
      if (await this.checkAccess(id, user)) {
        const updatedReqBody: any = { ...updateHotelDto };
        if (files?.length > 0) {
          updatedReqBody.images = files;
        }
        return this.hotelModel.findByIdAndUpdate({ _id: id }, updatedReqBody, {
          new: true,
        });
      } else {
        throw new BadRequestException('Access denied!');
      }
    } catch (error) {
      // console.log(error.message);
      throw new ForbiddenException({ message: error.message });
    }
  }

  async remove(id: string, user: User): Promise<Property> {
    try {
      if (await this.checkAccess(id, user)) {
        return this.hotelModel.findOneAndDelete({ _id: id });
      } else {
        throw new BadRequestException('Access denied!');
      }
    } catch (error) {
      // console.log(error.message);
      throw new ForbiddenException({ message: error.message });
    }
  }

  async getReviewInfo(properties) {
    const avgArray = await this.customerReviewsModel.aggregate([
      {
        $group: { _id: '$propertyId', averageRating: { $avg: '$rate' } },
      },
    ]);
    // console.log(avgArray);
    properties.forEach(async (property) => {
      const count = await this.customerReviewsModel
        .find({ propertyId: property._id })
        .count();
      property.ratingCount = count;

      // let propertyFromavgArray = avgArray.find((x) => x._id === property._id);
      // console.log(propertyFromavgArray);

      // property.averageRating = propertyFromavgArray.averageRating
      await property.save();
    });
    return properties;
  }

  async getDates(filterDto) {
    let currentDate = filterDto.checkIn;
    const stopDate = filterDto.checkOut;
    const dateArray = [];

    while (new Date(currentDate) <= new Date(stopDate)) {
      dateArray.push(new Date(currentDate));
      currentDate = moment.utc(currentDate).add(1, 'days');
    }
    return dateArray;
  }
}
