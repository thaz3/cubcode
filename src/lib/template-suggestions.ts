import type { AgeBand, SupervisionLevel } from "@/generated/prisma/client";
import { AGE_BAND_DEFAULTS } from "@/lib/age-band-defaults";

export type CubProfileSuggestions = {
  focusMinutesEarned: number;
  phoneMinutesEarned: number;
  xpEarned: number;
  focusTokensEarned: number;
  dailyPhoneCapMinutes: number;
  weekendBankCapMinutes: number;
  supervisionLevel: SupervisionLevel;
  supervisionLevelLabel: string;
};

const XP_BY_BAND: Record<AgeBand, number> = {
  LITTLE_CUBS: 5,
  CORE_CUBS: 10,
  TRAIL_CUBS: 15,
  LEGACY_BUILDERS: 20,
};

export function getCubProfileSuggestionsFromAgeBand(
  ageBand: AgeBand,
): CubProfileSuggestions {
  const defaults = AGE_BAND_DEFAULTS[ageBand];

  return {
    focusMinutesEarned: defaults.suggestedExchangeFocusMinutes,
    phoneMinutesEarned: defaults.suggestedExchangePhoneMinutes,
    xpEarned: XP_BY_BAND[ageBand],
    focusTokensEarned: 1,
    dailyPhoneCapMinutes: defaults.suggestedDailyPhoneCapMinutes,
    weekendBankCapMinutes: defaults.suggestedWeekendBankCapMinutes,
    supervisionLevel: defaults.supervisionLevel,
    supervisionLevelLabel: defaults.supervisionLevelLabel,
  };
}
