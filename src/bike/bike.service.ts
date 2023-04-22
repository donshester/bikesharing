import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BikeEntity, BikeStatus } from './bike.entity';
import { CreateBikeDto } from './dto/create-bike.dto';
import { Repository } from 'typeorm';
import { UpdateBikeDto } from './dto/update-bike.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class BikeService {
  constructor(
    @InjectRepository(BikeEntity)
    private readonly bikeRepository: Repository<BikeEntity>,
  ) {}

  async createBike(createBikeDto: CreateBikeDto): Promise<BikeEntity> {
    const bike: BikeEntity = await this.bikeRepository.create(createBikeDto);
    return await this.bikeRepository.save(bike);
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

  async updateBikeLocation(
    bikeId: number,
    updateLocationDto: UpdateLocationDto,
  ): Promise<BikeEntity> {
    const bike = await this.bikeRepository.findOneBy({ id: bikeId });
    if (!bike) {
      throw new NotFoundException('Bike not found');
    }

    Object.assign(bike, updateLocationDto);
    return await this.bikeRepository.save(bike);
  }
}
