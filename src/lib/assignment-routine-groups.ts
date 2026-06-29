import type {
  Challenge,
  ChallengeIntervalType,
  Prisma,
  TaskProofType,
} from "@/generated/prisma/client";

export type AssignmentRoutine = {
  id: string;
  title: string;
  status: string;
  intervalType: ChallengeIntervalType;
  intervalConfig: Prisma.JsonValue;
  proofType: TaskProofType;
  cub: { id: string; displayName: string };
};

export type GroupedAssignmentRoutine = {
  key: string;
  title: string;
  intervalType: AssignmentRoutine["intervalType"];
  intervalConfig: AssignmentRoutine["intervalConfig"];
  proofType: AssignmentRoutine["proofType"];
  status: "ACTIVE" | "PAUSED" | "MIXED";
  assignments: Array<{
    id: string;
    status: string;
    cub: AssignmentRoutine["cub"];
  }>;
};

export type RoutineDefinitionKey = {
  title: string;
  intervalType: ChallengeIntervalType;
  intervalConfig: Prisma.JsonValue | null;
  proofType: TaskProofType;
};

export function routineGroupKeyFromDefinition(def: RoutineDefinitionKey): string {
  return [
    def.title.trim().toLowerCase(),
    def.intervalType,
    JSON.stringify(def.intervalConfig ?? null),
    def.proofType,
  ].join("|");
}

export function routineGroupKeyFromChallenge(
  challenge: Pick<
    Challenge,
    "title" | "intervalType" | "intervalConfig" | "proofType"
  >,
): string {
  return routineGroupKeyFromDefinition(challenge);
}

function routineGroupKey(routine: AssignmentRoutine): string {
  return routineGroupKeyFromDefinition(routine);
}

export function findRoutineGroupMembers<
  T extends Pick<
    Challenge,
    "id" | "title" | "intervalType" | "intervalConfig" | "proofType" | "status" | "cubId"
  >,
>(anchor: RoutineDefinitionKey, challenges: T[]): T[] {
  const key = routineGroupKeyFromDefinition(anchor);
  return challenges.filter(
    (challenge) =>
      challenge.status !== "ARCHIVED" &&
      routineGroupKeyFromChallenge(challenge) === key,
  );
}

export function findRoutineGroupMembersByChallengeId<
  T extends Pick<
    Challenge,
    "id" | "title" | "intervalType" | "intervalConfig" | "proofType" | "status" | "cubId"
  >,
>(challengeId: string, challenges: T[]): T[] {
  const anchor = challenges.find((challenge) => challenge.id === challengeId);
  if (!anchor) return [];
  return findRoutineGroupMembers(anchor, challenges);
}

export function groupAssignmentRoutines(
  routines: AssignmentRoutine[],
): GroupedAssignmentRoutine[] {
  const groups = new Map<string, GroupedAssignmentRoutine>();

  for (const routine of routines) {
    const key = routineGroupKey(routine);
    const existing = groups.get(key);

    if (existing) {
      existing.assignments.push({
        id: routine.id,
        status: routine.status,
        cub: routine.cub,
      });
      const statuses = new Set(existing.assignments.map((a) => a.status));
      existing.status =
        statuses.size > 1 ? "MIXED" : routine.status === "ACTIVE" ? "ACTIVE" : "PAUSED";
    } else {
      groups.set(key, {
        key,
        title: routine.title,
        intervalType: routine.intervalType,
        intervalConfig: routine.intervalConfig,
        proofType: routine.proofType,
        status: routine.status === "ACTIVE" ? "ACTIVE" : "PAUSED",
        assignments: [
          {
            id: routine.id,
            status: routine.status,
            cub: routine.cub,
          },
        ],
      });
    }
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      assignments: [...group.assignments].sort((a, b) =>
        a.cub.displayName.localeCompare(b.cub.displayName),
      ),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

/** Unique routine definitions (same title/schedule/proof grouped across Cubs). */
export function countGroupedAssignmentRoutines(
  routines: AssignmentRoutine[],
): number {
  return groupAssignmentRoutines(routines).length;
}
