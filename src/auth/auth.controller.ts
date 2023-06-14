import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthCredentials, signInWithOTP } from './dto/auth-credential.dto';
import { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { User } from './interface/user.interface';
import {
  AdminFilterDto,
  AgentFilterDto,
  MakeAdminFilterDto,
} from './dto/make-admin.filter.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { PoliciesGuard } from 'src/casl/policies.guard';
import { CheckPolicies } from 'src/casl/decorator/check-policies.decorator';
import { Action } from 'src/casl/action.enum';
import { AppAbility } from 'src/casl/casl-ability.factor';
import { ApproveDto } from './dto/update-auth.dto';
import { otpVerifyDto } from './otp/otpVerify.dto';
import { UserOtp } from './otp/UserOtp';
import {
  emailDto,
  otpVerifyForgotPasswordDto,
  passwordDto,
} from './otp/otpVerifyForgotPassword.dto';
import { GetUser } from 'src/decorators/get-user.decorator';

enum OTPType {
  ResetPassword = 'reset',
  Login = 'login',
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Post('/signup')
  @ApiCreatedResponse({ description: 'this response has created successfully' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  signUp(
    @Body(new ValidationPipe()) authCredentials: CreateAuthDto,
  ): Promise<User> {
    return this.authService.signUp(authCredentials);
  }

  @Post('/signin')
  @ApiOkResponse({ description: 'The resource has been successfully returned' })
  @ApiForbiddenResponse({ description: 'Invalid credentials' })
  async signin(
    @Body(ValidationPipe) authCredentials: AuthCredentials,
    @Res() response: Response,
  ): Promise<string> {
    // if (authCredentials.phone) {
    //   return this.authService.signInWithPhone(authCredentials.phone);
    // }

    const token = await this.authService.signIn(authCredentials);
    // console.log(token);

    response
      .cookie('access_token', token, {
        httpOnly: true,
        // domain: 'localhost', // your domain here!
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      })
      .send(token);

    return token;
  }

  @Post('/signin/otp-request')
  @ApiOkResponse({ description: 'The resource has been successfully returned' })
  @ApiForbiddenResponse({ description: 'Invalid credentials' })
  async signInOTP(@Body() otpCredentials: signInWithOTP) {
    return this.authService.signInOTP(otpCredentials);
  }

  @Post('/otp/verify')
  async otpVerify(
    @Req() request: Request,
    @Res() response: Response,
    @Body() filterDto: otpVerifyDto,
  ) {
    const userRequest = filterDto;
    userRequest.type = OTPType.Login;
    // console.log(userRequest);
    try {
      const otpValid = await this.authService.verifyOtp(userRequest);
      // console.log(otpValid);
      if (otpValid) {
        const userObj = await this.authService.findOneById(userRequest.userId);

        request['userId'] = userObj._id;
        const accessToken = await this.authService.createToken(userObj);
        response
          .cookie('access_token', accessToken, {
            httpOnly: true,
            // domain: 'localhost', // your domain here!
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
          })
          .send({
            message: 'OTP successfully verified',
            token: accessToken,
          });
      } else {
        response.statusCode = 401;
        response.send({ message: 'Invalid OTP' });
      }
    } catch (err) {
      // console.log(err);
      response.statusCode = 503;
      response.send({
        message: 'Service not available',
      });
    }
  }

  @Get('/cookies')
  findAll(@Req() request: Request) {
    console.log(request.cookies['access_token']);
  }

  // to verify the user's token
  @Get('/user')
  // @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'User verified Successfully' })
  @ApiUnauthorizedResponse({ description: 'UnAuthorized User' })
  async user(@Req() request: Request) {
    try {
      const cookies = request.cookies['access_token'];
      // console.log("cookies:",cookies);

      const data = await this.jwtService.verifyAsync(cookies);
      // console.log("data:",data);

      if (!data) {
        throw new UnauthorizedException();
      }

      const user = await this.authService.findOne(data.email);

      return user;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  // to logout by deleting the token
  @ApiOkResponse({ description: 'User verified Successfully' })
  @ApiBadRequestResponse({ description: 'login failed' })
  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');

    return {
      message: 'Logged out successfully',
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'User verified Successfully' })
  @ApiBadRequestResponse({ description: 'login failed' })
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, User))
  update(
    @Param('id') id: string,
    @Body() filterDto: MakeAdminFilterDto,
  ): Promise<User> {
    return this.authService.update(id, filterDto);
  }

  @Get('/owners')
  @ApiOkResponse({ description: 'User verified Successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorised User' })
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Get, User))
  getOwners(@Req() request: Request, @Query() filterDto: AdminFilterDto) {
    if (filterDto?.isApproved) {
      return this.authService.getOwnersWithFilter(filterDto);
    }
    return this.authService.getOwners();
  }

  @Get('/agents')
  @ApiOkResponse({ description: 'User verified Successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorised User' })
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Get, User))
  getAgents(@Req() request: Request, @Query() filterDto: AgentFilterDto) {
    if (filterDto) {
      return this.authService.getAgentsWithFilter(filterDto);
    }
    return this.authService.getAgents();
  }

  @Patch('/owner/:id')
  @ApiOkResponse({ description: 'Owner approved successfully' })
  @ApiBadRequestResponse({ description: 'Owner approve act failed' })
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, User))
  approveOwner(
    @Param('id') id: string,
    @Body() filterDto: ApproveDto,
  ): Promise<User> {
    return this.authService.approveOwner(id, filterDto);
  }

  @Delete('/:id')
  delete(@Param('id') id: string) {
    return this.authService.delete(id);
  }

  // ======= forgot_password =====
  @Post('/forgot-password')
  @ApiOkResponse({ description: 'OTP created successfully' })
  @ApiBadRequestResponse({ description: 'server error' })
  forgotPassword(@Req() request: Request, @Body() filterDto: emailDto) {
    return this.authService.forgotPassword(request, filterDto);
  }

  @Post('/otp/forgot-password/verify')
  @ApiOkResponse({ description: 'Owner approved successfully' })
  @ApiBadRequestResponse({ description: 'Owner approve act failed' })
  async otpVerifyForgotPassword(
    @Req() request: Request,
    @Res() response: Response,
    @Body() filterDto: otpVerifyForgotPasswordDto,
  ) {
    const userRequest = filterDto as UserOtp;
    userRequest.type = OTPType.ResetPassword;
    try {
      const otpValid = await this.authService.verifyFGOtp(userRequest);
      if (otpValid) {
        const userAuthObj = await this.authService.findOne(userRequest.email);

        const accessToken = await this.authService.createToken(userAuthObj);
        response
          .cookie('access_token', accessToken, {
            httpOnly: true,
            // domain: 'localhost', // your domain here!
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
          })
          .send({
            message: 'OTP successfully verified',
            token: accessToken,
          });
      } else {
        response.statusCode = 401;
        response.send({ message: 'Invalid OTP' });
      }
    } catch (err) {
      // console.log(err);
      response.statusCode = 503;
      response.send({
        message: 'Service not available',
      });
    }
  }

  @Patch('/reset-password')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'Owner approved successfully' })
  @ApiBadRequestResponse({ description: 'Owner approve act failed' })
  updatePassword(
    @Body() updatepPasswordDto: passwordDto,
    @GetUser() user: User,
  ) {
    return this.authService.updatePassword(updatepPasswordDto, user);
  }
  // ===========================
}
