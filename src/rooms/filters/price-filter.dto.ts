import { ApiPropertyOptional } from '@nestjs/swagger';

export class PriceFilterDto {
  @ApiPropertyOptional({
    type: String,
    description: 'search by facilities',
  })
  facilities: string;
}
