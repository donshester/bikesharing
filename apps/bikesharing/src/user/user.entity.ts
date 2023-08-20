import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Roles } from './types/roles.enum';
import { DriveEntity } from '../drive/drive.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
@Unique(['email', 'phone'])
export class UserEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  @Exclude()
  hashedPassword: string;

  @Column({ type: 'boolean', default: true })
  isBlocked: boolean;

  @Column({ nullable: true })
  @Exclude()
  activationToken: string;

  @Column()
  firstName: string;

  @Column()
  secondName: string;

  @Column()
  phone: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  public created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  public updated_at: Date;

  @Column({ type: 'enum', enum: Roles, default: Roles.User })
  public role: Roles;

  @OneToMany(() => DriveEntity, (drive) => drive.user)
  drives: DriveEntity[];
  @BeforeInsert()
  generateId() {
    this.id = uuid();
  }
}
