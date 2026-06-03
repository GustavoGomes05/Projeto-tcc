import { supabase } from "@/lib/supabase";
import { Produto, Categoria } from "../types/produtos.types";

export async function buscarProdutos(): Promise<Produto[]> {
  const { data, error } = await supabase
    .from("produtos")
    .select(`
      *,
      categorias (
        id,
        nome
      )
    `)
    .order("criado_em", {
      ascending: false,
    });

  if (error) throw error;

  return (data || []) as Produto[];
}

export async function buscarCategorias(): Promise<Categoria[]> {
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("nome", {
      ascending: true,
    });

  if (error) throw error;

  return (data || []) as Categoria[];
}

export async function criarProduto(produto: {
  nome: string;
  preco_custo: number;
  preco: number;
  estoque: number;
  categoria_id?: string | null;
  image_url?: string | null; 
}) {
  const { error } = await supabase
    .from("produtos")
    .insert([
      {
        ...produto,
        ativo: true,
      },
    ]);

  if (error) throw error;
}

export async function atualizarProduto(
  id: string,
  produto: {
    nome: string;
    preco_custo: number;
    preco: number;
    estoque: number;
    categoria_id?: string | null;
    image_url?: string | null ;
  }
) {
  const { error } = await supabase
    .from("produtos")
    .update(produto)
    .eq("id", id);

  if (error) throw error;
}

export async function alterarStatusProduto(
  id: string,
  ativo: boolean
) {
  const { error } = await supabase
    .from("produtos")
    .update({
      ativo,
    })
    .eq("id", id);

  if (error) throw error;
}

export async function criarCategoria(nome: string) {
  const { error } = await supabase
    .from("categorias")
    .insert([
      {
        nome,
      },
    ]);

  if (error) throw error;
}