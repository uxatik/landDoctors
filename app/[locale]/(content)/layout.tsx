// Form, offer, payment and legal pages: one narrow reading column.
export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-[var(--content-max)] px-4 pb-12 pt-4">{children}</div>;
}
