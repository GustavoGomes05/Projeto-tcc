import { supabase } from "@/lib/supabase";
import {
  TotaisMeios,
  Venda,
} from "../types/inicio.types";

//buscando as 12 ultimas vendas 
export async function carregarPainelInicial(): Promise<Venda[]> {
  //pegando o usuario logado na sessao 
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }
  //consulta de vendas 
  const { data, error } = await supabase
    .from("vendas")
    .select(`
      id,
      criado_em,
      total,
      itens_venda (
        quantidade,
        preco_unitario,
        produtos ( nome )
      ),
      pagamentos_venda (
        id,
        forma_pagamento,
        valor
      )
    `)
    .order("criado_em", {
      ascending: false,
    })
    .limit(12);

  if (error) throw error;
    //assegurando a tipagem 
  return (data as unknown as Venda[]) || [];
}
  //atualizando os meios de pagamento 
export async function atualizarPagamentosVenda(
  vendaId: string,
  valoresPagamento: TotaisMeios
) {
  //limpando o pagamento anterior 
  const { error: deleteError } = await supabase
    .from("pagamentos_venda")
    .delete()
    .eq("venda_id", vendaId);

  if (deleteError) {
    throw deleteError;
  }
  //pegando o novo pagamento 
  const novosPagamentos = (Object.entries(valoresPagamento) as [string, number][])
    .filter(([_, valor]) => valor > 0)
    .map(([forma_pagamento, valor]) => ({
      venda_id: vendaId,
      forma_pagamento,
      valor,
    }));
    //inserindo no banco de dados 
  const { error: insertError } = await supabase
    .from("pagamentos_venda")
    .insert(novosPagamentos);

  if (insertError) {
    throw insertError;
  }
}