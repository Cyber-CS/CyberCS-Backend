import { Injectable } from '@nestjs/common';

@Injectable()
export class LoginService {
  async login(loginDto: any): Promise<any> {
    return {
      access_token: 'token',
    };
  }
}
