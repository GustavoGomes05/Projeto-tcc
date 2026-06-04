"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function HomePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.refresh();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-zinc-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4">
        {/* LOGO AREA */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-zinc-900" />

          <span className="text-sm font-semibold text-zinc-900">
            Projeto tcc
          </span>
        </div>

        {/* AUTH */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-zinc-500">
                Olá,{" "}
                <span className="text-zinc-900 font-medium">{user.email}</span>
              </span>

              <Separator orientation="vertical" className="h-5" />

              <Button variant="ghost" onClick={logout}>
                Sair
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Entrar</Button>
              </Link>

              <Link href="/cadastro">
                <Button>Criar conta</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* HERO */}
      <main className="flex flex-1 items-center justify-center px-6">
        <Card className="w-full max-w-xl p-10 text-center space-y-6 border-zinc-200/60">
          {/* LOGO BIG */}
          <div className="mx-auto h-14 w-14 rounded-2xl bg-zinc-900" />

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Sistema de Gestão de Vendas
            </h1>

            <p className="text-sm text-zinc-500">
              Controle produtos, estoque e vendas em um único lugar simples e
              rápido.
            </p>
          </div>

          <Separator />

          {/* CTA AREA */}
          {user ? (
            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={() => router.push("/produtos")}
              >
                Ir para sistema
              </Button>

              <p className="text-xs text-zinc-500">
                Você já está autenticado e pode acessar o sistema.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <Link href="/login">
                <Button className="w-full">Entrar no sistema</Button>
              </Link>

              <Link href="/cadastro">
                <Button variant="outline" className="w-full">
                  Criar conta
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </main>

      {/* FOOTER */}
      <footer className="text-center text-xs text-zinc-400 py-6">
        ERP System • Supabase Auth • Next.js
      </footer>
    </div>
  );
}
