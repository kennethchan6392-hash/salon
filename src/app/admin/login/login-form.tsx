"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/admin/orders";
  const [secret, setSecret] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/auth/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret }),
    });
    if (!response.ok) {
      setMessage("Login failed. Check your admin key.");
      return;
    }
    router.push(from);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-zinc-100">
      <h1 className="text-2xl font-semibold">Admin sign-in</h1>
      <p className="mt-2 max-w-md text-center text-sm text-zinc-400">
        Enter the same value as <code className="text-zinc-300">ADMIN_API_KEY</code> in your environment.
      </p>
      <form className="mt-8 flex w-full max-w-sm flex-col gap-4" onSubmit={onSubmit}>
        <label className="flex flex-col gap-2 text-sm">
          <span>Admin key</span>
          <input
            className="rounded-xl border border-zinc-600 bg-zinc-900 px-4 py-2"
            type="password"
            autoComplete="off"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            required
          />
        </label>
        <button className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-zinc-900" type="submit">
          Continue
        </button>
        {message ? <p className="text-sm text-rose-400">{message}</p> : null}
      </form>
    </main>
  );
}
