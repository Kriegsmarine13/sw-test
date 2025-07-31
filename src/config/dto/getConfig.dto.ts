import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Platform } from '../../data/enums/platform.enum';

export class GetConfigDto {
  @IsString()
  appVersion: string;

  @IsEnum(Platform)
  platform: Platform;

  @IsOptional()
  @IsString()
  assetsVersion?: string;

  @IsOptional()
  @IsString()
  definitionsVersion?: string;
}
