import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Site } from './site.entity';

@Entity('client_oems')
export class ClientOEM {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string; // e.g., "MB (Mercedes-Benz)"

  @Column({ default: true })
  isActive!: boolean;

  // Each OEM belongs to a single Site
  @ManyToOne(() => Site, (site) => site.oems, { onDelete: 'CASCADE' })
  site!: Site;
}
