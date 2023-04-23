import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseInterface } from './types/userResponse.interface';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './decorators/user.decorator';
import { UserGuard } from './guards/user.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  async login(@Body() loginDto: LoginUserDto): Promise<UserResponseInterface> {
    const user = await this.userService.login(loginDto);
    return this.userService.buildUserResponse(user);
  }

  @Post('/create')
  async create(@Body() dto: CreateUserDto) {
    const user = await this.userService.createUser(dto);
    return this.userService.buildUserResponse(user);
  }

  // @Get('users')
  // async getUsers(): Promise<UserEntity[]> {
  //   return await this.userService.getAllUsers();
  // }
  @Get('current')
  @UseGuards(UserGuard)
  async getCurrentUser(@User() user: UserEntity) {
    return this.userService.buildUserResponse(user);
  }
  @Get(':id')
  async getUser(@Param('id') id: string): Promise<UserResponseInterface> {
    return await this.userService.getUser(id);
  }

  @Put(':id')
  @UseGuards(UserGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.updateUser(id, updateUserDto);
    return this.userService.buildUserResponse(user);
  }

  @Delete(':id')
  @UseGuards(UserGuard)
  async deleteUser(@Param('id') id: string): Promise<void> {
    return await this.userService.deleteUser(id);
  }
}
