import { IsNumber, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationParams {
  @ApiPropertyOptional({
    type: String,
    description: 'set a number to skip them',
    default: '',
  })
  @IsOptional()
  // @Type(() => Number)
  // @IsNumber()
  // @Min(0)
  skip?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'set a limit of reviews',
    default: '',
  })
  @IsOptional()
  // @Type(() => Number)
  // @IsNumber()
  // @Min(1)
  limit?: string;
}
