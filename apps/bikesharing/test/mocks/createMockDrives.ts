import { BikeEntity, BikeStatus } from '../../src/bike/bike.entity';
import { Repository } from 'typeorm';
import { DriveEntity } from '../../src/drive/drive.entity';
import { UserEntity } from '../../src/user/user.entity';

export async function createMockDrives(
  driveRepository: Repository<DriveEntity>,
  bikeRepository: Repository<BikeEntity>,
  testUser: UserEntity,
): Promise<void> {
  const bike1 = new BikeEntity();
  bike1.modelName = 'Bike Model 1';
  bike1.hourlyPrice = 8.5;
  bike1.description = 'Test Bike 1 Description';
  bike1.isAvailable = true;
  bike1.longitude = 0.0;
  bike1.latitude = 0.0;
  bike1.status = BikeStatus.Serviceable;

  const bike2 = new BikeEntity();
  bike2.modelName = 'Bike Model 2';
  bike2.hourlyPrice = 10.0;
  bike2.description = 'Test Bike 2 Description';
  bike2.isAvailable = true;
  bike2.longitude = 0.0;
  bike2.latitude = 0.0;
  bike2.status = BikeStatus.Serviceable;

  await bikeRepository.save([bike1, bike2]);

  const drive1 = new DriveEntity();
  drive1.startTime = new Date('2023-07-01T12:00:00');
  drive1.endTime = new Date('2023-07-01T13:00:00');
  drive1.cost = 10.5;
  drive1.user = testUser;
  drive1.bike = bike1;

  const drive2 = new DriveEntity();
  drive1.id = 1;
  drive2.id = 2;
  drive2.startTime = new Date('2023-07-02T10:00:00');
  drive2.endTime = new Date('2023-07-02T11:30:00');
  drive2.cost = 15.75;
  drive2.user = testUser;
  drive2.bike = bike2;
  await driveRepository.save([drive1, drive2]);
}
