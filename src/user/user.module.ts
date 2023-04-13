import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserEntity } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordService } from './password.service';
import { UserService } from './user.service';


@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [PasswordService, UserService],
  controllers: [UserController],
})
export class UserModule {}
