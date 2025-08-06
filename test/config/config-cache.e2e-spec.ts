import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { ConfigController } from '../../src/config/config.controller';
import { ConfigService } from '../../src/config/config.service';
import { VersionMatcherService } from '../../src/config/versionMatcher.service';
import { KeyvCacheService } from '../../src/cache/keyv-cache.service';
import { DataService } from '../../src/data/data.service';
import { ConfigModule as EnvConfigModule } from '@nestjs/config';

// Stubs
const dummyAsset = { version: '14.2.123', hash: 'hash-assets' };
const dummyDefinition = { version: '14.2.999', hash: 'hash-defs' };

describe('ConfigService cache integration', () => {
  let app: INestApplication;
  let matcher: VersionMatcherService;
  let dataService: DataService;
  let cache: KeyvCacheService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [EnvConfigModule.forRoot({ isGlobal: true })],
      controllers: [ConfigController],
      providers: [
        ConfigService,
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
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    matcher = moduleRef.get(VersionMatcherService);
    dataService = moduleRef.get(DataService);
    cache = moduleRef.get(KeyvCacheService);
  }, 20000);

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
    expect((matcher as any).matchAssets).toHaveBeenCalledTimes(1);
    expect((matcher as any).matchDefinitions).toHaveBeenCalledTimes(1);

    // Второй запрос — должен взять из кеша (ответ одинаковый), но matcher снова вызывается
    const res2 = await request(app.getHttpServer())
      .get('/config')
      .query({ appVersion: '14.2.5', platform: 'android' })
      .expect(200);

    expect(res2.body).toEqual(res1.body);
    expect((matcher as any).matchAssets).toHaveBeenCalledTimes(2); // теперь 2
    expect((matcher as any).matchDefinitions).toHaveBeenCalledTimes(2);
  });

  it('invalidates cache when underlying definition hash changes', async () => {
    (matcher as any).matchDefinitions = jest.fn().mockReturnValue({
      version: '14.2.999',
      hash: 'different-hash',
    });

    const res3 = await request(app.getHttpServer())
      .get('/config')
      .query({ appVersion: '14.2.5', platform: 'android' })
      .expect(200);

    expect(res3.body.definitions.hash).toBe('different-hash');
    expect((matcher as any).matchDefinitions).toHaveBeenCalled();
  });
});
