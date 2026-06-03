import { supabase } from "@/lib/supabase";
import { Produto, FinalizarVendaParams  } from "@/types/vendas.types";


export async function verificarCaixaAberto(userId: string) {
  return await supabase
    .from("caixa")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "aberto")
    .maybeSingle();
}

export async function buscarProdutosAtivos() {
  return await supabase
    .from("produtos")
    .select("id, nome, preco, estoque, preco_custo")
    .eq("ativo", true)
    .order("nome", { ascending: true });
}

export async function criarVenda(
  userId: string,
  caixaId: string,
  total: number
) {
  return await supabase
    .from("vendas")
    .insert([
      {
        user_id: userId,
        caixa_id: caixaId,
        total,
      },
    ])
    .select()
    .single();
}

export async function inserirPagamentos(
  vendaId: string,
  pagamentos: {
    forma_pagamento: string;
    valor: number;
  }[]
) {
  return await supabase
    .from("pagamentos_venda")
    .insert(
      pagamentos.map((p) => ({
        venda_id: vendaId,
        ...p,
      }))
    );
}

export async function inserirItemVenda(
  vendaId: string,
  item: {
    produto_id: string;
    quantidade: number;
    preco_unitario: number;
    preco_custo: number;
  }
) {
  return await supabase
    .from("itens_venda")
    .insert([
      {
        venda_id: vendaId,
        ...item,
      },
    ]);
}


export async function finalizarVendaService({
  userId,
  caixaId,
  valorTotal,
  itens,
  valoresPagamento,
}: FinalizarVendaParams) {
  const { data: turno } =
    await verificarCaixaAberto(userId);

  if (!turno) {
    throw new Error(
      "Operação bloqueada: O caixa foi fechado."
    );
  }

  const { data: venda, error: vendaError } =
    await criarVenda(
      userId,
      caixaId,
      valorTotal
    );

  if (vendaError) throw vendaError;

     const pagamentos = Object.entries(valoresPagamento)
  .filter(([_, valor]) => Number(valor) > 0)
  .map(([forma, valor]) => ({
    forma_pagamento: forma,
    valor: Number(valor),
  }));

  const { error: pagamentoError } =
    await inserirPagamentos(
      venda.id,
      pagamentos
    );

  if (pagamentoError) throw pagamentoError;

  for (const item of itens) {
    const { error } =
      await inserirItemVenda(
        venda.id,
        {
          produto_id: item.produto.id,
          quantidade: item.quantidade,
          preco_unitario: item.produto.preco,
          preco_custo: item.produto.preco_custo,
        }
      );

    if (error) throw error;
  }

  return venda;
}