import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseInterface } from './types/userResponse.interface';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './decorators/user.decorator';
import { UserGuard } from './guards/user.guard';
import { Role } from './decorators/role.decorator';
import { Roles } from './types/roles.enum';
import { DriveEntity } from '../drive/drive.entity';
import { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/create')
  @UsePipes(new ValidationPipe())
  async create(@Body() dto: CreateUserDto) {
    const user = await this.userService.createUser(dto);
    return this.userService.buildUserResponse(user);
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body() loginDto: LoginUserDto): Promise<UserResponseInterface> {
    const user = await this.userService.login(loginDto);
    return this.userService.buildUserResponse(user);
  }

  @Get('current')
  @UseGuards(UserGuard)
  async getCurrentUser(@User() user: UserEntity) {
    return this.userService.buildUserResponse(user);
  }
  @Get('search/users')
  @UseGuards(UserGuard)
  @Role(Roles.Admin)
  async findByQuery(@Query('query') query: string): Promise<UserEntity[]> {
    return await this.userService.findByQuery(query);
  }

  @Get('current/drives')
  @UseGuards(UserGuard)
  async getCurrentUserDrives(@User('id') id: string): Promise<DriveEntity[]> {
    return this.userService.getUserDrives(id);
  }
  @Get(':id')
  @Role(Roles.Admin)
  @UseGuards(UserGuard)
  async getUser(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.getUser(id);
    return this.userService.buildUserResponse(user);
  }

  @Put('update')
  @UseGuards(UserGuard)
  @UsePipes(new ValidationPipe())
  async updateUser(
    @User('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.updateUser(id, updateUserDto);
    return this.userService.buildUserResponse(user);
  }
  @Put(':id/role')
  @UseGuards(UserGuard)
  @Role(Roles.Admin)
  @UsePipes(new ValidationPipe())
  async updateRole(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body('role') role: Roles,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.updateRole(userId, role);
    return this.userService.buildUserResponse(user);
  }

  @Delete(':id')
  @UseGuards(UserGuard)
  @Role(Roles.Admin)
  async deleteUser(@Param('id') id: string): Promise<void> {
    return await this.userService.deleteUser(id);
  }

  @Get('activate')
  async activateAccount(
    @Query('token', new ParseUUIDPipe({ version: '4' })) token: string,
    @Res() res: Response,
  ) {
    try {
      await this.userService.activateAccount(token);
      return res.redirect('/login');
    } catch (err) {
      return res.status(400).json({ message: 'Account activation error.' });
    }
  }
}
