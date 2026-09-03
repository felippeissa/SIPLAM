import { ACOES, ANOS, IPOFS, PROJETOS } from "./seed";
import type { AcaoOrcamentaria, Ipof, ParcelaIpof, PpaState, ProjetoGomap } from "./types";

export const zerosAno = (): Record<string, number> => Object.fromEntries(ANOS.map((a) => [a, 0]));

export const acaoPorId = (id: string): AcaoOrcamentaria | null => ACOES.find((a) => a.id === id) ?? null;
export const ipofPorIdSimples = (id: string): Ipof | null => IPOFS.find((i) => i.id === id) ?? null;
export const projetoPorIdSimples = (id: string | null): ProjetoGomap | null =>
  id ? (PROJETOS.find((p) => p.id === id) ?? null) : null;

/** Todas as parcelas do SIAFIC de uma Ação, com o IPOF de origem. */
export function parcelasDaAcao(acaoId: string): { ipof: Ipof; parcela: ParcelaIpof }[] {
  return IPOFS.flatMap((ipof) => ipof.parcelas.filter((p) => p.acaoId === acaoId).map((parcela) => ({ ipof, parcela })));
}

export const totalDaAcao = (acaoId: string) => parcelasDaAcao(acaoId).reduce((s, { parcela }) => s + parcela.valor, 0);

export function totalDaAcaoAno(acaoId: string, ano: string) {
  return parcelasDaAcao(acaoId)
    .filter(({ parcela }) => parcela.ano === ano)
    .reduce((s, { parcela }) => s + parcela.valor, 0);
}

/** Exclusividade: uma Ação financia no máximo uma Entrega do PPA. */
export const entregaDaAcao = (state: PpaState, acaoId: string) =>
  state.vinculosAcao.find((v) => v.acaoId === acaoId)?.entregaId ?? null;

export function acoesDaEntrega(state: PpaState, entregaId: string): AcaoOrcamentaria[] {
  return state.vinculosAcao
    .filter((v) => v.entregaId === entregaId)
    .map((v) => acaoPorId(v.acaoId))
    .filter((a): a is AcaoOrcamentaria => !!a);
}

/** Catálogo de Ações do órgão, indicando qual Entrega já consome cada uma. */
export function acoesDoOrgao(state: PpaState, orgao: string) {
  return ACOES.filter((a) => a.orgao === orgao).map((acao) => ({
    acao,
    total: totalDaAcao(acao.id),
    entregaId: entregaDaAcao(state, acao.id),
  }));
}

/** Projetos GOMAP alcançados pelos IPOFs que financiam a Entrega. */
export function projetosFinanciadoresDaEntrega(state: PpaState, entregaId: string): ProjetoGomap[] {
  const ids = new Set<string>();
  for (const acao of acoesDaEntrega(state, entregaId))
    for (const { ipof } of parcelasDaAcao(acao.id)) if (ipof.projetoId) ids.add(ipof.projetoId);
  return [...ids].map((id) => projetoPorIdSimples(id)).filter((p): p is ProjetoGomap => !!p);
}

export interface LinhaFinanceira {
  /** Chave sintética (entrega × ação × ipof × fonte × classificação). */
  id: string;
  acao: AcaoOrcamentaria;
  ipof: Ipof;
  projeto: ProjetoGomap | null;
  classificacao: string;
  entregaId: string;
  entrega: string;
  iniciativaId: string;
  iniciativa: string;
  programaId: string;
  programa: string;
  orgao: string;
  fonte: string;
  anos: Record<string, number>;
  total: number;
  parcelas: ParcelaIpof[];
}

/**
 * Financeiro do PPA derivado automaticamente: Entrega ← Ação ← parcelas do IPOF.
 * Nenhum valor é digitado pelo usuário.
 */
export function linhasFinanceiras(state: PpaState): LinhaFinanceira[] {
  const out: LinhaFinanceira[] = [];
  for (const v of state.vinculosAcao) {
    const acao = acaoPorId(v.acaoId);
    const entrega = state.entregas.find((e) => e.id === v.entregaId);
    if (!acao || !entrega) continue;
    const ini = state.iniciativas.find((i) => i.id === entrega.iniciativaId);
    if (!ini) continue;
    const prog = state.programas.find((pr) => pr.id === ini.programaId) ?? null;
    const grupos = new Map<string, LinhaFinanceira>();
    for (const { ipof, parcela } of parcelasDaAcao(acao.id)) {
      const chave = `${ipof.id}|${parcela.fonte}|${parcela.classificacao}`;
      const atual =
        grupos.get(chave) ??
        ({
          id: `${entrega.id}|${acao.id}|${chave}`,
          acao,
          ipof,
          projeto: projetoPorIdSimples(ipof.projetoId),
          classificacao: parcela.classificacao,
          entregaId: entrega.id,
          entrega: entrega.nome,
          iniciativaId: ini.id,
          iniciativa: ini.nome,
          programaId: ini.programaId,
          programa: prog ? `${prog.codigo} — ${prog.nome}` : "—",
          orgao: ini.orgao,
          fonte: parcela.fonte,
          anos: zerosAno(),
          total: 0,
          parcelas: [],
        } satisfies LinhaFinanceira);
      atual.anos[parcela.ano] = (atual.anos[parcela.ano] ?? 0) + parcela.valor;
      atual.total += parcela.valor;
      atual.parcelas.push(parcela);
      grupos.set(chave, atual);
    }
    out.push(...grupos.values());
  }
  return out;
}

