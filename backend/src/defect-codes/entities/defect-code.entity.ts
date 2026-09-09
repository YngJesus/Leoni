import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('defect_codes')
export class DefectCode {
  @PrimaryColumn({ length: 10 })
  code!: string; // e.g. "000", "100"

  @Column()
  category!: string; // e.g. "0.. Coupe", "1.. Sertissage..."

  @Column({ nullable: true })
  descriptionDe?: string;

  @Column({ nullable: true })
  descriptionEn?: string;

  @Column()
  descriptionFr!: string;
}
