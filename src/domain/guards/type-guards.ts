export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

export function isUuidString(value: unknown): boolean {
  if (!isString(value)) return false;
  return /^[0-9a-fA-F\-]{36}$/.test(value);
}

export function looksLikeTaskRecord(record: unknown): record is Record<string, unknown> {
  if (!record || typeof record !== 'object') return false;
  const r = record as Record<string, unknown>;
  return (
    isString(r.id) &&
    isString(r.title) &&
    (r.description === null || typeof r.description === 'string') &&
    isString(r.ownerId) &&
    (r.status === 'PENDING' || r.status === 'COMPLETED') &&
    (r.createdAt instanceof Date || typeof r.createdAt === 'string') &&
    (r.updatedAt instanceof Date || typeof r.updatedAt === 'string')
  );
}