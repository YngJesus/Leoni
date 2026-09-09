import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TriagePlan } from './triage-plan.entity';

@Entity('risk_analyses')
export class RiskAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  risquePotentiel!: string;

  @Column()
  actionPreventive!: string;

  @Column()
  responsable!: string;

  @Column()
  delai!: string;

  @ManyToOne(() => TriagePlan, (plan) => plan.analysesRisques, {
    onDelete: 'CASCADE',
  })
  triagePlan!: TriagePlan;
}
