"use client";

import type { TaskProofType } from "@/generated/prisma/client";
import {
  checklistItemsToText,
  CUB_PROOF_TYPE_LABELS,
  defaultProofPrompt,
  MAX_CHECKLIST_ITEMS,
  normalizeCubProofType,
  parseChecklistLines,
  type CubProofType,
} from "@/lib/task-labels";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const PROOF_TYPES = Object.keys(CUB_PROOF_TYPE_LABELS) as CubProofType[];

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
  const [proofPrompt, setProofPrompt] = useState(
    initialValues?.proofPrompt ?? defaultProofPrompt(initialProofType),
  );
  const [checklistText, setChecklistText] = useState(
    checklistItemsToText(initialValues?.proofChecklistItems),
  );

  function handleProofTypeChange(next: CubProofType) {
    setProofType(next);
    setProofPrompt(defaultProofPrompt(next));
  }

  const parsedItems = parseChecklistLines(checklistText);
  const checklistJson = JSON.stringify(parsedItems);
  const lineCount = checklistText.split("\n").filter((l) => l.trim()).length;

  return (
    <div className="space-y-4">
      <input type="hidden" name="proofChecklistItems" value={checklistJson} />

      <div>
        <Label htmlFor="proofType">Proof style</Label>
        <select
          id="proofType"
          name="proofType"
          value={proofType}
          onChange={(e) =>
            handleProofTypeChange(e.target.value as CubProofType)
          }
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          {PROOF_TYPES.map((type) => (
            <option key={type} value={type}>
              {CUB_PROOF_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-zinc-500">
          How the Cub shows work done on this task. Parent approval is always
          required to earn rewards.
        </p>
      </div>

      <div className="space-y-4 rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-900/50">
        <h4 className="text-sm font-medium">Proof instructions</h4>
        <p className="text-sm text-zinc-500">
          What the Cub should submit when the task is complete (parent-supervised).
        </p>

        <div>
          <Label htmlFor="proofPrompt">
            {proofType === "CHECKLIST"
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
            rows={3}
            value={proofPrompt}
            onChange={(e) => setProofPrompt(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            placeholder={defaultProofPrompt(proofType)}
          />
        </div>

        {proofType === "CHECKLIST" ? (
          <div>
            <Label htmlFor="checklistItems">Checklist items (one per line)</Label>
            <p className="mt-1 text-xs text-zinc-500">
              Add as many steps as needed (up to {MAX_CHECKLIST_ITEMS} items).
              Each line supports{" "}
              <strong className="font-medium">Markdown</strong> (e.g.{" "}
              <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">
                **bold**
              </code>
              ,{" "}
              <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">
                [link](url)
              </code>
              ) or simple HTML (
              <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">
                &lt;strong&gt;
              </code>
              ,{" "}
              <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">
                &lt;br&gt;
              </code>
              ).
              {lineCount > MAX_CHECKLIST_ITEMS ? (
                <span className="text-amber-700 dark:text-amber-400">
                  {" "}
                  Only the first {MAX_CHECKLIST_ITEMS} non-empty lines will be
                  saved.
                </span>
              ) : lineCount > 0 ? (
                <span> {lineCount} item{lineCount === 1 ? "" : "s"}.</span>
              ) : null}
            </p>
            <textarea
              id="checklistItems"
              rows={Math.min(24, Math.max(10, parsedItems.length + 2))}
              value={checklistText}
              onChange={(e) => setChecklistText(e.target.value)}
              className="mt-2 max-h-96 min-h-48 w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              placeholder={
                "**Read** Chapter 3\nAnswer all questions\nCheck my work — see [rubric](https://example.com)"
              }
            />
          </div>
        ) : null}

        {proofType === "PERFORMANCE_VIDEO" || proofType === "SLIDESHOW" ? (
          <p className="text-xs text-zinc-500">
            The Cub will paste a share link (Google Drive, iCloud, etc.) when
            submitting.
          </p>
        ) : null}
      </div>
    </div>
  );
}
