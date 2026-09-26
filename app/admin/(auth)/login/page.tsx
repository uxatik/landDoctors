import { A } from "@/lib/admin/strings";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const known = error && error in A.login.errors ? error : undefined;
  return (
    <main className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-12">
      <h1 className="text-xl font-bold">{A.login.title}</h1>
      <LoginForm initialError={known} />
    </main>
  );
}
