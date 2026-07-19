"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <section className="relative flex min-h-dvh flex-col justify-between px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-20 sm:px-5 md:px-8 md:pt-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_55%)]" />

      <div className="relative flex flex-1 items-center justify-center px-2">
        <h1 className="display rise-in text-[22vw] leading-none sm:text-[18vw] md:text-[12vw]">
          Wasi
        </h1>
      </div>

      <div className="relative flex flex-col gap-5 pb-2 text-xs text-muted sm:flex-row sm:items-end sm:justify-between sm:gap-6 md:text-sm">
        <p className="fade-in max-w-xs">
          Manga and novels. Bold pages. Quiet reading.
        </p>
        <div className="fade-in flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link href="/browse" className="transition-colors hover:text-white">
            Browse
          </Link>
          {!loading && !user && (
            <>
              <Link href="/register" className="transition-colors hover:text-white">
                Join
              </Link>
              <Link href="/login" className="transition-colors hover:text-white">
                Login
              </Link>
            </>
          )}
          {!loading && user && (
            <>
              {user.role === "admin" && (
                <Link href="/admin" className="transition-colors hover:text-white">
                  Admin
                </Link>
              )}
              <span className="text-muted/80">Hi, {user.name.split(" ")[0]}</span>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
