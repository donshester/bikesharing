import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { BikeService } from './bike.service';
import { UpdateBikeDto } from './dto/update-bike.dto';
import { GetBikeDto } from './dto/get-bike.dto';
import { CreateBikeDto } from './dto/create-bike.dto';
import { BikeEntity } from './bike.entity';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Roles } from '../user/types/roles.enum';
import { Role } from '../user/decorators/role.decorator';
import { UserGuard } from '../user/guards/user.guard';

@Controller('bike')
@UseGuards(UserGuard)
export class BikeController {
  constructor(private readonly bikeService: BikeService) {}

  @Get()
  @Role(Roles.Admin)
  async getAll() {
    return this.bikeService.getAll();
  }

  @Put(':id')
  @Role(Roles.Admin)
  async update(
    @Param('id') id: number,
    @Body() updateBikeDto: UpdateBikeDto,
  ): Promise<GetBikeDto> {
    return this.bikeService.update(id, updateBikeDto);
  }

  @Get('info/:id')
  @Role(Roles.Admin)
  async getBikeInfo(@Param('id') id: number): Promise<BikeEntity[]> {
    return this.bikeService.getBikeInfo(id);
  }
  @Get('available')
  async getAvailable() {
    return this.bikeService.getAllAvailable();
  }

  @Post('create')
  @Role(Roles.Admin)
  async create(@Body() createBikeDto: CreateBikeDto) {
    return this.bikeService.createBike(createBikeDto);
  }
  @Put('/:id/location')
  async updateBikeLocation(
    @Param('id') bikeId: number,
    @Body() updateBikeLocationDto: UpdateLocationDto,
  ): Promise<BikeEntity> {
    return await this.bikeService.updateBikeLocation(
      bikeId,
      updateBikeLocationDto,
    );
  }
}
