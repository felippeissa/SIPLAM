import { ACOES, ANOS, EXECUCAO_SIAFIC, IPOFS, PROJETOS } from "./seed";
import {
  acoesDaEntrega,
  acoesDoIpof,
  fontesDoIpof,
  linhasDaEntrega,
  linhasDaIniciativa,
  linhasDoProjeto,
  entregaDaAcao,
  totalDaAcao,
  projetoPorIdSimples,
  totalDoIpof,
} from "./financeiro";
import type { Comportamento, Entrega, Iniciativa, Ipof, PpaState, Programa, ProjetoGomap, StatusIniciativa } from "./types";

export const STATUS_LABEL: Record<StatusIniciativa, string> = {
  em_preenchimento: "Em preenchimento",
  enviada: "Enviada",
  em_analise: "Em análise pela Área Central",
  devolvida: "Devolvida para ajuste",
  validada: "Validada",
};

export const STATUS_CURTO: Record<StatusIniciativa, string> = {
  em_preenchimento: "Em preenchimento",
  enviada: "Enviada",
  em_analise: "Em análise",
  devolvida: "Devolvida",
  validada: "Validada",
};

export const COMPORTAMENTOS: { id: Comportamento; nome: string; ajuda: string }[] = [
  { id: "acumulativa", nome: "Acumulativa", ajuda: "Os valores anuais se somam ao longo do plano." },
  { id: "fluxo", nome: "Fluxo anual", ajuda: "Cada ano tem seu próprio volume, sem soma." },
  { id: "estoque", nome: "Estoque", ajuda: "O valor representa a situação existente ao final do ano." },
  { id: "percentual", nome: "Percentual/Taxa", ajuda: "O valor é uma proporção, não uma quantidade." },
  { id: "marco", nome: "Marco", ajuda: "Ocorre uma única vez, em um ano específico." },
];

export const TERRITORIO_LABEL: Record<string, string> = {
  estadual: "Abrangência estadual",
  territorializavel: "Territorializável",
  nao_territorializavel: "Não territorializável",
};

export function podeEditar(status: StatusIniciativa) {
  return status === "em_preenchimento" || status === "devolvida";
}

export type Nivel = "impeditivo" | "alerta" | "informacao";

export interface Pendencia {
  nivel: Nivel;
  campo: string;
  texto: string;
  entregaId?: string;
}

export function moeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function moedaCurta(v: number) {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
  if (v >= 1000) return `R$ ${(v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} mil`;
  return moeda(v);
}

export function ipofPorId(id: string) {
  const ipof = IPOFS.find((x) => x.id === id);
  if (!ipof) return null;
  return { ipof, projeto: projetoPorIdSimples(ipof.projetoId) };
}

export function projetosDaEntrega(state: PpaState, entregaId: string) {
  return state.vinculos
    .filter((v) => v.entregaId === entregaId)
    .map((v) => PROJETOS.find((p) => p.id === v.projetoId))
    .filter((p): p is NonNullable<typeof p> => !!p);
}

/** IPOFs alcançados pela Entrega por meio das Ações vinculadas — derivação automática. */
export function ipofsDaEntrega(state: PpaState, entregaId: string) {
  const mapa = new Map<string, { ipof: Ipof; projeto: ProjetoGomap | null; total: number }>();
  for (const l of linhasDaEntrega(state, entregaId)) {
    const atual = mapa.get(l.ipof.id) ?? { ipof: l.ipof, projeto: l.projeto, total: 0 };
    atual.total += l.total;
    mapa.set(l.ipof.id, atual);
  }
  return [...mapa.values()].sort((a, b) => b.total - a.total);
}

/** Valor total programado no IPOF (SIAFIC). */
export const totalDoIpofPpa = (ipofId: string) => {
  const ipof = IPOFS.find((x) => x.id === ipofId);
  return ipof ? totalDoIpof(ipof) : 0;
};

export const resumoIpof = (ipof: Ipof) => ({
  total: totalDoIpof(ipof),
  fontes: fontesDoIpof(ipof),
  acoes: acoesDoIpof(ipof),
});

/** Financeiro derivado da Entrega. */
export const recursosDaEntrega = (state: PpaState, entregaId: string) =>
  linhasDaEntrega(state, entregaId).reduce((s, l) => s + l.total, 0);

