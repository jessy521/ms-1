import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetFilterDto {
  @ApiPropertyOptional({
    type: String,
    description: 'search by id',
    default: '',
  })
  id: string;

  @ApiPropertyOptional({
    type: String,
    description: 'filter with a userid',
    default: '',
  })
  userid: string;

  @ApiPropertyOptional({
    type: String,
    description: 'filter with a hotelid',
    default: '',
  })
  hotelid: string;
}

export class getExactOwnerView {
  @ApiPropertyOptional({
    type: String,
    description: 'search by id',
    default: '',
  })
  ownerId: string;
}
