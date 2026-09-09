import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  Entity,
} from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  recipientMatricule!: string;

  @Column({ nullable: true })
  senderMatricule?: string;

  @Column({ nullable: true })
  senderName?: string;

  @Column()
  type!: string;

  @Column()
  entityType!: string;

  @Column()
  entityId!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ default: false })
  isRead!: boolean;

  @Column({ default: 'PENDING' })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
