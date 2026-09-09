import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CardStatus, ReparationType } from '../enums/reparation.enums';
import { DefectLine } from './defect-line.entity';
import { ClientOEM } from '../../admin/entities/client-oem.entity';
import { Site } from '../../admin/entities/site.entity';

@Entity('reparation_cards')
export class ReparationCard {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Site, { nullable: false, onDelete: 'CASCADE' })
  site!: Site;

  @ManyToOne(() => ClientOEM, { nullable: false, onDelete: 'CASCADE' })
  clientOem!: ClientOEM;

  @Column({ type: 'date' })
  date!: Date;

  @Column({
    type: 'enum',
    enum: ReparationType,
    default: ReparationType.UNITAIRE,
  })
  typeReparation!: ReparationType;

  @Column({ type: 'enum', enum: CardStatus, default: CardStatus.LOGGED })
  status!: CardStatus;

  @Column({ nullable: true })
  createdByMatricule?: string;

  @OneToMany(() => DefectLine, (line) => line.card, { cascade: true })
  defectLines!: DefectLine[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
