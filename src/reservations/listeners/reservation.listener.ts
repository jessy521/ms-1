import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/mail/mail.service';
import { reservationMailEvent } from '../events/reservation.event';

@Injectable()
export class reservationCreatedListener {
  constructor(private mailService: MailService) {}

  @OnEvent('mailEvent.created')
  handleOrderCreatedEvent(event: reservationMailEvent) {
    this.mailService.confirmBooking(event.reservation);
  }
}
