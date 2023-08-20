import { NestFactory } from '@nestjs/core';
import { FileProcessingModule } from './file-processing.module';
import { RmqService } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(FileProcessingModule);
  await app.startAllMicroservices();
  await app.listen(3001);
}
bootstrap();