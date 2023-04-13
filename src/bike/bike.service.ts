import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BikeEntity, BikeStatus } from './bike.entity';
import { CreateBikeDto } from './dto/create-bike.dto';
import { Repository } from 'typeorm';
import { UpdateBikeDto } from './dto/update-bike.dto';

@Injectable()
export class BikeService {
  constructor(
    @InjectRepository(BikeEntity)
    private readonly bikeRepository: Repository<BikeEntity>,
  ) {}

  async createBike(createBikeDto: CreateBikeDto): Promise<BikeEntity> {
    const bike: BikeEntity = this.bikeRepository.create(createBikeDto);
    return this.bikeRepository.save(bike);
  }

  async getAll(): Promise<BikeEntity[]> {
    return this.bikeRepository.find();
  }

  async getAllAvailable(): Promise<BikeEntity[]> {
    return this.bikeRepository.find({
      where: {
        status: BikeStatus.Serviceable,
        isAvailable: true,
      },
    });
  }
  async update(id: number, updateBikeDto: UpdateBikeDto) {
    const bike: BikeEntity = await this.bikeRepository.findOneBy({ id: id });
    Object.assign(bike, updateBikeDto);
    return await this.bikeRepository.save(bike);
  }
}
