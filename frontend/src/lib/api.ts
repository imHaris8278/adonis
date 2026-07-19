export type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
};

export type Series = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  type: "manga" | "novel";
  coverUrl: string;
  status: "draft" | "published";
  tags: string[];
  views: number;
  chapterCount?: number;
  author?: { name?: string; email?: string };
  createdAt?: string;
  updatedAt?: string;
};

export type Chapter = {
  _id: string;
  title: string;
  number: number;
  content?: string;
  pages?: { imageUrl: string; order: number }[];
  status: "draft" | "published";
  views: number;
  createdAt?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("wasi_token");
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  }).catch(() => {
    throw new Error("Cannot reach API. Is the backend running?");
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data as T;
}

export { API_URL };
