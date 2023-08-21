import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DriveEntity } from './drive.entity';
import { Repository } from 'typeorm';
import { BikeEntity } from '../bike/bike.entity';
import { UserEntity } from '../user/user.entity';
import { Roles } from '../user/types/roles.enum';

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

  async startDrive(user: UserEntity, bikeId: number): Promise<DriveEntity> {
    const bike = await this.bikeRepository.findOneBy({
      id: bikeId,
    });
    if (!bike) {
      throw new NotFoundException('Bike not found');
    }
    if (!bike.isAvailable) {
      throw new ConflictException('Bike is not available!');
    }

    const drive = new DriveEntity();
    drive.bike = bike;
    drive.user = user;
    drive.startTime = new Date();
    drive.cost = 0;
    bike.isAvailable = false;
    delete drive.user.hashedPassword;
    await this.bikeRepository.save(bike);
    return this.driveRepository.save(drive);
  }
  async endDrive(driveId: number, user: UserEntity): Promise<DriveEntity> {
    const drive = await this.driveRepository.findOne({
      where: { id: driveId },
      relations: ['bike', 'user'],
    });
    if (!drive) {
      throw new NotFoundException('Drive not found');
    }
    if (drive.user.id !== user.id) {
      throw new UnauthorizedException(
        'You are not authorized to end this drive',
      );
    }
    delete drive.user.hashedPassword;

    if (!drive.endTime) {
      drive.endTime = new Date();
      const timeDiff = drive.endTime.getTime() - drive.startTime.getTime();
      const hours = timeDiff / (1000 * 60 * 60);
      drive.cost = hours * drive.bike.hourlyPrice;
      drive.bike.isAvailable = true;
      await this.bikeRepository.save(drive.bike);
      return this.driveRepository.save(drive);
    }
  }

  async getDriveById(id: number, user: UserEntity): Promise<DriveEntity> {
    const drive = await this.driveRepository.findOneBy({ id: id });
    if (!drive) {
      throw new NotFoundException('Drive not found!');
    }
    if (drive.user.id !== user.id && user.role === Roles.User) {
      throw new UnauthorizedException(
        'You are not authorized to access this resource',
      );
    }
    if (drive.endTime === null) {
      const currentDate = new Date();
      const timeDiff = currentDate.getTime() - drive.startTime.getTime();
      const hours = timeDiff / (1000 * 60 * 60);
      drive.cost = hours * drive.bike.hourlyPrice;
      await this.driveRepository.save(drive);
    }
    delete drive.user.hashedPassword;
    return drive;
  }
}
