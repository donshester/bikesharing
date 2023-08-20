import { UserService } from '../../src/user/user.service';
import { Repository } from 'typeorm';
import { UserEntity } from '../../src/user/user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from '../../src/user/password.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createUserDtoMock } from '../mocks/create-user.dto.mock';
import { Roles } from '../../src/user/types/roles.enum';
import {
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  updateUserDtoMock,
  updateUserDtoMockWithPassword,
} from '../mocks/update-user.dtos.mock';
import { loginUserDto } from '../mocks/login-user.dto';
import { DriveEntity } from '../../src/drive/drive.entity';
import { mockUser } from '../mocks/user.mock';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<UserEntity>;
  let passwordService: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        PasswordService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        }, // fake repository
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    passwordService = module.get<PasswordService>(PasswordService);
  });

  describe('createUser', () => {
    it('should create user', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const mockUserEntity: UserEntity = {
        ...createUserDtoMock,
        ...mockUser,
        generateId: jest.fn,
      };
      jest.spyOn(userRepository, 'create').mockReturnValue(mockUserEntity);

      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUserEntity);

      jest
        .spyOn(passwordService, 'hashPassword')
        .mockResolvedValue('hashedPassword');

      const result = await service.createUser(createUserDtoMock);

      expect(result).toEqual(mockUserEntity);
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(passwordService.hashPassword).toHaveBeenCalledWith(
        createUserDtoMock.password,
      );
    });
    it('should throw ConflictException if user with this email or number already exist', async () => {
      const mockUserEntity: UserEntity = {
        ...createUserDtoMock,
        ...mockUser,
        generateId: jest.fn(),
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUserEntity);
      await expect(service.createUser(createUserDtoMock)).rejects.toThrowError(
        ConflictException,
      );
      expect(userRepository.findOne).toBeCalledTimes(1);
    });
  });
  describe('getUser', () => {
    it('should throw NotFoundException if user with ID not found', async () => {
      const userId = 'non_existent_id';
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.getUser(userId)).rejects.toThrowError(
        NotFoundException,
      );
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
    });

    it('should return user with valid ID', async () => {
      const userId = 'valid_user_id';
      const mockUserEntity: UserEntity = {
        ...mockUser,
        id: userId,
        generateId: jest.fn,
      };
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUserEntity);

      const result = await service.getUser(userId);

      expect(result).toEqual(mockUserEntity);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
    });
  });
  describe('updateUser', () => {
    it('should update user', async () => {
      const existingId = 'existingId';
      const mockUserEntity: UserEntity = {
        ...mockUser,
        id: existingId,
        generateId: jest.fn,
      };
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUserEntity);
      jest
        .spyOn(passwordService, 'hashPassword')
        .mockResolvedValue('newHashedPassword');
      jest.spyOn(userRepository, 'save').mockResolvedValue({
        ...mockUserEntity,
        ...updateUserDtoMock,
        updated_at: new Date(),
        generateId: jest.fn,
      });
      const result = await service.updateUser(existingId, updateUserDtoMock);
      expect(result).toEqual({
        ...mockUserEntity,
        ...updateUserDtoMock,
        updated_at: expect.any(Date),
      });
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: existingId });
      expect(userRepository.save).toHaveBeenCalledWith({
        ...mockUserEntity,
        ...updateUserDtoMock,
        updated_at: expect.any(Date),
      });
    });
    it('should update user with provided data including password', async () => {
      const userId = 'user_id';
      const mockUserEntity: UserEntity = {
        ...mockUser,
        id: userId,
        generateId: jest.fn,
      };
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUserEntity);
      jest
        .spyOn(passwordService, 'hashPassword')
        .mockResolvedValue('newHashedPassword');
      jest.spyOn(userRepository, 'save').mockResolvedValue({
        ...mockUserEntity,
        ...updateUserDtoMockWithPassword,
        hashedPassword: 'newHashedPassword',
        updated_at: expect.any(Date),
        generateId: jest.fn,
      });

      const result = await service.updateUser(
        userId,
        updateUserDtoMockWithPassword,
      );

      expect(result).toEqual({
        ...mockUserEntity,
        ...updateUserDtoMockWithPassword,
        hashedPassword: 'newHashedPassword',
        updated_at: expect.any(Date),
      });
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
      expect(passwordService.hashPassword).toHaveBeenCalledWith(
        updateUserDtoMockWithPassword.password,
      );
      expect(userRepository.save).toHaveBeenCalledWith({
        ...mockUserEntity,
        ...updateUserDtoMockWithPassword,
        hashedPassword: 'newHashedPassword',
        updated_at: expect.any(Date),
      });
    });
  });
  describe('deleteUser', () => {
    it('should delete existing user', async () => {
      const userId = 'user_id';
      const mockUserEntity: UserEntity = {
        ...mockUser,
        id: userId,
        generateId: jest.fn,
      };
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUserEntity);
      jest.spyOn(userRepository, 'remove').mockResolvedValue(undefined);

      await service.deleteUser(userId);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
      expect(userRepository.remove).toHaveBeenCalledWith(mockUserEntity);
    });

    it('should throw NotFoundException for non existing user', async () => {
      const userId = 'non_existing_user_id';
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(undefined);

      await expect(service.deleteUser(userId)).rejects.toThrowError(
        NotFoundException,
      );
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
    });
  });
  describe('getAllUsers', () => {
    it('should return an array of users', async () => {
      const mockUserEntityArray: UserEntity[] = [
        {
          ...mockUser,
          id: 'user_id_1',
          generateId: jest.fn,
        },
        {
          ...mockUser,
          id: 'user_id_2',
          generateId: jest.fn,
        },
      ];
      jest.spyOn(userRepository, 'find').mockResolvedValue(mockUserEntityArray);

      const result = await service.getAllUsers();

      expect(result).toEqual(mockUserEntityArray);
      expect(userRepository.find).toHaveBeenCalled();
    });
  });
  describe('login', () => {
    it('should return user for valid credentials', async () => {
      const mockUserEntity: UserEntity = {
        ...mockUser,
        generateId: jest.fn,
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUserEntity);
      jest.spyOn(passwordService, 'comparePassword').mockResolvedValue(true);

      const result = await service.login(loginUserDto);

      expect(result).toEqual(mockUserEntity);
      expect(passwordService.comparePassword).toHaveBeenCalledWith(
        loginUserDto.password,
        mockUserEntity.hashedPassword,
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: {
          email: loginUserDto.email,
        },
      });
    });
    it('should throw UnprocessableEntityException for invalid credentials', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.login(loginUserDto)).rejects.toThrowError(
        UnprocessableEntityException,
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: {
          email: loginUserDto.email,
        },
      });
    });
    it('should throw UnprocessableEntityException for user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.login(loginUserDto)).rejects.toThrowError(
        UnprocessableEntityException,
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: {
          email: loginUserDto.email,
        },
      });
    });
  });
  describe('buildUserResponse', () => {
    it('should build user response without hashed password and with token', () => {
      const mockUserEntity: UserEntity = {
        id: 'user_id',
        email: 'test@example.com',
        hashedPassword: 'hashedPassword',
        firstName: 'John',
        secondName: 'Doe',
        phone: '+1234567890',
        created_at: new Date(),
        updated_at: new Date(),
        role: Roles.User,
        drives: [],
        generateId: jest.fn,
      };
      const expectedResponse = {
        id: 'user_id',
        email: 'test@example.com',
        firstName: 'John',
        secondName: 'Doe',
        phone: '+1234567890',
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        role: Roles.User,
        drives: [],
        token: expect.any(String),
        generateId: jest.fn,
      };

      const generateJwtSpy = jest
        .spyOn(service as any, 'generateJwt')
        .mockImplementation(() => 'mocked_jwt_token');

      const result = service.buildUserResponse(mockUserEntity);

      expect(result).toEqual(expectedResponse);
      expect(generateJwtSpy).toHaveBeenCalledWith(mockUserEntity);
    });
  });
  describe('findById', () => {
    it('should find user by id', async () => {
      const mockUserEntity: UserEntity = {
        ...mockUser,
        generateId: jest.fn,
      };
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUserEntity);

      const result = await service.findById(mockUser.id);

      expect(result).toEqual(mockUserEntity);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        id: mockUser.id,
      });
    });
    it('should throw NotFoundException if user is not found', async () => {
      const userId = 'user_id';

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(undefined);

      const result = await service.findById(userId);

      expect(result).toBeNull();
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
    });
  });
  describe('getUserDrives', () => {
    it('should return an array of drives for a user', async () => {
      const userId = 'user_id';
      const user = new UserEntity();
      user.id = userId;
      const drive1 = new DriveEntity();
      const drive2 = new DriveEntity();
      user.drives = [drive1, drive2];

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await service.getUserDrives(userId);

      expect(result).toEqual([drive1, drive2]);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: { drives: true },
      });
    });
    it('should return an empty array if the user is not found', async () => {
      const userId = 'user_id';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      const result = await service.getUserDrives(userId);

      expect(result).toEqual([]);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: { drives: true },
      });
    });
  });
  describe('updateRole', () => {
    it('should update the role of the user', async () => {
      const userId = 'user_id';
      const role = Roles.Admin;
      const user = new UserEntity();
      user.id = userId;
      const mockUserEntity: UserEntity = {
        ...mockUser,
        generateId: jest.fn(),
      };
      jest.spyOn(userRepository, 'findOneOrFail').mockResolvedValue(user);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUserEntity);

      const result = await service.updateRole(userId, role);

      expect(result).toEqual(mockUserEntity);
      expect(user.role).toEqual(role);
      expect(userRepository.save).toHaveBeenCalledWith(user);
    });
    it('should throw NotFoundException if the user is not found', async () => {
      const userId = 'non_existent_user_id';
      const role = Roles.Admin;
      jest
        .spyOn(userRepository, 'findOneOrFail')
        .mockRejectedValue(new NotFoundException('User not found'));
      jest.spyOn(userRepository, 'save');

      await expect(service.updateRole(userId, role)).rejects.toThrowError(
        NotFoundException,
      );
      expect(userRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });
  describe('findByQuery', () => {
    it('should return an array of users that match the query', async () => {
      const mockUser1: UserEntity = {
        ...mockUser,
        generateId: jest.fn,
      };

      const mockUser2: UserEntity = {
        ...mockUser,
        id: '2',
        email: 'user2@example.com',
        firstName: 'Jane',
        secondName: 'Smith',
        phone: '+9876543210',
        created_at: new Date(),
        updated_at: new Date(),
        role: Roles.Admin,
        ...mockUser,
        generateId: jest.fn,
      };

      const mockUsers: UserEntity[] = [mockUser1, mockUser2];

      const qb = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockUsers),
      };

      jest
        .spyOn(userRepository, 'createQueryBuilder')
        .mockReturnValue(qb as any);

      const query = 'John';
      const result = await service.findByQuery(query);
      expect(result).toEqual(mockUsers);
      expect(userRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(qb.select).toHaveBeenCalledWith([
        'user.id',
        'user.email',
        'user.firstName',
        'user.secondName',
        'user.phone',
        'user.created_at',
        'user.updated_at',
        'user.role',
      ]);
      expect(qb.where).toHaveBeenCalledWith(
        'user.firstName ILIKE :query OR user.secondName ILIKE :query',
        { query: `%${query}%` },
      );
      expect(qb.getMany).toHaveBeenCalledTimes(1);
    });
  });
});
