import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body() loginDto: LoginUserDto): Promise<UserResponseInterface> {
    const user = await this.userService.login(loginDto);
    return this.userService.buildUserResponse(user);
  }

  @Post('/create')
  @UsePipes(new ValidationPipe())
  async create(@Body() dto: CreateUserDto) {
    const user = await this.userService.createUser(dto);
    return this.userService.buildUserResponse(user);
  }

  @Get('current')
  @UseGuards(UserGuard)
  async getCurrentUser(@User() user: UserEntity) {
    return this.userService.buildUserResponse(user);
  }

  @Get('current/drives')
  async getCurrentUserDrives(@User('id') id: string): Promise<DriveEntity[]> {
    return this.userService.getUserDrives(id);
  }
  @Get(':id')
  @Role(Roles.Admin)
  @UseGuards(UserGuard)
  async getUser(@Param('id') id: string): Promise<UserResponseInterface> {
    return await this.userService.getUser(id);
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
    @Param('id') userId: string,
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
}
