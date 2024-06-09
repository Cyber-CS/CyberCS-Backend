import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginDto } from './dtos/LoginDto';

@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}
  @Post()
  async login(@Body() loginDto: any, @Res() res): Promise<any> {
    const response = await this.loginService.login(loginDto);
    console.log(JSON.stringify(response));
    return res.status(HttpStatus.OK).json(response);
  }
}
