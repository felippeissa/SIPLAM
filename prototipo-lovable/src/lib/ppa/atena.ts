import { ANOS, PROJETOS } from "./seed";
import {
  coberturaCausa,
  entregasDaIniciativa,
  moedaCurta,
  pendenciasIniciativa,
  programaPorId,
  projetosDaEntrega,
  resumoPendencias,
  semContribuicao,
} from "./regras";
import { acoesDaEntrega, linhasDaEntrega, linhasFinanceiras, todosIpofs, totalDoIpof } from "./financeiro";
import type { PpaState } from "./types";

export type NivelSugestao = 1 | 2 | 3;

export interface Sugestao {
  id: string;
  nivel: NivelSugestao;
  texto: string;
  /** Link opcional para o componente relacionado. */
  to?: string;
  params?: Record<string, string>;
  rotuloAcao?: string;
}

/**
 * Sugestões proativas derivadas exclusivamente dos dados já existentes no PPA.
 * A Atena observa, identifica e sugere — nunca altera dados.
 */
export function sugestoesAtena(state: PpaState, pathname: string): Sugestao[] {
  const central = pathname.startsWith("/central");
  const out: Sugestao[] = [];
  const entregaId = pathname.startsWith("/entrega/") ? (pathname.split("/")[2] ?? null) : null;
  const iniId = /^\/(central\/)?iniciativa\//.test(pathname) ? (pathname.split("/").pop() ?? null) : null;

  if (entregaId) out.push(...sugestoesEntrega(state, entregaId));
  if (iniId) out.push(...sugestoesIniciativa(state, iniId));
  if (!entregaId && !iniId) {
    out.push(...(central ? sugestoesCentral(state) : sugestoesSetorial(state)));
  }
  return out.slice(0, 6);
}

function sugestoesEntrega(state: PpaState, entregaId: string): Sugestao[] {
  const e = state.entregas.find((x) => x.id === entregaId);
  if (!e) return [];
  const out: Sugestao[] = [];
  const palavrasProjeto = /(constru|reforma|implanta|aquisi)/i;

  if (palavrasProjeto.test(e.nome))
    out.push({
      id: `${e.id}-nome`,
      nivel: 3,
      texto: `O nome “${e.nome}” parece descrever um Projeto. Avalie se a Entrega deveria representar o resultado produzido para a sociedade.`,
    });

  const semMeta = ANOS.filter((a) => e.metas[a] === null || e.metas[a] === undefined);
  if (semMeta.length > 0 && semMeta.length < ANOS.length)
    out.push({ id: `${e.id}-metas`, nivel: 2, texto: `A meta de ${semMeta.join(", ")} ainda não foi informada.` });

  if (!e.unidadeMedida)
    out.push({
      id: `${e.id}-unidade`,
      nivel: 2,
      texto: "A unidade de medida ainda não foi informada — ela define como a meta será lida e comprovada.",
    });

  if (e.territorio.tipo === "territorializavel" && e.territorio.regioes.length === 0)
    out.push({
      id: `${e.id}-territorio`,
      nivel: 2,
      texto: "A Entrega foi definida como territorializável, mas nenhuma região foi informada.",
    });

  const fin = linhasDaEntrega(state, entregaId);
  const acoes = acoesDaEntrega(state, entregaId);
  const projetosVinc = projetosDaEntrega(state, entregaId);

  if (acoes.length === 0)
    out.push({
      id: `${e.id}-sem-acao`,
      nivel: 2,
      texto:
        "Nenhuma Ação Orçamentária está vinculada a esta Entrega. Sem vínculo, ela permanece sem valor financeiro no PPA.",
    });

  if (projetosVinc.length > 0 && acoes.length === 0)
    out.push({
      id: `${e.id}-projeto-sem-acao`,
      nivel: 2,
      texto: "Há Projeto GOMAP associado, mas nenhuma Ação vinculada. O Projeto informa como se produz, não quanto se gasta.",
    });

  for (const p of projetosVinc) {
    const noPpa = fin.filter((l) => l.projeto?.id === p.id).reduce((s2, l) => s2 + l.total, 0);
    if (noPpa > 0 && Math.abs(p.valorGlobal - noPpa) / p.valorGlobal > 0.3)
      out.push({
        id: `${e.id}-desc-${p.id}`,
        nivel: 3,
        texto: `O Projeto ${p.codigo} tem valor global de ${moedaCurta(p.valorGlobal)} no GOMAP, enquanto ${moedaCurta(noPpa)} aparecem nesta Entrega. A diferença pode estar em outras Entregas ou fora do período do PPA.`,
      });
  }

  return out;
}