export const recursosDaIniciativa = (state: PpaState, iniciativaId: string) =>
  linhasDaIniciativa(state, iniciativaId).reduce((s, l) => s + l.total, 0);

export const temVinculoOrcamentario = (state: PpaState, entregaId: string) => acoesDaEntrega(state, entregaId).length > 0;

/** Diferença entre o valor global do Projeto no GOMAP e o que o PPA reflete via Ações. */
export function descompassoProjeto(state: PpaState, projetoId: string) {
  const projeto = PROJETOS.find((p) => p.id === projetoId);
  if (!projeto) return null;
  const noPpa = linhasDoProjeto(state, projetoId).reduce((s, l) => s + l.total, 0);
  return { projeto, noPpa, diferenca: projeto.valorGlobal - noPpa };
}

export function pendenciasEntrega(state: PpaState, e: Entrega): Pendencia[] {
  const p: Pendencia[] = [];
  if (!e.nome.trim()) p.push({ nivel: "impeditivo", campo: "nome", texto: "Nome da Entrega não informado", entregaId: e.id });
  if (!e.unidadeMedida) p.push({ nivel: "impeditivo", campo: "unidade", texto: "Unidade de medida não informada", entregaId: e.id });

  const faltando = ANOS.filter((a) => e.metas[a] === null || e.metas[a] === undefined);
  if (faltando.length === ANOS.length)
    p.push({ nivel: "impeditivo", campo: "metas", texto: "Nenhuma meta anual informada", entregaId: e.id });
  else if (faltando.length > 0)
    p.push({
      nivel: "impeditivo",
      campo: "metas",
      texto: `Meta não informada em ${faltando.join(", ")}`,
      entregaId: e.id,
    });

  const comp = e.comportamento ?? e.comportamentoSugerido;
  if (!comp) p.push({ nivel: "impeditivo", campo: "comportamento", texto: "Comportamento da meta não definido", entregaId: e.id });
  else if (!e.comportamentoValidado)
    p.push({
      nivel: "alerta",
      campo: "comportamento",
      texto: "Comportamento sugerido pelo sistema ainda não validado pelo órgão",
      entregaId: e.id,
    });

  if (!e.territorio.tipo)
    p.push({ nivel: "impeditivo", campo: "territorio", texto: "Relação com o território não informada", entregaId: e.id });
  else if (e.territorio.tipo === "territorializavel" && e.territorio.regioes.length === 0)
    p.push({ nivel: "impeditivo", campo: "territorio", texto: "Distribuição territorial pendente", entregaId: e.id });

  if (!e.metodoComprovacao.trim())
    p.push({ nivel: "alerta", campo: "comprovacao", texto: "Método de comprovação não informado", entregaId: e.id });

  const projs = projetosDaEntrega(state, e.id).length;
  if (projs > 0)
    p.push({ nivel: "informacao", campo: "projetos", texto: `${projs} Projeto(s) GOMAP associado(s)`, entregaId: e.id });

  const acoes = acoesDaEntrega(state, e.id);
  const financeiro = recursosDaEntrega(state, e.id);
  if (acoes.length === 0)
    p.push({
      nivel: "alerta",
      campo: "orcamento",
      texto: "Nenhuma Ação Orçamentária vinculada — a Entrega não possui financeiro no PPA",
      entregaId: e.id,
    });
  else
    p.push({
      nivel: "informacao",
      campo: "orcamento",
      texto: `${acoes.length} Ação(ões) vinculada(s) · ${moedaCurta(financeiro)} no plano`,
      entregaId: e.id,
    });

  return p;
}

export function pendenciasIniciativa(state: PpaState, ini: Iniciativa): Pendencia[] {
  const p: Pendencia[] = [];
  if (!ini.nome.trim()) p.push({ nivel: "impeditivo", campo: "nome", texto: "Nome da Iniciativa não informado" });
  if (!ini.descricao.trim()) p.push({ nivel: "alerta", campo: "descricao", texto: "Detalhamento da Iniciativa não informado" });
  if (ini.causas.length === 0)
    p.push({ nivel: "impeditivo", campo: "causas", texto: "Nenhuma causa do Programa relacionada à Iniciativa" });
  const es = state.entregas.filter((e) => e.iniciativaId === ini.id);
  if (es.length === 0) p.push({ nivel: "impeditivo", campo: "entregas", texto: "A Iniciativa não possui Entregas" });
  for (const e of es) p.push(...pendenciasEntrega(state, e));
  return p;
}

