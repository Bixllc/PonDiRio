"use client";

import { useState, useTransition } from "react";
import { adminLogin } from "@/app/actions/auth";

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await adminLogin(null, formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F1E8]">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center font-serif text-2xl text-gray-900">
          Admin Login
        </h1>

        <form action={handleSubmit}>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            className="mb-4 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#C8940A] focus:outline-none focus:ring-1 focus:ring-[#C8940A]"
          />

          {error && (
            <p className="mb-4 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded bg-[#C8940A] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#a87a08] disabled:opacity-50"
          >
            {isPending ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
