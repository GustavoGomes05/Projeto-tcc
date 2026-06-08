"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  DollarSign,
  ChartColumnIncreasing,
} from "lucide-react";

import { getCurrentUser, onAuthChange, logout } from "@/services/auth.service";

interface NavbarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Navbar({ isCollapsed, onToggle }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function carregarUsuario() {
      const user = await getCurrentUser();

      setIsAuthenticated(!!user);
    }

    carregarUsuario();

    const subscription = onAuthChange((authenticated) => {
      setIsAuthenticated(authenticated);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await logout();

    router.push("/login");
  }

  if (!isAuthenticated || pathname === "/login" || pathname === "/cadastro") {
    return null;
  }

  const navLinks = [
    {
      label: "Início",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      label: "Vendas",
      href: "/inicio",
      icon: DollarSign,
    },
    {
      label: "Registrar Vendas",
      href: "/vendas",
      icon: ShoppingCart,
    },
    {
      label: "Caixa",
      href: "/caixa",
      icon: Wallet,
    },
    {
      label: "Produtos",
      href: "/produtos",
      icon: Package,
    },
    {
      label: "Relatório",
      href: "/dashboard",
      icon: ChartColumnIncreasing,
    },
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col justify-between border-r border-slate-200 bg-white/70 backdrop-blur-xl transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      {/* TOPO */}
      <div>
        <div
          className={cn(
            "flex h-16 items-center px-4",
            isCollapsed ? "justify-center" : "justify-between",
          )}
        >
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-black" />

              <span className="text-sm font-semibold tracking-tight text-zinc-900">
                Facilita Web
              </span>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="text-zinc-500 hover:text-zinc-900"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>

        <Separator />

        {/* LINKS */}
        <nav className="flex flex-col gap-1 p-3">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            const Icon = link.icon;

            const content = (
              <Link
                href={link.href}
                className={cn(
                  "group flex items-center rounded-xl text-sm font-medium transition-all duration-300 ease-out",
                  isCollapsed
                    ? "mx-auto h-11 w-11 justify-center"
                    : "h-11 gap-3 px-3",
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-100 shadow-sm"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />

                {!isCollapsed && <span>{link.label}</span>}
              </Link>
            );
            // Se o menu estiver encolhido, põe um texto para o usuario saber o que cada icone faz
            if (isCollapsed) {
              return (
                <Tooltip key={link.href}>
                  <TooltipTrigger asChild>{content}</TooltipTrigger>

                  <TooltipContent side="right">{link.label}</TooltipContent>
                </Tooltip>
              );
            }

            return <div key={link.href}>{content}</div>;
          })}
        </nav>
      </div>

      {/* FOOTER */}
      <div className="p-3">
        <Separator className="mb-3" />

        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="mx-auto flex h-11 w-11 text-zinc-500 hover:text-red-500"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>

            <TooltipContent side="right">Sair do Sistema</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-zinc-500 hover:text-red-500"
          >
            <LogOut className="h-5 w-5" />

            <span>Sair do Sistema</span>
          </Button>
        )}
      </div>
    </aside>
  );
}
