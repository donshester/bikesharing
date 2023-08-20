import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import * as process from 'process';
import { join } from 'path';
import { BikeEntity } from "../bike/bike.entity";
import { UserEntity } from "../user/user.entity";
import { DriveEntity } from "../drive/drive.entity";

config({ path: join(process.cwd(), '.env') });
const configService = new ConfigService();

const options = (): DataSourceOptions => {
  const url = configService.get('DATABASE_URL');
  if (!url) {
    throw new Error('Database url not found');
  }
  return {
    url: url,
    type: 'postgres',
    logging: configService.get('IS_PROD') === 'false',
    entities: [BikeEntity, UserEntity, DriveEntity],
    migrations: [join(__dirname, '..', 'migrations', '*{.js,.ts}')],
    synchronize: false,
    ssl: true
  };
};
export const appDataSource = new DataSource(options());
