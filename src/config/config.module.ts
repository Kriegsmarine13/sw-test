import { Module } from '@nestjs/common';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';
import { VersionMatcherService } from './versionMatcher.service';
import { DataModule } from '../data/data.module';
import { KeyvCacheService } from '../cache/keyv-cache.service';

@Module({
  controllers: [ConfigController],
  imports: [DataModule],
  providers: [ConfigService, VersionMatcherService, KeyvCacheService],
  exports: [KeyvCacheService],
})
export class ConfigModule {}