function sugestoesIniciativa(state: PpaState, iniId: string): Sugestao[] {
  const i = state.iniciativas.find((x) => x.id === iniId);
  if (!i) return [];
  const out: Sugestao[] = [];

  if (i.causas.length === 0)
    out.push({
      id: `${i.id}-causas`,
      nivel: 3,
      texto: "Esta Iniciativa ainda não está relacionada a nenhuma causa do Programa.",
    });

  if (i.resultadoEsperado && i.descricao && semelhante(i.resultadoEsperado, i.descricao))
    out.push({
      id: `${i.id}-resultado`,
      nivel: 2,
      texto: "O resultado esperado está muito semelhante à descrição da Iniciativa. Deseja revisar?",
    });

  const r = resumoPendencias(pendenciasIniciativa(state, i));
  if (r.impeditivos === 0 && (i.status === "em_preenchimento" || i.status === "devolvida"))
    out.push({
      id: `${i.id}-envio`,
      nivel: 2,
      texto: "Esta Iniciativa não possui mais pendências impeditivas e está apta a ser enviada para análise.",
    });

  const eventos = state.eventos.filter((ev) => ev.iniciativaId === i.id);
  if (eventos.some((ev) => /devolvida/i.test(ev.texto)) && i.versao > 1)
    out.push({
      id: `${i.id}-versao`,
      nivel: 1,
      texto: `Esta Iniciativa está na versão ${i.versao}, após devolução da Área Central.`,
    });

  return out;
}

function sugestoesSetorial(state: PpaState): Sugestao[] {
  const out: Sugestao[] = [];
  const minhas = state.iniciativas.filter((i) => i.orgao === state.orgaoAtual);
  const devolvidas = minhas.filter((i) => i.status === "devolvida");
  if (devolvidas.length > 0)
    out.push({
      id: "set-devolvidas",
      nivel: 2,
      texto: `${devolvidas.length} Iniciativa(s) do órgão foram devolvidas e aguardam ajuste.`,
      to: "/iniciativas",
      rotuloAcao: "Ver Iniciativas",
    });

  const aptas = minhas.filter(
    (i) =>
      (i.status === "em_preenchimento" || i.status === "devolvida") &&
      resumoPendencias(pendenciasIniciativa(state, i)).impeditivos === 0,
  );
  if (aptas.length > 0)
    out.push({
      id: "set-aptas",
      nivel: 2,
      texto: `${aptas.length} Iniciativa(s) sem pendências impeditivas já podem ser enviadas para análise.`,
      to: "/iniciativas",
      rotuloAcao: "Ver Iniciativas",
    });

  const naoAvaliados = state.programas.filter(
    (p) =>
      !semContribuicao(state, p.id, state.orgaoAtual) &&
      !state.iniciativas.some((i) => i.programaId === p.id && i.orgao === state.orgaoAtual),
  ).length;
  if (naoAvaliados > 0)
    out.push({
      id: "set-nao-avaliados",
      nivel: 1,
      texto: `${naoAvaliados} Programa(s) ainda não foram avaliados pelo órgão — é possível registrar que não há contribuição.`,
    });

  const semEntrega = minhas.filter((i) => entregasDaIniciativa(state, i.id).length === 0).length;
  if (semEntrega > 0)
    out.push({ id: "set-sem-entrega", nivel: 2, texto: `${semEntrega} Iniciativa(s) ainda não possuem Entregas.` });

  return out;
}

