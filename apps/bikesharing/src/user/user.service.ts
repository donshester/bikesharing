import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { PasswordService } from './password.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { sign } from 'jsonwebtoken';
import * as process from 'process';
import { UserResponseInterface } from './types/userResponse.interface';
import { LoginUserDto } from './dto/login-user.dto';
import { DriveEntity } from '../drive/drive.entity';
import { Roles } from './types/roles.enum';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly passwordService: PasswordService,
  ) {}

  async createUser(userDto: CreateUserDto): Promise<UserEntity> {
    const existingUser = await this.userRepository.findOne({
      where: [{ email: userDto.email }, { phone: userDto.phone }],
      operator: 'or',
    } as FindOneOptions<UserEntity>);

    if (existingUser) {
      throw new ConflictException('Email or phone already exists');
    }
    const hashedPassword = await this.passwordService.hashPassword(
      userDto.password,
    );
    const user: UserEntity = this.userRepository.create({
      ...userDto,
      hashedPassword,
    });
    user.activationToken = uuidv4();
    return await this.userRepository.save(user);
  }

  async getUser(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ id: id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ id: id });
    if (updateUserDto.password) {
      user.hashedPassword = await this.passwordService.hashPassword(
        updateUserDto.password,
      );
    }
    return await this.userRepository.save({
      ...user,
      ...updateUserDto,
      updated_at: new Date(),
    });
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
    const user = await this.userRepository.findOne({
      where: {
        email: loginUserDto.email,
      },
    });
    if (!user) {
      throw new UnprocessableEntityException('email or password are incorrect');
    }
    const isPasswordCorrect = await this.passwordService.comparePassword(
      loginUserDto.password,
      user.hashedPassword,
    );

    if (!isPasswordCorrect) {
      throw new UnprocessableEntityException('email or password are incorrect');
    }
    return user;
  }
  public generateJwt(user: UserEntity): string {
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
  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOneBy({ id: id });
    return user || null;
  }
  async getUserDrives(userId: string): Promise<DriveEntity[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { drives: true },
    });
    if (!user || !user.drives) {
      return [];
    }
    return user.drives;
  }

  async updateRole(userId: string, role: Roles): Promise<UserEntity> {
    const user = await this.userRepository.findOneOrFail({
      where: {
        id: userId,
      },
    });
    user.role = role;
    return await this.userRepository.save(user);
  }
  async findByQuery(query: string): Promise<UserEntity[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.firstName',
        'user.secondName',
        'user.phone',
        'user.created_at',
        'user.updated_at',
        'user.role',
      ])
      .where('user.firstName ILIKE :query OR user.secondName ILIKE :query', {
        query: `%${query}%`,
      })
      .getMany();
  }

  async activateAccount(token: string) {
    const user = await this.userRepository.findOneBy({
      activationToken: token,
    });
    if (!user) {
      throw new NotFoundException('Token is incorrect');
    }
    user.isBlocked = false;
    user.activationToken = null;
    await this.userRepository.save(user);
  }
}
