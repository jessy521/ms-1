import { ObjectId } from 'mongoose';

export class Property {
  name: string;
  location: {
    city: String;
    state: String;
    mapLink: String;
  };
  description: string;
  contactNo: string;
  email: string;
  facilities: [String];
  averageRating: number;
  ratingCount: number;
  extra: [
    {
      facility: String;
      price: 'number';
      single: boolean;
    },
  ];
  ownedBy: ObjectId;
  images: Object[];
  map: string;
}
