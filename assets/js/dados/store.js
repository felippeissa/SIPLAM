/**
 * Estado do SIPLAM sobre o localStorage.
 *
 * Substitui o contexto React do protótipo (`src/lib/ppa/store.tsx`) mantendo as
 * mesmas ações e o mesmo formato de estado. Sem servidor: o que o usuário faz
 * fica no navegador dele.
 *
 * Quem altera o estado deve fazê-lo pelas funções daqui — elas cuidam de
 * registrar evento, tocar a data de atualização e gravar.
 */
import { estadoInicial } from "./seed.js";

/**
 * O plano como entidade, que o protótipo não tinha.
 *
 * É uma lista: o PPA é quadrienal e o sistema atravessa mais de um ciclo.
 * Por ora são quatro campos; os demais entram depois de conversar com o usuário.
 */
function ppaInicial() {
    return {
        id: "ppa-2028",
        nome: "Plano Plurianual 2028–2031",
        primeiroAno: "2028",
        ultimoAno: "2031",
        descricao: "",
    };
}

const CHAVE = "siplam.estado.v1";

const uid = () => Math.random().toString(36).slice(2, 9);
const hoje = () => new Date().toLocaleDateString("pt-BR");

let estado = null;
const ouvintes = new Set();

/* ---------- persistência ---------- */

function carregar() {
    let base = null;
    try {
        const bruto = localStorage.getItem(CHAVE);
        if (bruto) base = JSON.parse(bruto);
    } catch (e) {
        // Estado incompatível ou armazenamento bloqueado: recomeça do seed.
        console.warn("SIPLAM: não foi possível ler o estado salvo, usando os dados de demonstração.", e);
    }
    if (!base) base = estadoInicial();
    // Estado gravado antes de o PPA existir como entidade.
    // Estado gravado antes de o PPA existir, ou quando ele ainda era único.
    if (!base.ppas) base.ppas = base.ppa ? [base.ppa] : [ppaInicial()];
    delete base.ppa;
    return base;
}

