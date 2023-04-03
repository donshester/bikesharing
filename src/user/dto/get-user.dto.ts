import {UserEntity} from "../user.entity";

export type GetUserDto = Omit<UserEntity, 'hashedPassword'| 'id'>
