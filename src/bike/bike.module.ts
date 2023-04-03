import { Module } from '@nestjs/common';
import { BikeController } from './bike.controller';

@Module({
  controllers: [BikeController]
})
export class BikeModule {}
