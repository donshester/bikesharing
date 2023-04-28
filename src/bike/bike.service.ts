import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BikeEntity, BikeStatus } from './bike.entity';
import { CreateBikeDto } from './dto/create-bike.dto';
import { Repository } from 'typeorm';
import { UpdateLocationDto } from './dto/update-location.dto';
import { BikeResponse } from './types/bike-response.type';
import { AuthService } from './auth.service';
import { BikeUserResponse } from './types/bike-user-response.type';
import { UpdateBikeDto } from './dto/update-bike.dto';

@Injectable()
export class BikeService {
  constructor(
    @InjectRepository(BikeEntity)
    private readonly bikeRepository: Repository<BikeEntity>,
    private readonly authService: AuthService,
  ) {}

  async createBike(createBikeDto: CreateBikeDto): Promise<BikeResponse> {
    const bike: BikeEntity = await this.bikeRepository.create(createBikeDto);
    const token = this.authService.generateToken(bike);
    await this.bikeRepository.save(bike);
    return { ...bike, token };
  }

  async getAll(): Promise<BikeEntity[]> {
    return this.bikeRepository.find();
  }

  async getBikeInfo(id: number): Promise<BikeEntity[]> {
    return await this.bikeRepository.find({
      where: { id: id },
      relations: { drives: true },
    });
  }
  async getAllAvailable(): Promise<BikeEntity[]> {
    return await this.bikeRepository.find({
      select: {
        status: false,
        isAvailable: false,
      },
      where: {
        status: BikeStatus.Serviceable,
        isAvailable: true,
      },
    });
  }
  async update(
    id: number,
    updateBikeDto: UpdateBikeDto,
  ): Promise<BikeUserResponse> {
    const bike: BikeEntity = await this.bikeRepository.findOneBy({ id: id });
    Object.assign(bike, updateBikeDto);
    await this.bikeRepository.save(bike);
    delete bike.isAvailable;
    delete bike.status;
    return bike;
  }

  async updateBikeLocation(
    id: number,
    updateBikeDto: UpdateLocationDto,
  ): Promise<BikeResponse> {
    const updatedBike = await this.bikeRepository.preload({
      id,
      ...updateBikeDto,
    });

    if (!updatedBike) {
      throw new NotFoundException(`Bike with id ${id} not found`);
    }

    await this.bikeRepository.save(updatedBike);

    const token = this.authService.generateToken(updatedBike);
    return { ...updatedBike, token };
  }

  async findById(id: number): Promise<BikeEntity> {
    const bike = this.bikeRepository.findOneBy({ id: id });
    if (!bike) {
      throw new NotFoundException('Bike not found!');
    }
    return bike;
  }
}
