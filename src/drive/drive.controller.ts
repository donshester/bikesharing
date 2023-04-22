import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { DriveService } from './drive.service';
import { StartDriveDto } from './dto/start-drive.dto';
import { EndDriveDto } from './dto/end-drive.dto';
import { DriveEntity } from './drive.entity';

@Controller('drive')
export class DriveController {
  constructor(private readonly driveService: DriveService) {}

  @Post('start-drive')
  async startDrive(@Body() startDriveDto: StartDriveDto): Promise<DriveEntity> {
    return this.driveService.startDrive(startDriveDto);
  }

  @Get(':driveId')
  async getDrive(@Param('driveId') driveId: number): Promise<DriveEntity> {
    return this.driveService.getDriveById(driveId);
  }

  @Put(':driveId/end')
  async endDrive(
    @Param('driveId', ParseIntPipe) driveId: number,
    @Body() endDriveDto: EndDriveDto,
  ) {
    return this.driveService.endDrive(driveId, endDriveDto);
  }
}
