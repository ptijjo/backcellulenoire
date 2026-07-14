const MS_PER_UNIT: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

export function parseDurationToMs(duration: string, fallbackMs = 7 * 24 * 60 * 60 * 1000): number {
  const match = duration.trim().match(/^(\d+)([smhd])$/i);
  if (!match) return fallbackMs;

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  return value * MS_PER_UNIT[unit];
}
