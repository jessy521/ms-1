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
} from '@nestjs/common';
import { ReservationService } from './reservaiton.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { getExactOwnerView, GetFilterDto } from './filters/get-filter.dto';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Reservation } from './interface/reservation.interface';
import { PoliciesGuard } from 'src/casl/policies.guard';
import { CheckPolicies } from 'src/casl/decorator/check-policies.decorator';
import { AppAbility } from 'src/casl/casl-ability.factor';
import { Action } from 'src/casl/action.enum';
import { GetUser } from 'src/decorators/get-user.decorator';
import { User } from 'src/auth/interface/user.interface';
import { diskStorage } from 'multer';
import path = require('path');
import { v4 as uuidv4 } from 'uuid';
import { FileInterceptor } from '@nestjs/platform-express';
var mongoose = require('mongoose');

// export const screenShotStorage = {
//   storage: diskStorage({
//     destination: './uploads/screen-shots',
//     filename: (req, file, cb) => {
//       const filename: string =
//         path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
//       const extension: string = path.parse(file.originalname).ext;

//       cb(null, `${filename}${extension}`);
//     },
//   }),
// };

@ApiTags('reservation')
@Controller('reservation')
export class ReservationController {
  constructor(private readonly recordsService: ReservationService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Create, Reservation),
  )
  @ApiCreatedResponse({ description: 'this response has created successfully' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  // @UseInterceptors(FileInterceptor('file', screenShotStorage))
  create(
    @GetUser() user: User,
    @Body() createRecordDto: CreateReservationDto,
    // @UploadedFile() file,
  ) {
    return this.recordsService.create(user, createRecordDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Get, Reservation))
  @ApiOkResponse({
    description: 'The resource list has been successfully returned',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  find(
    @Query() { id, userid, hotelid }: GetFilterDto,
    @GetUser() user: User,
    @Query() filterDto: getExactOwnerView,
  ) {
    if (id || userid || hotelid) {
      return this.recordsService.find(id, userid, hotelid, user);
    } else if (user.role === 'Admin' && filterDto?.ownerId) {
      return this.recordsService.findAllWithOwnerId(filterDto.ownerId);
    } else {
      return this.recordsService.findAll(user);
    }
  }

  @Get('/cancelledReservations')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, Reservation),
  )
  @ApiOkResponse({ description: 'Cancelled reservation returned successfully' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  findCancelledReservations(
    @GetUser() user: User,
    @Query() filterDto: getExactOwnerView,
  ) {
    if (user.role === 'Admin' && filterDto?.ownerId) {
      return this.recordsService.cancelledResWithOwnerId(filterDto.ownerId);
    }
    return this.recordsService.findCancelledReservations(user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, Reservation),
  )
  @ApiCreatedResponse({
    description: 'The resource has been updated successfully',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Not found' })
  update(
    @Param('id') id: string,
    @Body() updateRecordDto: UpdateReservationDto,
    @GetUser() user: User,
  ) {
    return this.recordsService.update(id, updateRecordDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, Reservation),
  )
  @ApiOkResponse({ description: 'The resource has been successfully deleted' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Not found' })
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.recordsService.remove(id, user);
  }

  @Get('/payment-dashboard')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, Reservation),
  )
  @ApiOkResponse({ description: 'Payment dashboard created successfully' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  paymentDashboard(
    @GetUser() user: User,
    @Query() filterDto: getExactOwnerView,
  ) {
    if (user.role === 'Admin' && filterDto?.ownerId) {
      return this.recordsService.paymentDashboardOwner(
        mongoose.Types.ObjectId(filterDto.ownerId),
      );
    }
    if (user.role === 'Property-Admin') {
      return this.recordsService.paymentDashboardOwner(user._id);
    }
    return this.recordsService.paymentDashboard();
  }

  @Get('/reservation-overview')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, Reservation),
  )
  @ApiOkResponse({ description: 'reservation overview returned successfully' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  reservationOverview(
    @GetUser() user: User,
    @Query() filterDto: getExactOwnerView,
  ) {
    if (user.role === 'Admin' && filterDto?.ownerId) {
      return this.recordsService.reservationInfoOwner(
        mongoose.Types.ObjectId(filterDto.ownerId),
      );
    }
    if (user.role === 'Property-Admin') {
      return this.recordsService.reservationInfoOwner(user._id);
    }
    return this.recordsService.reservationInfo();
  }

  @Get('/history/:id')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, Reservation),
  )
  @ApiOkResponse({ description: 'The resource has been successfully deleted' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  bookingHistory(@Param('id') id: string) {
    return this.recordsService.bookingHistory(id);
  }
}
