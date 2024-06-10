import { Injectable } from '@nestjs/common';
import { LoginDto } from './dtos/LoginDto';

@Injectable()
export class LoginService {
  async login(loginDto: LoginDto): Promise<any> {
    return {
      access_token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkb2MiOiIwMDA3MDczODc5MyIsIm5hbWUiOiJWQUdORVIgREUgT0xJVkVJUkEgREEgU0lMVkEiLCJhdXRob3JpemVkIjp0cnVlLCJpYXQiOjE3MTc5MTE3NjksImV4cCI6MTcxNzkxMzc2OX0.v5l6vCDv9HlCSABE9Eg8R3PO4YrHGMDTAKDBdGDpYY8',
    };
  }
}