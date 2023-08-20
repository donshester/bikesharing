import { Module } from '@nestjs/common';
import { FileProcessingController } from './file-processing.controller';
import { FileProcessingService } from './file-processing.service';
import { RmqModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RmqModule.registerAsync({
      name: 'BIKES',
    }),
  ],
  controllers: [FileProcessingController],
  providers: [FileProcessingService],
})
export class FileProcessingModule {}