export function resumoPendencias(ps: Pendencia[]) {
  return {
    impeditivos: ps.filter((x) => x.nivel === "impeditivo").length,
    alertas: ps.filter((x) => x.nivel === "alerta").length,
    informacoes: ps.filter((x) => x.nivel === "informacao").length,
  };
}

export function situacaoEntrega(state: PpaState, e: Entrega) {
  const ps = pendenciasEntrega(state, e);
  const r = resumoPendencias(ps);
  if (r.impeditivos > 0)
    return { tom: "impeditivo" as const, texto: `${r.impeditivos} pendência${r.impeditivos > 1 ? "s" : ""} impeditiva${r.impeditivos > 1 ? "s" : ""}` };
  if (r.alertas > 0) return { tom: "alerta" as const, texto: `${r.alertas} alerta${r.alertas > 1 ? "s" : ""}` };
  return { tom: "ok" as const, texto: "Completa" };
}

export function comentariosDaIniciativa(state: PpaState, iniciativaId: string) {
  const ids = state.entregas.filter((e) => e.iniciativaId === iniciativaId).map((e) => e.id);
  return state.comentarios.filter(
    (c) => (c.alvoTipo === "iniciativa" && c.alvoId === iniciativaId) || (c.alvoTipo === "entrega" && ids.includes(c.alvoId)),
  );
}

export function iniciativasDoOrgao(state: PpaState, programaId: string, orgao: string) {
  return state.iniciativas.filter((i) => i.programaId === programaId && i.orgao === orgao);
}

export function entregasDaIniciativa(state: PpaState, iniciativaId: string) {
  return state.entregas.filter((e) => e.iniciativaId === iniciativaId);
}

/* ---------- Estrutura estratégica ---------- */

export const DISPONIBILIZACAO_LABEL: Record<string, string> = {
  em_estruturacao: "Em estruturação",
  pronto: "Pronto para disponibilização",
  disponivel: "Disponível para contribuições",
  encerrado: "Encerrado para novas contribuições",
};

export const APTIDAO_LABEL: Record<string, string> = {
  incompleto: "Diagnóstico incompleto",
  apto: "Apto",
};

export function eixos(programas: Programa[]) {
  return [...new Set(programas.map((p) => p.eixo))].sort((a, b) => a.localeCompare(b));
}

export function objetivos(programas: Programa[], eixo?: string) {
  return [
    ...new Set(programas.filter((p) => !eixo || eixo === "todos" || p.eixo === eixo).map((p) => p.objetivoEstrategico)),
  ].sort((a, b) => a.localeCompare(b));
}

export function programaPorId(state: PpaState, id: string) {
  return state.programas.find((p) => p.id === id);
}

/* ---------- Contribuição do órgão ---------- */

export function semContribuicao(state: PpaState, programaId: string, orgao: string) {
  return state.semContribuicao.some((x) => x.programaId === programaId && x.orgao === orgao);
}

export type Participacao = "com_contribuicao" | "sem_contribuicao" | "nao_avaliado";

export function participacaoOrgao(state: PpaState, programaId: string, orgao: string): Participacao {
  if (iniciativasDoOrgao(state, programaId, orgao).length > 0) return "com_contribuicao";
  if (semContribuicao(state, programaId, orgao)) return "sem_contribuicao";
  return "nao_avaliado";
}

export const PARTICIPACAO_LABEL: Record<Participacao, string> = {
  com_contribuicao: "Com contribuição",
  sem_contribuicao: "Sem contribuição informada",
  nao_avaliado: "Não avaliado",
};

/* ---------- Financeiro ---------- */

export function executadoDaEntrega(entregaId: string) {
  return EXECUCAO_SIAFIC[entregaId] ?? 0;
}

export function executadoDaIniciativa(state: PpaState, iniciativaId: string) {
  return entregasDaIniciativa(state, iniciativaId).reduce((s, e) => s + executadoDaEntrega(e.id), 0);
}

