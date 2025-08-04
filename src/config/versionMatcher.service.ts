import { Asset } from '../data/entities/asset.entity';
import { Definition } from '../data/entities/definition.entity';

function parseParts(v: string): [number, number, number] {
  const [maj = '0', min = '0', pat = '0'] = v.split('.');
  return [parseInt(maj, 10), parseInt(min, 10), parseInt(pat, 10)];
}

export class VersionMatcherService {
  matchAssets(
    clientVersion: string,
    forcedVersion: string | undefined,
    available: Asset[],
  ): Asset | null {
    const [cMaj] = parseParts(clientVersion);
    if (forcedVersion) {
      const [fMaj, fMin, fPat] = parseParts(forcedVersion);
      const found = available.find(
        (a) => a.major === fMaj && a.minor === fMin && a.patch === fPat,
      );
      if (found && found.major === cMaj) return found;
      return null;
    }
    return available.find((a) => a.major === cMaj) || null;
  }

  matchDefinitions(
    clientVersion: string,
    forcedVersion: string | undefined,
    available: Definition[],
  ): Definition | null {
    const [cMaj, cMin] = parseParts(clientVersion);
    if (forcedVersion) {
      const [fMaj, fMin, fPat] = parseParts(forcedVersion);
      const found = available.find(
        (d) => d.major === fMaj && d.minor === fMin && d.patch === fPat,
      );
      if (found && found.major === cMaj && found.minor === cMin) return found;
      return null;
    }
    return available.find((d) => d.major === cMaj && d.minor === cMin) || null;
  }
}
