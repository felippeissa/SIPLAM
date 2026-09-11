import { ACOES, ANOS, IPOFS, PROJETOS } from "./seed.js";
const zerosAno = () => Object.fromEntries(ANOS.map((a) => [a, 0]));
const acaoPorId = (id) => ACOES.find((a) => a.id === id) ?? null;
const ipofPorIdSimples = (id) => IPOFS.find((i) => i.id === id) ?? null;
const projetoPorIdSimples = (id) => id ? PROJETOS.find((p) => p.id === id) ?? null : null;
function parcelasDaAcao(acaoId) {
  return IPOFS.flatMap((ipof) => ipof.parcelas.filter((p) => p.acaoId === acaoId).map((parcela) => ({ ipof, parcela })));
}
const totalDaAcao = (acaoId) => parcelasDaAcao(acaoId).reduce((s, { parcela }) => s + parcela.valor, 0);
function totalDaAcaoAno(acaoId, ano) {
  return parcelasDaAcao(acaoId).filter(({ parcela }) => parcela.ano === ano).reduce((s, { parcela }) => s + parcela.valor, 0);
}
const entregaDaAcao = (state, acaoId) => state.vinculosAcao.find((v) => v.acaoId === acaoId)?.entregaId ?? null;
function acoesDaEntrega(state, entregaId) {
  return state.vinculosAcao.filter((v) => v.entregaId === entregaId).map((v) => acaoPorId(v.acaoId)).filter((a) => !!a);
}
function acoesDoOrgao(state, orgao) {
  return ACOES.filter((a) => a.orgao === orgao).map((acao) => ({
    acao,
    total: totalDaAcao(acao.id),
    entregaId: entregaDaAcao(state, acao.id)
  }));
}
function projetosFinanciadoresDaEntrega(state, entregaId) {
  const ids = /* @__PURE__ */ new Set();
  for (const acao of acoesDaEntrega(state, entregaId))
    for (const { ipof } of parcelasDaAcao(acao.id)) if (ipof.projetoId) ids.add(ipof.projetoId);
  return [...ids].map((id) => projetoPorIdSimples(id)).filter((p) => !!p);
}
function linhasFinanceiras(state) {
  const out = [];
  for (const v of state.vinculosAcao) {
    const acao = acaoPorId(v.acaoId);
    const entrega = state.entregas.find((e) => e.id === v.entregaId);
    if (!acao || !entrega) continue;
    const ini = state.iniciativas.find((i) => i.id === entrega.iniciativaId);
    if (!ini) continue;
    const prog = state.programas.find((pr) => pr.id === ini.programaId) ?? null;
    const grupos = /* @__PURE__ */ new Map();
    for (const { ipof, parcela } of parcelasDaAcao(acao.id)) {
      const chave = `${ipof.id}|${parcela.fonte}|${parcela.classificacao}`;
      const atual = grupos.get(chave) ?? {
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
        programa: prog ? `${prog.codigo} \u2014 ${prog.nome}` : "\u2014",
        orgao: ini.orgao,
        fonte: parcela.fonte,
        anos: zerosAno(),
        total: 0,
        parcelas: []
      };
      atual.anos[parcela.ano] = (atual.anos[parcela.ano] ?? 0) + parcela.valor;
      atual.total += parcela.valor;
      atual.parcelas.push(parcela);
      grupos.set(chave, atual);
    }
    out.push(...grupos.values());
  }
  return out;
}
const DIMENSAO_LABEL = {
  fonte: "Fonte de recursos",
  orgao: "\xD3rg\xE3o",
  programa: "Programa",
  iniciativa: "Iniciativa",
  entrega: "Entrega",
  ipof: "IPOF",
  projeto: "Projeto GOMAP",
  acao: "A\xE7\xE3o Or\xE7ament\xE1ria",
  classificacao: "Classifica\xE7\xE3o de despesa"
};
function chaveDe(l, d) {
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
      return `${l.ipof.codigo} \u2014 ${l.ipof.nome}`;
    case "acao":
      return `${l.acao.codigo} \u2014 ${l.acao.nome}`;
    case "classificacao":
      return l.classificacao;
    case "projeto":
      return l.projeto ? `${l.projeto.codigo} \u2014 ${l.projeto.nome}` : "Sem Projeto GOMAP";
  }
}
function quadro(linhas, dimensao) {
  const mapa = /* @__PURE__ */ new Map();
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
const linhasDaEntrega = (state, entregaId) => linhasFinanceiras(state).filter((l) => l.entregaId === entregaId);
const linhasDaIniciativa = (state, iniciativaId) => linhasFinanceiras(state).filter((l) => l.iniciativaId === iniciativaId);
const linhasDoPrograma = (state, programaId) => linhasFinanceiras(state).filter((l) => l.programaId === programaId);
const linhasDoOrgao = (state, orgao) => linhasFinanceiras(state).filter((l) => l.orgao === orgao);
const linhasDoProjeto = (state, projetoId) => linhasFinanceiras(state).filter((l) => l.projeto?.id === projetoId);
function todosIpofs() {
  return IPOFS.map((ipof) => ({ ipof, projeto: projetoPorIdSimples(ipof.projetoId), orgao: ipof.orgao }));
}
const totalDoIpof = (ipof) => ipof.parcelas.reduce((s, p) => s + p.valor, 0);
const totalDoIpofAno = (ipof, ano) => ipof.parcelas.filter((p) => p.ano === ano).reduce((s, p) => s + p.valor, 0);
const fontesDoIpof = (ipof) => [...new Set(ipof.parcelas.map((p) => p.fonte))];
const acoesDoIpof = (ipof) => [...new Set(ipof.parcelas.map((p) => p.acaoId))].map((id) => acaoPorId(id)).filter((a) => !!a);
function entregasDoProjeto(state, projetoId) {
  return state.vinculos.filter((v) => v.projetoId === projetoId).map((v) => state.entregas.find((e) => e.id === v.entregaId)).filter((e) => !!e);
}
const apropriadoDoProjetoNoPpa = (state, projetoId) => linhasDoProjeto(state, projetoId).reduce((s, l) => s + l.total, 0);
export {
  DIMENSAO_LABEL,
  acaoPorId,
  acoesDaEntrega,
  acoesDoIpof,
  acoesDoOrgao,
  apropriadoDoProjetoNoPpa,
  entregaDaAcao,
  entregasDoProjeto,
  fontesDoIpof,
  ipofPorIdSimples,
  linhasDaEntrega,
  linhasDaIniciativa,
  linhasDoOrgao,
  linhasDoPrograma,
  linhasDoProjeto,
  linhasFinanceiras,
  parcelasDaAcao,
  projetoPorIdSimples,
  projetosFinanciadoresDaEntrega,
  quadro,
  todosIpofs,
  totalDaAcao,
  totalDaAcaoAno,
  totalDoIpof,
  totalDoIpofAno,
  zerosAno
};
