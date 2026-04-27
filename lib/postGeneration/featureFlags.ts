function isTrue(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

function readEnabledFlag(serverName: string, publicName: string, defaultValue: boolean): boolean {
  const publicValue = typeof process !== "undefined" ? process.env[publicName] : undefined;
  if (publicValue !== undefined) return isTrue(publicValue);

  const serverValue = typeof process !== "undefined" ? process.env[serverName] : undefined;
  if (serverValue !== undefined) return isTrue(serverValue);

  return defaultValue;
}

export const POSTGEN_CREATIVE_DIRECTOR_STAGE = readEnabledFlag(
  "POSTGEN_CREATIVE_DIRECTOR_STAGE",
  "NEXT_PUBLIC_POSTGEN_CREATIVE_DIRECTOR_STAGE",
  true,
);

export const POSTGEN_PLATFORM_WRITING_STYLE_MAP = readEnabledFlag(
  "POSTGEN_PLATFORM_WRITING_STYLE_MAP",
  "NEXT_PUBLIC_POSTGEN_PLATFORM_WRITING_STYLE_MAP",
  true,
);

export const POSTGEN_AUTO_ANALYTICS = readEnabledFlag(
  "POSTGEN_AUTO_ANALYTICS",
  "NEXT_PUBLIC_POSTGEN_AUTO_ANALYTICS",
  true,
);

