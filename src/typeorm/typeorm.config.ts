import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import * as process from 'process';
import { join } from 'path';

config({ path: join(process.cwd(), '.env') });
const configService = new ConfigService();

const options = (): DataSourceOptions => {
  const url = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DATABASE}`;
  if (!url) {
    throw new Error('Database url is empty!');
  }
  return {
    host: process.env.POSTGRES_HOST,
    port: parseInt(<string>process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    type: 'postgres',
    logging: configService.get('IS_PROD') === 'false',
    entities: [join(__dirname, '**', '*.entity{.ts,.js}')],
    migrations: ['dist/migrations/*.{ts,js}'],
  };
};
export const appDataSource = new DataSource(options());
