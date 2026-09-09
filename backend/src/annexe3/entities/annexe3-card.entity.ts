import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Annexe3CorrectiveAction } from './annexe3-corrective-action.entity';
import { Annexe3RiskAction } from './annexe3-risk-action.entity';

@Entity('annexe3_cards')
export class Annexe3Card {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Auto-Incrementing Card Number Sequence
  @Column()
  @Generated('increment')
  sequenceNumber!: number;

  @Column({ unique: true })
  cardNo!: string; // Constructed e.g. "CARD-COUPE-0001"

  @Column({ default: 'Coupe' })
  productionProcess!: string; // "Coupe" | "WPA" | "WEK"

  @Column({ type: 'date' })
  date!: Date;

  @Column()
  segmentLine!: string;

  @Column({ nullable: true })
  siteName?: string;

  @Column({ nullable: true })
  clientOemName?: string;

  @Column()
  responsiblePerson!: string;

  // ZONES AFFECTED BY THE N.C.
  @Column({ type: 'simple-array', nullable: true })
  zonesAffected?: string[]; // ["Manufacturing", "Warehouse", etc.]

  @Column({ nullable: true })
  manufacturingLinesConcerned?: string;

  // ORIGIN OF THE N.C.
  @Column({ type: 'simple-array', nullable: true })
  originOfNC?: string[]; // ["Notice of the N.C.", "Customer Incident", etc.]

  @Column({ nullable: true })
  redHoldLabelNo?: string;

  @Column({ nullable: true })
  originOther?: string;

  // SUBJECT OF THE N.C.
  @Column({ type: 'simple-array', nullable: true })
  subjectOfNC?: string[]; // ["Components", "Wires equipped", "Harness", "Cables", etc.]

  @Column({ nullable: true })
  severity?: string;

  @Column({ type: 'date', nullable: true })
  manufacturingDate?: Date;

  // DEFECT & ITEM DETAILS
  @Column()
  defectCode!: string;

  @Column()
  defectDescription!: string;

  @Column({ nullable: true })
  vehicle?: string;

  @Column({ nullable: true })
  family?: string;

  @Column({ nullable: true })
  refIndex?: string;

  @Column({ nullable: true })
  itemCode?: string;

  // QUANTITIES & DEFECT RATE
  @Column({ type: 'int' })
  quantityToBeControlled!: number;

  @Column({ type: 'int' })
  controlledQuantity!: number;

  @Column({ type: 'int' })
  defectiveQuantity!: number;

  @Column({ type: 'float', default: 0 })
  defectRate!: number; // Percentage value (e.g. 6.7)

  // NC DESCRIPTION & ATTACHMENT
  @Column({ type: 'text', nullable: true })
  ncDescription?: string;

  @Column({ nullable: true })
  defectPhotoUrl?: string;

  // RISK TOGGLE
  @Column({ type: 'boolean', default: false })
  riskForReworkOrRepair!: boolean;

  @OneToMany(() => Annexe3RiskAction, (ra) => ra.annexe3Card, {
    cascade: true,
  })
  riskActions?: Annexe3RiskAction[];

  // CORRECTIVE ACTIONS
  @OneToMany(() => Annexe3CorrectiveAction, (ca) => ca.annexe3Card, {
    cascade: true,
  })
  correctiveActions?: Annexe3CorrectiveAction[];

  @Column({ type: 'int', default: 0 })
  totalAllocatedTimeMin!: number;

  // COMMENTS & TRACEABILITY
  @Column({ type: 'text', nullable: true })
  comments?: string;

  @Column({ type: 'text', nullable: true })
  traceability?: string;

  // APPROVAL WORKFLOW STATUS
  @Column({ nullable: true })
  assignedProductionLeaderMatricule?: string;

  @Column({ nullable: true })
  assignedQualityReviewerMatricule?: string;

  @Column({ nullable: true })
  createdByMatricule?: string;

  @Column({ default: 'PENDING' })
  status!: string; // PENDING | APPROVED | REJECTED | TRANSFERRED_TO_ANNEXE2

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
