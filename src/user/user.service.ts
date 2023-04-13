import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { PasswordService } from './password.service';
import { GetUserDto } from './dto/get-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly passwordService: PasswordService,
  ) {}

  async createUser(userDto: CreateUserDto): Promise<UserEntity> {
    const hashedPassword = await this.passwordService.hashPassword(
      userDto.password,
    );
    const user: UserEntity = this.userRepository.create({
      ...userDto,
      hashedPassword,
    });
    return this.userRepository.save(user);
  }

  async getUser(id: string): Promise<GetUserDto> {
    const userResponse = await this.userRepository.findOneBy({ id: id });
    if (!userResponse) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    delete userResponse.id;
    delete userResponse.hashedPassword;
    return userResponse;
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ id: id });
    return await this.userRepository.save({ ...user, ...updateUserDto });
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ id: id });
    if (!user) {
      throw new NotFoundException('User was not found!');
    }
    await this.userRepository.remove(user);
  }

  async getAllUsers(): Promise<GetUserDto[]> {
    const users: UserEntity[] = await this.userRepository.find();
    return users.map(({ id, hashedPassword, ...user }) => user);
  }
}
