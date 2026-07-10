export function getDouglassProfileStorageKey(
  cubId: string,
  deckSlug: string,
  partKey: string,
): string {
  return `liblab:${cubId}:${deckSlug}:${partKey}:douglass-profile`;
}

export function getDouglassProfileLabPath(
  cubId: string,
  deckSlug: string,
  partKey: string,
): string {
  return `/cub/${cubId}/training/deck/${deckSlug}/part/${partKey}/profile-lab`;
}

export function getDouglassProfileViewPath(
  cubId: string,
  deckSlug: string,
  partKey: string,
): string {
  return `/cub/${cubId}/training/deck/${deckSlug}/part/${partKey}/profile`;
}
