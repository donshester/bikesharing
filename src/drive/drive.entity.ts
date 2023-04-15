import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { BikeEntity } from '../bike/bike.entity';
import { UserEntity } from '../user/user.entity';

@Entity('drives')
export class DriveEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, { eager: true })
  user: UserEntity;

  @ManyToOne(() => BikeEntity, { eager: true })
  bike: BikeEntity;

  @Column()
  startTime: Date;

  @Column({nullable: true})
  endTime: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cost: number;

}
