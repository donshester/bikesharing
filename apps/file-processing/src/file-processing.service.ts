import { Injectable } from '@nestjs/common';
import { BikeCsvDto, BikeStatus } from './dtos/bike-csv.dto';
import { validate } from 'class-validator';

@Injectable()
export class FileProcessingService {
  async validateCsvRow(row: any): Promise<BikeCsvDto | null> {
    const dto = new BikeCsvDto();
    dto.modelName = row.modelName;
    dto.hourlyPrice = parseFloat(row.hourlyPrice);
    dto.description = row.description;
    dto.isAvailable = row.isAvailable === 'true';
    dto.status = row.status as BikeStatus;
    const errors = await validate(dto);
    if (errors.length > 0) {
      return null;
    }
    return dto;
  }
}
