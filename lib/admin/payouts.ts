export type PaidOffer = {
  case_id: number; service_price: number; govt_fees: number; consultant_id: number;
  consultant_name: string; share_pct: number; case_ref: string;
};

export type PayoutLine = {
  consultantId: number; consultantName: string; caseIds: number[]; caseRefs: string[];
  share: number; feesReimbursed: number; total: number;
};

/**
 * Groups delivered/closed cases by consultant. The consultant gets their share of the
 * service price plus the government fees they paid on the customer's behalf.
 */
export function buildPayouts(offers: PaidOffer[], alreadyPaidCaseIds: Set<number>): PayoutLine[] {
  const by = new Map<number, PayoutLine>();
  for (const o of offers) {
    if (alreadyPaidCaseIds.has(o.case_id)) continue;
    const line = by.get(o.consultant_id) ?? {
      consultantId: o.consultant_id, consultantName: o.consultant_name, caseIds: [], caseRefs: [], share: 0, feesReimbursed: 0, total: 0,
    };
    const share = Math.round((o.service_price * o.share_pct) / 100);
    line.caseIds.push(o.case_id);
    line.caseRefs.push(o.case_ref);
    line.share += share;
    line.feesReimbursed += o.govt_fees;
    line.total += share + o.govt_fees;
    by.set(o.consultant_id, line);
  }
  return [...by.values()].sort((a, b) => b.total - a.total);
}
