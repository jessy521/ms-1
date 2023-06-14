import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { Customer } from 'src/customers/interface/customer.interface';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { GetFilterDto } from './filters/get-filter.dto';
import { Reservation } from './interface/reservation.interface';
import * as moment from 'moment';
import { Room } from 'src/rooms/interface/room.interface';
import { Property } from 'src/property/interface/property.interface';
import { User } from 'src/auth/interface/user.interface';
import { MailService } from 'src/mail/mail.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { reservationMailEvent } from './events/reservation.event';
var mongoose = require('mongoose');

@Injectable()
export class ReservationService {
  constructor(
    @Inject('RESERVATION_MODEL')
    private readonly reservationModel: Model<Reservation>,
    @Inject('CUSTOMER_MODEL')
    private customerModel: Model<Customer>,
    @Inject('PROPERTY_MODEL')
    private readonly propertyModel: Model<Property>,
    @Inject('ROOM_MODEL')
    private readonly roomModel: Model<Room>,
    private mailService: MailService,
    private eventEmitter: EventEmitter2,
  ) {}

  async checkRoom(createRecordDto: CreateReservationDto) {
    const maxRoomCount = await this.reservationModel.aggregate([
      {
        $match: {
          $or: [
            {
              checkIn: {
                $gte: new Date(createRecordDto.checkIn),
                $lte: new Date(createRecordDto.checkOut),
              },
            },
            {
              checkOut: {
                $gte: new Date(createRecordDto.checkIn),
                $lte: new Date(createRecordDto.checkOut),
              },
            },
          ],
          // roomId: '635e556bbc8fb8597660593a',
        },
      },
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

    const room = await this.roomModel.findById({ _id: createRecordDto.roomId });

    if (room.count < parseInt(createRecordDto.rooms)) {
      // console.log('No available rooms...');
      throw new ForbiddenException(`Sorry! We don't have so many rooms!`);
    }
    for (let k = 0; k < maxRoomCount.length; k++) {
      if (
        (maxRoomCount[k]._id.id.toString() === room._id.toString() &&
          maxRoomCount[k].maxCount >= room.count) ||
        (maxRoomCount[k]._id.id.toString() === room._id.toString() &&
          maxRoomCount[k].maxCount < room.count &&
          room.count - maxRoomCount[k].maxCount <
            parseInt(createRecordDto.rooms))
      ) {
        // console.log('No available rooms...');
        throw new ForbiddenException('Sorry! rooms are not available');
      }
      if (
        maxRoomCount[k]._id.id.toString() === room._id.toString() &&
        maxRoomCount[k].maxCount < room.count &&
        room.count - maxRoomCount[k].maxCount >= parseInt(createRecordDto.rooms)
      ) {
        // console.log('Available for booking..');
        return;
      }
    }
    return;
  }

  async create(user: User, createRecordDto: CreateReservationDto) {
    try {
      if (createRecordDto.checkIn) {
        createRecordDto.checkIn = moment
          .utc(createRecordDto.checkIn, 'DD-MM-YYYY')
          .toDate();
      }
      if (createRecordDto.checkOut) {
        createRecordDto.checkOut = moment
          .utc(createRecordDto.checkOut, 'DD-MM-YYYY')
          .toDate();
      }
      const room = await this.roomModel.findOne({
        _id: createRecordDto.roomId,
      });
      const daylist = await this.getDates(
        createRecordDto.checkIn,
        createRecordDto.checkOut,
      );

      await this.checkRoom(createRecordDto);

      const reservation = new this.reservationModel(createRecordDto);

      reservation.bookedDates = daylist;
      reservation.propertyId = room.propertyId;
      // if (file) {
      //   reservation.screenShot = file;
      // }
      if (reservation.mode === 'offline') {
        reservation.type = user.role;
      }
      reservation.bookedBy = user.username;
      reservation.save();

      let mailerEvent = new reservationMailEvent();
      mailerEvent.reservation = reservation;
      this.eventEmitter.emit('mailEvent.created', mailerEvent);

      // await this.mailService.confirmBooking(reservation);
      return reservation;
    } catch (error) {
      throw new ForbiddenException({
        message: error.message,
      });
    }
  }

  async findAllWithOwnerId(ownerId: string) {
    try {
      return this.reservationModel.aggregate([
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
          $match: { 'property.ownedBy': mongoose.Types.ObjectId(ownerId) },
        },
        { $sort: { bookingDate: -1 } },
      ]);
    } catch (error) {
      throw new ForbiddenException({ message: error.message });
    }
  }

  async findAll(user: User): Promise<any> {
    try {
      if (user.role === 'Property-Admin') {
        return this.reservationModel.aggregate([
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
          { $sort: { bookingDate: -1 } },
        ]);
      }
      let reservationList = await this.reservationModel
        .find({})
        .sort({ bookingDate: -1 });
      // console.log(reservationList);
      const filteredList = await this.deletedReservation(reservationList);

      return filteredList;
    } catch (error) {
      console.log(error.message);
      throw new BadRequestException();
    }
  }
  async cancelledResWithOwnerId(userId: string): Promise<Reservation[]> {
    return this.reservationModel.aggregate([
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
        $match: {
          paymentStatus: 'due',
          status: 'booked',
          'property.ownedBy': mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: '',
          payment: { $sum: '$priceBreakdown.grandTotal' },
        },
      },
      {
        $project: {
          _id: 0,
          payment: '$payment',
        },
      },
      {
        $match: {
          status: { $regex: /cancel/, $options: 'i' },
          paymentStatus: 'due',
        },
      },
    ]);
  }

