import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService as EnvService } from '@nestjs/config';
import { GetConfigDto } from './dto/getConfig.dto';
import { DataService } from '../data/data.service';
import { VersionMatcherService } from './versionMatcher.service';
import { ConfigResponse, VersionedItem } from '../data/types/config.types';
import { KeyvCacheService } from '../cache/keyv-cache.service';

const CACHE_TTL = 1000 * 60 * 5;

@Injectable()
export class ConfigService {
  constructor(
    private readonly dataService: DataService,
    private readonly matcher: VersionMatcherService,
    private readonly env: EnvService,
    private readonly cache: KeyvCacheService,
  ) {}

  private makeDataVersionHash(
    asset: VersionedItem,
    def: VersionedItem,
  ): string {
    const raw = `${asset.version}:${asset.hash}|${def.version}:${def.hash}`;
    return crypto.createHash('sha1').update(raw).digest('hex').slice(0, 8);
  }

  private makeCacheKey(query: GetConfigDto, dataVersionHash: string): string {
    const { platform, appVersion, assetsVersion, definitionsVersion } = query;
    return [
      'config',
      platform,
      appVersion,
      assetsVersion || 'auto',
      definitionsVersion || 'auto',
      `v${dataVersionHash}`,
    ].join(':');
  }
  async getConfig(query: GetConfigDto): Promise<{
    version: { required: string; store: string };
    backend_entry_point: { jsonrpc_url: any };
    assets: { version: string; hash: string; urls: any };
    definitions: { version: string; hash: string; urls: any };
    notifications: { jsonrpc_url: any };
  } | null> {
    const { platform, appVersion, assetsVersion, definitionsVersion } = query;
    const versions = await this.dataService.getVersions(platform);

    const matchedAssets: VersionedItem | null = this.matcher.matchAssets(
      appVersion,
      assetsVersion,
      versions.assets,
    );

    const matchedDefinitions: VersionedItem | null =
      this.matcher.matchDefinitions(
        appVersion,
        definitionsVersion,
        versions.definitions,
      );

    if (!matchedAssets || !matchedDefinitions) {
      throw new NotFoundException({
        error: {
          code: 404,
          message: `Configuration not found for appVersion ${query.appVersion} (${query.platform})`,
        },
      });
    }

    const dataVersionHash = this.makeDataVersionHash(
      matchedAssets,
      matchedDefinitions,
    );
    const cacheKey = this.makeCacheKey(query, dataVersionHash);

    // cache attempt
    const cached = await this.cache.get<ConfigResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const result: ConfigResponse = {
      version: {
        required: '12.2.423',
        store: '13.7.556',
      },
      backend_entry_point: {
        jsonrpc_url: this.env.get('BACKEND_ENTRYPOINT') || '',
      },
      assets: {
        version: matchedAssets.version,
        hash: matchedAssets.hash,
        urls: this.env.get('ASSETS_URLS')?.split(',') || [],
      },
      definitions: {
        version: matchedDefinitions.version,
        hash: matchedDefinitions.hash,
        urls: this.env.get('DEFINITIONS_URLS')?.split(',') || [],
      },
      notifications: {
        jsonrpc_url: this.env.get('NOTIFICATIONS_ENTRYPOINT') || '',
      },
    };

    try {
      await this.cache.set(cacheKey, result, CACHE_TTL);
      console.log('Cached result under', cacheKey);
    } catch (error) {
      console.log('FAILED TO SET CACHE');
      console.log(error);
    }

    return result;
  }
}
