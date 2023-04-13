import {Body, Controller, Get, Param, Post, Put} from '@nestjs/common';
import { BikeService } from './bike.service';
import { UpdateBikeDto } from './dto/update-bike.dto';
import { GetBikeDto } from './dto/get-bike.dto';
import { CreateBikeDto } from './dto/create-bike.dto';

@Controller('bike')
export class BikeController {
  constructor(private readonly bikeService: BikeService) {}

  @Get()
  async getAll() {
    return this.bikeService.getAll();
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateBikeDto: UpdateBikeDto,
  ): Promise<GetBikeDto> {
      console.log(updateBikeDto);
      return this.bikeService.update(id, updateBikeDto);
  }

  @Get('available')
  async getAvailable() {
    return this.bikeService.getAllAvailable();
  }

  @Post('create')
  async create(@Body() createBikeDto: CreateBikeDto) {
    return this.bikeService.createBike(createBikeDto);
  }
}
