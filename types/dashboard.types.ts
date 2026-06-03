export interface MetricasPeriodo {
  faturamento: number;
  lucro: number;
  totalItensVendidos: number;
}

export interface ProdutoMaisVendido {
  id: string;
  nome: string;
  quantidade_vendida: number;
  total_faturado: number;
  lucro_gerado: number;
}

export interface DadosGrafico {
  diaSemana: string;
  faturamento: number;
}

export interface DashboardData {
  metricas: MetricasPeriodo;
  produtosMaisVendidos: ProdutoMaisVendido[];
  dadosGrafico: DadosGrafico[];
}