  async findCancelledReservations(user: User): Promise<Reservation[]> {
    if (user.role === 'Property-Admin') {
      return this.reservationModel.aggregate([
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
          $match: {
            paymentStatus: 'due',
            status: 'booked',
            'property.ownedBy': user._id,
          },
        },
        {
          $group: {
            _id: '',
            payment: { $sum: '$priceBreakdown.grandTotal' },
          },
        },
        {
          $project: {
            _id: 0,
            payment: '$payment',
          },
        },
        {
          $match: {
            status: { $regex: /cancel/, $options: 'i' },
            paymentStatus: 'due',
          },
        },
      ]);
    }

    return this.reservationModel.find({
      status: { $regex: /cancel/, $options: 'i' },
      paymentStatus: 'due',
    });
  }

  async find(id, userId, hotelid, user: User) {
    try {
      if (id) {
        return this.reservationModel.findById({ _id: id });
      }

      if (userId) {
        let reservationList = await this.reservationModel
          .find({ userId: userId })
          .sort({ checkOut: -1 });

        const filteredList = await this.deletedReservation(reservationList);
        return filteredList;
      }
      if (hotelid) {
        let reservationList = await this.reservationModel
          .find({ hotelId: hotelid })
          .sort({ bookingDate: -1 });
        const filteredList = await this.deletedReservation(reservationList);
        return filteredList;
      }
    } catch (error) {
      console.log(error.message);
      throw new BadRequestException();
    }
  }

  async update(
    id: string,
    updateRecordDto: UpdateReservationDto,
    user: User,
  ): Promise<Reservation> {
    try {
      const property = await this.reservationModel.findById({ _id: id });

      if (
        !property ||
        !this.checkAccess(property.propertyId.toString(), user)
      ) {
        throw new BadRequestException('Access denied!');
      }

      if (updateRecordDto.bookingDate) {
        updateRecordDto.bookingDate = moment(
          updateRecordDto.bookingDate,
          'DD-MM-YYYY',
        ).toDate();
      }
      if (updateRecordDto.checkIn) {
        updateRecordDto.checkIn = moment(
          updateRecordDto.checkIn,
          'DD-MM-YYYY',
        ).toDate();
      }
      if (updateRecordDto.checkOut) {
        updateRecordDto.checkOut = moment(
          updateRecordDto.checkOut,
          'DD-MM-YYYY',
        ).toDate();
      }

      const reservation = await this.reservationModel.findByIdAndUpdate(
        { _id: id },
        updateRecordDto,
        {
          new: true,
          runValidators: true,
        },
      );

      if (updateRecordDto.feedback) {
        const property = await this.propertyModel.findById(
          reservation.propertyId,
        );

        const { ratingCount = 0, averageRating = 0 } = property;
        const newRating =
          (averageRating * ratingCount + updateRecordDto.feedback.rating) /
          (ratingCount + 1);
        await this.propertyModel.updateOne(
          { _id: property._id },
          {
            $set: {
              ratingCount: ratingCount + 1,
              averageRating: newRating,
            },
          },
        );
      }

      return reservation;
    } catch (error) {
      console.log(error.message);
      throw new ForbiddenException();
    }
  }

  async remove(id: string, user: User): Promise<Reservation> {
    try {
      const property = await this.reservationModel.findById({ _id: id });
      if (
        !property ||
        !this.checkAccess(property.propertyId.toString(), user)
      ) {
        throw new BadRequestException('Access denied!');
      }
      const deletedReservation = await this.reservationModel.findByIdAndDelete({
        _id: id,
      });

      // const room_id = deletedReservation.roomId;
      // const arriving_date = deletedReservation.checkIn;
      // console.log(room_id, arriving_date);

      // let rooms = await this.reservationModel.find({
      //   roomId: room_id,
      //   arrivingDate: arriving_date,
      // });
      // .sort({ availability: 1 });

      // rooms.forEach((room) => {
      //   room.availability = ++room.availability;
      //   room.save();
      //   console.log('room: ', room);
      // });

      return deletedReservation;
    } catch (error) {
      throw new ForbiddenException({ message: error.message });
    }
  }

  async deletedReservation(reservations) {
    const newReservationList = [];
    const today = moment(new Date(), 'DD-MM-YYYY');
    reservations.forEach(async (reservation) => {
      const diffDays = today.diff(reservation.checkIn, 'days');
      if (diffDays <= 90) {
        newReservationList.push(reservation);
      } else if (diffDays > 90) {
        console.log(diffDays, reservation);
        reservation = await this.reservationModel.findByIdAndDelete({
          _id: reservation._id,
        });
        // console.log(reservation);
      }
    });
    return newReservationList;
  }

  async getDates(currentDate, stopDate) {
    var dateArray = [];
    while (currentDate <= stopDate) {
      dateArray.push(moment(currentDate, 'DD-MM-YYYY').toDate());
      currentDate = moment(currentDate).add(1, 'days');
    }
    return dateArray;
  }

  async paymentDashboard() {
    let finalObject = {};

    const expectedCollection = await this.reservationModel.aggregate([
      { $match: { status: { $in: ['booked', 'confirmed'] } } },
      {
        $group: {
          _id: '',
          exp: { $sum: '$priceBreakdown.grandTotal' },
        },
      },
      {
        $project: {
          _id: 0,
          exp: '$exp',
        },
      },
    ]);
    const collectedPayment = await this.reservationModel.aggregate([
      {
        $match: {
          status: 'confirmed',
          paymentStatus: { $regex: /paid/, $options: 'i' },
        },
      },
      {
        $group: {
          _id: '',
          payment: { $sum: '$priceBreakdown.grandTotal' },
        },
      },
      {
        $project: {
          _id: 0,
          payment: '$payment',
        },
      },
    ]);
    // console.log('collectedPayment:', collectedPayment);

    const duePayment = await this.reservationModel.aggregate([
      {
        $match: {
          paymentStatus: 'due',
          status: 'booked',
        },
      },
      {
        $group: {
          _id: '',
          payment: { $sum: '$priceBreakdown.grandTotal' },
        },
      },
      {
        $project: {
          _id: 0,
          payment: '$payment',
        },
      },
    ]);

    if (expectedCollection.length != 0) {
      finalObject['expectedPayment'] = expectedCollection[0].exp;
    } else {
      finalObject['expectedPayment'] = 0;
    }

    if (collectedPayment.length != 0) {
      finalObject['collectedPayment'] = collectedPayment[0].payment;
    } else {
      finalObject['collectedPayment'] = 0;
    }

    if (duePayment.length != 0) {
      finalObject['duePayment'] = duePayment[0].payment;
    } else {
      finalObject['duePayment'] = 0;
    }

    return finalObject;
  }

  // payment func for owner
  async paymentDashboardOwner(userId: ObjectId) {
    let finalObject = {};

    const expectedCollection = await this.reservationModel.aggregate([
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
        $match: {
          status: { $in: ['booked', 'confirmed'] },
          'property.ownedBy': userId,
        },
      },
      {
        $group: {
          _id: '',
          exp: { $sum: '$priceBreakdown.grandTotal' },
        },
      },
      {
        $project: {
          _id: 0,
          exp: '$exp',
        },
      },
    ]);
    const collectedPayment = await this.reservationModel.aggregate([
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
        $match: {
          'property.ownedBy': userId,
          status: 'confirmed',
          paymentStatus: { $regex: /paid/, $options: 'i' },
        },
      },
      {
        $group: {
          _id: '',
          payment: { $sum: '$priceBreakdown.grandTotal' },
        },
      },
      {
        $project: {
          _id: 0,
          payment: '$payment',
        },
      },
    ]);
    // console.log('collectedPayment:', collectedPayment);

    const duePayment = await this.reservationModel.aggregate([
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
        $match: {
          paymentStatus: 'due',
          status: 'booked',
          'property.ownedBy': userId,
        },
      },
      {
        $group: {
          _id: '',
          payment: { $sum: '$priceBreakdown.grandTotal' },
        },
      },
      {
        $project: {
          _id: 0,
          payment: '$payment',
        },
      },
    ]);
    // console.log('duePayment:', duePayment);

    if (expectedCollection.length != 0) {
      finalObject['expectedPayment'] = expectedCollection[0].exp;
    } else {
      finalObject['expectedPayment'] = 0;
    }

    if (collectedPayment.length != 0) {
      finalObject['collectedPayment'] = collectedPayment[0].payment;
    } else {
      finalObject['collectedPayment'] = 0;
    }

    if (duePayment.length != 0) {
      finalObject['duePayment'] = duePayment[0].payment;
    } else {
      finalObject['duePayment'] = 0;
    }

    return finalObject;
  }

  async reservationInfoOwner(userId: ObjectId) {
    let finalObject = {};
    let today = moment.utc(new Date()).format('YYYY-MM-DD');

    const reservationCollections = await this.reservationModel.aggregate([
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
        $match: {
          status: { $in: ['booked', 'confirmed'] },
          'property.ownedBy': userId,
        },
      },
    ]);

    finalObject['totalReservation'] = reservationCollections.length;
    finalObject['upcomingReservations'] = reservationCollections.filter(
      (item) => item.status.includes('book') && item.checkIn >= new Date(today),
    );
    finalObject['bookedReservationList'] = reservationCollections.filter(
      (item) => item.status.includes('book') && item.paymentStatus === 'due',
    );
    finalObject['confirmedReservationList'] = reservationCollections.filter(
      (item) =>
        item.status.includes('confirm') && item.paymentStatus === 'paid',
    );
    finalObject['todayBookings'] = reservationCollections.filter(
      (item) =>
        item.status === 'confirmed' &&
        item.checkIn >= new Date(today) &&
        item.checkIn <= new Date(today),
    );
    finalObject['activeReservations'] = reservationCollections.filter(
      (item) => item.status === 'check-in',
    );
    finalObject['previousReservations'] = reservationCollections.filter(
      (item) => item.status === 'check-out',
    );
    finalObject['offlineReservations'] = reservationCollections.filter(
      (item) => item.mode === 'offline',
    );
    finalObject['onlineReservations'] = reservationCollections.filter(
      (item) => item.mode === 'online',
    );

    return finalObject;
  }

  async reservationInfo() {
    let finalObject = {};

    finalObject['totalReservation'] = await this.reservationModel
      .find()
      .count();

    let today = moment.utc(new Date()).format('YYYY-MM-DD');

    finalObject['upcomingReservations'] = await this.reservationModel.find({
      status: { $regex: /book/, $options: 'i' },
      checkIn: { $gte: new Date(today) },
    });

    finalObject['bookedReservationList'] = await this.reservationModel.find({
      status: { $regex: /book/, $options: 'i' },
      paymentStatus: 'due',
    });

    finalObject['confirmedReservationList'] = await this.reservationModel.find({
      status: { $regex: /confirm/, $options: 'i' },
      paymentStatus: 'paid',
    });
    finalObject['todayBookings'] = await this.reservationModel.find({
      checkIn: new Date(today),
      status: 'confirmed',
    });

    finalObject['activeReservations'] = await this.reservationModel.find({
      status: 'check-in',
    });
    finalObject['previousReservations'] = await this.reservationModel.find({
      status: 'check-out',
    });
    finalObject['offlineReservations'] = await this.reservationModel.find({
      mode: 'offline',
    });
    finalObject['onlineReservations'] = await this.reservationModel.find({
      mode: 'online',
    });

    return finalObject;
  }

  async bookingHistory(id: string) {
    const list = await this.reservationModel
      .find({
        userId: id,
        checkOut: { $lte: new Date() },
      })
      .sort({ checkOut: -1 });
    if (list.length > 0) {
      return list;
    } else {
      return 'no booking history found';
    }
  }

  async checkAccess(id: string, user: User) {
    const property: Property = await this.propertyModel.findById({ _id: id });
    console.log(property);
    if (property.ownedBy.toString() === user._id.toString()) return true;
    return false;
  }
}
