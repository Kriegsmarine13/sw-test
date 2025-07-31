import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Platform } from '../enums/platform.enum';

@Entity()
export class Definition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: Platform })
  platform: Platform;

  @Column({ type: 'varchar', length: 50 })
  version: string;

  @Column({ type: 'varchar', length: 255 })
  hash: string;
}
