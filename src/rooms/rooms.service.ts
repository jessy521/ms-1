import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from 'src/auth/interface/user.interface';
import { Property } from 'src/property/interface/property.interface';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { GetFilterDto } from './filters/get-filter.dto';
import { Room } from './interface/room.interface';

@Injectable()
export class RoomsService {
  constructor(
    @Inject('ROOM_MODEL')
    private readonly roomModel: Model<Room>,
    @Inject('PROPERTY_MODEL')
    private readonly hotelModel: Model<Property>,
  ) {}

  async create(
    id: string,
    createRoomDto: CreateRoomDto,
    user: User,
    file,
  ): Promise<Room> {
    try {
      if (!this.checkAccess(id, user)) {
        throw new BadRequestException('Access denied!');
      }
      const newRoom = new this.roomModel(createRoomDto);
      newRoom.propertyId = id;
      if (file) {
        newRoom.images = file;
      }
      await newRoom.save();
      return newRoom;
    } catch (error) {
      console.log(error.message);
      throw new ForbiddenException();
    }
  }

  async uploadImages(id: string, file) {
    try {
      let room = await this.roomModel.findById({ _id: id });
      if (room && room.images.length >= 0) {
        room.images = room.images.concat(file);
        await room.save();
        return room;
      } else if (room && !room.images) {
        room.images = file;
        await room.save();
        return room;
      } else {
        throw new NotFoundException('Invalid Id');
      }
    } catch (err) {
      throw new ForbiddenException({ message: err.message });
    }
  }

  async findAll(): Promise<Room[]> {
    try {
      return this.roomModel.find({}).sort({ price: 1 });
    } catch (error) {
      console.log(error.message);
      throw new BadRequestException();
    }
  }
  async findOwnerRooms(user: User) {
    return this.roomModel.aggregate([
      {
        $lookup: {
          from: 'properties',
          localField: 'propertyId',
          foreignField: '_id',
          as: 'property',
        },
      },
      {
        $unwind: {
          path: '$property',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $match: { 'property.ownedBy': user._id },
      },
      {
        $project: { property: 0 },
      },
    ]);
  }

  async find(id, hotelid) {
    try {
      // console.log(id, hotelid);
      if (id && hotelid === undefined) {
        return this.roomModel.findById({ _id: id });
      } else if (hotelid && id === undefined) {
        return this.roomModel.find({ propertyId: hotelid }).sort({ price: 1 });
      }
    } catch (error) {
      console.log(error.message);
      throw new BadRequestException();
    }
  }

  async update(
    id: string,
    updateRoomDto: UpdateRoomDto,
    user: User,
    files: Array<File>,
  ): Promise<Room> {
    try {
      const property = await this.roomModel.findById({ _id: id });

      if (
        !property ||
        !this.checkAccess(property.propertyId.toString(), user)
      ) {
        throw new BadRequestException('Access denied!');
      }
      const updatedReqBody: any = { ...updateRoomDto };
      if (files?.length > 0) {
        updatedReqBody.images = files;
      }
      return this.roomModel.findByIdAndUpdate({ _id: id }, updatedReqBody, {
        new: true,
      });
    } catch (error) {
      throw new ForbiddenException({ message: error.message });
    }
  }

  async remove(id: string, user: User): Promise<Room> {
    try {
      const property = await this.roomModel.findById({ _id: id });

      if (
        !property ||
        !this.checkAccess(property.propertyId.toString(), user)
      ) {
        throw new BadRequestException('Access denied!');
      }
      return this.roomModel.findOneAndDelete({ _id: id });
    } catch (error) {
      throw new ForbiddenException({ message: error.message });
    }
  }

  async getPrice(id: string, filterDto) {
    try {
      const room = await this.roomModel.findOne({ _id: id });
      const amenitiesList = filterDto.facilities.split(',');
      const propertyList = await (
        await this.hotelModel.findById({ _id: room.propertyId })
      ).extra;
      let roomPrice = room.price;

      var result = amenitiesList
        .map((id) => propertyList.find((x) => x.facility == id))
        .map((x) => x.price);
      result.forEach((facility) => (roomPrice += facility));
      let finalObject = {
        price: room.price,
        breakdown: result.reduce(function (result, field, index) {
          result[amenitiesList[index]] = field;
          return result;
        }, {}),
        total: roomPrice,
      };
      return finalObject;
    } catch (err) {
      throw new ForbiddenException({ message: err.message });
    }
  }

  async getPriceWithBody(id: string, filterDto) {
    try {
      const room = await this.roomModel.findById({ _id: id });
      filterDto.price = {};

      let childPrice = 0;
      if (filterDto.child != 0) {
        let count = Math.ceil(filterDto.child / 2);
        childPrice = count * room.price.child;

        filterDto.price['childPrice'] = {};
        filterDto.price['childPrice'][
          `Children Accomodation in ${count} rooms`
        ] = childPrice;
      } else {
        childPrice = 0;
        filterDto.price['childPrice'] = {};
        filterDto.price['childPrice'][`Children Accomodation in 0 rooms`] =
          childPrice;
      }

      let coupleCount = 0;
      let adultCount = 0;
      let adultPrice = 0;
      let couplePrice = 0;
      filterDto.price['adultPrice'] = {};
      filterDto.price['couplePrice'] = {};

      if (filterDto.adult > filterDto.totalRooms) {
        let adultCount = filterDto.totalRooms;
        let c = filterDto.adult - filterDto.totalRooms;
        coupleCount += c;
        adultCount = adultCount - c;

        if (c <= filterDto.totalRooms) {
          adultPrice = adultCount * room.price.single;
          couplePrice = coupleCount * room.price.couple;

          // console.log(' adultCount:', adultCount);
          // console.log('coupleCount:', couplePrice, coupleCount);

          filterDto.price['adultPrice'][
            `${adultCount} *  Room for Single Person`
          ] = adultPrice;
          filterDto.price['couplePrice'][
            `${coupleCount} * Room for Two Persons`
          ] = couplePrice;
        } else {
          throw new ForbiddenException({
            message: 'the limitation of 2 adult is not maintained',
          });
        }
      } else if (filterDto.adult <= filterDto.totalRooms) {
        adultPrice = filterDto.totalRooms * room.price.single;
        couplePrice = 0;
        filterDto.price['adultPrice'][
          `${filterDto.totalRooms} * Room for Single Person`
        ] = adultPrice;
        filterDto.price['couplePrice'][`0 Room for Two Persons`] = 0;
      }

      filterDto.price['totalRoomPrice'] = childPrice + adultPrice + couplePrice;
      // filterDto.price['adultPrice'][`${adultCount} * single rooms`] +
      // filterDto.price['couplePrice'][`${coupleCount} * couple rooms`];

      let template = filterDto.price['totalRoomPrice'];

      var result = filterDto.extra.map((facility) => {
        if (facility.single === false) {
          return facility.price * filterDto.totalPeople;
        } else {
          return facility.price;
        }
      });

      result.forEach((facility) => (template += facility));
      for (let i = 0; i < result.length; i++) {
        filterDto.extra[i].totalPrice = result[i];
      }

      filterDto.totalPerDay = template;
      filterDto.grandTotal = template * filterDto.totalDays;

      return filterDto;
    } catch (err) {
      throw new ForbiddenException({ message: err.message });
    }
  }

  async getRoomPriceOnly(id) {
    const room = await this.roomModel.findOne({ _id: id });
    return { price: room.price };
  }

  async checkAccess(id: string, user: User) {
    const property: Property = await this.hotelModel.findById({ _id: id });
    if (property.ownedBy.toString() === user._id.toString()) return true;
    return false;
  }
}
