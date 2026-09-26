import { describe, expect, it } from "vitest";
import { buildPayouts, type PaidOffer } from "@/lib/admin/payouts";

const o = (case_id: number, consultant_id: number, service_price: number, govt_fees: number, share_pct = 70): PaidOffer => ({
  case_id, consultant_id, service_price, govt_fees, share_pct, consultant_name: `K${consultant_id}`, case_ref: `LD-000${case_id}`,
});

describe("buildPayouts", () => {
  it("adds the share of the service price and reimburses government fees", () => {
    const [line] = buildPayouts([o(1, 1, 8000, 240), o(2, 1, 1000, 0, 80)], new Set());
    expect(line).toMatchObject({ share: 5600 + 800, feesReimbursed: 240, total: 6640, caseIds: [1, 2] });
  });

  it("skips cases already paid out and groups by consultant", () => {
    const lines = buildPayouts([o(1, 1, 8000, 0), o(2, 2, 6000, 0, 80), o(3, 1, 1000, 0, 80)], new Set([1]));
    expect(lines.map((l) => [l.consultantId, l.total])).toEqual([[2, 4800], [1, 800]]);
  });

  it("rounds each case share to whole taka", () => {
    const [line] = buildPayouts([o(1, 1, 999, 0, 70)], new Set());
    expect(line?.share).toBe(699);
  });
});
