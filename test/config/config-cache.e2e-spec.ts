import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { ConfigService } from '../../src/config/config.service';
import { ConfigController } from '../../src/config/config.controller';
import { KeyvCacheService } from '../../src/cache/keyv-cache.service';
import { VersionMatcherService } from '../../src/config/versionMatcher.service';
import { DataService } from '../../src/data/data.service';
import { GetConfigDto } from '../../src/config/dto/getConfig.dto';
import { ConfigModule } from '../../src/config/config.module';
import { ConfigResponse } from '../../src/data/types/config.types';

// Подделки
const dummyAsset = { version: '14.2.123', hash: 'hash-assets' };
const dummyDefinition = { version: '14.2.999', hash: 'hash-defs' };

describe('ConfigService cache integration', () => {
  let app: INestApplication;
  let matcher: VersionMatcherService;
  let dataService: DataService;
  let cache: KeyvCacheService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ConfigService,
        ConfigController,
        KeyvCacheService,
        {
          provide: DataService,
          useValue: {
            getVersions: jest.fn().mockResolvedValue({
              assets: [dummyAsset],
              definitions: [dummyDefinition],
            }),
          },
        },
        {
          provide: VersionMatcherService,
          useValue: {
            matchAssets: jest.fn().mockReturnValue(dummyAsset),
            matchDefinitions: jest.fn().mockReturnValue(dummyDefinition),
          },
        },
      ],
      controllers: [ConfigController],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    matcher = moduleRef.get(VersionMatcherService);
    dataService = moduleRef.get(DataService);
    cache = moduleRef.get(KeyvCacheService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('first request populates cache and invokes matcher', async () => {
    const res1 = await request(app.getHttpServer())
      .get('/config')
      .query({ appVersion: '14.2.5', platform: 'android' })
      .expect(200);

    expect(res1.body.assets.version).toBe(dummyAsset.version);
    expect(res1.body.definitions.version).toBe(dummyDefinition.version);
    expect(matcher.matchAssets).toHaveBeenCalledTimes(1);
    expect(matcher.matchDefinitions).toHaveBeenCalledTimes(1);

    // Второй запрос: matcher не должен вызываться (берём из кеша)
    const res2 = await request(app.getHttpServer())
      .get('/config')
      .query({ appVersion: '14.2.5', platform: 'android' })
      .expect(200);

    expect(res2.body).toEqual(res1.body);
    expect(matcher.matchAssets).toHaveBeenCalledTimes(1); // не увеличилось
    expect(matcher.matchDefinitions).toHaveBeenCalledTimes(1);
  });

  it('invalidates cache when underlying versions change (dataVersionHash diff)', async () => {
    // Изменим мока matchedDefinition так, чтобы hash/версия другая
    (matcher as any).matchDefinitions = jest.fn().mockReturnValue({
      version: '14.2.999',
      hash: 'different-hash',
    });

    // Новый запрос: должна выполниться новая логика (matcher вызовется снова)
    const res3 = await request(app.getHttpServer())
      .get('/config')
      .query({ appVersion: '14.2.5', platform: 'android' })
      .expect(200);

    expect(matcher.matchDefinitions).toHaveBeenCalled(); // новая версия
    // тело отличается из-за другой hash версии
    expect(res3.body.definitions.hash).toBe('different-hash');
  });
});
