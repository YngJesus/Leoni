import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QualityCheck } from './quality-check.entity';
import { RetouchInstruction } from './retouch-instruction.entity';
import { RiskAnalysis } from './risk-analysis.entity';
import { TriageCriterion } from './triage-criterion.entity';

@Entity('triage_plans')
export class TriagePlan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ==========================================
  // STEP 1 & 2: PRODUCTION & TRIAGE & DECISION
  // ==========================================
  @Column({ type: 'timestamp' })
  date!: Date;

  @Column()
  numOrdre!: string;

  @Column()
  numSerie!: string;

  @Column({ type: 'int' })
  quantiteBloquee!: number;

  @Column()
  numFicheRetouche!: string;

  @Column()
  motifBlocage!: string;

  @Column({ type: 'int', default: 0 })
  quantiteConforme!: number;

  @Column({ type: 'int', default: 0 })
  quantiteNonConforme!: number;

  @Column({ nullable: true })
  tempsReelTriage?: string;

  @Column({ nullable: true })
  createdByMatricule?: string;

  @Column({ nullable: true })
  siteName?: string;

  @Column({ nullable: true })
  clientOemName?: string;

  @Column({ nullable: true })
  assignedPeMatricule?: string;

  @Column({ nullable: true })
  assignedQmMatricule?: string;

  // Decision suite au triage (Production fills in Step 2)
  @Column()
  decision!: string;

  @Column()
  justificationDecision!: string;

  @OneToMany(() => TriageCriterion, (tc) => tc.triagePlan, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  criteresTriage!: TriageCriterion[];

  // ==========================================
  // STEP 3: PLAN DE RETOUCHE (PE)
  // ==========================================
  @Column({ nullable: true })
  productionEngineeringMatricule?: string;

  @OneToMany(() => RetouchInstruction, (ri) => ri.triagePlan, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  instructionsRetouche?: RetouchInstruction[];

  // ==========================================
  // STEP 4: CONTRÔLE & VALIDATION (QM)
  // ==========================================
  @OneToMany(() => QualityCheck, (qc) => qc.triagePlan, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  pointsControle?: QualityCheck[];

  @Column({ type: 'boolean', default: false })
  hasPotentialRisks!: boolean;

  @OneToMany(() => RiskAnalysis, (ra) => ra.triagePlan, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  analysesRisques?: RiskAnalysis[];

  @Column({ nullable: true })
  qualiteQmMatricule?: string;

  @Column({ nullable: true })
  qmMatriculeValidation?: string;

  @Column({ default: 'PENDING' })
  status!: string;

  // ==========================================
  // TIMESTAMPS
  // ==========================================
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
