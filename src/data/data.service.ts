import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from './entities/asset.entity';
import { Definition } from './entities/definition.entity';
import { Platform } from './enums/platform.enum';

@Injectable()
export class DataService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepo: Repository<Asset>,
    @InjectRepository(Definition)
    private readonly definitionRepo: Repository<Definition>,
  ) {}

  async getVersions(platform: Platform) {
    const assets = await this.assetRepo.findBy({ platform });
    const definitions = await this.definitionRepo.findBy({ platform });
    return { assets, definitions };
  }
}
