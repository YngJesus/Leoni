import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TriagePlan } from './triage-plan.entity';

@Entity('retouch_instructions')
export class RetouchInstruction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  descriptionEtape!: string;

  @Column()
  responsable!: string;

  @Column()
  delai!: string;

  @Column()
  tempsPrevu!: string;

  @ManyToOne(() => TriagePlan, (plan) => plan.instructionsRetouche, {
    onDelete: 'CASCADE',
  })
  triagePlan!: TriagePlan;
}
