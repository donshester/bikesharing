import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "./user.entity";
import {Repository} from "typeorm";
import {CreateUserDto} from "./dto/create-user.dto";
import {PasswordService} from "./password.service";
import {GetUserDto} from "./dto/get-user.dto";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly passwordService: PasswordService,
    ) {}

    async createUser(userDto: CreateUserDto):Promise<UserEntity> {
        const hashedPassword = await this.passwordService.hashPassword(userDto.password);
        const user:UserEntity = this.userRepository.create({ ...userDto, hashedPassword });
        return this.userRepository.save(user);
    }

    async getUser(id: string):Promise<GetUserDto>{
        const userResponse = await this.userRepository.findOneBy({id:id});
        delete userResponse.id;
        delete userResponse.hashedPassword;
        return userResponse;
    }
}