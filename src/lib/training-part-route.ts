export function parsePartKeyFromStarterKey(
  starterKey: string | null | undefined,
): string | null {
  if (!starterKey) return null;
  const colon = starterKey.indexOf(":");
  if (colon === -1) return null;
  const partKey = starterKey.slice(colon + 1);
  return partKey.length > 0 ? partKey : null;
}

export function getTrainingPartHref(
  cubId: string,
  deckSlug: string | null | undefined,
  starterKey: string | null | undefined,
): string | null {
  const partKey = parsePartKeyFromStarterKey(starterKey);
  if (!deckSlug || !partKey) return null;
  return `/cub/${cubId}/training/deck/${deckSlug}/part/${partKey}`;
}
