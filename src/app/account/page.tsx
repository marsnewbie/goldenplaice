"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, LogOut } from "lucide-react";

interface Session {
  id: string;
  email: string;
  name: string;
}

export default function AccountPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");

  const loadSession = () => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setSession(d.user || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadSession();
  }, []);

  const handleAuth = async () => {
    setError("");
    const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, phone }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    loadSession();
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  if (session) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <h1 className="section-title mb-6">My account</h1>
        <div className="card">
          <p className="text-lg font-semibold">{session.name}</p>
          <p className="text-white/60">{session.email}</p>
          <button type="button" onClick={logout} className="btn-secondary mt-6 w-full">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
        <Link href="/order" className="btn-primary mt-6 block text-center">
          Order now
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="section-title mb-6">Account</h1>
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-xl py-2 text-sm font-medium ${
            mode === "login" ? "bg-brand-orange text-brand-navy" : "bg-white/10"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`flex-1 rounded-xl py-2 text-sm font-medium ${
            mode === "register" ? "bg-brand-orange text-brand-navy" : "bg-white/10"
          }`}
        >
          Register
        </button>
      </div>
      <div className="card space-y-4">
        {mode === "register" && (
          <>
            <div>
              <label className="label">Name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </>
        )}
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="button" onClick={handleAuth} className="btn-primary w-full">
          {mode === "login" ? "Sign in" : "Create account"}
        </button>
      </div>
    </div>
  );
}
