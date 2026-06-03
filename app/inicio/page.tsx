"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  carregarPainelInicial,
  atualizarPagamentosVenda,
} from "@/services/inicio.service";

import {
  Venda,
  ItemVenda,
  PagamentoVenda,
  TotaisMeios,
} from "@/types/inicio.types";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Package,
  ShoppingBag,
  Monitor,
  ArrowRight,
  Eye,
  CreditCard,
  ChevronDown,
  ChevronUp,
} from "lucide-react";




export default function InicioPage() {
  const router = useRouter();

  const [vendasRecentes, setVendasRecentes] = useState<Venda[]>([]);
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null);
  const [modalVendaAberto, setModalVendaAberto] = useState(false);

  const [valoresPagamento, setValoresPagamento] = useState<TotaisMeios>({
    Pix: 0,
    Dinheiro: 0,
    "Cartão de Crédito": 0,
    "Cartão de Débito": 0,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

useEffect(() => {
  carregarDados();
}, []);

  //buscando os dados 
 async function carregarDados() {
  setLoading(true);

  try {
    const vendas =
      await carregarPainelInicial();

    setVendasRecentes(vendas);
  } catch (error) {
    console.error(
      "Erro ao carregar painel:",
      error
    );
  } finally {
    setLoading(false);
  }
}
  //funcao para editar os meios de pagamento de uma venda 
  function abrirDetalhesVenda(venda: Venda) {
    setVendaSelecionada(venda);

    const valoresIniciais = {
      Pix: 0,
      Dinheiro: 0,
      "Cartão de Crédito": 0,
      "Cartão de Débito": 0,
    };
    //pegando os meios de pagamento da venda para os inputs 
    venda.pagamentos_venda?.forEach((p) => {
      const meio = p.forma_pagamento as keyof TotaisMeios;
      if (valoresIniciais[meio] !== undefined) {
        valoresIniciais[meio] = Number(p.valor);
      }
    });

    setValoresPagamento(valoresIniciais);
    setModalVendaAberto(true);
  }

    //atualiza dinamicamente o estado do meio do pagamento editado pelo usuario no input 
  function handleMudarValorMeio(meio: keyof TotaisMeios, valor: string) {
    setValoresPagamento({
      ...valoresPagamento,
      [meio]: parseFloat(valor) || 0,
    });
  }
  //somando os valores digitados 
  const totalDigitadoNoModal = Object.values(valoresPagamento).reduce(
    (acc, curr) => acc + curr,
    0,
  );
//enviando os dados para o banco 
 async function salvarAlteracaoPagamento() {
  if (!vendaSelecionada) return;
  //verificacao se o valor bate com o total da venda 
  if (
    totalDigitadoNoModal.toFixed(2) !==
    Number(vendaSelecionada.total).toFixed(2)
  ) {
    alert(
      `Erro: A soma informada (R$ ${totalDigitadoNoModal.toFixed(
        2
      )}) não bate com o total da venda (R$ ${Number(
        vendaSelecionada.total
      ).toFixed(2)})`
    );

    return;
  }

  setActionLoading(true);

  try {
    await atualizarPagamentosVenda(
      vendaSelecionada.id,
      valoresPagamento
    );

    setModalVendaAberto(false);

    await carregarDados();
  } catch (err: any) {
    alert(
      `Erro ao atualizar os pagamentos: ${err.message}`
    );
  } finally {
    setActionLoading(false);
  }
}
    //tela de loading 
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-mono text-xs text-zinc-400">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Início</h1>
            <p className="text-sm text-zinc-500">
              VENDAS
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/produtos")}
              className="gap-2"
            >
              <Package className="w-4 h-4" /> Produtos
            </Button>
            <Button onClick={() => router.push("/vendas")} className="gap-2">
              REALIZAR VENDA <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        
        <div className="grid grid-cols-1 gap-6">
          <Card className="border-zinc-200/60 bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium text-zinc-900 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-zinc-400" /> VENDAS RECENTES
              </CardTitle>
              <CardDescription className="text-xs">
                PRODUTOS VENDIDOS E MEIOS DE PAGAMENTO
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50/70 text-zinc-500 font-medium border-b border-zinc-100">
                    <tr>
                      <th className="text-left p-4 font-medium w-[130px]">
                        Horário
                      </th>
                      <th className="text-left p-4 font-medium">Produtos</th>
                      <th className="text-left p-4 font-medium w-[240px]">
                        Pagamento
                      </th>
                      <th className="text-right p-4 font-medium w-[130px]">
                        Total
                      </th>
                      <th className="text-center p-4 font-medium w-[100px]">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-100">
                    {vendasRecentes.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center p-12 text-zinc-400 italic"
                        >
                          Nenhuma transação registrada no sistema.
                        </td>
                      </tr>
                    ) : (
                      vendasRecentes.map((venda) => (
                        <tr
                          key={venda.id}
                          className="hover:bg-zinc-50/40 transition group"
                        >
                          <td className="p-4 align-top font-mono text-zinc-600">
                            <div className="font-medium text-zinc-900">
                              {new Date(venda.criado_em).toLocaleTimeString(
                                "pt-BR",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </div>
                            <div className="text-[10px] text-zinc-400 font-sans mt-0.5">
                              {new Date(venda.criado_em).toLocaleDateString(
                                "pt-BR",
                              )}
                            </div>
                          </td>

                          {/* COLUNA DE PRODUTOS COM COLLAPSE (Limite: 3) */}
                          <td className="p-4 align-top">
                            <ListaProdutosCollapse itens={venda.itens_venda} />
                          </td>

                          {/* COLUNA DE PAGAMENTOS COM COLLAPSE (Limite: 1) */}
                          <td className="p-4 align-top">
                            <ListaPagamentosCollapse
                              pagamentos={venda.pagamentos_venda}
                            />
                          </td>

                          <td className="p-4 align-top text-right font-mono font-semibold text-zinc-900 text-sm">
                            R$ {Number(venda.total).toFixed(2)}
                          </td>

                          <td className="p-4 align-top text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => abrirDetalhesVenda(venda)}
                              className="gap-1.5 h-7 text-xs"
                            >
                              <Eye className="w-3.5 h-3.5" /> Abrir
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MODAL DETALHES DA VENDA */}
      <Dialog open={modalVendaAberto} onOpenChange={setModalVendaAberto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhamento da Venda</DialogTitle>
          </DialogHeader>

          <Separator />

          {vendaSelecionada && (
            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-xs text-zinc-500 font-mono">
                <span>ID: {vendaSelecionada.id.slice(0, 8)}</span>
                <span>
                  {new Date(vendaSelecionada.criado_em).toLocaleString("pt-BR")}
                </span>
              </div>

              {/* No modal mostramos sempre a lista completa, pois o usuário abriu para mudar */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5" /> Produtos comprados
                </span>
                <div className="divide-y divide-zinc-100 border border-zinc-200/60 rounded-lg p-3 bg-zinc-50/50 font-mono text-xs max-h-[160px] overflow-y-auto space-y-1">
                  {vendaSelecionada.itens_venda?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between py-1 first:pt-0 last:pb-0"
                    >
                      <span>
                        <span className="text-zinc-400 font-sans mr-1">
                          {item.quantidade}x
                        </span>
                        {item.produtos?.nome || "Produto Removido"}
                      </span>
                      <span className="text-zinc-500">
                        R${" "}
                        {(!item.quantidade || !item.preco_unitario
                          ? 0
                          : item.quantidade * item.preco_unitario
                        ).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formas de Pagamento no Modal */}
              <div className="space-y-2">
                <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" /> Divisão do Pagamento
                </span>

                <div className="grid grid-cols-2 gap-2 bg-zinc-50 p-3 rounded-lg border border-zinc-200/60">
                  
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-500">
                      Dinheiro
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 font-mono text-xs text-zinc-400">
                        R$
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={valoresPagamento["Dinheiro"] || ""}
                        onChange={(e) =>
                          handleMudarValorMeio("Dinheiro", e.target.value)
                        }
                        className="pl-7 h-8 text-xs font-mono bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-500">
                      Pix
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 font-mono text-xs text-zinc-400">
                        R$
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={valoresPagamento["Pix"] || ""}
                        onChange={(e) =>
                          handleMudarValorMeio("Pix", e.target.value)
                        }
                        className="pl-7 h-8 text-xs font-mono bg-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-500">
                      Cartão de Débito
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 font-mono text-xs text-zinc-400">
                        R$
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={valoresPagamento["Cartão de Débito"] || ""}
                        onChange={(e) =>
                          handleMudarValorMeio(
                            "Cartão de Débito",
                            e.target.value,
                          )
                        }
                        className="pl-7 h-8 text-xs font-mono bg-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-500">
                      Cartão de Crédito
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 font-mono text-xs text-zinc-400">
                        R$
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={valoresPagamento["Cartão de Crédito"] || ""}
                        onChange={(e) =>
                          handleMudarValorMeio(
                            "Cartão de Crédito",
                            e.target.value,
                          )
                        }
                        className="pl-7 h-8 text-xs font-mono bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between text-[11px] font-mono px-1 pt-0.5">
                  <span className="text-zinc-400">
                    Soma Atual: R$ {totalDigitadoNoModal.toFixed(2)}
                  </span>
                  {totalDigitadoNoModal.toFixed(2) !==
                  Number(vendaSelecionada.total).toFixed(2) ? (
                    <span className="text-amber-600 font-medium">
                      {totalDigitadoNoModal < Number(vendaSelecionada.total)
                        ? `Falta: R$ ${(Number(vendaSelecionada.total) - totalDigitadoNoModal).toFixed(2)}`
                        : `Passou: R$ ${(totalDigitadoNoModal - Number(vendaSelecionada.total)).toFixed(2)}`}
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-medium">
                      ✓ Valor exato atingido
                    </span>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center bg-zinc-900 text-white p-3 rounded-lg font-mono">
                <span className="text-xs text-zinc-400 font-sans uppercase">
                  Valor Total da Venda
                </span>
                <span className="text-base font-semibold text-green-400">
                  R$ {Number(vendaSelecionada.total).toFixed(2)}
                </span>
              </div>
            </div>
          )}
              
          <DialogFooter className="flex sm:justify-between gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setModalVendaAberto(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={salvarAlteracaoPagamento}
              disabled={
                actionLoading ||
                totalDigitadoNoModal.toFixed(2) !==
                  Number(vendaSelecionada?.total).toFixed(2)
              }
            >
              Confirmar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ==========================================
   SUB-COMPONENTES DE SUPORTE (COLLAPSE)
   ========================================== */


 //Se a venda tiver mais de 3 produtos, oculta os excedentes sob um botão "Ver Mais",
 

function ListaProdutosCollapse({ itens }: { itens: ItemVenda[] }) {
  const [expandido, setExpandido] = useState(false);

  if (!itens || itens.length === 0)
    return <span className="text-zinc-400 italic">Sem itens</span>;

  const limite = 3;
  const deveColapsar = itens.length > limite;
  const itensExibidos = expandido ? itens : itens.slice(0, limite);

  return (
    <div className="space-y-1 font-mono text-xs text-zinc-700 bg-zinc-50/40 p-2.5 rounded border border-zinc-100/80 max-w-xl">
      <div className="space-y-1">
        {itensExibidos.map((item, idx) => (
          <div key={idx} className="flex justify-between gap-4">
            <span className="truncate">
              <span className="text-zinc-400 font-sans mr-1.5">
                {item.quantidade}x
              </span>
              {item.produtos?.nome || "Item Deletado"}
            </span>
            <span className="text-zinc-400 shrink-0">
              R${" "}
              {(!item.quantidade || !item.preco_unitario
                ? 0
                : item.quantidade * item.preco_unitario
              ).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {deveColapsar && (
        <button
          onClick={() => setExpandido(!expandido)}
          className="mt-1.5 pt-1 border-t border-zinc-200/60 w-full flex items-center justify-center gap-1 text-[10px] text-zinc-400 font-sans hover:text-zinc-600 transition"
        >
          {expandido ? (
            <>
              Ocultar itens <ChevronUp className="w-3 h-3" />
            </>
          ) : (
            <>
              + {itens.length - limite} produtos{" "}
              <ChevronDown className="w-3 h-3" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
/**
 * mostra os meio de pagamento de maneira compacta.
 * Mostra por padrão a primeira forma de pagamento. Se houver divisão de meios (Ex: Pix + Dinheiro),
 * o usuário clica para abrir as demais divisões direto na tabela.
 */
function ListaPagamentosCollapse({
  pagamentos,
}: {
  pagamentos: PagamentoVenda[];
}) {
  const [expandido, setExpandido] = useState(false);

  if (!pagamentos || pagamentos.length === 0)
    return <span className="text-zinc-400 italic">Sem pagamentos</span>;

  const limite = 1;
  const deveColapsar = pagamentos.length > limite;
  const pagamentosExibidos = expandido
    ? pagamentos
    : pagamentos.slice(0, limite);

  return (
    <div className="space-y-1 bg-zinc-50/40 p-2.5 rounded border border-zinc-100/80 font-mono text-xs">
      <div className="space-y-1">
        {pagamentosExibidos.map((pag, idx) => (
          <div key={idx} className="flex justify-between text-[11px] gap-2">
            <span className="text-zinc-400 font-sans truncate">
              {pag.forma_pagamento}
            </span>
            <span className="text-emerald-600 font-medium shrink-0">
              R$ {Number(pag.valor).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {deveColapsar && (
        <button
          onClick={() => setExpandido(!expandido)}
          className="mt-1.5 pt-1 border-t border-zinc-200/60 w-full flex items-center justify-center gap-1 text-[10px] text-zinc-400 font-sans hover:text-zinc-600 transition"
        >
          {expandido ? (
            <>
              Ocultar <ChevronUp className="w-3 h-3" />
            </>
          ) : (
            <>
              + {pagamentos.length - limite} divisão{" "}
              <ChevronDown className="w-3 h-3" />
            </>
          )}
        </button>
      )}
    </div>
  );
}