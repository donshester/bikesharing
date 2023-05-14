import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { DriveService } from './drive.service';

import { DriveEntity } from './drive.entity';
import { UserGuard } from '../user/guards/user.guard';

import { User } from '../user/decorators/user.decorator';
import { UserEntity } from '../user/user.entity';

@Controller('drive')
@UseGuards(UserGuard)
export class DriveController {
  constructor(private readonly driveService: DriveService) {}

  @Post('start/:bikeId')
  async startDrive(
    @User() user: UserEntity,
    @Param('bikeId') bikeId: number,
  ): Promise<DriveEntity> {
    return this.driveService.startDrive(user, bikeId);
  }

  @Get(':driveId')
  async getDrive(
    @Param('driveId') driveId: number,
    @User() user: UserEntity,
  ): Promise<DriveEntity> {
    return this.driveService.getDriveById(driveId, user);
  }

  @Put(':driveId/end')
  async endDrive(
    @Param('driveId', ParseIntPipe) driveId: number,
    @User() user: UserEntity,
  ) {
    return this.driveService.endDrive(driveId, user);
  }
}
