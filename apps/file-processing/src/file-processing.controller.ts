import {
  Controller,
  Get,
  Inject,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileProcessingService } from './file-processing.service';
import { ClientProxy } from '@nestjs/microservices';
import { RmqService } from '@app/common';
import { lastValueFrom } from 'rxjs';
import { extname } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as Papa from 'papaparse';
import * as fs from 'fs';

@Controller('file')
export class FileProcessingController {
  constructor(
    private readonly fileProcessingService: FileProcessingService,
    private readonly rmqService: RmqService,
    @Inject('BIKES') private readonly bikesClient: ClientProxy,
  ) {
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('bikes', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const originalName = file.originalname;
          const extension = originalName.split('.').pop();
          const newFilename = `bike-${uniqueSuffix}.${extension}`;
          cb(null, newFilename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (extname(file.originalname).toLowerCase() === '.csv') {
          callback(null, true);
        } else {
          callback(new Error('Only CSV files are provided'), false);
        }
      },
    }),
  )
  async readBikes(@UploadedFile() file: Express.Multer.File) {
    return new Promise(async (resolve) => {
      const readableStream = fs.createReadStream(file.path);
      let success = true;

      Papa.parse(readableStream, {
        header: true,
        step: async (result) => {
          const newBike = result.data;
          const bikeDto = await this.fileProcessingService.validateCsvRow(
            newBike,
          );
          if (bikeDto) {
            try {
              await lastValueFrom(
                this.bikesClient.emit('bike_data_uploaded', {
                  newBike,
                }),
              );
            } catch (error) {
              console.error(`Failed to send message for bike:`, newBike, error);
              success = false;
            }
          }
        },
        complete: () => {
          console.log('CSV processing completed');
          resolve({ success });
        },
        error: (error) => {
          console.error('CSV processing error:', error);
          success = false;
          resolve({ success, message: 'CSV processing error' });
        },
      });
    });
  }
}