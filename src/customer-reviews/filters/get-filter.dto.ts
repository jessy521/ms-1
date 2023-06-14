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
    description: 'filter with a customerid',
    default: '',
  })
  customerid: string;

  @ApiPropertyOptional({
    type: String,
    description: 'filter with a hotelid',
    default: '',
  })
  hotelid: string;
}
