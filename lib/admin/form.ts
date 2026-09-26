/** Small helpers for reading admin forms. */
export function s(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export function list(fd: FormData, key: string): string[] {
  return s(fd, key)
    .split(/[,،\n]/)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 30);
}

export function int(fd: FormData, key: string): number | null {
  const v = s(fd, key);
  if (!/^\d+$/.test(v)) return null;
  return Number(v);
}

export function bool(fd: FormData, key: string): boolean {
  return fd.get(key) === "on" || fd.get(key) === "true";
}
