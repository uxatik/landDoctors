import type { Metadata } from "next";
import "@fontsource/hind-siliguri/400.css";
import "@fontsource/hind-siliguri/700.css";
import "../globals.css";

export const metadata: Metadata = {
  title: "LandDoctor Staff",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body className="min-h-dvh bg-bg">{children}</body>
    </html>
  );
}
