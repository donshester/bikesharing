import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
@Unique(['email', 'phone'])
export class UserEntity {
  @PrimaryColumn()
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
}