export type Dimensao = "fonte" | "orgao" | "programa" | "iniciativa" | "entrega" | "ipof" | "projeto" | "acao" | "classificacao";

export const DIMENSAO_LABEL: Record<Dimensao, string> = {
  fonte: "Fonte de recursos",
  orgao: "Órgão",
  programa: "Programa",
  iniciativa: "Iniciativa",
  entrega: "Entrega",
  ipof: "IPOF",
  projeto: "Projeto GOMAP",
  acao: "Ação Orçamentária",
  classificacao: "Classificação de despesa",
};

function chaveDe(l: LinhaFinanceira, d: Dimensao) {
  switch (d) {
    case "fonte":
      return l.fonte;
    case "orgao":
      return l.orgao;
    case "programa":
      return l.programa;
    case "iniciativa":
      return l.iniciativa;
    case "entrega":
      return l.entrega;
    case "ipof":
      return `${l.ipof.codigo} — ${l.ipof.nome}`;
    case "acao":
      return `${l.acao.codigo} — ${l.acao.nome}`;
    case "classificacao":
      return l.classificacao;
    case "projeto":
      return l.projeto ? `${l.projeto.codigo} — ${l.projeto.nome}` : "Sem Projeto GOMAP";
  }
}

export interface LinhaQuadro {
  chave: string;
  anos: Record<string, number>;
  total: number;
  linhas: LinhaFinanceira[];
}

export interface Quadro {
  linhas: LinhaQuadro[];
  totais: Record<string, number>;
  total: number;
}

/** Agrega o financeiro por uma dimensão qualquer; nunca usa o valor global do Projeto. */
export function quadro(linhas: LinhaFinanceira[], dimensao: Dimensao): Quadro {
  const mapa = new Map<string, LinhaQuadro>();
  const totais = zerosAno();
  for (const l of linhas) {
    const chave = chaveDe(l, dimensao);
    const atual = mapa.get(chave) ?? { chave, anos: zerosAno(), total: 0, linhas: [] };
    for (const ano of ANOS) {
      atual.anos[ano] = (atual.anos[ano] ?? 0) + (l.anos[ano] ?? 0);
      totais[ano] = (totais[ano] ?? 0) + (l.anos[ano] ?? 0);
    }
    atual.total += l.total;
    atual.linhas.push(l);
    mapa.set(chave, atual);
  }
  const out = [...mapa.values()].sort((a, b) => b.total - a.total);
  return { linhas: out, totais, total: out.reduce((s, l) => s + l.total, 0) };
}

export const linhasDaEntrega = (state: PpaState, entregaId: string) =>
  linhasFinanceiras(state).filter((l) => l.entregaId === entregaId);

export const linhasDaIniciativa = (state: PpaState, iniciativaId: string) =>
  linhasFinanceiras(state).filter((l) => l.iniciativaId === iniciativaId);

export const linhasDoPrograma = (state: PpaState, programaId: string) =>
  linhasFinanceiras(state).filter((l) => l.programaId === programaId);

export const linhasDoOrgao = (state: PpaState, orgao: string) =>
  linhasFinanceiras(state).filter((l) => l.orgao === orgao);

export const linhasDoProjeto = (state: PpaState, projetoId: string) =>
  linhasFinanceiras(state).filter((l) => l.projeto?.id === projetoId);

/* ---------- Catálogos ---------- */

export function todosIpofs(): { ipof: Ipof; projeto: ProjetoGomap | null; orgao: string }[] {
  return IPOFS.map((ipof) => ({ ipof, projeto: projetoPorIdSimples(ipof.projetoId), orgao: ipof.orgao }));
}

export const totalDoIpof = (ipof: Ipof) => ipof.parcelas.reduce((s, p) => s + p.valor, 0);

export const totalDoIpofAno = (ipof: Ipof, ano: string) =>
  ipof.parcelas.filter((p) => p.ano === ano).reduce((s, p) => s + p.valor, 0);

export const fontesDoIpof = (ipof: Ipof) => [...new Set(ipof.parcelas.map((p) => p.fonte))];

export const acoesDoIpof = (ipof: Ipof) =>
  [...new Set(ipof.parcelas.map((p) => p.acaoId))].map((id) => acaoPorId(id)).filter((a): a is AcaoOrcamentaria => !!a);

export function entregasDoProjeto(state: PpaState, projetoId: string) {
  return state.vinculos
    .filter((v) => v.projetoId === projetoId)
    .map((v) => state.entregas.find((e) => e.id === v.entregaId))
    .filter((e): e is NonNullable<typeof e> => !!e);
}

/** Quanto do Projeto GOMAP está efetivamente refletido no PPA, via Ações vinculadas. */
export const apropriadoDoProjetoNoPpa = (state: PpaState, projetoId: string) =>
  linhasDoProjeto(state, projetoId).reduce((s, l) => s + l.total, 0);
