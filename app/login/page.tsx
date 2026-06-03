"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { realizarLogin } from "@/services/login.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

 async function handleLogin(
  e: React.FormEvent
) {
  e.preventDefault();

  setLoading(true);
  setError("");

  try {
      // Tenta realizar a autenticação por e-mail/senha no Supabase
    await realizarLogin(
      email,
      password
    );

    router.push("/");
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 antialiased">
      <div className="max-w-sm w-full bg-white rounded-xl border border-gray-100 shadow-sm p-8 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-medium text-gray-900 tracking-tight">
            Acessar Sistema
          </h2>
          <p className="text-xs text-gray-400">
            Insira suas credenciais para continuar
          </p>
        </div>
           
        {error && (
          <div className="p-3 rounded-lg text-xs font-mono bg-red-50/50 text-red-600 border border-red-100">
            * {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] text-gray-400 mb-1">
              E-mail
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="h-9 bg-zinc-50/50 border-zinc-200 focus-visible:ring-zinc-400 text-sm"
            />
          </div>

          <div>
            <label className="block text-[11px] text-gray-400 mb-1">
              Senha
            </label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              className="h-9 bg-zinc-50/50 border-zinc-200 focus-visible:ring-zinc-400 text-sm"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-medium h-10 text-xs uppercase tracking-wider transition-colors"
          >
            {loading ? "Autenticando..." : "Entrar"}
          </Button>
        </form>


        <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-50">
          Não tem uma conta?{" "}
          <Link
            href="/cadastro"
            className="text-gray-900 hover:underline font-medium"
          >
            Cadastre-se agora
          </Link>
        </div>
      </div>
    </div>
  );
}
