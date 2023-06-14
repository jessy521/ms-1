import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { GetFilterDto } from './filters/get-filter.dto';
import { Customer } from './interface/customer.interface';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  // @UseGuards(JwtAuthGuard, PoliciesGuard)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Customer))
  @ApiCreatedResponse({ description: 'this response has created successfully' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  create(@Body(new ValidationPipe()) createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  // @UseGuards(JwtAuthGuard, PoliciesGuard)
  // @CheckPolicies((ability: AppAbility) => ability.can(Action.Get, Customer))
  @ApiOkResponse({
    description: 'The resource list has been successfully returned',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  find(@Query('id') filterDto: GetFilterDto) {
    if (filterDto) {
      return this.customersService.findOne(filterDto);
    } else {
      return this.customersService.findAll();
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Customer))
  @ApiCreatedResponse({
    description: 'The resource has been updated successfully',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Not found' })
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Customer))
  @ApiOkResponse({ description: 'The resource has been successfully deleted' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Not found' })
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }

  @Get('/history/:id')
  @ApiOkResponse({ description: 'The resource has been successfully deleted' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  bookingHistory(@Param('id') id: string) {
    return this.customersService.bookingHistory(id);
  }
}
