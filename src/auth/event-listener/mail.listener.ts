import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/mail/mail.service';
import {
  ownerMailEvent,
  signInEvent,
} from 'src/reservations/events/reservation.event';

@Injectable()
export class AuthListener {
  constructor(private mailService: MailService) {}

  @OnEvent('mailOwner.approved')
  mailOwnerEvent(event: ownerMailEvent) {
    this.mailService.sendEmailToOwner(event.user);
  }

  @OnEvent('signIn')
  signIn(event: signInEvent) {
    this.mailService.sendSignInOTP(event.user, event.otp);
  }

  @OnEvent('forgotPassword')
  forgotPassword(event: signInEvent) {
    this.mailService.sendForgotPassword(event.user, event.otp);
  }

  @OnEvent('resetPassword')
  resetPassword(event: ownerMailEvent) {
    this.mailService.resetPassword(event.user);
  }
}
