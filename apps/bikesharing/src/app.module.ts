import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BikeModule } from './bike/bike.module';
import { UserModule } from './user/user.module';
import { TypeormModule } from './typeorm/typeorm.module';
import { DriveModule } from './drive/drive.module';
import { AuthMiddleware } from './user/middleware/auth.middleware';
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    BikeModule,
    UserModule,
    TypeormModule,
    DriveModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
