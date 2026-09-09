import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TriagePlan } from './triage-plan.entity';

@Entity('quality_checks')
export class QualityCheck {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  descriptionControle!: string;

  @Column()
  responsable!: string;

  @Column()
  delai!: string;

  @Column()
  tempsPrevu!: string;

  @ManyToOne(() => TriagePlan, (plan) => plan.pointsControle, {
    onDelete: 'CASCADE',
  })
  triagePlan!: TriagePlan;
}
