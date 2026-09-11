import { ANOS, PROJETOS } from "./seed.js";
import {
  coberturaCausa,
  entregasDaIniciativa,
  moedaCurta,
  pendenciasIniciativa,
  programaPorId,
  projetosDaEntrega,
  resumoPendencias,
  semContribuicao
} from "./regras.js";
import { acoesDaEntrega, linhasDaEntrega, linhasFinanceiras, todosIpofs, totalDoIpof } from "./financeiro.js";
function sugestoesAtena(state, pathname) {
  const central = pathname.startsWith("/central");
  const out = [];
  const entregaId = pathname.startsWith("/entrega/") ? pathname.split("/")[2] ?? null : null;
  const iniId = /^\/(central\/)?iniciativa\//.test(pathname) ? pathname.split("/").pop() ?? null : null;
  if (entregaId) out.push(...sugestoesEntrega(state, entregaId));
  if (iniId) out.push(...sugestoesIniciativa(state, iniId));
  if (!entregaId && !iniId) {
    out.push(...central ? sugestoesCentral(state) : sugestoesSetorial(state));
  }
  return out.slice(0, 6);
}
function sugestoesEntrega(state, entregaId) {
  const e = state.entregas.find((x) => x.id === entregaId);
  if (!e) return [];
  const out = [];
  const palavrasProjeto = /(constru|reforma|implanta|aquisi)/i;
  if (palavrasProjeto.test(e.nome))
    out.push({
      id: `${e.id}-nome`,
      nivel: 3,
      texto: `O nome \u201C${e.nome}\u201D parece descrever um Projeto. Avalie se a Entrega deveria representar o resultado produzido para a sociedade.`
    });
  const semMeta = ANOS.filter((a) => e.metas[a] === null || e.metas[a] === void 0);
  if (semMeta.length > 0 && semMeta.length < ANOS.length)
    out.push({ id: `${e.id}-metas`, nivel: 2, texto: `A meta de ${semMeta.join(", ")} ainda n\xE3o foi informada.` });
  if (!e.unidadeMedida)
    out.push({
      id: `${e.id}-unidade`,
      nivel: 2,
      texto: "A unidade de medida ainda n\xE3o foi informada \u2014 ela define como a meta ser\xE1 lida e comprovada."
    });
  if (e.territorio.tipo === "territorializavel" && e.territorio.regioes.length === 0)
    out.push({
      id: `${e.id}-territorio`,
      nivel: 2,
      texto: "A Entrega foi definida como territorializ\xE1vel, mas nenhuma regi\xE3o foi informada."
    });
  const fin = linhasDaEntrega(state, entregaId);
  const acoes = acoesDaEntrega(state, entregaId);
  const projetosVinc = projetosDaEntrega(state, entregaId);
  if (acoes.length === 0)
    out.push({
      id: `${e.id}-sem-acao`,
      nivel: 2,
      texto: "Nenhuma A\xE7\xE3o Or\xE7ament\xE1ria est\xE1 vinculada a esta Entrega. Sem v\xEDnculo, ela permanece sem valor financeiro no PPA."
    });
  if (projetosVinc.length > 0 && acoes.length === 0)
    out.push({
      id: `${e.id}-projeto-sem-acao`,
      nivel: 2,
      texto: "H\xE1 Projeto GOMAP associado, mas nenhuma A\xE7\xE3o vinculada. O Projeto informa como se produz, n\xE3o quanto se gasta."
    });
  for (const p of projetosVinc) {
    const noPpa = fin.filter((l) => l.projeto?.id === p.id).reduce((s2, l) => s2 + l.total, 0);
    if (noPpa > 0 && Math.abs(p.valorGlobal - noPpa) / p.valorGlobal > 0.3)
      out.push({
        id: `${e.id}-desc-${p.id}`,
        nivel: 3,
        texto: `O Projeto ${p.codigo} tem valor global de ${moedaCurta(p.valorGlobal)} no GOMAP, enquanto ${moedaCurta(noPpa)} aparecem nesta Entrega. A diferen\xE7a pode estar em outras Entregas ou fora do per\xEDodo do PPA.`
      });
  }
  return out;
}
function sugestoesIniciativa(state, iniId) {
  const i = state.iniciativas.find((x) => x.id === iniId);
  if (!i) return [];
  const out = [];
  if (i.causas.length === 0)
    out.push({
      id: `${i.id}-causas`,
      nivel: 3,
      texto: "Esta Iniciativa ainda n\xE3o est\xE1 relacionada a nenhuma causa do Programa."
    });
  if (i.resultadoEsperado && i.descricao && semelhante(i.resultadoEsperado, i.descricao))
    out.push({
      id: `${i.id}-resultado`,
      nivel: 2,
      texto: "O resultado esperado est\xE1 muito semelhante \xE0 descri\xE7\xE3o da Iniciativa. Deseja revisar?"
    });
  const r = resumoPendencias(pendenciasIniciativa(state, i));
  if (r.impeditivos === 0 && (i.status === "em_preenchimento" || i.status === "devolvida"))
    out.push({
      id: `${i.id}-envio`,
      nivel: 2,
      texto: "Esta Iniciativa n\xE3o possui mais pend\xEAncias impeditivas e est\xE1 apta a ser enviada para an\xE1lise."
    });
  const eventos = state.eventos.filter((ev) => ev.iniciativaId === i.id);
  if (eventos.some((ev) => /devolvida/i.test(ev.texto)) && i.versao > 1)
    out.push({
      id: `${i.id}-versao`,
      nivel: 1,
      texto: `Esta Iniciativa est\xE1 na vers\xE3o ${i.versao}, ap\xF3s devolu\xE7\xE3o da \xC1rea Central.`
    });
  return out;
}
function sugestoesSetorial(state) {
  const out = [];
  const minhas = state.iniciativas.filter((i) => i.orgao === state.orgaoAtual);
  const devolvidas = minhas.filter((i) => i.status === "devolvida");
  if (devolvidas.length > 0)
    out.push({
      id: "set-devolvidas",
      nivel: 2,
      texto: `${devolvidas.length} Iniciativa(s) do \xF3rg\xE3o foram devolvidas e aguardam ajuste.`,
      to: "/iniciativas",
      rotuloAcao: "Ver Iniciativas"
    });
  const aptas = minhas.filter(
    (i) => (i.status === "em_preenchimento" || i.status === "devolvida") && resumoPendencias(pendenciasIniciativa(state, i)).impeditivos === 0
  );
  if (aptas.length > 0)
    out.push({
      id: "set-aptas",
      nivel: 2,
      texto: `${aptas.length} Iniciativa(s) sem pend\xEAncias impeditivas j\xE1 podem ser enviadas para an\xE1lise.`,
      to: "/iniciativas",
      rotuloAcao: "Ver Iniciativas"
    });
  const naoAvaliados = state.programas.filter(
    (p) => !semContribuicao(state, p.id, state.orgaoAtual) && !state.iniciativas.some((i) => i.programaId === p.id && i.orgao === state.orgaoAtual)
  ).length;
  if (naoAvaliados > 0)
    out.push({
      id: "set-nao-avaliados",
      nivel: 1,
      texto: `${naoAvaliados} Programa(s) ainda n\xE3o foram avaliados pelo \xF3rg\xE3o \u2014 \xE9 poss\xEDvel registrar que n\xE3o h\xE1 contribui\xE7\xE3o.`
    });
  const semEntrega = minhas.filter((i) => entregasDaIniciativa(state, i.id).length === 0).length;
  if (semEntrega > 0)
    out.push({ id: "set-sem-entrega", nivel: 2, texto: `${semEntrega} Iniciativa(s) ainda n\xE3o possuem Entregas.` });
  return out;
}
function sugestoesCentral(state) {
  const out = [];
  const prontos = state.programas.filter((p) => p.aptidao === "apto" && p.disponibilizacao !== "disponivel").length;
  if (prontos > 0)
    out.push({
      id: "cen-prontos",
      nivel: 2,
      texto: `${prontos} Programa(s) metodologicamente aptos ainda n\xE3o foram disponibilizados para contribui\xE7\xF5es.`,
      to: "/central/programas",
      rotuloAcao: "Abrir administra\xE7\xE3o"
    });
  const semAtuacao = state.programas.flatMap(
    (p) => p.causas.filter((c) => coberturaCausa(state, p.id, c.id, c.subcausas.map((s) => s.id)).cobertura === "sem").map((c) => ({ p, c }))
  );
  if (semAtuacao.length > 0)
    out.push({
      id: "cen-causas",
      nivel: 3,
      texto: `${semAtuacao.length} causa(s) cadastradas ainda n\xE3o possuem nenhuma Iniciativa relacionada \u2014 por exemplo, \u201C${semAtuacao[0].c.texto}\u201D.`,
      to: "/central/analises/causas",
      rotuloAcao: "Ver cobertura das causas"
    });
  const silenciosos = new Set(state.iniciativas.map((i) => i.orgao));
  const semManifestacao = 8 - silenciosos.size;
  if (semManifestacao > 0)
    out.push({
      id: "cen-orgaos",
      nivel: 1,
      texto: `${semManifestacao} \xF3rg\xE3o(s) ainda n\xE3o se manifestaram sobre nenhum Programa.`,
      to: "/central/orgaos",
      rotuloAcao: "Ver \xF3rg\xE3os"
    });
  const linhas = linhasFinanceiras(state);
  const critico = todosIpofs().map(({ ipof }) => {
    const usado = linhas.filter((l) => l.ipof.id === ipof.id);
    const total = totalDoIpof(ipof);
    return {
      ipof,
      perc: total > 0 ? usado.reduce((s, l) => s + l.total, 0) / total * 100 : 0,
      entregas: new Set(usado.map((l) => l.entregaId)).size
    };
  }).filter((x) => x.perc >= 85).sort((a, b) => b.perc - a.perc)[0];
  if (critico)
    out.push({
      id: "cen-ipof",
      nivel: 2,
      texto: `O ${critico.ipof.codigo} tem ${critico.perc.toFixed(0)}% do valor do SIAFIC refletido em ${critico.entregas} Entrega(s) do PPA.`,
      to: "/central/analises/ipofs",
      rotuloAcao: "Ver IPOFs"
    });
  const compartilhado = PROJETOS.map((p) => ({
    p,
    entregas: state.vinculos.filter((v) => v.projetoId === p.id).length
  })).find((x) => x.entregas > 1);
  if (compartilhado)
    out.push({
      id: "cen-projeto",
      nivel: 1,
      texto: `${compartilhado.entregas} Entregas utilizam o Projeto ${compartilhado.p.codigo}. Os valores continuam controlados separadamente pelos IPOFs.`,
      to: "/central/analises/projetos",
      rotuloAcao: "Ver Projetos"
    });
  const emAnalise = state.iniciativas.filter((i) => i.status === "em_analise" || i.status === "enviada").length;
  const validadas = state.iniciativas.filter((i) => i.status === "validada").length;
  if (emAnalise + validadas > 0)
    out.push({
      id: "cen-consolidacao",
      nivel: 1,
      texto: `${validadas} Iniciativa(s) validadas e ${emAnalise} aguardando an\xE1lise no PPA.`
    });
  const totalPrevisto = linhas.reduce((s, l) => s + l.total, 0);
  if (totalPrevisto > 0)
    out.push({
      id: "cen-financeiro",
      nivel: 1,
      texto: `Previs\xE3o consolidada de ${moedaCurta(totalPrevisto)} apropriados por ${new Set(linhas.map((l) => l.fonte)).size} fontes de recursos.`,
      to: "/central/analises/financeira",
      rotuloAcao: "Abrir an\xE1lise financeira"
    });
  return out;
}
function semelhante(a, b) {
  const norm = (s) => s.toLowerCase().replace(/[^a-zà-ú ]/g, " ").split(/\s+/).filter((w) => w.length > 4);
  const A = new Set(norm(a));
  const B = norm(b);
  if (A.size === 0 || B.length === 0) return false;
  const comuns = B.filter((w) => A.has(w)).length;
  return comuns / Math.max(A.size, B.length) > 0.6;
}
function responderAtena(state, pergunta) {
  const q = pergunta.toLowerCase();
  const linhas = linhasFinanceiras(state);
  if (/causa.*(sem|não).*atua|quais causas/.test(q)) {
    const itens = state.programas.flatMap(
      (p) => p.causas.filter((c) => coberturaCausa(state, p.id, c.id, c.subcausas.map((s) => s.id)).cobertura === "sem").map((c) => `${p.codigo}: ${c.texto}`)
    );
    return itens.length === 0 ? "Todas as causas cadastradas possuem ao menos uma Iniciativa relacionada." : `Causas sem atua\xE7\xE3o cadastrada:
\u2022 ${itens.slice(0, 6).join("\n\u2022 ")}`;
  }
  if (/órgãos?.*análise|em análise/.test(q)) {
    const orgs = [...new Set(state.iniciativas.filter((i) => i.status === "em_analise" || i.status === "enviada").map((i) => i.orgao))];
    return orgs.length === 0 ? "Nenhuma Iniciativa aguardando an\xE1lise." : `\xD3rg\xE3os com Iniciativas em an\xE1lise: ${orgs.join(", ")}.`;
  }
  const gomap = q.match(/gomap[-\s]?(\d+)/);
  if (gomap) {
    const proj = PROJETOS.find((p) => p.codigo.toLowerCase().includes(gomap[1]));
    if (!proj) return "N\xE3o encontrei esse Projeto no GOMAP.";
    const ents = state.vinculos.filter((v) => v.projetoId === proj.id).map((v) => state.entregas.find((e) => e.id === v.entregaId)?.nome).filter(Boolean);
    return ents.length === 0 ? `O Projeto ${proj.codigo} ainda n\xE3o est\xE1 relacionado a nenhuma Entrega do PPA.` : `Entregas que utilizam o ${proj.codigo}:
\u2022 ${ents.join("\n\u2022 ")}`;
  }
  const ipof = q.match(/ipof[\s]?([\d.]+)/);
  if (ipof) {
    const rel = linhas.filter((l) => l.ipof.codigo.toLowerCase().includes(ipof[1]));
    if (rel.length === 0) return "Esse IPOF ainda n\xE3o est\xE1 apropriado em nenhuma Entrega do PPA.";
    return `Apropria\xE7\xF5es encontradas:
\u2022 ${rel.map((l) => `${l.entrega} (${l.orgao}) \u2014 ${moedaCurta(l.total)}`).join("\n\u2022 ")}`;
  }
  if (/fonte de recursos|por fonte/.test(q)) {
    const porFonte = /* @__PURE__ */ new Map();
    for (const l of linhas) porFonte.set(l.fonte, (porFonte.get(l.fonte) ?? 0) + l.total);
    return `Previs\xE3o por fonte:
\u2022 ${[...porFonte.entries()].sort((a, b) => b[1] - a[1]).map(([f, v]) => `${f}: ${moedaCurta(v)}`).join("\n\u2022 ")}`;
  }
  if (/convênio/.test(q)) {
    const ents = [...new Set(linhas.filter((l) => /convênio/i.test(l.fonte)).map((l) => l.entrega))];
    return ents.length === 0 ? "Nenhuma Entrega com recursos de conv\xEAnios com a Uni\xE3o." : `Entregas com recursos de conv\xEAnios com a Uni\xE3o:
\u2022 ${ents.join("\n\u2022 ")}`;
  }
  const resumo = q.match(/resuma a contribuição d[ao] (.+)/);
  if (resumo) {
    const alvo = resumo[1].trim();
    const inis = state.iniciativas.filter((i) => i.orgao.toLowerCase().includes(alvo.toLowerCase()));
    if (inis.length === 0) return "N\xE3o encontrei contribui\xE7\xF5es desse \xF3rg\xE3o.";
    const prev = linhas.filter((l) => inis.some((i) => i.id === l.iniciativaId)).reduce((s, l) => s + l.total, 0);
    const progs = new Set(inis.map((i) => programaPorId(state, i.programaId)?.codigo));
    return `${inis[0].orgao}: ${inis.length} Iniciativa(s) em ${progs.size} Programa(s), com ${moedaCurta(prev)} previstos.`;
  }
  return null;
}
export {
  responderAtena,
  sugestoesAtena
};
