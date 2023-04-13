import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Roles } from './types/roles.enum';

@Entity('users')
@Unique(['email', 'phone'])
export class UserEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  hashedPassword: string;

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
  @BeforeInsert()
  generateId() {
    this.id = uuid();
  }
}
