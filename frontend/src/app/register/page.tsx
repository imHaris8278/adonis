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

function RegisterContent() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const next = safeNext(searchParams.get("next"));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-5 md:px-8 md:py-16">
      <h1 className="display text-4xl sm:text-5xl md:text-7xl">Register</h1>
      <p className="mt-4 text-sm text-muted">
        Already have an account?{" "}
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
          className="text-white underline underline-offset-4"
        >
          Login
        </Link>
      </p>
      <div className="mt-10 md:mt-12">
        <AuthForm
          mode="register"
          error={error}
          loading={loading}
          onSubmit={async ({ name, email, password }) => {
            setLoading(true);
            setError("");
            try {
              await register(name || "", email, password);
              router.push(next || "/browse");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Register failed");
            } finally {
              setLoading(false);
            }
          }}
        />
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<p className="px-4 py-10 text-sm text-muted">Loading…</p>}>
      <RegisterContent />
    </Suspense>
  );
}
