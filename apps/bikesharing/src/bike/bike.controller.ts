import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BikeService } from './bike.service';
import { UpdateBikeDto } from './dto/update-bike.dto';
import { CreateBikeDto } from './dto/create-bike.dto';
import { BikeEntity } from './bike.entity';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Roles } from '../user/types/roles.enum';
import { Role } from '../user/decorators/role.decorator';
import { UserGuard } from '../user/guards/user.guard';
import { BikeResponse } from './types/bike-response.type';
import { BikeUserResponse } from './types/bike-user-response.type';
import { BikeGuard } from './guards/bike.guard';
import { RmqService } from '@app/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { BikeCsvDto } from '../../../file-processing/src/dtos/bike-csv.dto';
@Controller('bike')
export class BikeController {
  constructor(
    private readonly bikeService: BikeService,
    private readonly rmqService: RmqService,
  ) {}

  @Get()
  @Role(Roles.Admin)
  @UseGuards(UserGuard)
  async getAll() {
    return this.bikeService.getAll();
  }
  @Put('/location')
  @UseGuards(BikeGuard)
  @UsePipes(new ValidationPipe())
  async updateBikeLocation(
    @Body() updateBikeLocationDto: UpdateLocationDto,
    @Req() req,
  ): Promise<BikeResponse> {
    const bike = await this.bikeService.findById(req.bikeId);
    return await this.bikeService.updateBikeLocation(
      bike.id,
      updateBikeLocationDto,
    );
  }
  @Put(':id')
  @Role(Roles.Admin)
  @UseGuards(UserGuard)
  @UsePipes(new ValidationPipe())
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBikeDto: UpdateBikeDto,
  ): Promise<BikeUserResponse> {
    return this.bikeService.update(id, updateBikeDto);
  }

  @Get('info/:id')
  @Role(Roles.Admin)
  @UseGuards(UserGuard)
  async getBikeInfo(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BikeEntity[]> {
    return this.bikeService.getBikeInfo(id);
  }
  @Get('available')
  @UseGuards(UserGuard)
  async getAvailable() {
    return this.bikeService.getAllAvailable();
  }

  @Post('create')
  @Role(Roles.Admin)
  @UseGuards(UserGuard)
  @UsePipes(new ValidationPipe())
  async create(@Body() createBikeDto: CreateBikeDto) {
    return this.bikeService.createBike(createBikeDto);
  }

  @EventPattern('bike_data_uploaded')
  async saveProcessedBikes(
    @Payload() data: { newBike: BikeCsvDto },
    @Ctx() ctx: RmqContext,
  ) {
    console.log(`validated data received ${data.newBike}`);
    await this.bikeService.saveProcessedBikes(data.newBike);
    this.rmqService.ack(ctx);
  }
}
