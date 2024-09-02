import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDto } from 'src/dtos/UserDto';
import { User, UserDocument } from 'src/schemas/register/user.schema';
import { LoginDto } from '../../dtos/LoginDto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ManagementService {
  @InjectModel(User.name) private userModel: Model<UserDocument>;
  constructor(private jwtService: JwtService) {}

  async saveUser(userDto: UserDto): Promise<any> {
    const user = new this.userModel(
      Object.assign(userDto, {
        password: bcrypt.hashSync(userDto.password, Number(process.env.SALT)),
      }),
    );
    return user.save();
  }
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async login(loginDto: LoginDto): Promise<any> {
    let user = await this.userModel
      .findOne({ username: loginDto.username })
      .exec();

    if (user) {
      const decryptedPassword = await bcrypt.compare(
        loginDto.password,
        user.password,
      );
      if (decryptedPassword) {
        return {
          access_token: await this.jwtService.signAsync(
            {
              username: user.username,
              sub: user._id,
              name: user.name,
              role: user.role,
              email: user.email,
              authorized: true,
            },
            { expiresIn: '1h', secret: process.env.JWT_SECRET },
          ),
        };
      }
    }
    return null;
  }
}
