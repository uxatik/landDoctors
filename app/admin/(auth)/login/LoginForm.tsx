"use client";

import { useActionState } from "react";
import { A } from "@/lib/admin/strings";
import { signIn, type LoginState } from "../actions";

const INPUT = "w-full rounded-sm border border-line bg-surface px-3 py-2.5";

export function LoginForm({ initialError }: { initialError?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, { error: initialError });
  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error && (
        <p id="login-error" role="alert" className="rounded-md border-2 border-danger bg-danger-soft p-3 text-sm">
          {A.login.errors[state.error] ?? A.login.errors.unknown}
        </p>
      )}
      <label className="flex flex-col gap-1">
        <span className="font-medium">{A.login.email}</span>
        <input name="email" type="email" autoComplete="username" required className={INPUT} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-medium">{A.login.password}</span>
        <input name="password" type="password" autoComplete="current-password" required className={INPUT} />
      </label>
      <button disabled={pending} className="min-h-[var(--tap-min)] rounded-md bg-accent font-semibold text-on-accent disabled:opacity-70">
        {A.login.submit}
      </button>
    </form>
  );
}
