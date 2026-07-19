"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const nav = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/publish", label: "Publish", exact: true },
  { href: "/admin/series", label: "Series", exact: false },
  { href: "/", label: "Public", exact: true },
];

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login?next=/admin");
    else if (user.role !== "admin") router.replace("/browse");
  }, [user, loading, router]);

  if (loading || !user || user.role !== "admin") {
    return (
      <p className="px-4 py-16 text-sm text-muted sm:px-5 md:px-8">
        Checking access…
      </p>
    );
  }

  return (
    <div className="min-h-screen md:grid md:grid-cols-[200px_1fr] lg:grid-cols-[220px_1fr]">
      <aside className="sticky top-0 z-20 border-b border-line bg-black px-4 py-4 sm:px-5 md:border-r md:border-b-0 md:px-6 md:py-6">
        <div className="flex items-center justify-between gap-4 md:block">
          <div>
            <p className="display text-xl md:text-2xl">Wasi</p>
            <p className="mt-0.5 text-xs text-muted">Admin</p>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="text-sm text-muted hover:text-white md:hidden"
          >
            Logout
          </button>
        </div>

        <nav className="admin-nav -mx-4 mt-4 flex gap-1 overflow-x-auto px-4 pb-1 md:mx-0 md:mt-10 md:flex-col md:gap-4 md:overflow-visible md:px-0 md:pb-0">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 border px-3 py-2 text-sm md:border-0 md:px-0 md:py-0 ${
                isActive(pathname, item.href, item.exact)
                  ? "chip-active border-white bg-white"
                  : "border-transparent text-muted hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="hidden text-left text-sm text-muted hover:text-white md:block"
          >
            Logout
          </button>
        </nav>
      </aside>
      <div className="min-w-0 px-4 py-6 sm:px-5 md:px-8 md:py-8 lg:px-10">
        {children}
      </div>
    </div>
  );
}
