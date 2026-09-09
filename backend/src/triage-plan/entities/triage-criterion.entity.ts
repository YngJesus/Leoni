import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TriagePlan } from './triage-plan.entity';

@Entity('triage_criteria')
export class TriageCriterion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  critere!: string;

  @Column()
  reperageCablagesCaisse!: string;

  @Column()
  matriculeExecuteur!: string;

  @Column()
  tempsPrevu!: string;

  @ManyToOne(() => TriagePlan, (plan) => plan.criteresTriage, {
    onDelete: 'CASCADE',
  })
  triagePlan!: TriagePlan;
}
