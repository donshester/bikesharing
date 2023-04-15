import { Module } from '@nestjs/common';
import { DriveController } from './drive.controller';
import {DriveService} from "./drive.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {DriveEntity} from "./drive.entity";
import {BikeEntity} from "../bike/bike.entity";
import {UserEntity} from "../user/user.entity";

@Module({

  imports: [TypeOrmModule.forFeature([DriveEntity, BikeEntity, UserEntity])],
  providers: [DriveService],
  controllers: [DriveController],
})
export class DriveModule {}
