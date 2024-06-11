import { Injectable } from '@nestjs/common';
import { LoginDto } from './dtos/LoginDto';

@Injectable()
export class LoginService {
  async login(loginDto: LoginDto): Promise<any> {
    return {
      access_token:
        '',
    };
  }
}