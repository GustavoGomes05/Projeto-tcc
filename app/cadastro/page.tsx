"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cadastrarUsuario } from "@/services/auth.service";

export default function CadastroPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
 
 async function handleCadastro(e: React.FormEvent) {
  e.preventDefault();  // Impede o recarregamento total da página

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
      text:
        error instanceof Error
          ? error.message
          : "Erro ao criar conta.",
    });
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Criar Nova Conta
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Tenha acesso ao gerenciador de produtos e vendas.
        </p>

        {message.text && (
          <div
            className={`p-3 rounded-lg text-sm mb-4 border ${
              message.type === "error"
                ? "bg-red-50 text-red-600 border-red-100"
                : "bg-green-50 text-green-600 border-green-100"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleCadastro} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Seu Nome
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: João Silva"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition-all text-sm disabled:opacity-50"
          >
            {loading ? "Criando conta..." : "Cadastrar"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Faça login
          </Link>
        </div>
      </div>
    </div>
  );
}
