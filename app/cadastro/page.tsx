"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cadastrarUsuario } from "@/services/auth.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CadastroPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault(); // Impede o recarregamento total da página

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const data = await cadastrarUsuario({
        nome,
        email,
        password,
      });
      // Se o email de confirmação estiver ativo no painel ele cria o user mas não gera sessão imediata
      if (data.user && !data.session) {
        setMessage({
          type: "success",
          text: "Conta criada! Verifique seu e-mail para confirmar o cadastro.",
        });
      } else {
        setMessage({
          type: "success",
          text: "Conta criada com sucesso!",
        });
      }
      // Resetando o formulario apos o sucesso
      setNome("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Erro ao criar conta.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 antialiased">
      <div className="max-w-sm w-full bg-white rounded-xl border border-gray-100 shadow-sm p-8 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-medium text-gray-900 tracking-tight">
            Criar Nova Conta
          </h2>
        </div>

        {message.text && (
          <div
            className={`p-3 rounded-lg text-xs font-mono border ${
              message.type === "error"
                ? "bg-red-50/50 text-red-600 border-red-100"
                : "bg-green-50/50 text-green-600 border-green-100"
            }`}
          >
            * {message.text}
          </div>
        )}

        <form onSubmit={handleCadastro} className="space-y-4">
          <div>
            <label className="block text-[11px] text-gray-400 mb-1">
              Seu Nome
            </label>
            <Input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: João Silva"
              className="h-9 bg-zinc-50/50 border-zinc-200 focus-visible:ring-zinc-400 text-sm"
            />
          </div>

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
              placeholder="Mínimo 6 caracteres"
              className="h-9 bg-zinc-50/50 border-zinc-200 focus-visible:ring-zinc-400 text-sm"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-medium h-10 text-xs uppercase tracking-wider transition-colors"
          >
            {loading ? "Criando conta..." : "Cadastrar"}
          </Button>
        </form>

        <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-50">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="text-gray-900 hover:underline font-medium"
          >
            Faça login
          </Link>
        </div>
      </div>
    </div>
  );
}
