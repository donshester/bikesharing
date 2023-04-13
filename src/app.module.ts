import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BikeModule } from './bike/bike.module';
import { UserModule } from './user/user.module';
import { TypeormModule } from './typeorm/typeorm.module';


@Module({
  imports: [BikeModule, UserModule, TypeormModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
