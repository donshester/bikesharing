import {DataSource, DataSourceOptions} from "typeorm";
import {ConfigService} from "@nestjs/config";
import {config} from "dotenv"
import * as process from "process";
import {join} from 'path';

config({path: join(process.cwd(), '.env')})
const configService = new ConfigService()
const options = ():DataSourceOptions =>{
    const url = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DATABASE}`;
    if(!url){
        throw new Error("Database url is empty!")
    }
    return {
        url,
        type: 'postgres',
        schema: 'public',
        logging: (configService.get('IS_PROD'))==='false',
        entities: [],
        migrations: [join(process.cwd(), 'migrations', '**', '*migration.ts')],
        migrationsRun: true,
        migrationsTableName: 'migrations'
    };
}
export const appDataSource = new DataSource(options())
