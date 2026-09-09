import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ReparationCard } from './reparation-card.entity';

@Entity('defect_lines')
export class DefectLine {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Optional for Série & Montage types
  @Column({ nullable: true })
  etiquetteStop?: string;

  // Optional for Série & Montage types
  @Column({ type: 'date', nullable: true })
  dateProduction?: Date;

  @Column()
  serieVariante!: string;

  @Column()
  kskIdUnique!: string;

  @Column()
  groupeEquipe!: string;

  @Column()
  numFilDouilleConn!: string;

  @Column()
  codeDefaut!: string;

  @Column({ type: 'int', default: 1 })
  qte!: number;

  @Column()
  defautDetecteA!: string;

  @Column({ nullable: true })
  tempsMin?: string;

  @Column({ type: 'text' })
  descriptionFaute!: string;

  @Column({ type: 'timestamp' })
  dateHeureEntree!: Date;

  @Column()
  sortiPar!: string;

  @ManyToOne(() => ReparationCard, (card) => card.defectLines, {
    onDelete: 'CASCADE',
  })
  card!: ReparationCard;
}
