"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const links = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/browse?type=manga", label: "Manga" },
  { href: "/browse?type=novel", label: "Novels" },
];

function SiteShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const isHome = pathname === "/";
  const isAdmin = pathname.startsWith("/admin");
  const searchKey = searchParams.toString();

  useEffect(() => {
    setOpen(false);
  }, [pathname, searchKey]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      {!isAdmin && (
        <header className="fixed top-0 right-0 left-0 z-40 flex items-center justify-between bg-black/80 px-4 py-4 backdrop-blur-md sm:px-5 md:px-8 md:py-5">
          <Link href="/" className="text-sm tracking-wide">
            Wasi
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex min-h-11 items-center gap-3 text-sm tracking-wide"
            aria-label="Open menu"
            aria-expanded={open}
          >
            <span>Menu</span>
            <span className="flex flex-col gap-1.5" aria-hidden>
              <span className="block h-px w-6 bg-white" />
              <span className="block h-px w-6 bg-white" />
            </span>
          </button>
        </header>
      )}

      {open && (
        <div
          className="menu-overlay fixed inset-0 z-50 flex flex-col bg-black"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
        >
          <div className="flex items-center justify-between px-4 py-4 sm:px-5 md:px-8 md:py-5">
            <Link href="/" className="text-sm tracking-wide" onClick={() => setOpen(false)}>
              Wasi
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="min-h-11 text-sm tracking-wide"
            >
              Close
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 pb-10 pt-8 sm:gap-6 sm:px-5 md:px-8 md:pt-12">
            {links.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="display text-4xl transition-opacity hover:opacity-60 sm:text-5xl md:text-7xl"
              >
                {link.label}
              </Link>
            ))}
            {!loading && !user && (
              <>
                <Link
                  href="/login"
                  className="display text-4xl transition-opacity hover:opacity-60 sm:text-5xl md:text-7xl"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="display text-4xl transition-opacity hover:opacity-60 sm:text-5xl md:text-7xl"
                >
                  Register
                </Link>
              </>
            )}
            {!loading && user && (
              <>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="display text-4xl transition-opacity hover:opacity-60 sm:text-5xl md:text-7xl"
                  >
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="display text-left text-4xl transition-opacity hover:opacity-60 sm:text-5xl md:text-7xl"
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      )}

      <main className={`flex-1 ${isHome || isAdmin ? "" : "pt-20 md:pt-24"}`}>
        {children}
      </main>
    </div>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen">{children}</div>}>
      <SiteShellInner>{children}</SiteShellInner>
    </Suspense>
  );
}
