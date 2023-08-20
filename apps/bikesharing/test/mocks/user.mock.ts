import { UserEntity } from '../../src/user/user.entity';
import { Roles } from '../../src/user/types/roles.enum';

export const mockUser: UserEntity = {
  id: 'id',
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
