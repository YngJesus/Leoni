import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Annexe3Card } from './annexe3-card.entity';

@Entity('annexe3_risk_actions')
export class Annexe3RiskAction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  actionRiskDescription!: string;

  @Column()
  ownerPilot!: string;

  @Column({ type: 'date' })
  completionDate!: Date;

  @Column({ default: 'OK' })
  successCheck!: string;

  @Column({ nullable: true })
  verificationDetails?: string;

  @ManyToOne(() => Annexe3Card, (card) => card.riskActions, {
    onDelete: 'CASCADE',
  })
  annexe3Card!: Annexe3Card;
}
