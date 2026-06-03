//estutura de meios de pagamento
export interface TotaisMeios {
  Pix: number;
  Dinheiro: number;
  "Cartão de Crédito": number;
  "Cartão de Débito": number;
}
//estrutura de um itme vinculado a uma venda
export interface ItemVenda {
  quantidade: number;
  preco_unitario: number;
  produtos: {
    nome: string;
  } | null; 
}

//estutura de um pagamento de uma venda 
export interface PagamentoVenda {
  id?: string;
  forma_pagamento: string;
  valor: number;
}

//estutura de uma venda 
export interface Venda {
  id: string;
  criado_em: string;
  total: number;

  itens_venda: ItemVenda[];

  pagamentos_venda: PagamentoVenda[];
}