function sugestoesCentral(state: PpaState): Sugestao[] {
  const out: Sugestao[] = [];

  const prontos = state.programas.filter((p) => p.aptidao === "apto" && p.disponibilizacao !== "disponivel").length;
  if (prontos > 0)
    out.push({
      id: "cen-prontos",
      nivel: 2,
      texto: `${prontos} Programa(s) metodologicamente aptos ainda não foram disponibilizados para contribuições.`,
      to: "/central/programas",
      rotuloAcao: "Abrir administração",
    });

  const semAtuacao = state.programas.flatMap((p) =>
    p.causas
      .filter((c) => coberturaCausa(state, p.id, c.id, c.subcausas.map((s) => s.id)).cobertura === "sem")
      .map((c) => ({ p, c })),
  );
  if (semAtuacao.length > 0)
    out.push({
      id: "cen-causas",
      nivel: 3,
      texto: `${semAtuacao.length} causa(s) cadastradas ainda não possuem nenhuma Iniciativa relacionada — por exemplo, “${semAtuacao[0]!.c.texto}”.`,
      to: "/central/analises/causas",
      rotuloAcao: "Ver cobertura das causas",
    });

  const silenciosos = new Set(state.iniciativas.map((i) => i.orgao));
  const semManifestacao = 8 - silenciosos.size;
  if (semManifestacao > 0)
    out.push({
      id: "cen-orgaos",
      nivel: 1,
      texto: `${semManifestacao} órgão(s) ainda não se manifestaram sobre nenhum Programa.`,
      to: "/central/orgaos",
      rotuloAcao: "Ver órgãos",
    });

  const linhas = linhasFinanceiras(state);
  const critico = todosIpofs()
    .map(({ ipof }) => {
      const usado = linhas.filter((l) => l.ipof.id === ipof.id);
      const total = totalDoIpof(ipof);
      return {
        ipof,
        perc: total > 0 ? (usado.reduce((s, l) => s + l.total, 0) / total) * 100 : 0,
        entregas: new Set(usado.map((l) => l.entregaId)).size,
      };
    })
    .filter((x) => x.perc >= 85)
    .sort((a, b) => b.perc - a.perc)[0];
  if (critico)
    out.push({
      id: "cen-ipof",
      nivel: 2,
      texto: `O ${critico.ipof.codigo} tem ${critico.perc.toFixed(0)}% do valor do SIAFIC refletido em ${critico.entregas} Entrega(s) do PPA.`,
      to: "/central/analises/ipofs",
      rotuloAcao: "Ver IPOFs",
    });

  const compartilhado = PROJETOS.map((p) => ({
    p,
    entregas: state.vinculos.filter((v) => v.projetoId === p.id).length,
  })).find((x) => x.entregas > 1);
  if (compartilhado)
    out.push({
      id: "cen-projeto",
      nivel: 1,
      texto: `${compartilhado.entregas} Entregas utilizam o Projeto ${compartilhado.p.codigo}. Os valores continuam controlados separadamente pelos IPOFs.`,
      to: "/central/analises/projetos",
      rotuloAcao: "Ver Projetos",
    });

  const emAnalise = state.iniciativas.filter((i) => i.status === "em_analise" || i.status === "enviada").length;
  const validadas = state.iniciativas.filter((i) => i.status === "validada").length;
  if (emAnalise + validadas > 0)
    out.push({
      id: "cen-consolidacao",
      nivel: 1,
      texto: `${validadas} Iniciativa(s) validadas e ${emAnalise} aguardando análise no PPA.`,
    });

  const totalPrevisto = linhas.reduce((s, l) => s + l.total, 0);
  if (totalPrevisto > 0)
    out.push({
      id: "cen-financeiro",
      nivel: 1,
      texto: `Previsão consolidada de ${moedaCurta(totalPrevisto)} apropriados por ${new Set(linhas.map((l) => l.fonte)).size} fontes de recursos.`,
      to: "/central/analises/financeira",
      rotuloAcao: "Abrir análise financeira",
    });

  return out;
}

function semelhante(a: string, b: string) {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-zà-ú ]/g, " ").split(/\s+/).filter((w) => w.length > 4);
  const A = new Set(norm(a));
  const B = norm(b);
  if (A.size === 0 || B.length === 0) return false;
  const comuns = B.filter((w) => A.has(w)).length;
  return comuns / Math.max(A.size, B.length) > 0.6;
}

