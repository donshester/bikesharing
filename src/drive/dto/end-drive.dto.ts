import {IsNotEmpty, IsNumber, IsString} from "class-validator";

export class EndDriveDto {
    @IsNotEmpty()
    @IsNumber()
    readonly bikeId: number;

    @IsNotEmpty()
    @IsString()
    readonly userId: string;

    @IsNotEmpty()
    @IsNumber()
    readonly longitude: number;

    @IsNotEmpty()
    @IsNumber()
    readonly latitude: number;
}
