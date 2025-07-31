export function parseVersion(version: string): [number, number, number] {
  return version.split('.').map(Number) as [number, number, number];
}

export function isCompatibleAssets(base: string, target: string): boolean {
  return parseVersion(base)[0] === parseVersion(target)[0];
}

export function isCompatibleDefinitions(base: string, target: string): boolean {
  const [baseMajor, baseMinor] = parseVersion(base);
  const [targetMajor, targetMinor] = parseVersion(target);
  return baseMajor === targetMajor && baseMinor === targetMinor;
}
