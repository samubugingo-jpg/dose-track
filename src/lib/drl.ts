export const DRL_LIMITS: Record<string, number> = {
  head: 1050,
  chest: 400,
  abdomen: 700,
  cardiac: 300, // Estimated
  spine: 600,
};

export function checkDrlExceedance(examType: string, dlp: number): boolean {
  const limit = DRL_LIMITS[examType.toLowerCase()];
  if (!limit) return false;
  return dlp > limit;
}
