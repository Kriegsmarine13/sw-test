import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from './entities/asset.entity';
import { Definition } from './entities/definition.entity';
import { DataService } from './data.service';

@Module({
  imports: [TypeOrmModule.forFeature([Asset, Definition])],
  providers: [DataService],
  exports: [DataService],
})
export class DataModule {}
