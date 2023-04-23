import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserEntity } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordService } from './password.service';
import { UserService } from './user.service';
import { UserGuard } from './guards/user.guard';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [PasswordService, UserService, UserGuard],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
