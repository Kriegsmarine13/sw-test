import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { ConfigModule as EnvConfigModule } from '@nestjs/config';
import { DataModule } from './data/data.module';
import { Asset } from './data/entities/asset.entity';
import { Definition } from './data/entities/definition.entity';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    // Дефолтные значения троттлера
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    EnvConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'db',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USER || 'configuser',
      password: process.env.DB_PASSWORD || 'configpass',
      database: process.env.DB_NAME || 'configdb',
      synchronize: true,
      autoLoadEntities: true,
      retryAttempts: 10,
      retryDelay: 2000,
    }),
    DataModule,
    ConfigModule,
    TypeOrmModule.forFeature([Asset, Definition]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
