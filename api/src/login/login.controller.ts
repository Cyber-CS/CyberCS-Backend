import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginDto } from './dtos/LoginDto';

@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}
  @Post()
  async login(@Body() loginDto: LoginDto, @Res() res): Promise<any> {
    const response = await this.loginService.login(loginDto);
    return res.status(HttpStatus.OK).json(response);
  }
}