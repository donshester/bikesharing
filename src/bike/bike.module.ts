import { Module } from '@nestjs/common';
import { BikeController } from './bike.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BikeEntity } from './bike.entity';

@Module({
  providers: [],
  imports: [TypeOrmModule.forFeature([BikeEntity])],
  controllers: [BikeController],
})
export class BikeModule {}
