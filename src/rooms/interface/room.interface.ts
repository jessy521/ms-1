export class Room {
  propertyId: String;
  type: String;
  beds: String;
  facilities: [String];
  price: {
    single: number;
    couple: number;
    child: number;
  };
  count: number;
  images: Object[];
}
