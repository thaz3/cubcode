import type { AgeBand, ProofStyle, SupervisionLevel } from "@/generated/prisma/client";

export type AgeBandDefaults = {
  label: string;
  ageRange: string;
  focusBlockMinutes: number;
  proofStyle: ProofStyle;
  proofStyleLabel: string;
  suggestedDailyPhoneCapMinutes: number;
  suggestedWeekendBankCapMinutes: number;
  suggestedExchangeFocusMinutes: number;
  suggestedExchangePhoneMinutes: number;
  councilDayMinutes: number;
  supervisionLevel: SupervisionLevel;
  supervisionLevelLabel: string;
};

const PROOF_STYLE_LABELS: Record<ProofStyle, string> = {
  PARENT_APPROVAL: "Parent approval only",
  SHORT_REFLECTION: "Short written reflection",
  CHECKLIST: "Checklist",
};

const SUPERVISION_LABELS: Record<SupervisionLevel, string> = {
  DIRECT: "Direct (parent nearby)",
  NEARBY: "Nearby (parent in home/area)",
  INDEPENDENT: "Independent (check-ins)",
};

export const AGE_BAND_DEFAULTS: Record<AgeBand, AgeBandDefaults> = {
  LITTLE_CUBS: {
    label: "Little Cubs",
    ageRange: "5–7",
    focusBlockMinutes: 10,
    proofStyle: "PARENT_APPROVAL",
    proofStyleLabel: PROOF_STYLE_LABELS.PARENT_APPROVAL,
    suggestedDailyPhoneCapMinutes: 30,
    suggestedWeekendBankCapMinutes: 60,
    suggestedExchangeFocusMinutes: 20,
    suggestedExchangePhoneMinutes: 10,
    councilDayMinutes: 15,
    supervisionLevel: "DIRECT",
    supervisionLevelLabel: SUPERVISION_LABELS.DIRECT,
  },
  CORE_CUBS: {
    label: "Core Cubs",
    ageRange: "8–11",
    focusBlockMinutes: 20,
    proofStyle: "SHORT_REFLECTION",
    proofStyleLabel: PROOF_STYLE_LABELS.SHORT_REFLECTION,
    suggestedDailyPhoneCapMinutes: 45,
    suggestedWeekendBankCapMinutes: 90,
    suggestedExchangeFocusMinutes: 30,
    suggestedExchangePhoneMinutes: 15,
    councilDayMinutes: 20,
    supervisionLevel: "NEARBY",
    supervisionLevelLabel: SUPERVISION_LABELS.NEARBY,
  },
  TRAIL_CUBS: {
    label: "Trail Cubs",
    ageRange: "12–15",
    focusBlockMinutes: 30,
    proofStyle: "SHORT_REFLECTION",
    proofStyleLabel: PROOF_STYLE_LABELS.SHORT_REFLECTION,
    suggestedDailyPhoneCapMinutes: 120,
    suggestedWeekendBankCapMinutes: 120,
    suggestedExchangeFocusMinutes: 30,
    suggestedExchangePhoneMinutes: 15,
    councilDayMinutes: 30,
    supervisionLevel: "NEARBY",
    supervisionLevelLabel: SUPERVISION_LABELS.NEARBY,
  },
  LEGACY_BUILDERS: {
    label: "Legacy Builders",
    ageRange: "16–18",
    focusBlockMinutes: 45,
    proofStyle: "CHECKLIST",
    proofStyleLabel: PROOF_STYLE_LABELS.CHECKLIST,
    suggestedDailyPhoneCapMinutes: 90,
    suggestedWeekendBankCapMinutes: 180,
    suggestedExchangeFocusMinutes: 30,
    suggestedExchangePhoneMinutes: 15,
    councilDayMinutes: 45,
    supervisionLevel: "INDEPENDENT",
    supervisionLevelLabel: SUPERVISION_LABELS.INDEPENDENT,
  },
};

export const AGE_BAND_OPTIONS = (
  Object.entries(AGE_BAND_DEFAULTS) as [AgeBand, AgeBandDefaults][]
).map(([value, defaults]) => ({
  value,
  label: `${defaults.label} (${defaults.ageRange})`,
}));

export function formatAgeBand(ageBand: AgeBand): string {
  const defaults = AGE_BAND_DEFAULTS[ageBand];
  return `${defaults.label} (${defaults.ageRange})`;
}
