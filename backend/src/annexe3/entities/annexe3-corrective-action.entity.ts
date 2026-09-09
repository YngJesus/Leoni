import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Annexe3Card } from './annexe3-card.entity';

@Entity('annexe3_corrective_actions')
export class Annexe3CorrectiveAction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  actionType!: string; // e.g. "Accepted state", "Sorting", "Rework / Repair", "Scrap"

  @Column({ nullable: true })
  ownerPilot?: string;

  @Column({ type: 'date', nullable: true })
  completionDate?: Date;

  @Column({ type: 'int', default: 0 })
  quantity!: number;

  @Column({ type: 'int', default: 0 })
  elapsedTimeMin!: number;

  @ManyToOne(() => Annexe3Card, (card) => card.correctiveActions, {
    onDelete: 'CASCADE',
  })
  annexe3Card!: Annexe3Card;
}
