"use client";

import { useActionState } from "react";
import { login } from "../actions";

export function LoginForm({ devHint }: { devHint: string | null }) {
  const [state, action, pending] = useActionState(login, null);
  const field =
    "w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20";

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Your name
        <input name="name" required autoComplete="name" placeholder="Maria (ALAS)" className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Passcode
        <input name="passcode" type="password" required autoComplete="current-password" className={field} />
      </label>
      {state?.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      {devHint && (
        <p className="text-xs text-stone-500">
          Development mode: the passcode is <code className="rounded bg-stone-100 px-1">{devHint}</code>.
        </p>
      )}
    </form>
  );
}
