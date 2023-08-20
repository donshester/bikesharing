import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserEntity } from '../src/user/user.entity';
import { BikeEntity } from '../src/bike/bike.entity';
import { DriveEntity } from '../src/drive/drive.entity';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env') });
export const testDbConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.TEST_DATABASE_URL,
  synchronize: true,
  dropSchema: true,
  entities: [UserEntity, BikeEntity, DriveEntity],
  keepConnectionAlive: true,
};
