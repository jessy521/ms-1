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
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Action } from 'src/casl/action.enum';
import { AppAbility } from 'src/casl/casl-ability.factor';
import { CheckPolicies } from 'src/casl/decorator/check-policies.decorator';
import { PoliciesGuard } from 'src/casl/policies.guard';
import { CustomerReviewsService } from './customer-reviews.service';
import { CreateCustomerReviewDto } from './dto/create-customer-review.dto';
import { UpdateCustomerReviewDto } from './dto/update-customer-review.dto';
import { GetFilterDto } from './filters/get-filter.dto';
import { PaginationParams } from './filters/paginationParams';
import { CustomerReviews } from './interface/customer-review.interface';

@ApiTags('customer-reviews')
@Controller('customer-reviews')
export class CustomerReviewsController {
  constructor(
    private readonly customerReviewsService: CustomerReviewsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Create, CustomerReviews),
  )
  @ApiCreatedResponse({ description: 'this response has created successfully' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  create(@Body() createCustomerReviewDto: CreateCustomerReviewDto) {
    return this.customerReviewsService.create(createCustomerReviewDto);
  }

  @Get()
  // @UseGuards(JwtAuthGuard, PoliciesGuard)
  // @CheckPolicies((ability: AppAbility) =>
  // ability.can(Action.Get, CustomerReviews),
  // )
  @ApiOkResponse({
    description: 'The resource list has been successfully returned',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  find(
    @Query() { skip, limit }: PaginationParams,
    @Query() { id, hotelid, customerid }: GetFilterDto,
  ) {
    if (id || hotelid || customerid) {
      return this.customerReviewsService.find(
        id,
        hotelid,
        customerid,
        skip,
        limit,
      );
    } else {
      return this.customerReviewsService.findAll(skip, limit);
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, CustomerReviews),
  )
  @ApiCreatedResponse({
    description: 'The resource has been updated successfully',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Not found' })
  update(
    @Param('id') id: string,
    @Body() updateCustomerReviewDto: UpdateCustomerReviewDto,
  ) {
    return this.customerReviewsService.update(id, updateCustomerReviewDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, CustomerReviews),
  )
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'The resource has been successfully deleted' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Not found' })
  remove(@Param('id') id: string) {
    return this.customerReviewsService.remove(id);
  }
}
