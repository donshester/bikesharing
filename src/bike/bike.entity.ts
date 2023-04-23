import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DriveEntity } from '../drive/drive.entity';

export enum BikeStatus {
  Serviceable = 'Serviceable',
  OutOfOrder = 'OutOfOrder',
}
@Entity('bikes')
export class BikeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  modelName: string;

  @Column({ type: 'float' })
  hourlyPrice: number;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ type: 'float' })
  longitude: number;

  @Column({ type: 'float' })
  latitude: number;

  @Column({ type: 'enum', enum: BikeStatus, default: BikeStatus.Serviceable })
  status: BikeStatus;

  @OneToMany(() => DriveEntity, (drive) => drive.bike)
  drives: DriveEntity[];
}
