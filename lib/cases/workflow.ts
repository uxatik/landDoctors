export const CASE_STATUSES = [
  "new",
  "triage_done",
  "offer_sent",
  "paid",
  "in_progress",
  "delivered",
  "closed",
  "cancelled",
  "refunded",
] as const;

export type CaseStatus = (typeof CASE_STATUSES)[number];

/**
 * Status moves staff can make by hand. Mirrors private.case_transitions in
 * supabase/migrations/0004_workflow.sql (checked by tests/unit/workflow.test.ts).
 * offer_sent, paid and refunded are reached only through their own actions.
 */
export const allowedTransitions: Record<CaseStatus, readonly CaseStatus[]> = {
  new: ["triage_done", "cancelled"],
  triage_done: ["cancelled"],
  offer_sent: ["triage_done", "cancelled"],
  paid: ["in_progress"],
  in_progress: ["delivered"],
  delivered: ["closed"],
  closed: [],
  cancelled: [],
  refunded: [],
};

export function canMove(from: CaseStatus, to: CaseStatus): boolean {
  return allowedTransitions[from].includes(to);
}
