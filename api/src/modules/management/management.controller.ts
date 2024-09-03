import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ManagementService } from './management.service';
import { UserDto } from 'src/dtos/UserDto';
import { LoginDto } from '../../dtos/LoginDto';

@Controller()
export class ManagementController {
  constructor(private readonly managementService: ManagementService) {}

  @Post('register')
  async saveUser(@Body() userDto: UserDto): Promise<any> {
    return this.managementService.saveUser(userDto);
  }
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res): Promise<any> {
    const response = await this.managementService.login(loginDto);
    if (!response) {
      return res.status(HttpStatus.BAD_REQUEST).send();
    }
    return res.status(HttpStatus.OK).json(response);
  }
  @Get('all-users')
  async result(@Res() res): Promise<any> {
    const response = await this.managementService.findAll();
    const jsonResponse = JSON.stringify(response);
    return res.status(HttpStatus.OK).send(jsonResponse);
  }
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string, @Res() res): Promise<any> {
    const result = await this.managementService.deleteUser(id);
    if (result.deletedCount === 0) {
      return res.status(HttpStatus.NOT_FOUND).send();
    }
    return res.status(HttpStatus.OK).send();
  }
}
