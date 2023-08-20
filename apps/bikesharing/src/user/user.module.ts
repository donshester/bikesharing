import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserEntity } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordService } from './password.service';
import { UserService } from './user.service';
import { UserGuard } from './guards/user.guard';
import { DriveEntity } from '../drive/drive.entity';
import { BikeEntity } from '../bike/bike.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, DriveEntity, BikeEntity])],
  providers: [PasswordService, UserService, UserGuard],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
