import { supabase } from "@/lib/supabase";
import { format, subDays, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import {
  DashboardData,
  ProdutoMaisVendido,
} from "@/types/dashboard.types";

//pegando a data e fazendo os calculos dos relatorios 
export async function carregarDashboard(
  periodoSelecionado: string,
  date?: {
    from?: Date;
    to?: Date;
  }
): Promise<DashboardData> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  let dataInicioISO = "";
  let dataFimISO = new Date().toISOString();

  if (periodoSelecionado === "hoje") {
    const dataLimite = new Date();
    dataLimite.setHours(0, 0, 0, 0);
    dataInicioISO = dataLimite.toISOString();
  }

  if (periodoSelecionado === "7") {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 6);
    dataLimite.setHours(0, 0, 0, 0);
    dataInicioISO = dataLimite.toISOString();
  }

  if (periodoSelecionado === "30") {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 29);
    dataLimite.setHours(0, 0, 0, 0);
    dataInicioISO = dataLimite.toISOString();
  }

  if (periodoSelecionado === "customizado") {
    if (!date?.from) {
      throw new Error("Data inicial obrigatória");
    }

    const dInicio = new Date(date.from);
    dInicio.setHours(0, 0, 0, 0);
    // Se o utilizador não escolheu uma data final, assume que ele quer ver só o dia inicial
    const dFim = date.to
      ? new Date(date.to)
      : new Date(date.from);

    dFim.setHours(23, 59, 59, 999);

    dataInicioISO = dInicio.toISOString();
    dataFimISO = dFim.toISOString();
  }
  //pegando todos os itens vendidos no periodo
  const { data: itensVenda, error } = await supabase
    .from("itens_venda")
    .select(`
      quantidade,
      preco_unitario,
      preco_custo,
      vendas:venda_id!inner(criado_em, user_id),
      produtos:produto_id(id,nome)
    `)
    .eq("vendas.user_id", user.id)
    .gte("vendas.criado_em", dataInicioISO)
    .lte("vendas.criado_em", dataFimISO);

  if (error) {
    throw error;
  }

  let faturamento = 0;
  let lucro = 0;
  let totalItensVendidos = 0;

  const mapaProdutos: Record<
    string,
    ProdutoMaisVendido
  > = {};
//Cria uma lista vazia com os ultimos 7 dias da semana
  const ultimos7Dias = Array.from({ length: 7 }).map(
    (_, i) => {
      const dataDia = subDays(new Date(), 6 - i);

      return {
        dataOriginal: dataDia,
        diaSemana: format(dataDia, "eeee", {
          locale: ptBR,
        }),
        faturamento: 0,
      };
    }
  );
//Analisa item por item que foi vendido
  itensVenda?.forEach((item: any) => {
    const produto = item.produtos;

    if (!produto) return;

    const qtd = Number(item.quantidade);
    const precoUnitario = Number(item.preco_unitario);
    const precoCusto = Number(item.preco_custo);

    const subtotal = qtd * precoUnitario;
    const lucroItem =
      (precoUnitario - precoCusto) * qtd;

    faturamento += subtotal;
    lucro += lucroItem;
    totalItensVendidos += qtd;
    //vendo o dia exato que o item foi vendido 
    const dataVenda = parseISO(
      item.vendas.criado_em
    );
    //verificando se esse dia bate com a data dos ultimos 7 dias 
    const dia = ultimos7Dias.find((d) =>
      isSameDay(d.dataOriginal, dataVenda)
    );

    if (dia) {
      dia.faturamento += subtotal;
    }
  //agrupa as quantidades por produto para sabermos qual vendeu mais
    if (!mapaProdutos[produto.id]) {
      //se é a primeira vez que esse produto aparece na varredura, cria o registro dele
      mapaProdutos[produto.id] = {
        id: produto.id,
        nome: produto.nome,
        quantidade_vendida: 0,
        total_faturado: 0,
        lucro_gerado: 0,
      };
    }
  //soma os novos valores ao produto que já estava guardado
    mapaProdutos[produto.id].quantidade_vendida += qtd;
    mapaProdutos[produto.id].total_faturado += subtotal;
    mapaProdutos[produto.id].lucro_gerado += lucroItem;
  });

  const dadosGrafico = ultimos7Dias.map((d) => ({
    diaSemana:
      d.diaSemana.charAt(0).toUpperCase() +
      d.diaSemana.slice(1),
    faturamento: Number(d.faturamento.toFixed(2)),
  }));

  const produtosMaisVendidos = Object.values(
    mapaProdutos
  )
    .sort(
      (a, b) =>
        b.quantidade_vendida - a.quantidade_vendida
    )
    .slice(0, 5);

  return {
    metricas: {
      faturamento,
      lucro,
      totalItensVendidos,
    },
    produtosMaisVendidos,
    dadosGrafico,
  };
}