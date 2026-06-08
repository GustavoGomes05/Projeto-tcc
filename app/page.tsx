"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart } from "lucide-react";

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
          <ShoppingCart className="mx-auto h-8 w-8 text-zinc-900 stroke-[1.5]" />

          <span className="text-sm font-semibold text-zinc-900">
            Facilta Web
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
          <ShoppingCart className="mx-auto h-16 w-16 text-zinc-900 stroke-[1.5]" />

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Facilita Web
            </h1>
          </div>

          <Separator />

          {/* CTA AREA */}
          {user ? (
            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={() => router.push("/produtos")}
              >
                Fazer uma venda
              </Button>
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
