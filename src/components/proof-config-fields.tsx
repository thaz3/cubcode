"use client";

import type { TaskProofType } from "@/generated/prisma/client";
import {
  checklistItemsToText,
  defaultProofPrompt,
  formatProofType,
  isLegacyProofType,
  isMvpProofType,
  MAX_CHECKLIST_ITEMS,
  normalizeCubProofType,
  parseChecklistLines,
  selectableCubProofTypes,
  type CubProofType,
  type MvpCubProofType,
} from "@/lib/task-labels";
import { Label } from "@/components/ui/label";
import { RadioChoiceList } from "@/components/ui/radio-choice-list";
import { useState } from "react";

const PROOF_TYPE_SHORT_LABELS: Record<MvpCubProofType, string> = {
  PARENT_APPROVAL: "Parent approval",
  SHORT_REFLECTION: "Reflection",
  CHECKLIST: "Checklist",
  TIME_LOG: "Time log",
};

const SELECTABLE_PROOF_TYPES = selectableCubProofTypes();

export type ProofConfigValues = {
  proofType: TaskProofType;
  proofPrompt: string;
  proofChecklistItems: string[];
};

type ProofConfigFieldsProps = {
  initialValues?: Partial<ProofConfigValues>;
};

export function ProofConfigFields({ initialValues }: ProofConfigFieldsProps) {
  const initialProofType = normalizeCubProofType(
    initialValues?.proofType ?? "SHORT_REFLECTION",
  );

  const [proofType, setProofType] = useState<CubProofType>(initialProofType);
  const legacyProofType = isLegacyProofType(initialProofType)
    ? initialProofType
    : null;
  const [proofPrompt, setProofPrompt] = useState(
    initialValues?.proofPrompt ?? defaultProofPrompt(initialProofType),
  );
  const [checklistText, setChecklistText] = useState(
    checklistItemsToText(initialValues?.proofChecklistItems),
  );

  function handleProofTypeChange(next: MvpCubProofType) {
    setProofType(next);
    setProofPrompt(defaultProofPrompt(next));
  }

  const parsedItems = parseChecklistLines(checklistText);
  const checklistJson = JSON.stringify(parsedItems);
  const lineCount = checklistText.split("\n").filter((l) => l.trim()).length;

  return (
    <div className="space-y-3">
      <input type="hidden" name="proofChecklistItems" value={checklistJson} />

      <div className="space-y-1.5">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Proof style
        </p>
        <input type="hidden" name="proofType" value={proofType} />
        {legacyProofType && proofType === legacyProofType ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
            This task uses a legacy proof style ({formatProofType(legacyProofType)}).
            Pick a supported style below to switch, or keep the current style.
          </p>
        ) : null}
        <RadioChoiceList
          name="proofTypeChoice"
          value={
            isMvpProofType(proofType)
              ? proofType
              : ("" as MvpCubProofType)
          }
          onChange={handleProofTypeChange}
          layout="compact"
          options={SELECTABLE_PROOF_TYPES.map((type) => ({
            value: type,
            label: PROOF_TYPE_SHORT_LABELS[type],
          }))}
        />
        <p className="text-xs text-zinc-500">
          {proofType === "PARENT_APPROVAL"
            ? "Cub taps View instructions, does the work, and submits — you approve to award rewards."
            : "Parent approval is always required to earn rewards."}
        </p>
      </div>

      <div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50/50 p-3 dark:border-zinc-700 dark:bg-zinc-900/50">
        <div>
          <Label htmlFor="proofPrompt" className="text-xs">
            {proofType === "PARENT_APPROVAL"
              ? "Instructions for your Cub (optional)"
              : proofType === "CHECKLIST"
                ? "Instructions (optional)"
                : proofType === "SHORT_REFLECTION"
                  ? "Reflection question"
                  : proofType === "PERFORMANCE_VIDEO" || proofType === "SLIDESHOW"
                    ? "Upload instructions"
                    : "Instructions (optional)"}
          </Label>
          <textarea
            id="proofPrompt"
            name="proofPrompt"
            rows={2}
            value={proofPrompt}
            onChange={(e) => setProofPrompt(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-cub-ebony"
            placeholder={defaultProofPrompt(proofType)}
          />
        </div>

        {proofType === "CHECKLIST" ? (
          <div>
            <Label htmlFor="checklistItems" className="text-xs">
              Checklist items (one per line)
            </Label>
            <p className="mt-1 text-xs text-zinc-500">
              Up to {MAX_CHECKLIST_ITEMS} items. Markdown supported.
              {lineCount > MAX_CHECKLIST_ITEMS ? (
                <span className="text-amber-700 dark:text-cub-gold-light">
                  {" "}
                  Only the first {MAX_CHECKLIST_ITEMS} lines will be saved.
                </span>
              ) : lineCount > 0 ? (
                <span> {lineCount} item{lineCount === 1 ? "" : "s"}.</span>
              ) : null}
            </p>
            <textarea
              id="checklistItems"
              rows={Math.min(12, Math.max(4, parsedItems.length + 2))}
              value={checklistText}
              onChange={(e) => setChecklistText(e.target.value)}
              className="mt-1 max-h-64 min-h-24 w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-cub-ebony"
              placeholder={
                "**Read** Chapter 3\nAnswer all questions\nCheck my work"
              }
            />
          </div>
        ) : null}

        {proofType === "PERFORMANCE_VIDEO" || proofType === "SLIDESHOW" ? (
          <p className="text-xs text-zinc-500">
            Cub uploads to Drive or iCloud, copies the share link, and pastes it on
            submit. Add the steps above in the prompt if helpful.
          </p>
        ) : null}
      </div>
    </div>
  );
}
