import { User } from 'src/auth/interface/user.interface';
import { Reservation } from '../interface/reservation.interface';

export class reservationMailEvent {
  reservation: Reservation;
}

export class ownerMailEvent {
  user: User;
}

export class signInEvent {
  user: User;
  otp: number;
}
