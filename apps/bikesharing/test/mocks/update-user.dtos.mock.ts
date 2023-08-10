import { UpdateUserDto } from '../../src/user/dto/update-user.dto';

export const updateUserDtoMock: UpdateUserDto = {
  firstName: 'Updated',
  secondName: 'Updated',
};

export const updateUserDtoMockWithPassword: UpdateUserDto = {
  firstName: 'Updated',
  secondName: 'Updated',
  password: 'Updated',
};
