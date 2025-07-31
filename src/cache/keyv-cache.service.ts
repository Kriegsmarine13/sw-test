// src/cache/keyv-cache.service.ts
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';
import { Injectable, Logger } from '@nestjs/common';

const CACHE_TTL = 1000 * 60 * 5;

@Injectable()
export class KeyvCacheService {
  private keyv: Keyv;
  private readonly logger = new Logger(KeyvCacheService.name);

  constructor() {
    const redisHost = process.env.REDIS_HOST || 'redis';
    const redisPort = process.env.REDIS_PORT || '6379';
    const redisUri = `redis://${redisHost}:${redisPort}`;

    this.keyv = new Keyv({
      store: new KeyvRedis(redisUri),
      ttl: CACHE_TTL,
    });

    this.keyv.on('error', (err) => {
      this.logger.warn('Keyv redis cache error', err);
    });
  }

  async get<T>(key: string): Promise<T | undefined> {
    try {
      const value = await this.keyv.get<T>(key);
      this.logger.debug(`Cache GET key=${key} hit=${value !== undefined}`);
      return value ?? undefined;
    } catch (e) {
      this.logger.warn('Cache get failed', e);
      return undefined;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds !== undefined) {
        await this.keyv.set(key, value, ttlSeconds);
      } else {
        await this.keyv.set(key, value); // использует дефолтный
      }
      this.logger.debug(`Cache SET key=${key} ttl=${ttlSeconds ?? '(default)'}`);
    } catch (e) {
      this.logger.warn('Cache set failed', e);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.keyv.delete(key);
    } catch (e) {
      this.logger.warn('Cache delete failed', e);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.keyv.clear();
    } catch (e) {
      this.logger.warn('Cache clear failed', e);
    }
  }
}
