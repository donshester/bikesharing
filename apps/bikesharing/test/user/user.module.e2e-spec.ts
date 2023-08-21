import { Repository } from 'typeorm';
import { UserEntity } from '../../src/user/user.entity';
import { INestApplication } from '@nestjs/common';
import { UserModule } from '../../src/user/user.module';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { testDbConfig } from '../db_config';
import * as request from 'supertest';
import { PasswordService } from '../../src/user/password.service';
import { LoginUserDto } from '../../src/user/dto/login-user.dto';
import { CreateUserDto } from '../../src/user/dto/create-user.dto';
import { UserService } from '../../src/user/user.service';
import { AuthMiddleware } from '../../src/user/middleware/auth.middleware';
import { Roles } from '../../src/user/types/roles.enum';
import { DriveEntity } from '../../src/drive/drive.entity';
import { createMockDrives } from '../mocks/createMockDrives';
import { BikeEntity } from '../../src/bike/bike.entity';

describe('UserController (E2E)', () => {
  let app: INestApplication;
  let repository: Repository<UserEntity>;
  let driveRepository: Repository<DriveEntity>;
  let bikeRepository: Repository<BikeEntity>;
  let passwordService: PasswordService;
  let userService: UserService;
  let testUser;
  const testUserPassword = 'password123';
  let authorizedUser;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserModule, TypeOrmModule.forRoot(testDbConfig)],
      providers: [
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository<UserEntity>,
        },
        {
          provide: getRepositoryToken(DriveEntity),
          useClass: Repository<DriveEntity>,
        },
        {
          provide: getRepositoryToken(BikeEntity),
          useClass: Repository<BikeEntity>,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    userService = module.get<UserService>(UserService);
    repository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    driveRepository = module.get<Repository<DriveEntity>>(
      getRepositoryToken(DriveEntity),
    );
    bikeRepository = module.get<Repository<BikeEntity>>(
      getRepositoryToken(BikeEntity),
    );
    passwordService = module.get<PasswordService>(PasswordService);
    app.use((req, _, next) =>
      new AuthMiddleware(userService).use(req, _, next),
    );

    await app.init();
  });

  beforeAll(async () => {
    const hashedPassword = await passwordService.hashPassword(testUserPassword);
    testUser = {
      email: 'test@example.com',
      hashedPassword: hashedPassword,
      firstName: 'John',
      secondName: 'Doe',
      phone: '+1234567890',
    };
  });
  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const user = repository.create({ ...testUser });
    await repository.save(user);
  });

  afterEach(async () => {
    await repository.query('DELETE FROM users;');
  });
  describe('login', () => {
    it('should log in a user and return user details with token', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };

      const response = await request(app.getHttpServer())
        .post('/user/login')
        .send(loginDto);

      expect(response.status).toBe(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          email: loginDto.email,
          firstName: expect.any(String),
          secondName: expect.any(String),
          phone: expect.any(String),
          created_at: expect.any(String),
          updated_at: expect.any(String),
          role: expect.any(String),
          token: expect.any(String),
        }),
      );
    });
    it('should return 422 if user email is incorrect', async () => {
      const loginDto = {
        email: 'incorrect@example.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/user/login')
        .send(loginDto);

      expect(response.status).toBe(422);

      expect(response.body).toEqual({
        statusCode: 422,
        message: 'email or password are incorrect',
        error: 'Unprocessable Entity',
      });
    });
    it('should return 422 Unprocessable Entity for non-existent user', async () => {
      const loginDto: LoginUserDto = {
        email: 'nonexistentuser@example.com',
        password: 'somepassword',
      };

      const user = await repository.findOneBy({ email: loginDto.email });
      expect(user).toBeNull();

      return request(app.getHttpServer())
        .post('/user/login')
        .send(loginDto)
        .expect(422)
        .expect((res) => {
          expect(res.body.message).toBe('email or password are incorrect');
        });
    });
    it('should return 400 Bad Request for missing or invalid email and password', async () => {
      const loginDtoWithoutEmail = {
        password: 'testpassword',
      };

      const loginDtoWithoutPassword = {
        email: 'test@example.com',
      };

      const incorrectLoginDto: LoginUserDto = {
        email: '123345',
        password: '1',
      };

      await request(app.getHttpServer())
        .post('/user/login')
        .send(loginDtoWithoutEmail)
        .expect(400);

      await request(app.getHttpServer())
        .post('/user/login')
        .send(loginDtoWithoutPassword)
        .expect(400);

      await request(app.getHttpServer())
        .post('/user/login')
        .send(incorrectLoginDto)
        .expect(400);
    });
  });
  describe('register', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'another@example.com',
        password: 'Test1234',
        firstName: 'John',
        secondName: 'Doe',
        phone: '+1214567890',
      };

      await request(app.getHttpServer())
        .post('/user/create')
        .send(createUserDto)
        .expect(201);
    });
    it('should throw ConflictException for existing email or phone', async () => {
      const existingUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'Test1234',
        firstName: 'Jane',
        secondName: 'Smith',
        phone: '+9876543210',
      };

      await request(app.getHttpServer())
        .post('/user/create')
        .send(existingUserDto)
        .expect(409);
    });
    it('should throw UnprocessableEntityException for invalid input', async () => {
      const invalidUserDto: CreateUserDto = {
        email: 'invalidemail',
        password: 'invalid',
        firstName: '',
        secondName: 'LongLastName',
        phone: '+123abc',
      };

      await request(app.getHttpServer())
        .post('/user/create')
        .send(invalidUserDto)
        .expect(400);
    });
    it('should hash the password before saving to the database', async () => {
      const userDto: CreateUserDto = {
        email: 'another@example.com',
        password: 'testpassword123',
        firstName: 'John',
        secondName: 'Doe',
        phone: '+1214567890',
      };

      const response = await request(app.getHttpServer())
        .post('/user/create')
        .send(userDto);

      expect(response.status).toBe(201);

      const user = await repository.findOneBy({ email: userDto.email });

      expect(user).toBeDefined();
      expect(user?.hashedPassword).toBeDefined();
      expect(user?.hashedPassword).not.toEqual(userDto.password);
    });
  });
  describe('endpoints using token for user', () => {
    let testToken: string;
    afterAll(async () => {
      await repository.query('DELETE FROM users;');
    });
    beforeEach(async () => {
      authorizedUser = {
        email: 'authorized@example.com',
        password: 'Test1234',
        firstName: 'John',
        secondName: 'Doe',
        phone: '+1214567890',
      };
      const loginDto: LoginUserDto = {
        email: 'authorized@example.com',
        password: 'Test1234',
      };
      const response = await request(app.getHttpServer())
        .post('/user/create')
        .send(authorizedUser);
      const loginResponse = await request(app.getHttpServer())
        .post('/user/login')
        .send(loginDto);

      testToken = loginResponse.body.token;
    });
    it('should return unauthorized if user is not authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/user/current')
        .expect(401);

      expect(response.body.message).toBe(
        'You are not authorized to access this resource',
      );
    });
    describe('current user', () => {
      it('should return current user', async () => {
        const response = await request(app.getHttpServer())
          .get('/user/current')
          .set('Authorization', testToken)
          .expect(200);

        expect(response.body.hashedPassword).toBeUndefined();
        expect(response.body.email).toBe(authorizedUser.email);
        expect(response.body.firstName).toBe(authorizedUser.firstName);
        expect(response.body.secondName).toBe(authorizedUser.secondName);
        expect(response.body.phone).toBe(authorizedUser.phone);
        expect(response.body.role).toBe(Roles.User);
      });
    });
    it('should return 401 Unauthorized if an invalid authorization token is provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/user/current/drives')
        .set('Authorization', 'InvalidToken')
        .expect(401);
    });
    describe('get current user drives', () => {
      afterEach(async () => {
        await driveRepository.delete({});
        await bikeRepository.delete({});
        await repository.delete({});
      });
      it('should return an empty array if the user has no drives', async () => {
        const response = await request(app.getHttpServer())
          .get('/user/current/drives')
          .set('Authorization', testToken)
          .expect(200);

        expect(response.body).toEqual([]);
      });
      it('should return an array of user drives', async () => {
        const existingUser = await repository.findOneBy({
          email: authorizedUser.email,
        });
        await createMockDrives(driveRepository, bikeRepository, existingUser);
        const response = await request(app.getHttpServer())
          .get('/user/current/drives')
          .set('Authorization', testToken)
          .expect(200);

        expect(response.body.length).toBe(2);

        expect(response.body[0]).toHaveProperty('id', 1);
        expect(response.body[0]).toHaveProperty('startTime');
        expect(new Date(response.body[0].startTime)).toBeInstanceOf(Date);

        expect(response.body[0]).toHaveProperty('endTime');
        expect(new Date(response.body[0].endTime)).toBeInstanceOf(Date);

        expect(Number(response.body[0].cost)).toEqual(10.5);
        expect(response.body[0]).toHaveProperty('bike');

        expect(response.body[1]).toHaveProperty('id', 2);
        expect(response.body[1]).toHaveProperty('startTime');
        expect(new Date(response.body[1].startTime)).toBeInstanceOf(Date);

        expect(response.body[1]).toHaveProperty('endTime');
        expect(new Date(response.body[1].endTime)).toBeInstanceOf(Date);

        expect(Number(response.body[1].cost)).toEqual(15.75);
        expect(response.body[1]).toHaveProperty('bike');
      });
    });
    describe('update user', () => {
      it('should update the user data', async () => {
        const updatedUserData = {
          firstName: 'Updated First Name',
          secondName: 'Updated Second Name',
          phone: '+375291234567',
        };
        const response = await request(app.getHttpServer())
          .put('/user/update')
          .set('Authorization', testToken)
          .send(updatedUserData)
          .expect(200);
        expect(response.body.firstName).toBe(updatedUserData.firstName);
        expect(response.body.secondName).toBe(updatedUserData.secondName);
        expect(response.body.phone).toBe(updatedUserData.phone);

        const updatedUser = await repository.findOneBy({
          email: authorizedUser.email,
        });
        expect(updatedUser.firstName).toBe(updatedUserData.firstName);
        expect(updatedUser.secondName).toBe(updatedUserData.secondName);
        expect(updatedUser.phone).toBe(updatedUserData.phone);
      });
      it('should update the user password', async () => {
        const updatedUserData = {
          password: 'NewPassword123',
        };

        const response = await request(app.getHttpServer())
          .put('/user/update')
          .set('Authorization', testToken)
          .send(updatedUserData)
          .expect(200);

        const updatedUser = await repository.findOneBy({
          email: authorizedUser.email,
        });
        const isPasswordValid = await passwordService.comparePassword(
          updatedUserData.password,
          updatedUser.hashedPassword,
        );
        expect(isPasswordValid).toBe(true);
      });
      it('should return 400 Bad Request if an invalid email is provided', async () => {
        const updatedUserData = {
          email: 'invalid-email',
        };

        await request(app.getHttpServer())
          .put('/user/update')
          .set('Authorization', testToken)
          .send(updatedUserData)
          .expect(400);
      });
    });
  });
  describe('endpoints using token for admin', () => {
    let testToken: string;

    beforeEach(async () => {
      authorizedUser = {
        email: 'admin@example.com',
        password: 'Test1234',
        firstName: 'John',
        secondName: 'Doe',
        phone: '+1214567890',
      };
      const loginDto: LoginUserDto = {
        email: 'admin@example.com',
        password: 'Test1234',
      };
      const response = await request(app.getHttpServer())
        .post('/user/create')
        .send(authorizedUser);

      const user = await repository.findOneBy({ email: loginDto.email });
      await repository.save({ ...user, role: Roles.Admin });
      const loginResponse = await request(app.getHttpServer())
        .post('/user/login')
        .send(loginDto);
      testToken = loginResponse.body.token;
    });
    afterAll(async () => {
      await repository.query('DELETE FROM users;');
    });
    it('should return 401 Unauthorized if no token is provided', async () => {
      await request(app.getHttpServer()).get('/user/search/users').expect(401);
    });

    it('should return 401 Unauthorized if an invalid token is provided', async () => {
      const invalidToken = 'invalid-token';
      await request(app.getHttpServer())
        .get('/user/search/users')
        .set('Authorization', invalidToken)
        .expect(401);
    });
    describe('get user ', () => {
      it('should get a user by ID', async () => {
        const findUser = await repository.findOneBy({
          email: testUser.email,
        });
        const response = await request(app.getHttpServer())
          .get(`/user/${findUser.id}`)
          .set('Authorization', testToken)
          .expect(200);

        expect(response.body.hashedPassword).toBeUndefined();
        expect(response.body.email).toBe(testUser.email);
        expect(response.body.firstName).toBe(testUser.firstName);
        expect(response.body.secondName).toBe(testUser.secondName);
        expect(response.body.phone).toBe(testUser.phone);
        expect(Object.values(Roles).includes(response.body.role)).toBeTruthy();
      });
      it('should return 404 Not Found for fetching a user with non uuid id', async () => {
        const invalidUserId = 'invalid-id';
        await request(app.getHttpServer())
          .get(`/user/${invalidUserId}`)
          .set('Authorization', testToken)
          .expect(400);
      });
      it('should return 403 Forbidden for fetching a user with a valid ID but without Admin role', async () => {
        const findUser = await repository.findOneBy({
          email: testUser.email,
        });
        const loginDto: LoginUserDto = {
          email: testUser.email,
          password: testUserPassword,
        };
        const loginResponse = await request(app.getHttpServer())
          .post('/user/login')
          .send(loginDto);

        const nonAdminToken = loginResponse.body.token;
        await request(app.getHttpServer())
          .get(`/user/${findUser.id}`)
          .set('Authorization', nonAdminToken)
          .expect(401);
      });
    });
    describe('find user by query', () => {
      it('should return an array of users matching the query', async () => {
        const user1 = {
          email: 'user1@example.com',
          password: 'Test1234',
          firstName: 'Alice',
          secondName: 'Smith',
          phone: '+1234567810',
          role: Roles.User,
        };
        const user2 = {
          email: 'user2@example.com',
          password: 'Test5678',
          firstName: 'Bob',
          secondName: 'Johnson',
          phone: '+9876543210',
          role: Roles.User,
        };
        await request(app.getHttpServer())
          .post('/user/create')
          .send(user1)
          .expect(201);
        await request(app.getHttpServer())
          .post('/user/create')
          .send(user2)
          .expect(201);

        const response = await request(app.getHttpServer())
          .get('/user/search/users')
          .query({ query: 'ali' }) // case-insensitive
          .set('Authorization', testToken)
          .expect(200);

        expect(response.body.length).toBe(1);
        expect(response.body[0].email).toBe(user1.email);
        expect(response.body[0].firstName).toBe(user1.firstName);
        expect(response.body[0].secondName).toBe(user1.secondName);
        expect(response.body[0].phone).toBe(user1.phone);
        expect(response.body[0].role).toBe(user1.role);
      });
      it('should return an empty array if no users match the query', async () => {
        const user1 = {
          email: 'user1@example.com',
          password: 'Test1234',
          firstName: 'Alice',
          secondName: 'Smith',
          phone: '+1234567891',
          role: Roles.User,
        };
        await request(app.getHttpServer())
          .post('/user/create')
          .send(user1)
          .expect(201);

        const response = await request(app.getHttpServer())
          .get('/user/search/users')
          .query({ query: 'pop' })
          .set('Authorization', testToken)
          .expect(200);

        expect(response.body.length).toBe(0);
      });
    });
    describe('update role', () => {
      it('should update the role of a user', async () => {
        const newUser: CreateUserDto = {
          email: 'user1@example.com',
          password: 'Test1234',
          firstName: 'Jane',
          secondName: 'Doe',
          phone: '+1211567890',
        };

        const createUserResponse = await request(app.getHttpServer())
          .post('/user/create')
          .send(newUser)
          .expect(201);

        const userId = createUserResponse.body.id;
        const updatedRole = Roles.Admin;

        const response = await request(app.getHttpServer())
          .put(`/user/${userId}/role`)
          .set('Authorization', testToken)
          .send({ role: updatedRole })
          .expect(200);

        expect(response.body).toHaveProperty('id', userId);
        expect(response.body).toHaveProperty('role', updatedRole);
      });
      it('should return 404 Not Found for updating the role of a non-existing user', async () => {
        const nonExistingUserId = 'non-existing-user-id';
        const updatedRole = Roles.Admin;

        const response = await request(app.getHttpServer())
          .put(`/user/${nonExistingUserId}/role`)
          .set('Authorization', testToken)
          .send({ role: updatedRole })
          .expect(400);

        expect(response.body.message).toEqual(
          'Validation failed (uuid is expected)',
        );
      });
    });
  });
});
