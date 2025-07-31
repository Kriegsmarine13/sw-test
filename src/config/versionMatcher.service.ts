import { Injectable } from '@nestjs/common';
import {
  isCompatibleAssets,
  isCompatibleDefinitions,
} from '../common/utils/semver.utils';
import { VersionedItem } from '../data/types/config.types';

@Injectable()
export class VersionMatcherService {
  matchAssets(
    clientVersion: string,
    forcedVersion: string | undefined,
    available: VersionedItem[],
  ): VersionedItem | null {
    if (forcedVersion) {
      const exact = available.find((v) => v.version === forcedVersion);
      if (exact && isCompatibleAssets(clientVersion, forcedVersion)) {
        return exact;
      }
      return null;
    }

    return (
      available.find((v) => isCompatibleAssets(clientVersion, v.version)) ||
      null
    );
  }

  matchDefinitions(
    clientVersion: string,
    forcedVersion: string | undefined,
    available: VersionedItem[],
  ): VersionedItem | null {
    if (forcedVersion) {
      const exact = available.find((v) => v.version === forcedVersion);
      if (exact && isCompatibleDefinitions(clientVersion, forcedVersion)) {
        return exact;
      }
      return null;
    }

    return (
      available.find((v) =>
        isCompatibleDefinitions(clientVersion, v.version),
      ) || null
    );
  }
}