/* ---------- Respostas analíticas simuladas ---------- */

export function responderAtena(state: PpaState, pergunta: string): string | null {
  const q = pergunta.toLowerCase();
  const linhas = linhasFinanceiras(state);

  if (/causa.*(sem|não).*atua|quais causas/.test(q)) {
    const itens = state.programas.flatMap((p) =>
      p.causas
        .filter((c) => coberturaCausa(state, p.id, c.id, c.subcausas.map((s) => s.id)).cobertura === "sem")
        .map((c) => `${p.codigo}: ${c.texto}`),
    );
    return itens.length === 0
      ? "Todas as causas cadastradas possuem ao menos uma Iniciativa relacionada."
      : `Causas sem atuação cadastrada:\n• ${itens.slice(0, 6).join("\n• ")}`;
  }

  if (/órgãos?.*análise|em análise/.test(q)) {
    const orgs = [...new Set(state.iniciativas.filter((i) => i.status === "em_analise" || i.status === "enviada").map((i) => i.orgao))];
    return orgs.length === 0 ? "Nenhuma Iniciativa aguardando análise." : `Órgãos com Iniciativas em análise: ${orgs.join(", ")}.`;
  }

  const gomap = q.match(/gomap[-\s]?(\d+)/);
  if (gomap) {
    const proj = PROJETOS.find((p) => p.codigo.toLowerCase().includes(gomap[1]!));
    if (!proj) return "Não encontrei esse Projeto no GOMAP.";
    const ents = state.vinculos
      .filter((v) => v.projetoId === proj.id)
      .map((v) => state.entregas.find((e) => e.id === v.entregaId)?.nome)
      .filter(Boolean);
    return ents.length === 0
      ? `O Projeto ${proj.codigo} ainda não está relacionado a nenhuma Entrega do PPA.`
      : `Entregas que utilizam o ${proj.codigo}:\n• ${ents.join("\n• ")}`;
  }

  const ipof = q.match(/ipof[\s]?([\d.]+)/);
  if (ipof) {
    const rel = linhas.filter((l) => l.ipof.codigo.toLowerCase().includes(ipof[1]!));
    if (rel.length === 0) return "Esse IPOF ainda não está apropriado em nenhuma Entrega do PPA.";
    return `Apropriações encontradas:\n• ${rel
      .map((l) => `${l.entrega} (${l.orgao}) — ${moedaCurta(l.total)}`)
      .join("\n• ")}`;
  }

  if (/fonte de recursos|por fonte/.test(q)) {
    const porFonte = new Map<string, number>();
    for (const l of linhas) porFonte.set(l.fonte, (porFonte.get(l.fonte) ?? 0) + l.total);
    return `Previsão por fonte:\n• ${[...porFonte.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([f, v]) => `${f}: ${moedaCurta(v)}`)
      .join("\n• ")}`;
  }

  if (/convênio/.test(q)) {
    const ents = [...new Set(linhas.filter((l) => /convênio/i.test(l.fonte)).map((l) => l.entrega))];
    return ents.length === 0
      ? "Nenhuma Entrega com recursos de convênios com a União."
      : `Entregas com recursos de convênios com a União:\n• ${ents.join("\n• ")}`;
  }

  const resumo = q.match(/resuma a contribuição d[ao] (.+)/);
  if (resumo) {
    const alvo = resumo[1]!.trim();
    const inis = state.iniciativas.filter((i) => i.orgao.toLowerCase().includes(alvo.toLowerCase()));
    if (inis.length === 0) return "Não encontrei contribuições desse órgão.";
    const prev = linhas.filter((l) => inis.some((i) => i.id === l.iniciativaId)).reduce((s, l) => s + l.total, 0);
    const progs = new Set(inis.map((i) => programaPorId(state, i.programaId)?.codigo));
    return `${inis[0]!.orgao}: ${inis.length} Iniciativa(s) em ${progs.size} Programa(s), com ${moedaCurta(prev)} previstos.`;
  }

  return null;
}
