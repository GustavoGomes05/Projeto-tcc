"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { format, subDays, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

import { carregarDashboard } from "@/services/dashboard.service";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
// Importações para o Gráfico do Shadcn UI
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import {
  TrendingUp,
  DollarSign,
  Package,
  Loader2,
  BarChart3,
  ShoppingBag,
  Calendar as CalendarIcon,
} from "lucide-react";
import { DadosGrafico, MetricasPeriodo, ProdutoMaisVendido } from "@/types/dashboard.types";



const chartConfig = {
  faturamento: {
    label: "Faturamento",
    color: "currentColor",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [periodoSelecionado, setPeriodoSelecionado] = useState<string>("hoje");

  const [isModalAberto, setIsModalAberto] = useState<boolean>(false);
  const [dataInicioTmp, setDataInicioTmp] = useState<Date | undefined>(
    undefined,
  );
  const [dataFimTmp, setDataFimTmp] = useState<Date | undefined>(undefined);

  const [popoverInicioAberto, setPopoverInicioAberto] =
    useState<boolean>(false);
  const [popoverFimAberto, setPopoverFimAberto] = useState<boolean>(false);

  const [date, setDate] = useState<DateRange | undefined>(undefined);

  const [metricas, setMetricas] = useState<MetricasPeriodo>({
    faturamento: 0,
    lucro: 0,
    totalItensVendidos: 0,
  });

  const [produtosMaisVendidos, setProdutosMaisVendidos] = useState<
    ProdutoMaisVendido[]
  >([]);

  const [dadosGrafico, setDadosGrafico] = useState<DadosGrafico[]>([]);

 useEffect(() => {
  if (
    periodoSelecionado === "customizado" &&
    !date?.from
  ) {
    return;
  }

  carregarDadosDashboard();
}, [periodoSelecionado, date]);

  async function carregarDadosDashboard() {
  setLoading(true);

  try {
    const resultado = await carregarDashboard(
      periodoSelecionado,
      date
    );

    setMetricas(resultado.metricas);
    setProdutosMaisVendidos(
      resultado.produtosMaisVendidos
    );
    setDadosGrafico(resultado.dadosGrafico);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
}

  function aplicarFiltroPersonalizado() {
    if (dataInicioTmp) {
      setDate({
        from: dataInicioTmp,
        to: dataFimTmp || dataInicioTmp,
      });
      setIsModalAberto(false);
    }
  }

  const labelPeriodo =
    periodoSelecionado === "hoje"
      ? "apurado hoje"
      : periodoSelecionado === "customizado"
        ? date?.from
          ? `de ${format(date.from, "dd/MM/yyyy")} até ${date.to ? format(date.to, "dd/MM/yyyy") : format(date.from, "dd/MM/yyyy")}`
          : "Selecione o intervalo de datas"
        : `total dos últimos ${periodoSelecionado} dias`;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col gap-2 items-center justify-center font-mono text-xs text-zinc-500">
        <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
        Processando dados de vendas...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 p-6 md:p-10 text-zinc-950 antialiased">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
              Dashboard de Performance
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Visão consolidada de vendas, lucratividade e movimentação de
              mercadorias.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
            {periodoSelecionado === "customizado" && (
              <div className="animate-in fade-in duration-200">
                <Button
                  variant="outline"
                  onClick={() => setIsModalAberto(true)}
                  className={cn(
                    "w-[230px] h-8 justify-start text-left font-normal text-xs bg-white border-zinc-200 shadow-sm hover:bg-zinc-50",
                    !date && "text-zinc-500",
                  )}
                >
                  <CalendarIcon className="mr-2 h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate">
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "dd/MM/yyyy")} -{" "}
                          {format(date.to, "dd/MM/yyyy")}
                        </>
                      ) : (
                        `${format(date.from, "dd/MM/yyyy")} ...`
                      )
                    ) : (
                      <span>Clique para escolher as datas</span>
                    )}
                  </span>
                </Button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-400 font-medium whitespace-nowrap">
                Filtrar período:
              </label>
              <Select
                value={periodoSelecionado}
                onValueChange={(val) => {
                  setPeriodoSelecionado(val);
                  if (val === "customizado") {
                    setDate(undefined);
                    setDataInicioTmp(undefined);
                    setDataFimTmp(undefined);
                    setIsModalAberto(true);
                  } else {
                    setDate(undefined);
                  }
                }}
              >
                <SelectTrigger className="w-[160px] bg-white h-8 text-xs border-zinc-200 shadow-sm">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="customizado">Personalizado...</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* MODAL DE SELEÇÃO DE DATAS */}
        <Dialog open={isModalAberto} onOpenChange={setIsModalAberto}>
          <DialogContent className="sm:max-w-[360px] bg-white p-6">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold text-zinc-900">
                Filtrar Período Personalizado
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4 my-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                  Data Inicial
                </label>
                <Popover
                  open={popoverInicioAberto}
                  onOpenChange={setPopoverInicioAberto}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-9 justify-start text-left text-xs bg-white border-zinc-200",
                        !dataInicioTmp && "text-zinc-400",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5 text-zinc-400" />
                      {dataInicioTmp
                        ? format(dataInicioTmp, "dd/MM/yyyy")
                        : "Selecione a data inicial"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dataInicioTmp}
                      onSelect={(novaData) => {
                        setDataInicioTmp(novaData);
                        setPopoverInicioAberto(false);
                      }}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                  Data Final
                </label>
                <Popover
                  open={popoverFimAberto}
                  onOpenChange={setPopoverFimAberto}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-9 justify-start text-left text-xs bg-white border-zinc-200",
                        !dataFimTmp && "text-zinc-400",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5 text-zinc-400" />
                      {dataFimTmp
                        ? format(dataFimTmp, "dd/MM/yyyy")
                        : "Selecione a data final"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dataFimTmp}
                      onSelect={(novaData) => {
                        setDataFimTmp(novaData);
                        setPopoverFimAberto(false);
                      }}
                      disabled={(date) =>
                        dataInicioTmp ? date < dataInicioTmp : false
                      }
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <DialogFooter className="mt-2">
              <Button
                size="sm"
                className="w-full h-8 text-xs bg-zinc-900 text-white hover:bg-zinc-800"
                disabled={!dataInicioTmp}
                onClick={aplicarFiltroPersonalizado}
              >
                Aplicar Filtro
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Card className="border-zinc-200/80 bg-white shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div className="space-y-0.5">
                <CardTitle className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                  Faturamento Total
                </CardTitle>
                <CardDescription className="text-[10px] text-zinc-400">
                  {labelPeriodo}
                </CardDescription>
              </div>
              <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold font-mono tracking-tight text-zinc-900">
                R${" "}
                {metricas.faturamento.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200/80 bg-white shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div className="space-y-0.5">
                <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
                  Lucro Estimado
                </CardTitle>
                <CardDescription className="text-[10px] text-zinc-400">
                  Baseado no valor bruto das vendas
                </CardDescription>
              </div>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold font-mono tracking-tight text-emerald-600">
                R${" "}
                {metricas.lucro.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200/80 bg-white shadow-xs sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div className="space-y-0.5">
                <CardTitle className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  Mercadorias Vendidas
                </CardTitle>
                <CardDescription className="text-[10px] text-zinc-400">
                  Volume total de saídas
                </CardDescription>
              </div>
              <ShoppingBag className="w-3.5 h-3.5 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold font-mono tracking-tight text-zinc-900">
                {metricas.totalItensVendidos}{" "}
                <span className="text-xs font-sans text-zinc-400">
                  unidades
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* GRÁFICO DE FATURAMENTO DOS ÚLTIMOS 7 DIAS */}
        <Card className="border-zinc-200/80 bg-white shadow-xs">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-zinc-900">
              Evolução do Faturamento
            </CardTitle>
            <CardDescription className="text-[11px] text-zinc-400">
              Valores diários obtidos nos últimos 7 dias cronológicos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dadosGrafico}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }} // Margens limpas e centralizadas
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f4f4f5"
                    />
                    <XAxis
                      dataKey="diaSemana"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      className="text-[10px] font-sans fill-zinc-400"
                    />
                    {/* YAxis foi removido daqui para ocultar os números da esquerda */}
                    <ChartTooltip
                      cursor={{ fill: "#fafafa" }}
                      content={
                        <ChartTooltipContent
                          labelClassName="text-zinc-500 font-sans text-[11px]"
                          className="bg-white border border-zinc-200 shadow-sm font-mono text-[11px]"
                        />
                      }
                    />
                    <Bar
                      dataKey="faturamento"
                      fill="var(--color-faturamento)"
                      className="fill-zinc-950"
                      radius={[4, 4, 0, 0]}
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* RANKING DE ITENS */}
        <Card className="border-zinc-200/80 bg-white shadow-xs overflow-hidden">
          <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 pb-4">
            <CardTitle className="text-sm font-medium text-zinc-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-zinc-400" />
              Ranking de Saídas (
              {periodoSelecionado === "hoje"
                ? "Hoje"
                : periodoSelecionado === "customizado"
                  ? "Personalizado"
                  : `${periodoSelecionado} dias`}
              )
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50 text-zinc-500 font-medium border-b border-zinc-100 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4 text-center w-[70px]">Pos.</th>
                    <th className="p-4">Produto</th>
                    <th className="p-4 text-center w-[130px]">Qtd. Vendida</th>
                    <th className="p-4 text-right w-[150px]">Faturamento</th>
                    <th className="p-4 text-right w-[150px]">Lucro Gerado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {produtosMaisVendidos.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center p-12 text-zinc-400 font-mono text-[11px]"
                      >
                        Nenhuma movimentação de produto para o período
                        selecionado.
                      </td>
                    </tr>
                  ) : (
                    produtosMaisVendidos.map((prod, index) => (
                      <tr
                        key={prod.id}
                        className="hover:bg-zinc-50/50 transition-colors"
                      >
                        <td className="p-4 text-center font-mono font-medium text-zinc-400">
                          {String(index + 1).padStart(2, "0")}
                        </td>
                        <td className="p-4 font-medium text-zinc-900">
                          <div className="flex items-center gap-2">
                            <Package className="w-3.5 h-3.5 text-zinc-300" />
                            {prod.nome}
                          </div>
                        </td>
                        <td className="p-4 text-center font-mono text-zinc-600">
                          {prod.quantidade_vendida} un.
                        </td>
                        <td className="p-4 text-right font-mono text-zinc-600">
                          R${" "}
                          {prod.total_faturado.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-4 text-right font-mono font-semibold text-emerald-600">
                          R${" "}
                          {prod.lucro_gerado.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
