import { MailerService } from '@nestjs-modules/mailer';
import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from 'src/auth/interface/user.interface';
import { Property } from 'src/property/interface/property.interface';
import { Reservation } from 'src/reservations/interface/reservation.interface';
import * as fs from 'fs';
@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    @Inject('PROPERTY_MODEL')
    private readonly hotelModel: Model<Property>,
  ) {}

  async confirmBooking(reservation: Reservation) {
    const propertyName = await (
      await this.hotelModel.findById({ _id: reservation.propertyId })
    ).name;
    const month = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    await this.mailerService.sendMail({
      to: reservation.email,
      subject: '🏠Booking Confirmation',
      template: './bookingConfirmation',
      context: {
        name: `${reservation.guestDetails.title} ${reservation.guestDetails.firstName} ${reservation.guestDetails.lastName}`,
        checkInDate: reservation.checkIn.getDate(),
        checkInMonth: month[reservation.checkIn.getMonth()],
        // checkOut: reservation.checkOut,
        propertyName,
      },
      attachments: [
        {
          filename: 'LOGO.png',
          path: 'src/mail/LOGO.png',
          cid: 'batman',
        },
      ],
    });
  }

  async sendForgotPassword(user: User, otp: number) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Otp verification',
      template: './forgot-password',
      context: {
        name: user.username,
        otp,
      },
      attachments: [
        {
          filename: 'LOGO.png',
          path: 'src/mail/LOGO.png',
          cid: 'batman',
        },
      ],
    });
  }

  async resetPassword(user: User) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Password updated!',
      template: './reset-password',
      context: {
        name: user.username,
      },
      attachments: [
        {
          filename: 'LOGO.png',
          path: 'src/mail/LOGO.png',
          cid: 'batman',
        },
      ],
    });
  }

  async sendSignInOTP(user: User, otp: number) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Log-in',
      template: './login',
      context: {
        name: user.username,
        otp,
      },
      attachments: [
        {
          filename: 'LOGO.png',
          path: 'src/mail/LOGO.png',
          cid: 'batman',
        },
      ],
    });
  }

  async sendEmailToOwner(user: User) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: '🏠Approved mail',
      template: './confirmationOwner',
      context: {
        name: user.username,
      },
      attachments: [
        {
          filename: 'LOGO.png',
          path: 'src/mail/LOGO.png',
          cid: 'batman',
        },
      ],
    });
  }
}
