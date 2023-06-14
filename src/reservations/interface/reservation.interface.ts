export class Reservation {
  propertyId;
  roomId;
  rooms: number;
  userId;
  // customerId;
  // customer: Object;
  // members: string;
  bookingDate: Date;
  checkIn: Date;
  checkOut: Date;
  guestDetails: {
    firstName: String;
    lastName: String;
    title: String;
  };
  email: string;
  phone: String;
  paymentStatus: String;
  status: string;
  // availability: {
  //   bookedDate: Date;
  //   availability: String;
  // };
  availability: number;
  bookedDates: Array<Date>;
  priceBreakdown: {
    roomId;
    adult: number;
    child: number;
    extra: [Object];
    totalPeople: number;
    totalDays: number;
    totalRooms: number;
    price: number;
    totalPerDay: number;
    grandTotal: number;
  };

  screenShot: Object;

  feedback?: {
    rating: number;
    review: string;
    guestName: string;
  };
  mode: string;
  type: String;
  bookedBy: String;
}
