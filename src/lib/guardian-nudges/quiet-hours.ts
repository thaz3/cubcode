type QuietHoursInput = {
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  timezone: string;
};

function parseHm(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function localMinutesNow(timezone: string, now = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return hour * 60 + minute;
}

export function isWithinQuietHours(
  prefs: QuietHoursInput,
  now = new Date(),
): boolean {
  if (!prefs.quietHoursStart || !prefs.quietHoursEnd) {
    return false;
  }

  const start = parseHm(prefs.quietHoursStart);
  const end = parseHm(prefs.quietHoursEnd);
  if (start == null || end == null) {
    return false;
  }

  const current = localMinutesNow(prefs.timezone, now);

  if (start === end) {
    return false;
  }

  if (start < end) {
    return current >= start && current < end;
  }

  return current >= start || current < end;
}

export function localHmNow(timezone: string, now = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(now)
    .replace(/^24:/, "00:");
}

export function isAtOrAfterLocalTime(
  timezone: string,
  targetHm: string,
  now = new Date(),
): boolean {
  const target = parseHm(targetHm);
  if (target == null) return false;
  return localMinutesNow(timezone, now) >= target;
}
