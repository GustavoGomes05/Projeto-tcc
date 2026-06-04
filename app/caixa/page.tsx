"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Wallet,
  ArrowUpRight,
  TrendingUp,
  History,
  ArrowLeft,
  Loader2,
  Eye,
  ShoppingBag,
} from "lucide-react";

import {
  buscarUsuarioAtual,
  buscarTurnoAtivo,
  buscarHistoricoCaixa,
  abrirCaixa,
  fecharCaixa,
  carregarMetricasTurno,
} from "@/services/caixa.service";

import { Turno, TotaisMeios, MetricasTurno } from "@/types/caixa.types";

interface DetalhesCaixaAntigo extends MetricasTurno {
  id: string;
}

export default function Caixa() {
  const router = useRouter();

  const [turnoAtivo, setTurnoAtivo] = useState<Turno | null>(null);
  const [historicoTurnos, setHistoricoTurnos] = useState<Turno[]>([]);
  const [valorAberturaInput, setValorAberturaInput] = useState<string>("0.00");

  const [totais, setTotais] = useState<TotaisMeios>({
    Pix: 0,
    Dinheiro: 0,
    "Cartão de Crédito": 0,
    "Cartão de Débito": 0,
  });
  const [totalGeralVendido, setTotalGeralVendido] = useState<number>(0);
  const [lucroGeralTurno, setLucroGeralTurno] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Estados para o Modal de Detalhes do Caixa Antigo
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [loadingDetalhes, setLoadingDetalhes] = useState<boolean>(false);
  const [caixaSelecionado, setCaixaSelecionado] = useState<Turno | null>(null);
  const [detalhesSelecionado, setDetalhesSelecionado] =
    useState<DetalhesCaixaAntigo | null>(null);

  useEffect(() => {
    carregarDadosCaixa();
  }, []);

  async function carregarDadosCaixa() {
    setLoading(true);

    try {
      const user = await buscarUsuarioAtual();

      const turno = await buscarTurnoAtivo(user.id);

      setTurnoAtivo(turno);

      const historico = await buscarHistoricoCaixa(user.id);

      setHistoricoTurnos(historico);
      // Se houver um caixa aberto, calcula o painel financeiro dele imediatamente
      if (turno) {
        const metricas = await carregarMetricasTurno(turno.id);

        setTotais(metricas.meiosPagamento);
        setTotalGeralVendido(metricas.faturamentoGeral);
        setLucroGeralTurno(metricas.lucroGeral);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ativado ao clicar em "Ver Detalhes" de um caixa antigo
  async function visualizarDetalhesCaixa(turno: Turno) {
    setCaixaSelecionado(turno);
    setModalAberto(true);
    setLoadingDetalhes(true);

    try {
      const metricas = await carregarMetricasTurno(turno.id);

      setDetalhesSelecionado({
        id: turno.id,
        ...metricas,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetalhes(false);
    }
  }

  async function handleAbrirCaixa(e: React.FormEvent) {
    e.preventDefault();

    setActionLoading(true);

    try {
      const user = await buscarUsuarioAtual();

      await abrirCaixa(
        user.id,
        parseFloat(valorAberturaInput.replace(",", ".")) || 0,
      );

      await carregarDadosCaixa();
    } catch (err: any) {
      alert(`Erro ao abrir caixa: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleFecharCaixa() {
    if (!turnoAtivo) return;

    if (!confirm("Deseja encerrar o caixa e salvar o fechamento?")) {
      return;
    }

    setActionLoading(true);

    try {
      const valorFechamento =
        Number(turnoAtivo.valor_abertura) + totalGeralVendido;

      await fecharCaixa(turnoAtivo.id, valorFechamento);

      setTotais({
        Pix: 0,
        Dinheiro: 0,
        "Cartão de Crédito": 0,
        "Cartão de Débito": 0,
      });

      setTotalGeralVendido(0);
      setLucroGeralTurno(0);

      await carregarDadosCaixa();
    } catch (err: any) {
      alert(`Erro ao fechar o caixa: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading)
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center font-mono text-xs text-zinc-400 gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
        Sincronizando fluxo de caixa...
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-800 antialiased p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">
              Caixas
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Abertura, fechamento e faturamentos por meios de pagamento
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="text-xs text-zinc-500 hover:text-zinc-900 gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao início
          </Button>
        </header>

        {/* PAINEL CENTRAL (CAIXA ATUAL) */}
        <Card className="border-zinc-200/60 bg-white shadow-sm overflow-hidden">
          {!turnoAtivo ? (
            <CardContent className="max-w-sm mx-auto text-center space-y-5 py-12">
              <div className="space-y-1">
                <CardTitle className="text-base font-medium text-zinc-900">
                  Terminal Fechado
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Informe o valor de fundo ou troco inicial em dinheiro para
                  iniciar as vendas.
                </CardDescription>
              </div>
              <form onSubmit={handleAbrirCaixa} className="space-y-3">
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-mono text-xs text-zinc-400">
                    R$
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    value={valorAberturaInput}
                    onChange={(e) => setValorAberturaInput(e.target.value)}
                    className="text-center font-mono text-sm h-10 pl-8"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full text-xs font-medium h-10 uppercase tracking-wider"
                >
                  {actionLoading ? "Processando..." : "Abrir Caixa"}
                </Button>
              </form>
            </CardContent>
          ) : (
            <div className="divide-y divide-zinc-100">
              <div className="p-6 bg-zinc-50/50 flex justify-between items-center text-xs">
                <div className="space-y-0.5">
                  <div className="text-zinc-500 font-medium flex items-center gap-1.5">
                    Status:{" "}
                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                      Aberto
                    </span>
                  </div>
                  <p className="text-zinc-400 text-[11px]">
                    Iniciado às{" "}
                    {new Date(turnoAtivo.aberto_em).toLocaleTimeString("pt-BR")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-zinc-400">Troco Inicial</p>
                  <p className="font-mono text-sm font-semibold text-zinc-900">
                    R$ {Number(turnoAtivo.valor_abertura).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                  Faturamento por Meio de Pagamento
                </h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 font-mono text-xs">
                  {Object.entries(totais).map(([meio, valor]) => (
                    <div
                      key={meio}
                      className="py-2 flex justify-between items-center border-b border-zinc-100"
                    >
                      <span className="text-zinc-500 font-sans">{meio}</span>
                      <span className="text-zinc-900 font-medium">
                        R$ {valor.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 grid grid-cols-3 gap-4 font-mono text-center">
                <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-sm">
                  <span className="text-[10px] text-zinc-400 uppercase font-sans font-medium flex items-center justify-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-zinc-400" />{" "}
                    Faturamento
                  </span>
                  <span className="block text-base font-semibold text-zinc-900 mt-1">
                    R$ {totalGeralVendido.toFixed(2)}
                  </span>
                </div>

                <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-4 shadow-sm">
                  <span className="text-[10px] text-emerald-600 uppercase font-sans font-semibold flex items-center justify-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-500" /> Lucro
                    Real
                  </span>
                  <span className="block text-base font-bold text-emerald-600 mt-1">
                    R$ {lucroGeralTurno.toFixed(2)}
                  </span>
                </div>

                <div className="bg-zinc-900 border border-zinc-950 rounded-xl p-4 text-white shadow-sm">
                  <span className="text-[10px] text-zinc-400 uppercase font-sans font-medium flex items-center justify-center gap-1">
                    <Wallet className="w-3 h-3 text-zinc-400" /> Em Caixa
                  </span>
                  <span className="block text-base font-semibold text-white mt-1">
                    R${" "}
                    {(
                      Number(turnoAtivo.valor_abertura) + totalGeralVendido
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="p-6 bg-zinc-50/30">
                <Button
                  variant="outline"
                  onClick={handleFecharCaixa}
                  disabled={actionLoading}
                  className="w-full text-xs font-medium h-10 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 uppercase tracking-wider"
                >
                  {actionLoading ? "Encerrando..." : "Fechar Turno Atual"}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* HISTÓRICO DE FECHAMENTOS*/}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold tracking-wider text-zinc-400 uppercase flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" /> Histórico Recente de Fechamentos
          </h2>

          <Card className="border-zinc-200/60 bg-white shadow-sm overflow-hidden">
            <CardContent className="p-0 divide-y divide-zinc-100">
              {historicoTurnos.length === 0 ? (
                <p className="text-xs text-zinc-400 italic py-6 text-center">
                  Nenhum registro de fechamento anterior encontrado.
                </p>
              ) : (
                historicoTurnos.map((turno) => (
                  <div
                    key={turno.id}
                    className="p-4 flex items-center justify-between gap-4 text-xs font-mono text-zinc-600 hover:bg-zinc-50/50 transition-colors"
                  >
                    <div className="space-y-0.5 flex-1">
                      <p className="text-zinc-900 font-sans font-medium text-sm">
                        {new Date(turno.aberto_em).toLocaleDateString("pt-BR")}
                      </p>
                      {/* ID do Caixa adicionado aqui de forma sutil */}
                      <p className="text-[10px] text-zinc-400 select-all font-sans">
                        ID: {turno.id}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        Abertura: R$ {Number(turno.valor_abertura).toFixed(2)} |
                        Aberto em{" "}
                        {new Date(turno.aberto_em).toLocaleDateString("pt-BR")}{" "}
                        às{" "}
                        {new Date(turno.aberto_em).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        h
                        {/*Só tenta renderizar o bloco abaixo se o caixa possuir uma data de fechamento.*/}
                        {turno.fechado_em && (
                          <>
                            {" "}
                            | Encerrado em{" "}
                            {new Date(turno.fechado_em).toLocaleDateString(
                              "pt-BR",
                            )}{" "}
                            às{" "}
                            {new Date(turno.fechado_em).toLocaleTimeString(
                              "pt-BR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                            h
                          </>
                        )}
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      <p className="text-zinc-900 font-semibold text-sm">
                        Total: R$ {Number(turno.valor_fechamento).toFixed(2)}
                      </p>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => visualizarDetalhesCaixa(turno)}
                        className="h-6 text-[10px] gap-1 px-2 border-zinc-200 text-zinc-600 font-sans"
                      >
                        <Eye className="w-3 h-3" /> Ver Detalhes
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      {/* MODAL DETALHES DE CAIXAS ANTERIORES */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-md bg-white border border-zinc-200 shadow-lg p-6 rounded-xl antialiased">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-zinc-900">
              Auditoria de Turno Passado
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Detalhamento de movimentação e receitas brutas consolidadas.
            </DialogDescription>
          </DialogHeader>

          {loadingDetalhes || !detalhesSelecionado ? (
            <div className="py-12 flex flex-col items-center justify-center font-mono text-[11px] text-zinc-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Puxando registros de itens vendidos...
            </div>
          ) : (
            <div className="space-y-5 py-2 font-mono text-xs">
              <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100 flex justify-between text-[11px] font-sans">
                <span className="text-zinc-500">Data de Entrada:</span>
                <span className="text-zinc-900 font-medium">
                  {caixaSelecionado
                    ? new Date(caixaSelecionado.aberto_em).toLocaleDateString(
                        "pt-BR",
                      )
                    : ""}
                </span>
              </div>

              {/* MEIOS DO CAIXA SELECIONADO */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-sans font-semibold uppercase text-zinc-400 tracking-wider">
                  Entradas por meios de pagamento
                </h4>
                <div className="divide-y divide-zinc-100 border-y border-zinc-100">
                  {Object.entries(detalhesSelecionado.meiosPagamento).map(
                    ([meio, valor]) => (
                      <div key={meio} className="py-2 flex justify-between">
                        <span className="text-zinc-500 font-sans">{meio}</span>
                        <span className="text-zinc-900 font-medium">
                          R$ {valor.toFixed(2)}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* RESUMO DE RECEITAS DO CAIXA SELECIONADO */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-zinc-50/50 border border-zinc-200/60 p-3 rounded-xl">
                  <span className="text-[10px] font-sans text-zinc-400 font-medium flex items-center justify-center gap-1">
                    <ShoppingBag className="w-3 h-3" /> Itens Vendidos
                  </span>
                  <span className="block text-sm font-semibold text-zinc-900 mt-0.5">
                    {detalhesSelecionado.totalItens} un.
                  </span>
                </div>

                <div className="bg-emerald-50/30 border border-emerald-100/60 p-3 rounded-xl">
                  <span className="text-[10px] font-sans text-emerald-600 font-semibold flex items-center justify-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Lucro do Turno
                  </span>
                  <span className="block text-sm font-bold text-emerald-600 mt-0.5">
                    R$ {detalhesSelecionado.lucroGeral.toFixed(2)}
                  </span>
                </div>
              </div>

              <Separator className="bg-zinc-100" />

              <div className="flex justify-between items-center bg-zinc-900 text-zinc-50 p-3 rounded-xl text-sm font-semibold">
                <span className="font-sans font-medium text-xs text-zinc-400">
                  Total Acumulado em Caixa:
                </span>
                <span>
                  R${" "}
                  {(
                    Number(caixaSelecionado?.valor_abertura || 0) +
                    detalhesSelecionado.faturamentoGeral
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
