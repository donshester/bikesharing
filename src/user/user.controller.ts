import {Body, Controller, Get, Inject, Param, Post} from '@nestjs/common';
import {CreateUserDto} from "./dto/create-user.dto";
import {UserEntity} from "./user.entity";
import {UserService} from "./user.service";
import {GetUserDto} from "./dto/get-user.dto";

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService){}

    @Post('create')
    async create(@Body() dto: CreateUserDto){
        return this.userService.createUser(dto);
    }

    @Get(":id")
    async getUser(@Param('id') id:string):Promise<GetUserDto> {
        return await this.userService.getUser(id);
    }

}
