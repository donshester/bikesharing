import { Module } from '@nestjs/common';
import { BikeController } from './bike.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BikeEntity } from './bike.entity';
import { BikeService } from './bike.service';
import { AuthService } from './auth.service';
import { BikeGuard } from './guards/bike.guard';

@Module({
  providers: [BikeService, AuthService, BikeGuard],
  imports: [TypeOrmModule.forFeature([BikeEntity])],
  controllers: [BikeController],
})
export class BikeModule {}
