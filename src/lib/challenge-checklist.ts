import { getTaskChecklistItems } from "@/lib/tasks";

export function getChallengeChecklistItems(challenge: {
  proofChecklistItems: unknown;
}): string[] {
  return getTaskChecklistItems(challenge);
}
