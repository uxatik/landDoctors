import Link from "next/link";
import { requireStaff } from "@/lib/admin/auth";
import { A } from "@/lib/admin/strings";
import { signOut } from "../(auth)/actions";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff();
  const links: { href: string; label: string; superAdmin?: boolean }[] = [
    { href: "/admin/cases", label: A.nav.cases },
    { href: "/admin/waitlist", label: A.nav.waitlist },
    { href: "/admin/complaints", label: A.nav.complaints },
    { href: "/admin/consultants", label: A.nav.consultants },
    { href: "/admin/packages", label: A.nav.packages, superAdmin: true },
    { href: "/admin/payouts", label: A.nav.payouts, superAdmin: true },
  ];
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <span className="font-bold text-accent">{A.appName}</span>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted">
              {staff.name} · {staff.role === "super_admin" ? "Super admin" : "Operations"}
            </span>
            <form action={signOut}>
              <button className="rounded-control border border-line px-3 py-1.5">{A.nav.signOut}</button>
            </form>
          </div>
        </div>
        <nav aria-label="Staff" className="mx-auto max-w-6xl overflow-x-auto px-4">
          <ul className="flex gap-1 pb-2 text-sm">
            {links
              .filter((l) => !l.superAdmin || staff.role === "super_admin")
              .map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="block whitespace-nowrap rounded-control px-3 py-2 hover:bg-accent-soft">
                    {l.label}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
