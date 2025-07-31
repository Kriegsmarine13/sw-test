import {
  Controller,
  Get,
  Query,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from './config.service';
import { GetConfigDto } from './dto/getConfig.dto';
import { LoggerInterceptor } from '../common/logger.interceptor';
import { Throttle } from '@nestjs/throttler';

@UseInterceptors(LoggerInterceptor)
@Throttle({ default: { limit: 60, ttl: 60000 } })
@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Get()
  async getConfig(@Query() query: GetConfigDto) {
    const result = await this.configService.getConfig(query);
    if (!result) {
      throw new NotFoundException({
        error: {
          code: 404,
          message: `Configuration not found for appVersion ${query.appVersion} (${query.platform})`,
        },
      });
    }
    return result;
  }
}
