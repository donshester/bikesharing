import { Module } from '@nestjs/common';
import { BikeController } from './bike.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BikeEntity } from './bike.entity';
import { BikeService } from './bike.service';
import { AuthService } from './auth.service';
import { BikeGuard } from './guards/bike.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  providers: [BikeService, AuthService, BikeGuard, ConfigService],
  imports: [
    TypeOrmModule.forFeature([BikeEntity]),
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [BikeController],
})
export class BikeModule {}