/** Soma das apropriações das Entregas — nunca o valor integral dos Projetos GOMAP. */
export function previstoDaIniciativa(state: PpaState, iniciativaId: string) {
  return recursosDaIniciativa(state, iniciativaId);
}

export function financeiroIniciativa(state: PpaState, iniciativaId: string) {
  const previsto = previstoDaIniciativa(state, iniciativaId);
  const executado = executadoDaIniciativa(state, iniciativaId);
  return { previsto, executado, percentual: previsto > 0 ? (executado / previsto) * 100 : null };
}

export function financeiroProgramaOrgao(state: PpaState, programaId: string, orgao: string) {
  const inis = iniciativasDoOrgao(state, programaId, orgao);
  const previsto = inis.reduce((s, i) => s + previstoDaIniciativa(state, i.id), 0);
  const executado = inis.reduce((s, i) => s + executadoDaIniciativa(state, i.id), 0);
  return { previsto, executado, percentual: previsto > 0 ? (executado / previsto) * 100 : null };
}

export function pct(v: number | null) {
  return v === null ? "—" : `${v.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

/* ---------- Visão por Órgão (Área Central) ---------- */

export function orgaosComContribuicao(state: PpaState) {
  return [...new Set(state.iniciativas.map((i) => i.orgao))].sort((a, b) => a.localeCompare(b));
}

export function resumoOrgao(state: PpaState, orgao: string) {
  const inis = state.iniciativas.filter((i) => i.orgao === orgao);
  const programas = [...new Set(inis.map((i) => i.programaId))];
  const entregas = inis.reduce((s, i) => s + entregasDaIniciativa(state, i.id).length, 0);
  const previsto = inis.reduce((s, i) => s + previstoDaIniciativa(state, i.id), 0);
  const executado = inis.reduce((s, i) => s + executadoDaIniciativa(state, i.id), 0);
  const conta = (st: StatusIniciativa) => inis.filter((i) => i.status === st).length;
  return {
    orgao,
    inis,
    programas,
    entregas,
    previsto,
    executado,
    emPreenchimento: conta("em_preenchimento"),
    enviadas: conta("enviada"),
    emAnalise: conta("em_analise"),
    devolvidas: conta("devolvida"),
    validadas: conta("validada"),
  };
}

/* ---------- Ordenação inteligente da tabela de Programas ---------- */

export function prioridadePrograma(state: PpaState, programaId: string, orgao: string) {
  if (semContribuicao(state, programaId, orgao)) return 6;
  const inis = iniciativasDoOrgao(state, programaId, orgao);
  if (inis.length === 0) return 5;
  if (inis.some((i) => i.status === "devolvida")) return 1;
  if (inis.some((i) => i.status === "em_preenchimento")) return 2;
  if (inis.some((i) => i.status === "enviada" || i.status === "em_analise")) return 3;
  return 4;
}

/* ---------- Busca global ---------- */

export interface ResultadoBusca {
  id: string;
  tipo: "Programa" | "Iniciativa" | "Entrega" | "Indicador" | "Projeto GOMAP" | "Ação Orçamentária" | "IPOF";
  titulo: string;
  contexto: string;
  to: string;
  params?: Record<string, string>;
  search?: Record<string, string>;
}

export function buscaGlobal(state: PpaState, termo: string, orgao?: string): ResultadoBusca[] {
  const q = termo.trim().toLowerCase();
  if (q.length < 2) return [];
  const bate = (...campos: (string | undefined)[]) => campos.some((c) => (c ?? "").toLowerCase().includes(q));
  const out: ResultadoBusca[] = [];

  for (const p of state.programas) {
    if (bate(p.nome, p.codigo))
      out.push({ id: p.id, tipo: "Programa", titulo: `${p.codigo} — ${p.nome}`, contexto: `${p.eixo} · ${p.objetivoEstrategico}`, to: "/programa/$id", params: { id: p.id } });
    for (const ind of p.indicadores)
      if (bate(ind.nome))
        out.push({ id: `${p.id}-${ind.nome}`, tipo: "Indicador", titulo: ind.nome, contexto: `Indicador de Programa · ${p.nome}`, to: "/programa/$id", params: { id: p.id } });
  }

  const inis = state.iniciativas.filter((i) => !orgao || i.orgao === orgao);
  for (const i of inis) {
    const p = programaPorId(state, i.programaId);
    if (bate(i.nome))
      out.push({ id: i.id, tipo: "Iniciativa", titulo: i.nome, contexto: `Programa ${p?.nome ?? "—"} · ${i.orgao}`, to: "/iniciativa/$id", params: { id: i.id } });
    for (const ind of i.indicadores ?? [])
      if (bate(ind.nome))
        out.push({ id: ind.id, tipo: "Indicador", titulo: ind.nome, contexto: `Indicador de Iniciativa · ${i.nome}`, to: "/iniciativa/$id", params: { id: i.id } });
  }

  for (const e of state.entregas) {
    const i = state.iniciativas.find((x) => x.id === e.iniciativaId);
    if (!i || (orgao && i.orgao !== orgao)) continue;
    const p = programaPorId(state, i.programaId);
    if (bate(e.nome))
      out.push({ id: e.id, tipo: "Entrega", titulo: e.nome, contexto: `${p?.nome ?? "—"} › ${i.nome}`, to: "/entrega/$id", params: { id: e.id } });
  }

  for (const prj of PROJETOS) {
    if (orgao && prj.orgao !== orgao) continue;
    if (!bate(prj.nome, prj.codigo)) continue;
    const ents = state.vinculos.filter((v) => v.projetoId === prj.id).length;
    out.push({
      id: prj.id,
      tipo: "Projeto GOMAP",
      titulo: `${prj.codigo} — ${prj.nome}`,
      contexto: `${prj.orgao} · ${ents} Entrega(s) do PPA relacionadas`,
      to: "/central/analises/projetos",
      search: { q: prj.codigo },
    });
  }

  for (const acao of ACOES) {
    if (orgao && acao.orgao !== orgao) continue;
    if (!bate(acao.codigo, acao.nome)) continue;
    const entregaId = entregaDaAcao(state, acao.id);
    const entrega = entregaId ? state.entregas.find((e) => e.id === entregaId) : null;
    out.push({
      id: acao.id,
      tipo: "Ação Orçamentária",
      titulo: `${acao.codigo} — ${acao.nome}`,
      contexto: `${moedaCurta(totalDaAcao(acao.id))} no SIAFIC · ${entrega ? `financia ${entrega.nome}` : "sem Entrega vinculada"}`,
      to: "/central/analises/ipofs",
      search: { q: acao.codigo },
    });
  }

  for (const ipof of IPOFS) {
    if (orgao && ipof.orgao !== orgao) continue;
    const projeto = projetoPorIdSimples(ipof.projetoId);
    if (!bate(ipof.codigo, ipof.nome, ...fontesDoIpof(ipof))) continue;
    out.push({
      id: ipof.id,
      tipo: "IPOF",
      titulo: `${ipof.codigo} — ${ipof.nome}`,
      contexto: `${fontesDoIpof(ipof).join(", ")} · ${projeto ? projeto.codigo : "sem Projeto"} · ${moedaCurta(totalDoIpof(ipof))}`,
      to: "/central/analises/ipofs",
      search: { q: ipof.codigo },
    });
  }

  return out.slice(0, 30);
}

/* ---------- Cobertura de causas ---------- */

export type Cobertura = "direta" | "indireta" | "sem";

export const COBERTURA_LABEL: Record<Cobertura, string> = {
  direta: "Cobertura direta",
  indireta: "Cobertura por subcausas",
  sem: "Sem atuação cadastrada",
};

export function coberturaCausa(state: PpaState, programaId: string, causaId: string, subcausaIds: string[]) {
  const inisPrograma = state.iniciativas.filter((i) => i.programaId === programaId);
  const diretas = inisPrograma.filter((i) => i.causas.includes(causaId));
  const indiretas = inisPrograma.filter((i) => i.causas.some((c) => subcausaIds.includes(c)));
  const iniciativas = [...new Set([...diretas, ...indiretas])];
  const entregas = state.entregas.filter((e) => iniciativas.some((i) => i.id === e.iniciativaId));
  const orgaos = [...new Set(iniciativas.map((i) => i.orgao))].sort((a, b) => a.localeCompare(b));
  const cobertura: Cobertura = diretas.length > 0 ? "direta" : indiretas.length > 0 ? "indireta" : "sem";
  return { cobertura, iniciativas, entregas, orgaos, diretas, indiretas };
}
