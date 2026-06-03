export interface Produto {
  id: string;
  nome: string;
  preco: number;
  estoque: number;
  preco_custo: number;
}

export interface ItemVenda {
  produto: Produto;
  quantidade: number;
  subtotal: number;
}

export interface ValoresPagamento {
  Pix: number;
  Dinheiro: number;
  "Cartão de Crédito": number;
  "Cartão de Débito": number;
}

export interface PagamentoVenda {
  forma_pagamento: string;
  valor: number;
}

export interface ItemVendaInsert {
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  preco_custo: number;
}

export interface FinalizarVendaParams {
  userId: string;
  caixaId: string;
  valorTotal: number;
  itens: ItemVenda[];
  valoresPagamento: ValoresPagamento;
}