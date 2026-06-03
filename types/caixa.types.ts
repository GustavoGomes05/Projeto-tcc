export interface Turno {
  id: string;
  valor_abertura: number;
  valor_fechamento: number | null;
  aberto_em: string;
  fechado_em: string | null;
  status: "aberto" | "fechado";
}

export interface TotaisMeios {
  Pix: number;
  Dinheiro: number;
  "Cartão de Crédito": number;
  "Cartão de Débito": number;
}
// Estrutura das metricas financeiras 
export interface MetricasTurno {
  faturamentoGeral: number;
  lucroGeral: number;
  totalItens: number;
  meiosPagamento: TotaisMeios;
}