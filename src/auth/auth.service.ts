import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import mongoose, { Model } from 'mongoose';
import { AuthCredentials, signInWithOTP } from './dto/auth-credential.dto';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './user.repository';
import { User } from './interface/user.interface';
import { CreateAuthDto } from './dto/create-auth.dto';
import { JwtPayload } from './interface/jwt-payload.interface';
import {
  AdminFilterDto,
  AgentFilterDto,
  MakeAdminFilterDto,
} from './dto/make-admin.filter.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ownerMailEvent,
  signInEvent,
} from 'src/reservations/events/reservation.event';
import { ApproveDto } from './dto/update-auth.dto';
import { UserOtp } from './otp/UserOtp';
import { MailService } from 'src/mail/mail.service';

enum OTPType {
  ResetPassword = 'reset',
  Login = 'login',
}

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_MODEL')
    private authModel: Model<User>,
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private eventEmitter: EventEmitter2,
    @Inject('OTP_MODEL')
    private readonly otpModel: Model<UserOtp>,
    private mailService: MailService,
  ) {}

  async signUp(authCredentials: CreateAuthDto): Promise<User> {
    const { password, confirmPassword } = authCredentials;

    if (password === confirmPassword) {
      const regularUser = await this.userRepository.validateUser(
        authCredentials,
      );

      if (regularUser) {
        const user = new this.authModel(authCredentials);
        user.password = await bcrypt.hash(user.password, 10);
        await user.save();

        return user;
      } else {
        throw new ConflictException('user already exist');
      }
    } else {
      throw new BadRequestException('password mismatched');
    }
  }

  async signIn(authCredentials: AuthCredentials): Promise<string> {
    const user = await this.userRepository.validateUserPassword(
      authCredentials,
    );

    const accessToken = await this.createToken(user);
    return accessToken;
  }

  async createToken(user) {
    const payload: JwtPayload = {
      username: user.username,
      email: user.email,
      phone: user.phone,
      password: user.password,
      role: user.role,
    };
    const accessToken = await this.jwtService.sign(payload);
    return accessToken;
  }

  async signInOTP(otpCredentials: signInWithOTP) {
    const user = await this.authModel.findOne({
      $or: [
        { email: otpCredentials.phoneOrEmail },
        { phone: otpCredentials.phoneOrEmail },
      ],
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const otp = await this.generateOTP({
      userId: user._id,
      email: user.email,
      phone: user.phone,
      type: OTPType.Login,
    });
    // console.log('OTP: ', otp);
    let mailerEvent = new signInEvent();
    mailerEvent.user = user;
    mailerEvent.otp = otp;
    this.eventEmitter.emit('signIn', mailerEvent);
    return {
      message: 'OTP sent successfully',
      user: user,
    };
  }

  async generateOTP(userRequest) {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000);
      await this.otpModel.deleteOne({ userId: userRequest.userId });
      await this.otpModel.create({
        userId: userRequest.userId,
        email: userRequest.email,
        phone: userRequest.phone,
        otp,
        type: userRequest.type,
      });
      // console.log('generateOTP:', otp);
      return otp;
    } catch (err) {
      throw err;
    }
  }

  async verifyOtp(userRequest) {
    try {
      const userObject = await this.otpModel.findOne({
        userId: userRequest.userId,
        type: userRequest.type,
      });
      const passwordValid = await bcrypt.compare(
        userRequest.otp,
        userObject.otp,
      );
      if (passwordValid) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      // console.log(err);
      throw new Error(err.message);
    }
  }

  async findOne(email: string): Promise<User> {
    const user = this.authModel.findOne({ email });

    return user.select({ password: 0 });
  }

  async findOneById(id: string): Promise<User> {
    const user = this.authModel.findById({ _id: id });

    return user.select({ password: 0 });
  }

  async update(id: string, filterDto: MakeAdminFilterDto) {
    const userFound = await this.authModel.findById({ _id: id });
    if (userFound) {
      return this.authModel.findByIdAndUpdate({ _id: id }, filterDto, {
        returnOriginal: false,
      });
    }
  }

  async approveOwner(id: string, filterDto: ApproveDto) {
    const userFound = await this.authModel.findById({ _id: id });
    if (userFound) {
      const updatedAdmin = await this.authModel.findByIdAndUpdate(
        { _id: id },
        filterDto,
        {
          new: true,
        },
      );
      let mailerEvent = new ownerMailEvent();
      mailerEvent.user = updatedAdmin;
      this.eventEmitter.emit('mailOwner.approved', mailerEvent);

      return updatedAdmin;
    } else {
      throw new NotFoundException();
    }
  }

  async getOwners() {
    try {
      return this.authModel.find({ role: 'Property-Admin' });
    } catch (err) {
      throw new BadRequestException({ message: err.message });
    }
  }

  async getAgents() {
    try {
      return this.authModel.find({ role: 'Agent' });
    } catch (err) {
      throw new BadRequestException({ message: err.message });
    }
  }

  async getOwnersWithFilter(filterDto: AdminFilterDto) {
    try {
      return this.authModel.find({
        role: 'Property-Admin',
        isApproved: filterDto.isApproved,
      });
    } catch (err) {
      throw new BadRequestException({ message: err.message });
    }
  }

  async getAgentsWithFilter(filterDto: AgentFilterDto) {
    try {
      const query = { role: 'Agent', ...filterDto };
      return this.authModel.find(query);
    } catch (err) {
      throw new BadRequestException({ message: err.message });
    }
  }

  async delete(id: string) {
    try {
      return this.authModel.findByIdAndDelete({ _id: id });
    } catch (err) {
      throw new ForbiddenException({ message: err.message });
    }
  }

  async forgotPassword(request, filterDto) {
    // try {
    const { email } = filterDto;
    const userExist = await this.authModel.findOne({ email });
    if (!userExist) {
      throw new NotFoundException({
        message: 'Please enter a valid email address',
      });
    } else {
      // const rId = Date.now() + Math.round(Math.random() * 100).toString();
      // const rIdHash = await bcrypt.hash(rId, 2);
      const otp = await this.generateOTP({
        userId: userExist._id,
        phone: userExist.phone,
        email,
        type: OTPType.ResetPassword,
        // rId,
      });
      // request.r = rIdHash;
      // console.log(otp);
      let mailerEvent = new signInEvent();
      mailerEvent.user = userExist;
      mailerEvent.otp = otp;
      this.eventEmitter.emit('forgotPassword', mailerEvent);
      return {
        user: userExist,
        message: 'OTP successfully generated',
      };
    }
    // } catch (err) {
    //   throw new ForbiddenException({ message: 'unable to generate OTP' });
    // }
  }

  async verifyFGOtp(userRequest) {
    try {
      const userObject = await this.otpModel.findOne({
        email: userRequest.email,
        type: OTPType.ResetPassword,
      });
      const passwordValid = await bcrypt.compare(
        userRequest.otp,
        userObject.otp,
      );
      if (passwordValid) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      // console.log(err);
      throw new Error(err.message);
    }
  }

  async updatePassword(updatePasswordDto, user: User) {
    try {
      const { password, confirmPassword } = updatePasswordDto;
      if (password === confirmPassword) {
        const userExist = await this.authModel.findById({ _id: user._id });

        if (!userExist) {
          throw new ForbiddenException('user not found!');
        }
        const passwordToStore = await bcrypt.hash(password, 10);
        userExist.password = passwordToStore;
        await userExist.save();

        let mailerEvent = new ownerMailEvent();
        mailerEvent.user = userExist;
        this.eventEmitter.emit('resetPassword', mailerEvent);

        return 'Password updated successfully! Log-in with new password!';
      } else {
        throw new ForbiddenException({ message: "password didn't matched!" });
      }
    } catch (error) {
      throw new ForbiddenException({
        message: 'Failed to update the password!' + error.message,
      });
    }
  }
}
