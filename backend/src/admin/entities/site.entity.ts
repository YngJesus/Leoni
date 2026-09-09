import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ClientOEM } from './client-oem.entity';

@Entity('sites')
export class Site {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string; // e.g., "Sousse 1 (LT4)"

  @Column({ default: true })
  isActive!: boolean;

  // A Site can have multiple OEMs
  @OneToMany(() => ClientOEM, (oem) => oem.site, { cascade: true })
  oems!: ClientOEM[];
}
