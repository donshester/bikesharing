import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { PasswordService } from './password.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { sign } from 'jsonwebtoken';
import * as process from 'process';
import { UserResponseInterface } from './types/userResponse.interface';
import { LoginUserDto } from './dto/login-user.dto';
import { DriveEntity } from '../drive/drive.entity';
import { Roles } from './types/roles.enum';

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

  async getUser(id: string): Promise<UserResponseInterface> {
    const userResponse = await this.userRepository.findOneBy({ id: id });
    if (!userResponse) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.buildUserResponse(userResponse);
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

  async getAllUsers(): Promise<UserEntity[]> {
    return await this.userRepository.find();
  }

  async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const errorResponse = {
      errors: {
        'email or password': 'is invalid',
      },
    };
    const user = await this.userRepository.findOne({
      where: {
        email: loginUserDto.email,
      },
    });
    if (!user) {
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }
    const isPasswordCorrect = await this.passwordService.comparePassword(
      loginUserDto.password,
      user.hashedPassword,
    );

    if (!isPasswordCorrect) {
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }
    return user;
  }
  private generateJwt(user: UserEntity): string {
    return sign(
      {
        id: user.id,
        email: user.email,
        telephone: user.phone,
      },
      process.env.SECRET_KEY,
    );
  }
  buildUserResponse(userEntity: UserEntity): UserResponseInterface {
    const { hashedPassword, ...userWithoutPassword } = userEntity;
    return { ...userWithoutPassword, token: this.generateJwt(userEntity) };
  }
  async findById(id: string): Promise<UserEntity> {
    return await this.userRepository.findOneBy({ id: id });
  }
  async getUserDrives(userId: string): Promise<DriveEntity[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { drives: true },
    });
    return user.drives;
  }

  async updateRole(userId: string, role: Roles): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.role = role;
    return await this.userRepository.save(user);
  }
}
