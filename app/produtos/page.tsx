"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Package,
  Pencil,
  Plus,
  EyeOff,
  CheckCircle,
  Search,
  Tag,
} from "lucide-react";

import {
  buscarProdutos,
  buscarCategorias,
  criarProduto,
  atualizarProduto,
  alterarStatusProduto,
  criarCategoria,
} from "@/services/produtos.service";

import {
  Produto,
  Categoria,
} from "@/types/produtos.types";


export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Produto | null>(null);

  const [nome, setNome] = useState("");
  const [precoCusto, setPrecoCusto] = useState("");
  const [preco, setPreco] = useState("");
  const [estoque, setEstoque] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  //criar categoria nova
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState("");
  const [openNovaCategoria, setOpenNovaCategoria] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState("");

  // FILTROS E PESQUISA
  const [search, setSearch] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<
    string | null
  >(null);

  // ADICIONADO: Estado para filtrar por status de atividade ("todos", "ativos", "inativos")
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");

 useEffect(() => {
  carregarDados();
}, []);

async function carregarDados() {
  setLoading(true);

  try {
    const [produtosData, categoriasData] =
      await Promise.all([
        buscarProdutos(),
        buscarCategorias(),
      ]);

    setProdutos(produtosData);
    setCategorias(categoriasData);
  } catch (error) {
    console.error(
      "Erro ao carregar dados:",
      error
    );
  } finally {
    setLoading(false);
  }
}

  // ✓ ATUALIZADO: Filtro unificado (Pesquisa por texto + Filtro por categoria + Filtro por status)
  const produtosFiltrados = produtos.filter((produto) => {
    const batePesquisa = produto.nome
      .toLowerCase()
      .includes(search.toLowerCase());

    const bateCategoria =
      categoriaSelecionada === null
        ? true
        : produto.categoria_id === categoriaSelecionada;

    // Lógica de filtro por ativo/inativo
    let bateStatus = true;
    if (statusFiltro === "ativos") {
      bateStatus = produto.ativo === true;
    } else if (statusFiltro === "inativos") {
      bateStatus = produto.ativo === false;
    }

    return batePesquisa && bateCategoria && bateStatus;
  });

  
  function openCreate() {
    setSelected(null);
    setNome("");
    setPrecoCusto("");
    setPreco("");
    setEstoque("");
    setCategoriaId("");
    setImageUrl("");
    setOpen(true);
  }

  function openEdit(produto: Produto) {
    setSelected(produto);
    setNome(produto.nome);
    setPrecoCusto(String(produto.preco_custo || ""));
    setPreco(String(produto.preco));
    setEstoque(String(produto.estoque));
    setCategoriaId(produto.categoria_id || "");
    setImageUrl("");
    setOpen(true);
  }

  async function salvar() {
    const precoCustoLimpo = Number(precoCusto.replace(",", "."));
    const precoLimpo = Number(preco.replace(",", "."));
    const estoqueLimpo = Number(estoque);

    if (!nome.trim()) {
      alert("O nome do produto é obrigatório.");
      return;
    }

    if (isNaN(precoCustoLimpo) || precoCustoLimpo < 0) {
      alert(
        "Por favor, insira um preço de custo válido e maior ou igual a zero.",
      );
      return;
    }

    if (isNaN(precoLimpo) || precoLimpo < 0) {
      alert(
        "Por favor, insira um preço de venda válido e maior ou igual a zero.",
      );
      return;
    }

    if (isNaN(estoqueLimpo) || estoqueLimpo < 0) {
      alert("Por favor, insira um estoque válido e maior ou igual a zero.");
      return;
    }

    if (selected) {
  try {
    //editar
    await atualizarProduto(
      selected.id,
      {
        nome,
        preco_custo: precoCustoLimpo,
        preco: precoLimpo,
        estoque: estoqueLimpo,
        categoria_id:
          categoriaId || null,
      }
    );
  } catch (error: any) {
    alert(error.message);
    return;
  }
}else {
      // CRIAR
      try {
    await criarProduto({
      nome,
      preco_custo: precoCustoLimpo,
      preco: precoLimpo,
      estoque: estoqueLimpo,
      categoria_id:
        categoriaId || null,
    });
  } catch (error: any) {
    alert(error.message);
    return;
  }
    }

    setOpen(false);
    await carregarDados();
  }

  async function inativarProduto() {
  if (!selected) return;

  const novoStatus =
    !selected.ativo;

  const mensagem = novoStatus
    ? "Deseja reativar este produto?"
    : "Deseja inativar este produto?";

  if (!confirm(mensagem)) return;

  try {
    await alterarStatusProduto(
      selected.id,
      novoStatus
    );

    setOpen(false);

    await carregarDados();
  } catch (error: any) {
    alert(error.message);
  }
}

  //funcao criar novaCategoria
  async function salvarNovaCategoria() {
  if (!novaCategoria.trim()) {
    alert("Digite o nome da categoria");
    return;
  }

  try {
    await criarCategoria(
      novaCategoria.trim()
    );

    setNovaCategoria("");
    setOpenNovaCategoria(false);

    await carregarDados();

    alert(
      "Categoria criada com sucesso!"
    );
  } catch (error: any) {
    alert(error.message);
  }
}

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Produtos</h1>
            <p className="text-sm text-zinc-500">
              Gerencie seu estoque e catálogo
            </p>
          </div>

          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo produto
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={() => setOpenNovaCategoria(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Categoria
        </Button>

        {/* PESQUISA E FILTROS */}
        <div className="space-y-3">
          <div className="flex gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Pesquisar produto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* ADICIONADO: Seletor de Status (Ativos / Inativos / Todos) */}
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="h-10 rounded-md border border-zinc-200 px-3 text-sm bg-white text-zinc-900 focus:outline-hidden"
            >
              <option value="todos">Todos os Status</option>
              <option value="ativos">Apenas Ativos</option>
              <option value="inativos">Apenas Inativos</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button
            variant={categoriaSelecionada === null ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoriaSelecionada(null)}
          >
            Todas
          </Button>

          {categorias.map((categoria) => (
            <Button
              key={categoria.id}
              size="sm"
              variant={
                categoriaSelecionada === categoria.id ? "default" : "outline"
              }
              onClick={() => setCategoriaSelecionada(categoria.id)}
            >
              {categoria.nome}
            </Button>
          ))}
        </div>
        {/* TABLE */}
        <Card className="border-zinc-200/60">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-zinc-500">
                <tr>
                  <th className="text-left p-4">Produto</th>
                  <th className="text-left p-4">Preço Venda</th>
                  <th className="text-left p-4">Estoque</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Categoria</th>
                  <th className="text-right p-4">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-zinc-500">
                      Carregando produtos...
                    </td>
                  </tr>
                ) : produtosFiltrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center p-8 text-zinc-500 italic"
                    >
                      Nenhum produto correspondente encontrado.
                    </td>
                  </tr>
                ) : (
                  produtosFiltrados.map((p) => (
                    <tr
                      key={p.id}
                      className={`hover:bg-zinc-50 transition ${!p.ativo ? "opacity-50 bg-zinc-100/40" : ""}`}
                    >
                      <td className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-zinc-100 flex items-center justify-center overflow-hidden border border-zinc-200">
                          <Package className="w-4 h-4 text-zinc-400" />
                        </div>

                        <div>
                          <p
                            className={`font-medium ${!p.ativo ? "text-zinc-400 line-through" : "text-zinc-900"}`}
                          >
                            {p.nome}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-zinc-500">
                              Custo: R$ {Number(p.preco_custo || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-zinc-700">
                        R$ {Number(p.preco).toFixed(2)}
                      </td>

                      <td className="p-4 text-zinc-700">{p.estoque}</td>

                      <td className="p-4 text-zinc-700">
                        {p.ativo ? (
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            Ativo
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
                            Inativo
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-zinc-700">
                        {p.categorias?.nome}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(p)}
                          className="gap-2"
                        >
                          <Pencil className="w-4 h-4" />
                          Abrir
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* MODAL  criar produto */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selected ? "Editar produto" : "Novo produto"}
            </DialogTitle>
          </DialogHeader>

          <Separator />

          <div className="space-y-3">
            <label>Nome Produto</label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do Produto"
            />

            {/* ✓ ADICIONADO: Campo Categoria (Opcional) */}
            <div className="space-y-1">
              <div className="space-y-1">
                <label>Categoria</label>

                <select
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                  className="w-full h-10 rounded-md border border-zinc-300 px-3"
                >
                  <option value="">Selecione uma categoria</option>

                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>
              </div>

              <label>Preço de Custo</label>
              <Input
                value={precoCusto}
                onChange={(e) => setPrecoCusto(e.target.value)}
                placeholder="Preço de Custo (Ex: 5.20)"
              />
              <label>preço de Venda </label>
              <Input
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                placeholder="Preço de Venda (Ex: 10.50)"
              />
              <label>Estoque </label>
              <Input
                value={estoque}
                onChange={(e) => setEstoque(e.target.value)}
                placeholder="Estoque"
              />
              <label>Imagem</label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="URL da Imagem/Foto (Inativa - Apenas teste)"
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant={selected?.ativo ? "destructive" : "default"}
                onClick={inativarProduto}
                className="gap-2"
                disabled={!selected}
              >
                {selected?.ativo ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Inativar
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Reativar
                  </>
                )}
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>

                <Button onClick={salvar}>Salvar</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/*Modal criar categoria*/}
      <Dialog open={openNovaCategoria} onOpenChange={setOpenNovaCategoria}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
          </DialogHeader>
          <Separator />
          <div className="space-y-3">
            <label>Categoria</label>
            <Input
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value)}
              placeholder="Nome da categoria"
            ></Input>
          </div>
          <div className="flex justify-end gap-2-pt-4">
            <Button
              variant="outline"
              onClick={() => setOpenNovaCategoria(false)}
            >
              Cancelar
            </Button>
            <Button onClick={salvarNovaCategoria}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
