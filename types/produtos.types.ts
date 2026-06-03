export interface Categoria {
  id: string;
  nome: string;
  criado_em?: string;
}

export interface Produto {
  id: string;
  nome: string;
  preco_custo: number;
  preco: number;
  estoque: number;
  ativo: boolean;
  categoria_id?: string | null;
  image_url?: string;
  categorias?: Categoria;
}