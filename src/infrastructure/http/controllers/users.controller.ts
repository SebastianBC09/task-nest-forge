import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from '../../../application/services/users.service';
import { HeaderUserGuard } from '../../auth/header-user.guard';
import { CreateUserDto } from '../dtos/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return await this.usersService.create({ name: dto.name });
  }

  @UseGuards(HeaderUserGuard)
  @Get('me')
  async me(@Req() req) {
    const id = req.user.id as string;
    return await this.usersService.findOrCreateById(id);
  }
}