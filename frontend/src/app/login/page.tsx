"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthForm } from "@/components/AuthForm";
import { useAuth } from "@/context/AuthContext";

function safeNext(path: string | null) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return null;
  return path;
}

function LoginContent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const next = safeNext(searchParams.get("next"));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-5 md:px-8 md:py-16">
      <h1 className="display text-4xl sm:text-5xl md:text-7xl">Login</h1>
      <p className="mt-4 text-sm text-muted">
        Need an account?{" "}
        <Link
          href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}
          className="text-white underline underline-offset-4"
        >
          Create one
        </Link>
      </p>
      <div className="mt-10 md:mt-12">
        <AuthForm
          mode="login"
          error={error}
          loading={loading}
          onSubmit={async ({ email, password }) => {
            setLoading(true);
            setError("");
            try {
              const user = await login(email, password);
              if (next) router.push(next);
              else router.push(user.role === "admin" ? "/admin" : "/browse");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Login failed");
            } finally {
              setLoading(false);
            }
          }}
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="px-4 py-10 text-sm text-muted">Loading…</p>}>
      <LoginContent />
    </Suspense>
  );
}
