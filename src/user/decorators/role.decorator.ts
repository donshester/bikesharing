import {SetMetadata} from "@nestjs/common";
import {Roles} from "../types/roles.enum";

export const Role = (role: Roles) => SetMetadata('role', role);