function gravar() {
    try {
        localStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch (e) {
        console.warn("SIPLAM: não foi possível gravar o estado.", e);
    }
    ouvintes.forEach((fn) => fn(estado));
}

/** Estado atual. Carrega do armazenamento na primeira chamada. */
export function obterEstado() {
    if (!estado) estado = carregar();
    return estado;
}

/** Recebe o estado a cada alteração. Devolve a função que cancela a inscrição. */
export function aoMudar(fn) {
    ouvintes.add(fn);
    return () => ouvintes.delete(fn);
}

/** Volta aos dados de demonstração. */
export function reiniciar() {
    estado = estadoInicial();
    estado.ppas = [ppaInicial()];
    gravar();
}

/* ---------- PPA ---------- */

export function addPpa(ppa) {
    estado.ppas.push({ ...ppa, id: ppa.id || `ppa-${uid()}` });
    gravar();
}

export function updPpa(id, patch) {
    const ppa = estado.ppas.find((p) => p.id === id);
    if (!ppa) return;
    Object.assign(ppa, patch);
    gravar();
}

export function removePpa(id) {
    estado.ppas = estado.ppas.filter((p) => p.id !== id);
    gravar();
}

/** Modelo de um plano novo, já com o período seguinte ao último cadastrado. */
export function ppaVazio() {
    const ultimo = [...estado.ppas].sort((a, b) => Number(b.ultimoAno) - Number(a.ultimoAno))[0];
    const inicio = ultimo ? Number(ultimo.ultimoAno) + 1 : 2028;
    return {
        id: `ppa-${uid()}`,
        nome: `Plano Plurianual ${inicio}–${inicio + 3}`,
        primeiroAno: String(inicio),
        ultimoAno: String(inicio + 3),
        descricao: "",
    };
}

/* ---------- utilidades internas ---------- */

function registrarEvento(iniciativaId, autor, texto) {
    estado.eventos.push({ id: `ev-${uid()}`, iniciativaId, quando: hoje(), autor, texto });
}

function tocar(iniciativaId) {
    const ini = estado.iniciativas.find((i) => i.id === iniciativaId);
    if (ini) ini.atualizadoEm = hoje();
}

/* ---------- Iniciativa ---------- */

export function addIniciativa({ programaId, nome, descricao, publicoAlvo, causas }) {
    const id = `ini-${uid()}`;
    estado.iniciativas.push({
        id,
        programaId,
        orgao: estado.orgaoAtual,
        nome,
        descricao,
        publicoAlvo,
        causas,
        status: "em_preenchimento",
        atualizadoEm: hoje(),
        versao: 1,
    });
    registrarEvento(id, estado.orgaoAtual, "Iniciativa criada");
    gravar();
    return id;
}

export function updIniciativa(id, patch) {
    const ini = estado.iniciativas.find((i) => i.id === id);
    if (!ini) return;
    Object.assign(ini, patch);
    tocar(id);
    gravar();
}

export function removeIniciativa(id) {
    const entregas = estado.entregas.filter((e) => e.iniciativaId === id).map((e) => e.id);
    estado.iniciativas = estado.iniciativas.filter((i) => i.id !== id);
    estado.entregas = estado.entregas.filter((e) => e.iniciativaId !== id);
    estado.vinculos = estado.vinculos.filter((v) => !entregas.includes(v.entregaId));
    estado.vinculosAcao = estado.vinculosAcao.filter((v) => !entregas.includes(v.entregaId));
    gravar();
}

/* ---------- Fluxo da Iniciativa ---------- */

export function enviar(id) {
    const ini = estado.iniciativas.find((i) => i.id === id);
    if (!ini) return;
    const versao = ini.versao + (ini.status === "devolvida" ? 1 : 0);
    Object.assign(ini, { status: "enviada", enviadoEm: hoje(), atualizadoEm: hoje(), versao });
    registrarEvento(id, estado.orgaoAtual, `Iniciativa enviada para análise (versão ${versao})`);
    gravar();
}

export function iniciarAnalise(id) {
    const ini = estado.iniciativas.find((i) => i.id === id);
    if (!ini) return;
    Object.assign(ini, { status: "em_analise", analista: estado.analista, atualizadoEm: hoje() });
    registrarEvento(id, estado.analista, "Análise iniciada pela Área Central");
    gravar();
}

export function devolver(id) {
    const ini = estado.iniciativas.find((i) => i.id === id);
    if (!ini) return;
    const entregas = estado.entregas.filter((e) => e.iniciativaId === id).map((e) => e.id);
    const abertos = estado.comentarios.filter(
        (c) =>
            !c.resolvido &&
            ((c.alvoTipo === "iniciativa" && c.alvoId === id) ||
                (c.alvoTipo === "entrega" && entregas.includes(c.alvoId)))
    ).length;
    Object.assign(ini, { status: "devolvida", analista: estado.analista, atualizadoEm: hoje() });
    registrarEvento(id, estado.analista, `Iniciativa devolvida para ajuste com ${abertos} apontamento(s)`);
    gravar();
}

export function validar(id) {
    const ini = estado.iniciativas.find((i) => i.id === id);
    if (!ini) return;
    Object.assign(ini, { status: "validada", analista: estado.analista, atualizadoEm: hoje() });
    registrarEvento(id, estado.analista, "Iniciativa validada");
    gravar();
}

/* ---------- Entrega ---------- */

export function addEntrega(iniciativaId, nome) {
    const id = `ent-${uid()}`;
    estado.entregas.push({
        id,
        iniciativaId,
        nome,
        descricao: "",
        unidadeMedida: "",
        metodoComprovacao: "",
        comportamentoValidado: false,
        metas: { 2028: null, 2029: null, 2030: null, 2031: null },
        territorio: { tipo: null, regioes: [] },
        gomap: null,
    });
    tocar(iniciativaId);
    gravar();
    return id;
}

export function updEntrega(id, patch) {
    const entrega = estado.entregas.find((e) => e.id === id);
    if (!entrega) return;
    Object.assign(entrega, patch);
    tocar(entrega.iniciativaId);
    gravar();
}

export function removeEntrega(id) {
    estado.entregas = estado.entregas.filter((e) => e.id !== id);
    estado.vinculos = estado.vinculos.filter((v) => v.entregaId !== id);
    estado.vinculosAcao = estado.vinculosAcao.filter((v) => v.entregaId !== id);
    gravar();
}

/* ---------- Vínculos ---------- */

export function toggleProjeto(entregaId, projetoId) {
    const existe = estado.vinculos.find((v) => v.entregaId === entregaId && v.projetoId === projetoId);
    if (existe) estado.vinculos = estado.vinculos.filter((v) => v.id !== existe.id);
    else estado.vinculos.push({ id: `v-${uid()}`, entregaId, projetoId });
    gravar();
}

/**
 * Vincula ou desvincula uma Ação Orçamentária.
 * Uma Ação financia no máximo uma Entrega: se já financia outra, a vinculação é
 * recusada e a função devolve o id da Entrega que a consome.
 */
export function toggleAcao(entregaId, acaoId) {
    const existe = estado.vinculosAcao.find((v) => v.entregaId === entregaId && v.acaoId === acaoId);
    if (existe) {
        estado.vinculosAcao = estado.vinculosAcao.filter((v) => v.id !== existe.id);
        gravar();
        return { ok: true };
    }
    const ocupada = estado.vinculosAcao.find((v) => v.acaoId === acaoId);
    if (ocupada) return { ok: false, entregaId: ocupada.entregaId };
    estado.vinculosAcao.push({ id: `va-${uid()}`, entregaId, acaoId });
    gravar();
    return { ok: true };
}

/* ---------- Programa ---------- */

export function addPrograma(programa) {
    estado.programas.push(programa);
    gravar();
}

export function updPrograma(id, patch) {
    const programa = estado.programas.find((p) => p.id === id);
    if (!programa) return;
    Object.assign(programa, patch);
    gravar();
}

/* ---------- Participação do órgão ---------- */

export function marcarSemContribuicao(programaId, orgao) {
    const jaTem = estado.semContribuicao.some((x) => x.programaId === programaId && x.orgao === orgao);
    if (!jaTem) estado.semContribuicao.push({ programaId, orgao });
    gravar();
}

export function reconsiderarParticipacao(programaId, orgao) {
    estado.semContribuicao = estado.semContribuicao.filter(
        (x) => !(x.programaId === programaId && x.orgao === orgao)
    );
    gravar();
}

/* ---------- Apontamentos ---------- */

export function addComentario({ alvoTipo, alvoId, campo, texto, autor }) {
    estado.comentarios.push({
        id: `cm-${uid()}`,
        alvoTipo,
        alvoId,
        campo,
        texto,
        autor,
        criadoEm: hoje(),
        resolvido: false,
    });
    gravar();
}

export function resolverComentario(id) {
    const comentario = estado.comentarios.find((c) => c.id === id);
    if (!comentario) return;
    comentario.resolvido = true;
    gravar();
}
