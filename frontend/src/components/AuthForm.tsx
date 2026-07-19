"use client";

export function AuthForm({
  mode,
  onSubmit,
  error,
  loading,
}: {
  mode: "login" | "register";
  onSubmit: (data: {
    name?: string;
    email: string;
    password: string;
  }) => Promise<void>;
  error: string;
  loading: boolean;
}) {
  return (
    <form
      className="mx-auto w-full max-w-md space-y-6"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        await onSubmit({
          name: String(form.get("name") || ""),
          email: String(form.get("email") || ""),
          password: String(form.get("password") || ""),
        });
      }}
    >
      {mode === "register" && (
        <label className="block space-y-2">
          <span className="text-xs uppercase tracking-[0.2em] text-muted">
            Name
          </span>
          <input name="name" required className="field" autoComplete="name" />
        </label>
      )}
      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-[0.2em] text-muted">
          Email
        </span>
        <input
          name="email"
          type="email"
          required
          className="field"
          autoComplete="email"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-[0.2em] text-muted">
          Password
        </span>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          className="field"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </label>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button type="submit" disabled={loading} className="btn btn-solid w-full">
        {loading ? "Please wait…" : mode === "login" ? "Login" : "Create account"}
      </button>
    </form>
  );
}
