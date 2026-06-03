"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ShoppingBag,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Coins,
  Loader2,
  Search,
} from "lucide-react";

import {
  verificarCaixaAberto,
  buscarProdutosAtivos,
  criarVenda,
  inserirPagamentos,
  inserirItemVenda,
  finalizarVendaService
} from "@/services/vendas.service";
import {getCurrentUser} from "@/services/auth.service"

import {
  Produto,
  ItemVenda,
  ValoresPagamento,
} from "@/types/vendas.types";

export default function paginaInicial() {
  const router = useRouter();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produtoId, setProdutoId] = useState<string>("");
  const [quantidade, setQuantidade] = useState<number>(1);
  const [itens, setItens] = useState<ItemVenda[]>([]);

  // CORRIGIDO: Tipo alterado de ValuesPagamento para ValoresPagamento
  const [valoresPagamento, setValoresPagamento] = useState<ValoresPagamento>({
    Pix: 0,
    Dinheiro: 0,
    "Cartão de Crédito": 0,
    "Cartão de Débito": 0,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [caixaAberto, setCaixaAberto] = useState<boolean>(false);
  const [caixaId, setCaixaId] = useState<string | null>(null);
  const [status, setStatus] = useState({ erro: false, texto: "" });

  //barra pesquisa
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const focusQuantidade = useRef<HTMLInputElement>(null);
  const focusBarra = useRef<HTMLInputElement>(null);

  const produtosFiltrados = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    async function inicializarCaixa() {
      setLoading(true);
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data: turno } =  await verificarCaixaAberto(user.id);
          

        if (!turno) {
          setCaixaAberto(false);
          setLoading(false);
          return;
        }

        setCaixaId(turno.id);
        setCaixaAberto(true);

        // ALTERADO: Adicionado .eq("ativo", true) para listar apenas produtos ativos
      const { data: prods } =
      await buscarProdutosAtivos();
        if (prods) setProdutos(prods as Produto[]);
      } catch (err) {
        console.error(err);
      } finally {
        loading && setLoading(false);
      }
    }
    inicializarCaixa();
  }, [router]);

  function adicionarItem(e: React.FormEvent) {
    e.preventDefault();
    if (!caixaAberto) return;
    setStatus({ erro: false, texto: "" });

    if (!produtoId) return;
    const produto = produtos.find((p) => p.id === produtoId);
    if (!produto) return;

    const itemExistente = itens.find((item) => item.produto.id === produtoId);
    const qtdTotal =
      (itemExistente ? itemExistente.quantidade : 0) + quantidade;

    if (qtdTotal > produto.estoque) {
      setStatus({
        erro: true,
        texto: `Estoque insuficiente (${produto.estoque} disponíveis)`,
      });
      return;
    }

    const novosItens = itemExistente
      ? itens.map((item) =>
          item.produto.id === produtoId
            ? {
                ...item,
                quantidade: qtdTotal,
                subtotal: qtdTotal * produto.preco,
              }
            : item,
        )
      : [
          ...itens,
          { produto, quantidade, subtotal: quantidade * produto.preco },
        ];

    setItens(novosItens);
    setProdutoId("");
    setQuantidade(1);
    setSearch("");
    // ao adicionar um item foca na barra de pesquisa para uma nova pesquisa
    setTimeout(() => {
      focusBarra.current?.focus();
    }, 50);
  }

  function removerItem(id: string) {
    const novosItens = itens.filter((item) => item.produto.id !== id);
    setItens(novosItens);
  }

  const valorTotal = itens.reduce((acc, item) => acc + item.subtotal, 0);

  const totalInformado = Object.values(valoresPagamento).reduce(
    (acc, curr) => acc + curr,
    0,
  );

  function handleMudarValorMeio(meio: keyof ValoresPagamento, valor: string) {
    setValoresPagamento({
      ...valoresPagamento,
      [meio]: parseFloat(valor) || 0,
    });
  }

  async function finalizarVenda() {
  if (itens.length === 0 || !caixaAberto || !caixaId) {
    return;
  }

  if (totalInformado.toFixed(2) !== valorTotal.toFixed(2)) {
    setStatus({
      erro: true,
      texto: `A soma informada (R$ ${totalInformado.toFixed(2)}) não confere com o total da venda (R$ ${valorTotal.toFixed(2)})`,
    });

    return;
  }

  try {
    setLoading(true);

    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Sessão expirada.");
    }

    await finalizarVendaService({
      userId: user.id,
      caixaId,
      valorTotal,
      itens,
      valoresPagamento,
    });

    setStatus({
      erro: false,
      texto: "Venda concluída com sucesso!",
    });

    setItens([]);

    setValoresPagamento({
      Pix: 0,
      Dinheiro: 0,
      "Cartão de Crédito": 0,
      "Cartão de Débito": 0,
    });

    const { data } =
      await buscarProdutosAtivos();

    if (data) {
      setProdutos(data);
    }
  } catch (err: any) {
    setStatus({
      erro: true,
      texto: err.message,
    });
  } finally {
    setLoading(false);
  }
}

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col gap-2 items-center justify-center font-mono text-xs text-zinc-500">
        <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
        Validando credenciais do terminal...
      </div>
    );
  }

  if (!caixaAberto) {
    return (
      <div className="min-h-screen bg-zinc-50/50 flex flex-col items-center justify-center p-6 text-center antialiased">
        <Card className="max-w-md border-zinc-200 shadow-sm bg-white">
          <CardHeader className="space-y-2">
            <div className="flex justify-center">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-sm">
                Vendas Bloqueadas
              </span>
            </div>
            <CardTitle className="text-lg font-semibold text-zinc-900 tracking-tight">
              O Caixa está Fechado
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Não é possível realizar vendas no momento. Vá ao painel de
              gerenciamento para iniciar um novo turno.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center pt-2">
            <Button
              size="sm"
              variant="default"
              className="bg-zinc-900 hover:bg-zinc-800 text-xs font-medium"
              onClick={() => router.push("/caixa")}
            >
              Abrir Caixa Agora
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const estaAjustado = totalInformado.toFixed(2) === valorTotal.toFixed(2);
  const ehMenor = totalInformado < valorTotal;

  return (
    <div className="min-h-screen bg-zinc-50/50 text-zinc-900 antialiased p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* HEADER DO CAIXA */}
        <div className="flex justify-between items-center border-b border-zinc-200 pb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase font-mono">
              Frente de Caixa Ativo
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1.5"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar ao painel
          </Button>
        </div>

        {/* FEEDBACK STATUS */}
        {status.texto && (
          <Alert
            variant={status.erro ? "destructive" : "default"}
            className={
              !status.erro
                ? "border-emerald-200 bg-emerald-50/50 text-emerald-800"
                : ""
            }
          >
            {status.erro ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            )}
            <AlertTitle className="text-xs font-semibold">
              {status.erro ? "Atenção" : "Sucesso"}
            </AlertTitle>
            <AlertDescription className="text-xs font-mono">
              {status.texto}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* COLUNA ESQUERDA: LANÇAMENTO E ITENS */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-zinc-200 bg-white shadow-xs overflow-visible">
              <CardHeader className="pb-4">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Lançamento de Mercadoria
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-visible">
                <form
                  onSubmit={adicionarItem}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  {/* PESQUISA DE PRODUTOS */}
                  <div className="relative flex-1">
                    {/* INPUT */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 z-10" />
                      <Input
                        ref={focusBarra}
                        placeholder="Pesquisar produto..."
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setDropdownOpen(true);
                        }}
                        onFocus={() => setDropdownOpen(true)}
                        onBlur={() =>
                          setTimeout(() => setDropdownOpen(false), 200)
                        }
                        className="pl-9 h-9 text-xs border-zinc-200"
                      />
                    </div>

                    {/* DROPDOWN DE RESULTADOS */}
                    {dropdownOpen && (
                      <div className="absolute left-0 top-full z-[9999] mt-2 w-full rounded-xl border border-zinc-200 bg-white shadow-2xl max-h-60 overflow-y-auto">
                        {/* SEM RESULTADOS */}
                        {produtosFiltrados.length === 0 ? (
                          <p className="p-4 text-sm text-zinc-400 font-mono">
                            Nenhum produto encontrado
                          </p>
                        ) : (
                          produtosFiltrados.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              disabled={p.estoque <= 0}
                              onClick={() => {
                                setProdutoId(p.id);
                                setSearch(p.nome);
                                setDropdownOpen(false);
                                setTimeout(() => {
                                  focusQuantidade.current?.focus();
                                }, 50);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-zinc-50 border-b border-zinc-100 last:border-0 disabled:opacity-40 transition"
                            >
                              <div className="flex items-center justify-between gap-4">
                                {/* ESQUERDA: NOME E ESTOQUE */}
                                <div className="flex flex-col">
                                  <p className="text-sm font-semibold text-zinc-900">
                                    {p.nome}
                                  </p>
                                  <p className="text-xs text-zinc-400 mt-1">
                                    Estoque: {p.estoque}
                                  </p>
                                </div>

                                {/* DIREITA: PREÇO */}
                                <span className="text-sm font-mono text-zinc-700 whitespace-nowrap">
                                  R$ {Number(p.preco || 0).toFixed(2)}
                                </span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* QUANTIDADE E BOTÃO INCLUIR */}
                  <div className="flex gap-2 items-center">
                    <Input
                      ref={focusQuantidade}
                      type="number"
                      min="1"
                      value={quantidade}
                      onChange={(e) =>
                        setQuantidade(parseInt(e.target.value) || 1)
                      }
                      onFocus={(e) => e.target.select()}
                      className="w-16 h-9 text-center text-xs border-zinc-200 font-mono"
                      placeholder="Qtd"
                    />

                    <Button
                      type="submit"
                      size="sm"
                      className="bg-zinc-900 hover:bg-zinc-800 h-9 text-xs font-medium px-4 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Incluir
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* LISTA DE ITENS DA VENDA */}
            <Card className="border-zinc-200 bg-white shadow-xs">
              <CardHeader className="pb-2 border-b border-zinc-100 bg-zinc-50/50 py-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Carrinho de Compras
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {itens.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic text-center py-10 font-mono">
                    Nenhum produto listado ainda.
                  </p>
                ) : (
                  <div className="divide-y divide-zinc-100 max-h-[320px] overflow-y-auto">
                    {itens.map((item) => (
                      <div
                        key={item.produto.id}
                        className="flex justify-between items-center text-xs p-4 hover:bg-zinc-50/30 transition-colors"
                      >
                        <div className="space-y-0.5 pr-4 flex-1">
                          <p className="font-medium text-zinc-900">
                            {item.produto.nome}
                          </p>
                          <p className="text-[11px] text-zinc-400 font-mono">
                            {item.quantidade}x R${" "}
                            {Number(item.produto.preco).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-mono font-semibold text-zinc-900">
                            R$ {item.subtotal.toFixed(2)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-zinc-300 hover:text-rose-600 hover:bg-rose-50"
                            onClick={() => removerItem(item.produto.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* COLUNA DIREITA: PAGAMENTO E CONCLUSÃO */}
          <div className="space-y-6">
            <Card className="border-zinc-200 bg-white shadow-xs overflow-hidden">
              <CardHeader className="pb-4 border-b border-zinc-100 bg-zinc-50/50 py-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-zinc-400" />
                  Divisão de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {Object.keys(valoresPagamento).map((meio) => (
                  <div key={meio} className="flex flex-col space-y-1">
                    <label className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                      {meio}
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-2.5 text-xs font-mono text-zinc-400">
                        R$
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={
                          valoresPagamento[meio as keyof ValoresPagamento] || ""
                        }
                        onChange={(e) =>
                          handleMudarValorMeio(
                            meio as keyof ValoresPagamento,
                            e.target.value,
                          )
                        }
                        className="h-8 pl-8 text-xs font-mono border-zinc-200"
                      />
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t border-zinc-100 space-y-2">
                  <div className="flex justify-between text-[11px] font-mono text-zinc-500">
                    <span>Total Informado:</span>
                    <span>R$ {totalInformado.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-[11px] font-mono text-zinc-500">
                    <span>
                      {ehMenor
                        ? "Falta / Restante:"
                        : totalInformado > valorTotal
                          ? "Troco / Excedente:"
                          : "Diferença:"}
                    </span>
                    <span
                      className={`font-semibold ${estaAjustado ? "text-emerald-600" : ehMenor ? "text-rose-600" : "text-blue-600"}`}
                    >
                      {ehMenor ? "- " : totalInformado > valorTotal ? "+ " : ""}
                      R$ {Math.abs(valorTotal - totalInformado).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>

              <div className="bg-zinc-900 text-white p-4 text-center space-y-1">
                <p className="text-[10px] tracking-widest text-zinc-400 uppercase">
                  Total da Venda
                </p>
                <p className="text-2xl font-semibold font-mono tracking-tight">
                  R$ {valorTotal.toFixed(2)}
                </p>
              </div>

              <CardFooter className="p-4 bg-zinc-50 border-t border-zinc-100">
                <Button
                  onClick={finalizarVenda}
                  disabled={loading || itens.length === 0 || !estaAjustado}
                  className="w-full text-xs font-semibold uppercase tracking-wider bg-zinc-900 hover:bg-zinc-800 text-white disabled:opacity-40"
                >
                  {!estaAjustado && itens.length > 0
                    ? "Ajuste os valores"
                    : "Concluir Venda"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
