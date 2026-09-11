import { ACOES, ANOS, EXECUCAO_SIAFIC, IPOFS, PROJETOS } from "./seed.js";
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
  totalDoIpof
} from "./financeiro.js";
const STATUS_LABEL = {
  em_preenchimento: "Em preenchimento",
  enviada: "Enviada",
  em_analise: "Em an\xE1lise pela \xC1rea Central",
  devolvida: "Devolvida para ajuste",
  validada: "Validada"
};
const STATUS_CURTO = {
  em_preenchimento: "Em preenchimento",
  enviada: "Enviada",
  em_analise: "Em an\xE1lise",
  devolvida: "Devolvida",
  validada: "Validada"
};
const COMPORTAMENTOS = [
  { id: "acumulativa", nome: "Acumulativa", ajuda: "Os valores anuais se somam ao longo do plano." },
  { id: "fluxo", nome: "Fluxo anual", ajuda: "Cada ano tem seu pr\xF3prio volume, sem soma." },
  { id: "estoque", nome: "Estoque", ajuda: "O valor representa a situa\xE7\xE3o existente ao final do ano." },
  { id: "percentual", nome: "Percentual/Taxa", ajuda: "O valor \xE9 uma propor\xE7\xE3o, n\xE3o uma quantidade." },
  { id: "marco", nome: "Marco", ajuda: "Ocorre uma \xFAnica vez, em um ano espec\xEDfico." }
];
const TERRITORIO_LABEL = {
  estadual: "Abrang\xEAncia estadual",
  territorializavel: "Territorializ\xE1vel",
  nao_territorializavel: "N\xE3o territorializ\xE1vel"
};
function podeEditar(status) {
  return status === "em_preenchimento" || status === "devolvida";
}
function moeda(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}
function moedaCurta(v) {
  if (v >= 1e6) return `R$ ${(v / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
  if (v >= 1e3) return `R$ ${(v / 1e3).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} mil`;
  return moeda(v);
}
function ipofPorId(id) {
  const ipof = IPOFS.find((x) => x.id === id);
  if (!ipof) return null;
  return { ipof, projeto: projetoPorIdSimples(ipof.projetoId) };
}
function projetosDaEntrega(state, entregaId) {
  return state.vinculos.filter((v) => v.entregaId === entregaId).map((v) => PROJETOS.find((p) => p.id === v.projetoId)).filter((p) => !!p);
}
function ipofsDaEntrega(state, entregaId) {
  const mapa = /* @__PURE__ */ new Map();
  for (const l of linhasDaEntrega(state, entregaId)) {
    const atual = mapa.get(l.ipof.id) ?? { ipof: l.ipof, projeto: l.projeto, total: 0 };
    atual.total += l.total;
    mapa.set(l.ipof.id, atual);
  }
  return [...mapa.values()].sort((a, b) => b.total - a.total);
}
const totalDoIpofPpa = (ipofId) => {
  const ipof = IPOFS.find((x) => x.id === ipofId);
  return ipof ? totalDoIpof(ipof) : 0;
};
const resumoIpof = (ipof) => ({
  total: totalDoIpof(ipof),
  fontes: fontesDoIpof(ipof),
  acoes: acoesDoIpof(ipof)
});
const recursosDaEntrega = (state, entregaId) => linhasDaEntrega(state, entregaId).reduce((s, l) => s + l.total, 0);
const recursosDaIniciativa = (state, iniciativaId) => linhasDaIniciativa(state, iniciativaId).reduce((s, l) => s + l.total, 0);
const temVinculoOrcamentario = (state, entregaId) => acoesDaEntrega(state, entregaId).length > 0;
function descompassoProjeto(state, projetoId) {
  const projeto = PROJETOS.find((p) => p.id === projetoId);
  if (!projeto) return null;
  const noPpa = linhasDoProjeto(state, projetoId).reduce((s, l) => s + l.total, 0);
  return { projeto, noPpa, diferenca: projeto.valorGlobal - noPpa };
}
function pendenciasEntrega(state, e) {
  const p = [];
  if (!e.nome.trim()) p.push({ nivel: "impeditivo", campo: "nome", texto: "Nome da Entrega n\xE3o informado", entregaId: e.id });
  if (!e.unidadeMedida) p.push({ nivel: "impeditivo", campo: "unidade", texto: "Unidade de medida n\xE3o informada", entregaId: e.id });
  const faltando = ANOS.filter((a) => e.metas[a] === null || e.metas[a] === void 0);
  if (faltando.length === ANOS.length)
    p.push({ nivel: "impeditivo", campo: "metas", texto: "Nenhuma meta anual informada", entregaId: e.id });
  else if (faltando.length > 0)
    p.push({
      nivel: "impeditivo",
      campo: "metas",
      texto: `Meta n\xE3o informada em ${faltando.join(", ")}`,
      entregaId: e.id
    });
  const comp = e.comportamento ?? e.comportamentoSugerido;
  if (!comp) p.push({ nivel: "impeditivo", campo: "comportamento", texto: "Comportamento da meta n\xE3o definido", entregaId: e.id });
  else if (!e.comportamentoValidado)
    p.push({
      nivel: "alerta",
      campo: "comportamento",
      texto: "Comportamento sugerido pelo sistema ainda n\xE3o validado pelo \xF3rg\xE3o",
      entregaId: e.id
    });
  if (!e.territorio.tipo)
    p.push({ nivel: "impeditivo", campo: "territorio", texto: "Rela\xE7\xE3o com o territ\xF3rio n\xE3o informada", entregaId: e.id });
  else if (e.territorio.tipo === "territorializavel" && e.territorio.regioes.length === 0)
    p.push({ nivel: "impeditivo", campo: "territorio", texto: "Distribui\xE7\xE3o territorial pendente", entregaId: e.id });
  if (!e.metodoComprovacao.trim())
    p.push({ nivel: "alerta", campo: "comprovacao", texto: "M\xE9todo de comprova\xE7\xE3o n\xE3o informado", entregaId: e.id });
  const projs = projetosDaEntrega(state, e.id).length;
  if (projs > 0)
    p.push({ nivel: "informacao", campo: "projetos", texto: `${projs} Projeto(s) GOMAP associado(s)`, entregaId: e.id });
  const acoes = acoesDaEntrega(state, e.id);
  const financeiro = recursosDaEntrega(state, e.id);
  if (acoes.length === 0)
    p.push({
      nivel: "alerta",
      campo: "orcamento",
      texto: "Nenhuma A\xE7\xE3o Or\xE7ament\xE1ria vinculada \u2014 a Entrega n\xE3o possui financeiro no PPA",
      entregaId: e.id
    });
  else
    p.push({
      nivel: "informacao",
      campo: "orcamento",
      texto: `${acoes.length} A\xE7\xE3o(\xF5es) vinculada(s) \xB7 ${moedaCurta(financeiro)} no plano`,
      entregaId: e.id
    });
  return p;
}
function pendenciasIniciativa(state, ini) {
  const p = [];
  if (!ini.nome.trim()) p.push({ nivel: "impeditivo", campo: "nome", texto: "Nome da Iniciativa n\xE3o informado" });
  if (!ini.descricao.trim()) p.push({ nivel: "alerta", campo: "descricao", texto: "Detalhamento da Iniciativa n\xE3o informado" });
  if (ini.causas.length === 0)
    p.push({ nivel: "impeditivo", campo: "causas", texto: "Nenhuma causa do Programa relacionada \xE0 Iniciativa" });
  const es = state.entregas.filter((e) => e.iniciativaId === ini.id);
  if (es.length === 0) p.push({ nivel: "impeditivo", campo: "entregas", texto: "A Iniciativa n\xE3o possui Entregas" });
  for (const e of es) p.push(...pendenciasEntrega(state, e));
  return p;
}
function resumoPendencias(ps) {
  return {
    impeditivos: ps.filter((x) => x.nivel === "impeditivo").length,
    alertas: ps.filter((x) => x.nivel === "alerta").length,
    informacoes: ps.filter((x) => x.nivel === "informacao").length
  };
}
function situacaoEntrega(state, e) {
  const ps = pendenciasEntrega(state, e);
  const r = resumoPendencias(ps);
  if (r.impeditivos > 0)
    return { tom: "impeditivo", texto: `${r.impeditivos} pend\xEAncia${r.impeditivos > 1 ? "s" : ""} impeditiva${r.impeditivos > 1 ? "s" : ""}` };
  if (r.alertas > 0) return { tom: "alerta", texto: `${r.alertas} alerta${r.alertas > 1 ? "s" : ""}` };
  return { tom: "ok", texto: "Completa" };
}
function comentariosDaIniciativa(state, iniciativaId) {
  const ids = state.entregas.filter((e) => e.iniciativaId === iniciativaId).map((e) => e.id);
  return state.comentarios.filter(
    (c) => c.alvoTipo === "iniciativa" && c.alvoId === iniciativaId || c.alvoTipo === "entrega" && ids.includes(c.alvoId)
  );
}
function iniciativasDoOrgao(state, programaId, orgao) {
  return state.iniciativas.filter((i) => i.programaId === programaId && i.orgao === orgao);
}
function entregasDaIniciativa(state, iniciativaId) {
  return state.entregas.filter((e) => e.iniciativaId === iniciativaId);
}
const DISPONIBILIZACAO_LABEL = {
  em_estruturacao: "Em estrutura\xE7\xE3o",
  pronto: "Pronto para disponibiliza\xE7\xE3o",
  disponivel: "Dispon\xEDvel para contribui\xE7\xF5es",
  encerrado: "Encerrado para novas contribui\xE7\xF5es"
};
const APTIDAO_LABEL = {
  incompleto: "Diagn\xF3stico incompleto",
  apto: "Apto"
};
function eixos(programas) {
  return [...new Set(programas.map((p) => p.eixo))].sort((a, b) => a.localeCompare(b));
}
function objetivos(programas, eixo) {
  return [
    ...new Set(programas.filter((p) => !eixo || eixo === "todos" || p.eixo === eixo).map((p) => p.objetivoEstrategico))
  ].sort((a, b) => a.localeCompare(b));
}
function programaPorId(state, id) {
  return state.programas.find((p) => p.id === id);
}
function semContribuicao(state, programaId, orgao) {
  return state.semContribuicao.some((x) => x.programaId === programaId && x.orgao === orgao);
}
function participacaoOrgao(state, programaId, orgao) {
  if (iniciativasDoOrgao(state, programaId, orgao).length > 0) return "com_contribuicao";
  if (semContribuicao(state, programaId, orgao)) return "sem_contribuicao";
  return "nao_avaliado";
}
const PARTICIPACAO_LABEL = {
  com_contribuicao: "Com contribui\xE7\xE3o",
  sem_contribuicao: "Sem contribui\xE7\xE3o informada",
  nao_avaliado: "N\xE3o avaliado"
};
function executadoDaEntrega(entregaId) {
  return EXECUCAO_SIAFIC[entregaId] ?? 0;
}
function executadoDaIniciativa(state, iniciativaId) {
  return entregasDaIniciativa(state, iniciativaId).reduce((s, e) => s + executadoDaEntrega(e.id), 0);
}
function previstoDaIniciativa(state, iniciativaId) {
  return recursosDaIniciativa(state, iniciativaId);
}
function financeiroIniciativa(state, iniciativaId) {
  const previsto = previstoDaIniciativa(state, iniciativaId);
  const executado = executadoDaIniciativa(state, iniciativaId);
  return { previsto, executado, percentual: previsto > 0 ? executado / previsto * 100 : null };
}
function financeiroProgramaOrgao(state, programaId, orgao) {
  const inis = iniciativasDoOrgao(state, programaId, orgao);
  const previsto = inis.reduce((s, i) => s + previstoDaIniciativa(state, i.id), 0);
  const executado = inis.reduce((s, i) => s + executadoDaIniciativa(state, i.id), 0);
  return { previsto, executado, percentual: previsto > 0 ? executado / previsto * 100 : null };
}
function pct(v) {
  return v === null ? "\u2014" : `${v.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}
function orgaosComContribuicao(state) {
  return [...new Set(state.iniciativas.map((i) => i.orgao))].sort((a, b) => a.localeCompare(b));
}
function resumoOrgao(state, orgao) {
  const inis = state.iniciativas.filter((i) => i.orgao === orgao);
  const programas = [...new Set(inis.map((i) => i.programaId))];
  const entregas = inis.reduce((s, i) => s + entregasDaIniciativa(state, i.id).length, 0);
  const previsto = inis.reduce((s, i) => s + previstoDaIniciativa(state, i.id), 0);
  const executado = inis.reduce((s, i) => s + executadoDaIniciativa(state, i.id), 0);
  const conta = (st) => inis.filter((i) => i.status === st).length;
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
    validadas: conta("validada")
  };
}
function prioridadePrograma(state, programaId, orgao) {
  if (semContribuicao(state, programaId, orgao)) return 6;
  const inis = iniciativasDoOrgao(state, programaId, orgao);
  if (inis.length === 0) return 5;
  if (inis.some((i) => i.status === "devolvida")) return 1;
  if (inis.some((i) => i.status === "em_preenchimento")) return 2;
  if (inis.some((i) => i.status === "enviada" || i.status === "em_analise")) return 3;
  return 4;
}
function buscaGlobal(state, termo, orgao) {
  const q = termo.trim().toLowerCase();
  if (q.length < 2) return [];
  const bate = (...campos) => campos.some((c) => (c ?? "").toLowerCase().includes(q));
  const out = [];
  for (const p of state.programas) {
    if (bate(p.nome, p.codigo))
      out.push({ id: p.id, tipo: "Programa", titulo: `${p.codigo} \u2014 ${p.nome}`, contexto: `${p.eixo} \xB7 ${p.objetivoEstrategico}`, to: "/programa/$id", params: { id: p.id } });
    for (const ind of p.indicadores)
      if (bate(ind.nome))
        out.push({ id: `${p.id}-${ind.nome}`, tipo: "Indicador", titulo: ind.nome, contexto: `Indicador de Programa \xB7 ${p.nome}`, to: "/programa/$id", params: { id: p.id } });
  }
  const inis = state.iniciativas.filter((i) => !orgao || i.orgao === orgao);
  for (const i of inis) {
    const p = programaPorId(state, i.programaId);
    if (bate(i.nome))
      out.push({ id: i.id, tipo: "Iniciativa", titulo: i.nome, contexto: `Programa ${p?.nome ?? "\u2014"} \xB7 ${i.orgao}`, to: "/iniciativa/$id", params: { id: i.id } });
    for (const ind of i.indicadores ?? [])
      if (bate(ind.nome))
        out.push({ id: ind.id, tipo: "Indicador", titulo: ind.nome, contexto: `Indicador de Iniciativa \xB7 ${i.nome}`, to: "/iniciativa/$id", params: { id: i.id } });
  }
  for (const e of state.entregas) {
    const i = state.iniciativas.find((x) => x.id === e.iniciativaId);
    if (!i || orgao && i.orgao !== orgao) continue;
    const p = programaPorId(state, i.programaId);
    if (bate(e.nome))
      out.push({ id: e.id, tipo: "Entrega", titulo: e.nome, contexto: `${p?.nome ?? "\u2014"} \u203A ${i.nome}`, to: "/entrega/$id", params: { id: e.id } });
  }
  for (const prj of PROJETOS) {
    if (orgao && prj.orgao !== orgao) continue;
    if (!bate(prj.nome, prj.codigo)) continue;
    const ents = state.vinculos.filter((v) => v.projetoId === prj.id).length;
    out.push({
      id: prj.id,
      tipo: "Projeto GOMAP",
      titulo: `${prj.codigo} \u2014 ${prj.nome}`,
      contexto: `${prj.orgao} \xB7 ${ents} Entrega(s) do PPA relacionadas`,
      to: "/central/analises/projetos",
      search: { q: prj.codigo }
    });
  }
  for (const acao of ACOES) {
    if (orgao && acao.orgao !== orgao) continue;
    if (!bate(acao.codigo, acao.nome)) continue;
    const entregaId = entregaDaAcao(state, acao.id);
    const entrega = entregaId ? state.entregas.find((e) => e.id === entregaId) : null;
    out.push({
      id: acao.id,
      tipo: "A\xE7\xE3o Or\xE7ament\xE1ria",
      titulo: `${acao.codigo} \u2014 ${acao.nome}`,
      contexto: `${moedaCurta(totalDaAcao(acao.id))} no SIAFIC \xB7 ${entrega ? `financia ${entrega.nome}` : "sem Entrega vinculada"}`,
      to: "/central/analises/ipofs",
      search: { q: acao.codigo }
    });
  }
  for (const ipof of IPOFS) {
    if (orgao && ipof.orgao !== orgao) continue;
    const projeto = projetoPorIdSimples(ipof.projetoId);
    if (!bate(ipof.codigo, ipof.nome, ...fontesDoIpof(ipof))) continue;
    out.push({
      id: ipof.id,
      tipo: "IPOF",
      titulo: `${ipof.codigo} \u2014 ${ipof.nome}`,
      contexto: `${fontesDoIpof(ipof).join(", ")} \xB7 ${projeto ? projeto.codigo : "sem Projeto"} \xB7 ${moedaCurta(totalDoIpof(ipof))}`,
      to: "/central/analises/ipofs",
      search: { q: ipof.codigo }
    });
  }
  return out.slice(0, 30);
}
const COBERTURA_LABEL = {
  direta: "Cobertura direta",
  indireta: "Cobertura por subcausas",
  sem: "Sem atua\xE7\xE3o cadastrada"
};
function coberturaCausa(state, programaId, causaId, subcausaIds) {
  const inisPrograma = state.iniciativas.filter((i) => i.programaId === programaId);
  const diretas = inisPrograma.filter((i) => i.causas.includes(causaId));
  const indiretas = inisPrograma.filter((i) => i.causas.some((c) => subcausaIds.includes(c)));
  const iniciativas = [.../* @__PURE__ */ new Set([...diretas, ...indiretas])];
  const entregas = state.entregas.filter((e) => iniciativas.some((i) => i.id === e.iniciativaId));
  const orgaos = [...new Set(iniciativas.map((i) => i.orgao))].sort((a, b) => a.localeCompare(b));
  const cobertura = diretas.length > 0 ? "direta" : indiretas.length > 0 ? "indireta" : "sem";
  return { cobertura, iniciativas, entregas, orgaos, diretas, indiretas };
}
export {
  APTIDAO_LABEL,
  COBERTURA_LABEL,
  COMPORTAMENTOS,
  DISPONIBILIZACAO_LABEL,
  PARTICIPACAO_LABEL,
  STATUS_CURTO,
  STATUS_LABEL,
  TERRITORIO_LABEL,
  buscaGlobal,
  coberturaCausa,
  comentariosDaIniciativa,
  descompassoProjeto,
  eixos,
  entregasDaIniciativa,
  executadoDaEntrega,
  executadoDaIniciativa,
  financeiroIniciativa,
  financeiroProgramaOrgao,
  iniciativasDoOrgao,
  ipofPorId,
  ipofsDaEntrega,
  moeda,
  moedaCurta,
  objetivos,
  orgaosComContribuicao,
  participacaoOrgao,
  pct,
  pendenciasEntrega,
  pendenciasIniciativa,
  podeEditar,
  previstoDaIniciativa,
  prioridadePrograma,
  programaPorId,
  projetosDaEntrega,
  recursosDaEntrega,
  recursosDaIniciativa,
  resumoIpof,
  resumoOrgao,
  resumoPendencias,
  semContribuicao,
  situacaoEntrega,
  temVinculoOrcamentario,
  totalDoIpofPpa
};
