export interface DraftLike {
  filename: string;
  sessionId: string;
  type: string;
}

/**
 * Case-insensitive substring filter over draft filenames.
 * An empty/whitespace query returns the list unchanged.
 */
export function filterDrafts<T extends DraftLike>(drafts: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return drafts;
  return drafts.filter((d) => d.filename.toLowerCase().includes(q));
}
