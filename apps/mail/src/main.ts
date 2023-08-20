import { NestFactory } from '@nestjs/core';
import { RmqService } from '@app/common';
import { AppModule } from '../../bikesharing/src/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions('mail'));
  await app.listen(3009);
}
bootstrap();
