import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User } from 'src/auth/interface/user.interface';
import { CustomerReviews } from 'src/customer-reviews/interface/customer-review.interface';
import { Customer } from 'src/customers/interface/customer.interface';
import { Property } from 'src/property/interface/property.interface';
import { Reservation } from 'src/reservations/interface/reservation.interface';
import { Room } from 'src/rooms/interface/room.interface';
import { Action } from './action.enum';

type Subjects =
  | InferSubjects<
      | typeof CustomerReviews
      | typeof Customer
      | typeof Property
      | typeof Reservation
      | typeof Room
      | typeof User
    >
  | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[Action, Subjects]>
    >(Ability as AbilityClass<AppAbility>);

    if (user.role === 'Admin') {
      can(Action.Manage, 'all');
    } else if (user.role === 'Property-Admin' && user.isApproved) {
      can(Action.Manage, User);
      can(Action.Manage, Property);
      can(Action.Manage, Room);
      can(Action.Manage, Reservation);
      can(Action.Delete, CustomerReviews);
    } else if (user.role === 'Agent') {
      can(Action.Get, 'all');
      can(Action.Get, Customer);
      can(Action.Get, Property);
      can(Action.Manage, Reservation);
      can(Action.Get, Room);
      cannot(Action.Update, User);
    } else {
      can(Action.Get, 'all');
      can(Action.Manage, CustomerReviews);
      can(Action.Create, Reservation);
      can(Action.Update, Reservation);
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
