import {Column, Entity, PrimaryColumn, PrimaryGeneratedColumn} from 'typeorm';

export enum BikeStatus {
  Serviceable,
  OutOfOrder,
}
@Entity('bikes')
export class BikeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  modelName: string;

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
}
