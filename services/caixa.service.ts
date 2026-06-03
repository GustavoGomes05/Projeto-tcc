import { supabase } from "@/lib/supabase";
import { Turno, TotaisMeios } from "@/types/caixa.types";

//verificando se tem um usuario logado 
export async function buscarUsuarioAtual() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  return user;
}
//verificando se tem um caixa aberto
export async function buscarTurnoAtivo(
  userId: string,
): Promise<Turno | null> {
  const { data, error } = await supabase
    .from("caixa")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "aberto")
    .maybeSingle();

  if (error) throw error;

  return data;
}
//buscando os ultimos caixas 
export async function buscarHistoricoCaixa(
  userId: string,
): Promise<Turno[]> {
  const { data, error } = await supabase
    .from("caixa")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "fechado")
    .order("fechado_em", { ascending: false })
    .limit(10);

  if (error) throw error;

  return data || [];
}

export async function abrirCaixa(
  userId: string,
  valorAbertura: number,
) {
  const { error } = await supabase
    .from("caixa")
    .insert([
      {
        user_id: userId,
        valor_abertura: valorAbertura,
        status: "aberto",
      },
    ]);

  if (error) throw error;
}

export async function fecharCaixa(
  caixaId: string,
  valorFechamento: number,
) {
  const { error } = await supabase
    .from("caixa")
    .update({
      status: "fechado",
      valor_fechamento: valorFechamento,
      fechado_em: new Date().toISOString(),
    })
    .eq("id", caixaId);

  if (error) throw error;
}


 //Calcula em tempo real o faturamento, custos, lucros e meios de pagamento do turno.
 
export async function carregarMetricasTurno(
  caixaId: string,
) {
  let totalItens = 0;
  //Consulta Relacional: Busca o total da venda e desce até os itens para pegar o preço de custo original
  const { data: vendas, error: erroVendas } =
    await supabase
      .from("vendas")
      .select(`
        total,
        itens_venda(
          quantidade,
          preco_custo
        )
      `)
      .eq("caixa_id", caixaId);

  if (erroVendas) throw erroVendas;

  const meiosPagamento: TotaisMeios = {
    Pix: 0,
    Dinheiro: 0,
    "Cartão de Crédito": 0,
    "Cartão de Débito": 0,
  };

  let faturamentoGeral = 0;
  let custoTotal = 0;
    // Processa as margens de lucro de cada item vendido no turno
  vendas?.forEach((venda: any) => {
    faturamentoGeral += Number(venda.total || 0);

    venda.itens_venda?.forEach((item: any) => {
      const qtd = Number(item.quantidade || 0);
      const custo = Number(item.preco_custo || 0);

      totalItens += qtd;
      custoTotal += qtd * custo;
    });
  });

  const { data: pagamentos, error: erroPagamentos } =
    await supabase
      .from("vendas")
      .select(`
        pagamentos_venda(
          forma_pagamento,
          valor
        )
      `)
      .eq("caixa_id", caixaId);

  if (erroPagamentos) throw erroPagamentos;
// Agrupa os valores financeiros por suas respectivas chaves (Pix, Dinheiro, etc)
  pagamentos?.forEach((venda: any) => {
    venda.pagamentos_venda?.forEach((pagamento: any) => {
      const forma =
        pagamento.forma_pagamento as keyof TotaisMeios;

      if (forma in meiosPagamento) {
        meiosPagamento[forma] += Number(
          pagamento.valor || 0,
        );
      }
    });
  });
/// Lucro Real Líquido (Faturamento - Custo dos Produtos Vendidos)
  const lucroGeral = Math.max(
    faturamentoGeral - custoTotal,
    0,
  );

  return {
    faturamentoGeral,
    lucroGeral,
    totalItens,
    meiosPagamento,
  };
}