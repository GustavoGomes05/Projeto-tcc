"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { Geist } from "next/font/google";

import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

import Navbar from "./components/Navbar";

import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checarSessao() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setIsAuthenticated(!!user);
    }

    checarSessao();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const mostrarNavbar =
    isAuthenticated && pathname !== "/login" && pathname !== "/cadastro";

  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn("font-sans", geist.variable)}
    >
      <body className="min-h-screen bg-slate-50 text-zinc-900 antialiased">
        <TooltipProvider delayDuration={100}>
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <Navbar
              isCollapsed={isCollapsed}
              onToggle={() => setIsCollapsed(!isCollapsed)}
            />

            {/* Conteúdo */}
            <main
              className={cn(
                "flex-1 min-h-screen transition-all duration-300 ease-in-out",
                mostrarNavbar ? (isCollapsed ? "pl-20" : "pl-64") : "pl-0",
              )}
            >
              <div className="min-h-screen">{children}</div>
            </main>
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}
