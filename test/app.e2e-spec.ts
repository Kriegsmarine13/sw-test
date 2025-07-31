// test/app.e2e-spec.ts
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule as EnvConfigModule } from '@nestjs/config';
import { DataModule } from '../src/data/data.module';
import { ConfigModule } from '../src/config/config.module';
import { Asset } from '../src/data/entities/asset.entity';
import { Definition } from '../src/data/entities/definition.entity';

describe('/config (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        EnvConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Asset, Definition],
          synchronize: true,
          dropSchema: true,
        }),
        DataModule,
        ConfigModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    const assetRepo = moduleRef.get('AssetRepository');
    const definitionRepo = moduleRef.get('DefinitionRepository');

    // сидим нужные версии
    await assetRepo.upsert(
      { platform: 'android', version: '14.2.123', hash: 'hash-assets-123' },
      ['platform', 'version'],
    );
    await definitionRepo.upsert(
      { platform: 'android', version: '14.2.999', hash: 'hash-defs-999' },
      ['platform', 'version'],
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns config when versions compatible', async () => {
    const res = await request(app.getHttpServer())
      .get('/config')
      .query({ appVersion: '14.2.5', platform: 'android' })
      .expect(200);

    expect(res.body.assets.version).toBe('14.2.123');
    expect(res.body.definitions.version).toBe('14.2.999');
  });

  it('404 when incompatible', async () => {
    await request(app.getHttpServer())
      .get('/config')
      .query({ appVersion: '13.0.0', platform: 'android' })
      .expect(404);
  });
});
