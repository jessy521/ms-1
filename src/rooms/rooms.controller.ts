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
  UploadedFiles,
  UseInterceptors,
  Put,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { GetFilterDto } from './filters/get-filter.dto';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Room } from './interface/room.interface';
import { PoliciesGuard } from 'src/casl/policies.guard';
import { CheckPolicies } from 'src/casl/decorator/check-policies.decorator';
import { AppAbility } from 'src/casl/casl-ability.factor';
import { Action } from 'src/casl/action.enum';
import { PriceFilterDto } from './filters/price-filter.dto';
import { GetPriceDto } from './filters/get-price.dto';
import { GetUser } from 'src/decorators/get-user.decorator';
import { User } from 'src/auth/interface/user.interface';
import { diskStorage } from 'multer';
import path = require('path');
import { v4 as uuidv4 } from 'uuid';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ParseArrayJsonPipe } from 'src/parseJson.pipe';

export const roomPicStorage = {
  storage: diskStorage({
    destination: './uploads/roomImages',
    filename: (req, file, cb) => {
      const filename: string =
        path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
      const extension: string = path.parse(file.originalname).ext;

      cb(null, `${filename}${extension}`);
    },
  }),
};

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post(':id')
  @UseInterceptors(FilesInterceptor('file', 20, roomPicStorage))
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Room))
  @ApiCreatedResponse({ description: 'this response has created successfully' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  create(
    @Param('id') id: string,
    @Body() createRoomDto: CreateRoomDto,
    @GetUser() user: User,
    @UploadedFiles() file,
  ) {
    return this.roomsService.create(id, createRoomDto, user, file);
  }

  @Put('/upload-images/:id')
  @UseInterceptors(FilesInterceptor('file', 20, roomPicStorage))
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Room))
  @ApiCreatedResponse({ description: 'this response has updated successfully' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  uploadImages(@Param('id') id: string, @UploadedFiles() file) {
    return this.roomsService.uploadImages(id, file);
  }

  @Get()
  // @UseGuards(JwtAuthGuard, PoliciesGuard)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Get, Room))
  @ApiOkResponse({
    description: 'The resource list has been successfully returned',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  findOne(@Query() { id, propertyid }: GetFilterDto) {
    if (id || propertyid) {
      return this.roomsService.find(id, propertyid);
    } else {
      return this.roomsService.findAll();
    }
  }

  @Get('/owner-properties-rooms')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @ApiOkResponse({
    description: 'The resource list has been successfully returned',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  findOwner(@GetUser() user: User) {
    return this.roomsService.findOwnerRooms(user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Room))
  @ApiCreatedResponse({
    description: 'The resource has been updated successfully',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @UseInterceptors(FilesInterceptor('file', 20, roomPicStorage))
  update(
    @Param('id') id: string,
    @Body(new ParseArrayJsonPipe(['price'])) updateRoomDto: UpdateRoomDto,
    @GetUser() user: User,
    @UploadedFiles() file,
  ) {
    return this.roomsService.update(id, updateRoomDto, user, file);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Room))
  @ApiOkResponse({ description: 'The resource has been successfully deleted' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Not found' })
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.roomsService.remove(id, user);
  }

  // @Get('/price/:id')
  // @ApiOkResponse({ description: 'The resource has been successfully deleted' })
  // @ApiForbiddenResponse({ description: 'Forbidden' })
  // @ApiNotFoundResponse({ description: 'Not found' })
  // getPrice(@Param('id') id: string, @Query() filterDto: PriceFilterDto) {
  //   if (filterDto?.facilities) {
  //     return this.roomsService.getPrice(id, filterDto);
  //   } else {
  //     return this.roomsService.getRoomPriceOnly(id);
  //   }
  // }

  @Post('/price/:roomid')
  @ApiOkResponse({ description: 'The resource has been successfully deleted' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Not found' })
  getPrice(@Param('roomid') roomid: string, @Body() filterDto: GetPriceDto) {
    // if (filterDto.roomId) {
    // console.log(filterDto);
    return this.roomsService.getPriceWithBody(roomid, filterDto);
    // } else {
    //   return this.roomsService.getRoomPriceOnly(id);
    // }
  }
}
