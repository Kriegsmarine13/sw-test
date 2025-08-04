import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { Platform } from '../enums/platform.enum';

@Entity()
@Index(['platform', 'major']) // для поиска совместимых assets по major
export class Asset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: Platform })
  platform: Platform;

  @Column({ type: 'int' })
  major: number;

  @Column({ type: 'int' })
  minor: number;

  @Column({ type: 'int' })
  patch: number;

  @Column({ type: 'varchar', length: 255 })
  hash: string;

  @Column({ type: 'varchar', length: 50 })
  version: string;
}
