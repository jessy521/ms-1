import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';

export class MakeAdminFilterDto {
  @IsString()
  @ApiProperty({
    type: String,
    default: 'Admin',
  })
  role: string;

  @ApiProperty({
    type: String,
    description: 'Enter the property Id',
    default: '',
  })
  propertyId: ObjectId;

  @ApiProperty({
    type: String,
    description: 'Enter the status of the agent',
    default: '',
  })
  status: string;
}

export class AdminFilterDto {
  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    type: Boolean,
  })
  isApproved: boolean;
}

export class AgentFilterDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    type: String,
    default: 'active',
  })
  status: string;

  @ApiProperty({
    type: String,
    description: 'Enter the property Id',
    default: '',
  })
  propertyId: ObjectId;
}
