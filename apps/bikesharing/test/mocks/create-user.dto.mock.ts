import { plainToClass } from 'class-transformer';
import { CreateUserDto } from '../../src/user/dto/create-user.dto';

export const createUserDtoMock: CreateUserDto = plainToClass(CreateUserDto, {
  email: 'test@example.com',
  password: 'Test1234',
  firstName: 'John',
  secondName: 'Doe',
  phone: '+1234567890',
});
