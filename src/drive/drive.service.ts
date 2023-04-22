import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DriveEntity } from './drive.entity';
import { Repository } from 'typeorm';
import { BikeEntity } from '../bike/bike.entity';
import { UserEntity } from '../user/user.entity';
import { StartDriveDto } from './dto/start-drive.dto';
import { EndDriveDto } from './dto/end-drive.dto';

@Injectable()
export class DriveService {
  constructor(
    @InjectRepository(DriveEntity)
    private readonly driveRepository: Repository<DriveEntity>,
    @InjectRepository(BikeEntity)
    private readonly bikeRepository: Repository<BikeEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async startDrive(startDriveDto: StartDriveDto): Promise<DriveEntity> {
    const bike = await this.bikeRepository.findOneBy({
      id: startDriveDto.bikeId,
    });
    if (!bike) {
      throw new NotFoundException('Bike not found');
    }

    const user = await this.userRepository.findOneBy({
      id: startDriveDto.userId,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const drive = new DriveEntity();
    drive.bike = bike;
    drive.user = user;
    drive.startTime = new Date();

    return await this.driveRepository.save(drive);
  }
  async endDrive(
    driveId: number,
    endDriveDto: EndDriveDto,
  ): Promise<DriveEntity> {
    const drive = await this.driveRepository.findOne({
      where: { id: driveId },
      relations: ['bike', 'user'],
    });
    if (!drive) {
      throw new NotFoundException('Drive not found');
    }
    delete drive.user.hashedPassword;

    if (!drive.endTime) {
      drive.endTime = new Date();
      const timeDiff = drive.endTime.getTime() - drive.startTime.getTime();
      const hours = timeDiff / (1000 * 60 * 60);
      drive.cost = hours * drive.bike.hourlyPrice;
      return await this.driveRepository.save(drive);
    }
  }

  async getDriveById(id: number): Promise<DriveEntity> {
    const drive = await this.driveRepository.findOneBy({ id: id });
    if (!drive) {
      throw new NotFoundException('Drive not found!');
    }
    delete drive.user.hashedPassword;
    return drive;
  }
}
