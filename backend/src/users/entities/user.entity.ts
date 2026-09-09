import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../enums/user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  matricule!: string; // e.g., "PE-4402", "QM-1109"

  @Column()
  nomComplet!: string;

  @Column()
  password!: string; // Will be hashed with bcrypt

  @Column({ type: 'enum', enum: UserRole, default: UserRole.PRODUCTION })
  role!: UserRole;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
