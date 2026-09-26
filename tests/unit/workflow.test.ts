import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { allowedTransitions, canMove, type CaseStatus } from "@/lib/cases/workflow";

function sqlTransitions(): string[] {
  const sql = readFileSync("supabase/migrations/0004_workflow.sql", "utf8");
  const block = sql.split("-- transitions:begin")[1]?.split("-- transitions:end")[0] ?? "";
  return [...block.matchAll(/\('([a-z_]+)',\s*'([a-z_]+)'\)/g)].map((m) => `${m[1]}->${m[2]}`).sort();
}

describe("case workflow", () => {
  it("matches the database transition table exactly", () => {
    const ts = Object.entries(allowedTransitions)
      .flatMap(([from, tos]) => tos.map((to) => `${from}->${to}`))
      .sort();
    expect(sqlTransitions().length).toBeGreaterThan(0);
    expect(ts).toEqual(sqlTransitions());
  });

  it("never lets staff mark a case paid or refunded by hand", () => {
    for (const from of Object.keys(allowedTransitions) as CaseStatus[]) {
      expect(canMove(from, "paid")).toBe(false);
      expect(canMove(from, "refunded")).toBe(false);
      expect(canMove(from, "offer_sent")).toBe(false);
    }
  });
});
