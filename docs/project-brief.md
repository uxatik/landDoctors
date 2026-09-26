# LandDoctor — Project Brief

Copy of the project doc `claude/LandDoctor-Project-Brief.md` (version 1.2, 25 September 2026). The project doc is the master; update both together.

## 1. Summary

LandDoctor helps people in Bangladesh solve land problems through verified experts at fixed, published prices, without middlemen or bribes. Users start from their problem (mutation, checking land before buying, survey, inheritance, record errors, disputes). LandDoctor matches them with a verified expert and a clear package. Public expert profiles build trust, ADPList-style.

The first goal is a small paid pilot in Savar and Gazipur that proves people will pay for this, not a full platform.

## 2. Problem

- About 8 million people a year face land disputes; only about a quarter are resolved.
- About half of households using land services report corruption (TIB 2023).
- Land records are split across several offices and written in terms most people don't understand, so middlemen (dalals) fill the gap.
- The government is digitising processes (e-mutation, online fees, 16122 hotline), but nobody explains an individual's case to them.

## 3. Solution and model

**Hybrid managed marketplace:**
- **Main path (problem first):** user picks a problem → gives area and details → free 10-minute triage call → offer with fixed price and matched expert → pays → case tracked to completion.
- **Choose-an-expert path:** browse verified profiles → book a specific expert directly. (Phase 2)
- **Phone path:** hotline or WhatsApp → operations person enters the case for the user → payment link.

**Principles:**
- Bangla first, English as an option.
- Mobile-first website, not a native app.
- Official government fees always shown separately from the service price.
- Never sell "faster approval". Sell advice, correct paperwork and field work.
- No cash to consultants. The platform collects payment and pays out after delivery.
- Consultants never take cases from an office where they work or have worked.

## 4. Users and roles

| Role | Who | Can do | Phase |
|---|---|---|---|
| Customer | Landowners, buyers, heirs, expatriates (NRB) | Submit a problem, accept an offer, pay | 1 (no account; identified by phone) · 2 (OTP login) |
| Consultant | Verified surveyors, retired land officials, land advocates, deed writers | Assigned cases via WhatsApp | 1 (no login) · 2 (dashboard) |
| Operations | Day-to-day team member in Bangladesh | Review cases, triage, match consultants, send offers and payment links, update status, complaints, refunds | 1 |
| Super admin | Founder | Everything operations can, plus approve/remove consultants, set packages and prices, payouts, settings, revenue | 1 |

Rules:
- Customers do not create accounts in phase 1.
- Consultants cannot sign themselves up. Admin creates and verifies every consultant profile.
- Operations cannot change prices, payouts or consultant approval.
- Phase 1 assigns private consultants only. Government employees only later, with written sanction on file, and never on cases from an office where they work or have worked.

## 5. Launch services (phase 1)

| Package | Deliverable | Starting price (placeholder) | Consultant share |
|---|---|---|---|
| 30-minute session | Phone or WhatsApp call (Google Meet on request) plus a short written summary of next steps | ৳1,000 | 80% |
| Field survey | Site visit, measurement and boundary marking, written result with sketch | from ৳6,000 (by size) | 80% |
| Land health report | Pre-purchase check of deed chain, khatian, mutation, tax status and known disputes; written Bangla report in 5–7 days | from ৳8,000 | 70% |

Plus a free 10-minute triage call for every new case.

## 6. Phase 1 scope

**Pilot areas:** Savar (Dhaka district) and Gazipur. Phone sessions from anywhere in Bangladesh; field surveys and land health reports only for land in Savar and Gazipur. Other requests go on a waiting list.

**Build:**
- Home page: problem categories, call and WhatsApp buttons, trust points, "Now serving Savar and Gazipur"
- Problem intake form: category, area (Savar / Gazipur / other → waiting list), upazila or thana, documents held, description, phone, contact preference
- Offer page (sent as a link): package, price, government fees, matched expert
- Payment via SSLCommerz, verified on the server; manual fallback until the gateway is approved
- Admin case list for operations and super admin: view, assign, change status, record payment and refund
- Basic consultant records (created by admin; not public yet)
- Legal pages: terms, refund policy, privacy policy, report disclaimer
- Analytics: Google Analytics and Microsoft Clarity

**Operate:** 5–10 private consultants in Savar and Gazipur; manual matching; consultants receive cases by WhatsApp; documents shared over WhatsApp only.

## 7. Out of scope for phase 1

Native apps; customer accounts; consultant self-signup or login; government-employed consultants; field work outside Savar and Gazipur; public expert browsing; document uploads; automatic matching; reviews; subscriptions, B2B, marketplace, escrow; in-platform video; automatic SMS.

## 8. Core user flow

1. Customer picks a problem on the home page, or calls or messages on WhatsApp.
2. Customer submits the intake form, or operations fills it in during a call.
3. Operations makes the free 10-minute triage call and chooses a package and consultant.
4. Operations sends the offer link by SMS or WhatsApp.
5. Customer pays. The server confirms payment with the gateway.
6. Consultant is assigned by WhatsApp and does the work.
7. Operations updates the case status; the report or summary is delivered.
8. Operations asks for feedback. Consultant is paid in the weekly payout.

## 9. Data model (draft)

- Case: id (LD-0001), created at, category, area, upazila or thana, mouza (optional), documents held, description, customer name, customer phone, contact preference, status, assigned consultant, package, price, government fees, payment status, notes
- Waiting list entry: id, created at, district, upazila, category, phone
- Consultant: id, name, role type, employment status, sanction reference, offices worked at, verification status, areas served, specialities, languages, phone, payout account, share %, active
- Package: id, name (bn/en), scope, exclusions, delivery days, base price, consultant share
- Payment: id, case, amount, method, gateway transaction id, verified at, status
- Payout: id, consultant, cases included, amount, paid at
- Staff user: id, name, email, role (operations or super admin)
- Complaint: id, case, reported by, description, status, resolution

Case statuses: New → Triage done → Offer sent → Paid → In progress → Delivered → Closed (plus Cancelled and Refunded).

## 10. Technology

Next.js + Tailwind + next-intl (bn default, en); Supabase (Postgres, staff auth, RLS; Mumbai or Singapore); Vercel; SSLCommerz with server-side validation; WhatsApp Business app; Google Analytics and Microsoft Clarity.

Security: RLS on every table; no secrets in frontend; every payment verified on the server; minimal personal data; no uploads; staff 2FA.
