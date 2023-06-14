import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ForbiddenException,
  Put,
  UploadedFiles,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { GetFilterDto } from './filters/get-filter.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Property } from './interface/property.interface';
import { PoliciesGuard } from 'src/casl/policies.guard';
import { AppAbility } from 'src/casl/casl-ability.factor';
import { CheckPolicies } from 'src/casl/decorator/check-policies.decorator';
import { Action } from 'src/casl/action.enum';
import { GetUser } from 'src/decorators/get-user.decorator';
import { User } from 'src/auth/interface/user.interface';
import { diskStorage } from 'multer';
import path = require('path');
import { v4 as uuidv4 } from 'uuid';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ParseArrayJsonPipe } from 'src/parseJson.pipe';

export const propertyPicStorage = {
  storage: diskStorage({
    destination: './uploads/propertyImages',
    filename: (req, file, cb) => {
      const filename: string =
        path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
      const extension: string = path.parse(file.originalname).ext;

      cb(null, `${filename}${extension}`);
    },
  }),
};

@ApiTags('property')
@ApiBearerAuth('JWT')
@Controller('property')
export class PropertyController {
  constructor(private readonly hotelsService: PropertyService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('file', 20, propertyPicStorage))
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Property))
  @ApiCreatedResponse({ description: 'this response has created successfully' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  create(
    @Body(new ParseArrayJsonPipe(['extra', 'location', 'facilities']))
    createHotelDto: CreatePropertyDto,
    @UploadedFiles() file,
  ) {
    return this.hotelsService.create(createHotelDto, file);
  }

  @Put('/upload-images/:id')
  @UseInterceptors(FilesInterceptor('file', 20, propertyPicStorage))
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Property))
  @ApiCreatedResponse({ description: 'this response has created successfully' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  uploadImages(@Param('id') id: string, @UploadedFiles() file) {
    return this.hotelsService.uploadImages(id, file);
  }

  @Get()
  @ApiOkResponse({
    description: 'The resource list has been successfully returned',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  findOne(@Query() filterDto: GetFilterDto) {
    const { id, ...rest } = filterDto;
    if (filterDto?.id) {
      return this.hotelsService.find(filterDto);
    } else if (Object.keys(rest).length > 0) {
      return this.hotelsService.findWithFilters(filterDto);
    } else {
      return this.hotelsService.findAll();
    }
  }

  @Get('/owner-properties')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Get, Property))
  @ApiOkResponse({
    description: 'The resource list has been successfully returned',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  findOwner(@GetUser() user: User) {
    return this.hotelsService.findOwner(user);
  }

  @Get(':id/reviews')
  @ApiOkResponse({
    description: 'The resource list has been successfully returned',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  findReviews(@Param('id') propertyId: string) {
    if (propertyId) {
      return this.hotelsService.getReviewsForProperty(propertyId);
    }
    throw new Error('Property id is required');
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Property))
  @ApiCreatedResponse({
    description: 'The resource has been updated successfully',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @UseInterceptors(FilesInterceptor('file', 20, propertyPicStorage))
  update(
    @Param('id') id: string,
    @Body(new ParseArrayJsonPipe(['extra', 'location', 'facilities']))
    updateHotelDto: UpdatePropertyDto,
    @GetUser() user: User,
    @UploadedFiles() file,
  ) {
    return this.hotelsService.update(id, updateHotelDto, user, file);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Property))
  @ApiOkResponse({ description: 'The resource has been successfully deleted' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Not found' })
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.hotelsService.remove(id, user);
  }
}
