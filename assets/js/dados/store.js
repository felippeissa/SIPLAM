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
 * Situações do PPA. Não é uma fila reta: a submissão se bifurca.
 *
 *   elaboração → submetido → aprovado → vigente → encerrado
 *                     ↓
 *                 reprovado → volta para elaboração
 *
 * O corte importante está entre **submetido** e o que vem antes: em elaboração o
 * plano é construído; a partir da submissão ele vira peça formal e não se edita
 * mais. Reprovado é o único estado que anda para trás — e anda porque precisa:
 * o plano volta a ser editável para ser corrigido e submetido de novo.
 *
 * Um plano vigente também muda, mas por alteração — outro caminho, que o sistema
 * ainda não tem.
 */
export const SITUACOES_PPA = [
    { id: "elaboracao", rotulo: "Elaboração", tom: "info", editavel: true, ajuda: "Em construção pelos órgãos e pela Área Central." },
    { id: "submetido", rotulo: "Submetido", tom: "alerta", editavel: false, ajuda: "Encaminhado para apreciação; não se edita mais." },
    { id: "aprovado", rotulo: "Aprovado", tom: "ok", editavel: false, ajuda: "Aprovado, aguardando o início da vigência." },
    { id: "reprovado", rotulo: "Reprovado", tom: "impeditivo", editavel: false, ajuda: "Não aprovado. Para corrigir, volte o plano para Elaboração." },
    { id: "vigente", rotulo: "Vigente", tom: "ok", editavel: false, ajuda: "Em execução. Mudanças só por alteração do plano." },
    { id: "encerrado", rotulo: "Encerrado", tom: "neutro", editavel: false, ajuda: "Ciclo concluído. Permanece para consulta." },
];

export const situacaoPpa = (id) => SITUACOES_PPA.find((s) => s.id === id) ?? SITUACOES_PPA[0];

/**
 * O plano como entidade, que o protótipo não tinha.
 *
 * É uma lista: o sistema atravessa mais de um ciclo. O ciclo costuma ter quatro anos, mas não
 * sempre — se um governador sai e o vice assume, o plano pode cobrir menos.
 * Por ora são quatro campos; os demais entram depois de conversar com o usuário.
 */
function ppaInicial() {
    return {
        id: "ppa-2028",
        nome: "Plano Plurianual 2028–2031",
        primeiroAno: "2028",
        ultimoAno: "2031",
        descricao: "",
        situacao: "elaboracao",
    };
}

/**
 * Situações do usuário, na ordem do fluxo.
 *
 *   aguardando → aprovado → revogado → aprovado (reativado)
 *        ↓
 *    reprovado
 *
 * Quem se registra em `registrar.html` entra como **aguardando**, sem perfil.
 * O perfil é escolhido pelo Administrador central no momento da aprovação — é
 * ele que decide o papel, não quem se cadastrou.
 */
export const SITUACOES_USUARIO = [
    { id: "aguardando", rotulo: "Aguardando aprovação", tom: "alerta" },
    { id: "aprovado", rotulo: "Aprovado", tom: "ok" },
    { id: "reprovado", rotulo: "Reprovado", tom: "impeditivo" },
    { id: "revogado", rotulo: "Acesso revogado", tom: "neutro" },
];

export const situacaoUsuario = (id) => SITUACOES_USUARIO.find((s) => s.id === id) ?? SITUACOES_USUARIO[0];

/**
 * Usuários do sistema.
 *
 * `perfis` é lista porque a mesma pessoa pode acumular papéis. Fica vazia
 * enquanto o cadastro aguarda aprovação: quem se registra informa quem é, não
 * o que pode fazer.
 */
function usuariosIniciais() {
    return [
        { id: "us-1", nome: "Vagner Ribeiro", email: "vagner.ribeiro@exemplo.go", login: "vagner.ribeiro", orgao: "Secretaria de Desenvolvimento Social", perfis: ["setorial"], situacao: "aprovado", criadoEm: "02/03/2026", decididoEm: "04/03/2026", decididoPor: "Maria Fonseca" },
        { id: "us-2", nome: "Maria Fonseca", email: "maria.fonseca@exemplo.go", login: "maria.fonseca", orgao: "", perfis: ["admin-central"], situacao: "aprovado", criadoEm: "02/03/2026", decididoEm: "02/03/2026", decididoPor: "Maria Fonseca" },
        { id: "us-3", nome: "João Peixoto", email: "joao.peixoto@exemplo.go", login: "joao.peixoto", orgao: "", perfis: ["admin-central", "gestao-central"], situacao: "aprovado", criadoEm: "15/03/2026", decididoEm: "16/03/2026", decididoPor: "Maria Fonseca" },
        { id: "us-4", nome: "Cláudia Bastos", email: "claudia.bastos@exemplo.go", login: "claudia.bastos", orgao: "Secretaria de Saúde", perfis: ["setorial", "gestao-setorial"], situacao: "aprovado", criadoEm: "20/04/2026", decididoEm: "22/04/2026", decididoPor: "Maria Fonseca" },
        { id: "us-5", nome: "Tereza Nunes", email: "tereza.nunes@exemplo.go", login: "tereza.nunes", orgao: "", perfis: ["controle"], situacao: "aprovado", criadoEm: "11/05/2026", decididoEm: "12/05/2026", decididoPor: "João Peixoto" },
        { id: "us-6", nome: "Helena Arantes", email: "helena.arantes@exemplo.go", login: "helena.arantes", orgao: "Secretaria de Educação", perfis: ["gestao-setorial"], situacao: "aprovado", criadoEm: "03/06/2026", decididoEm: "05/06/2026", decididoPor: "Maria Fonseca" },
        { id: "us-7", nome: "Marcos Tavares", email: "marcos.tavares@exemplo.go", login: "marcos.tavares", orgao: "Secretaria de Meio Ambiente", perfis: ["setorial"], situacao: "aprovado", criadoEm: "19/06/2026", decididoEm: "19/06/2026", decididoPor: "João Peixoto" },

        { id: "us-8", nome: "Renato Camargo", email: "renato.camargo@exemplo.go", login: "renato.camargo", orgao: "Secretaria de Agricultura", perfis: [], situacao: "aguardando", criadoEm: "14/09/2026" },
        { id: "us-9", nome: "Bianca Siqueira", email: "bianca.siqueira@exemplo.go", login: "bianca.siqueira", orgao: "Secretaria de Segurança Pública", perfis: [], situacao: "aguardando", criadoEm: "16/09/2026" },
        { id: "us-10", nome: "Otávio Lemes", email: "otavio.lemes@exemplo.go", login: "otavio.lemes", orgao: "Secretaria de Infraestrutura", perfis: [], situacao: "aguardando", criadoEm: "17/09/2026" },

        { id: "us-11", nome: "Paulo Medeiros", email: "paulo.medeiros@exemplo.go", login: "paulo.medeiros", orgao: "Secretaria de Infraestrutura", perfis: ["setorial"], situacao: "revogado", criadoEm: "03/02/2026", decididoEm: "05/02/2026", decididoPor: "João Peixoto" },
        { id: "us-12", nome: "Lúcia Andrade", email: "lucia.andrade@exemplo.go", login: "lucia.andrade", orgao: "Secretaria de Indústria e Comércio", perfis: ["setorial", "gestao-setorial"], situacao: "revogado", criadoEm: "27/01/2026", decididoEm: "29/01/2026", decididoPor: "Maria Fonseca" },

        { id: "us-13", nome: "Sérgio Vilela", email: "sergio.vilela@exemplo.go", login: "sergio.vilela", orgao: "Secretaria de Agricultura", perfis: [], situacao: "reprovado", criadoEm: "28/08/2026", decididoEm: "30/08/2026", decididoPor: "Maria Fonseca" },
        { id: "us-14", nome: "Daniel Prado", email: "daniel.prado@exemplo.go", login: "daniel.prado", orgao: "Secretaria de Saúde", perfis: [], situacao: "reprovado", criadoEm: "09/09/2026", decididoEm: "10/09/2026", decididoPor: "João Peixoto" },
    ];
}

/**
 * Diagnóstico como cadastro, derivado do que já existe dentro dos Programas.
 *
 * O diagnóstico sempre esteve no Programa — problema central, evidências,
 * causas, subcausas e consequências. As telas de cadastro foram construídas
 * depois, com uma estrutura própria, e nasciam vazias: o sistema mostrava no
 * Hub causas que o Cadastro de Causa jurava não existir.
 *
 * Aqui as duas viram uma só. A hierarquia segue a árvore de problemas, que é o
 * método do diagnóstico e o que os dados já traziam:
 *
 *   Programa → Diagnóstico → Problema central → Causas → Subcausas
 *
 * Só roda quando as quatro coleções estão vazias, para não passar por cima do
 * que alguém tenha cadastrado à mão.
 */
function diagnosticoDosProgramas(programas) {
    const diagnosticos = [];
    const problemas = [];
    const causas = [];
    const subcausas = [];

    for (const p of programas) {
        const diagId = `dg-${p.id}`;
        diagnosticos.push({
            id: diagId,
            programaId: p.id,
            nome: `Diagnóstico ${p.codigo}`,
            descricao: (p.evidencias ?? []).join(" · "),
        });

        if (!p.problema) continue;
        const probId = `pb-${p.id}`;
        problemas.push({
            id: probId,
            diagnosticoId: diagId,
            nome: p.problema,
            descricao: (p.consequencias ?? []).join(" · "),
        });

        for (const c of p.causas ?? []) {
            const causaId = `ca-${p.id}-${c.id}`;
            causas.push({ id: causaId, problemaId: probId, nome: c.texto, descricao: "" });
            for (const s of c.subcausas ?? []) {
                subcausas.push({ id: `sc-${p.id}-${s.id}`, causaId, nome: s.texto, descricao: "" });
            }
        }
    }

    return { diagnosticos, problemas, causas, subcausas };
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

    // Coleções de cadastro do diagnóstico.
    for (const colecao of ["diagnosticos", "problemas", "causas", "subcausas"]) {
        if (!base[colecao]) base[colecao] = [];
    }
    // Estado gravado quando o nível abaixo da causa se chamava "subproblema".
    if (base.subproblemas) {
        if (!base.subcausas.length) base.subcausas = base.subproblemas;
        delete base.subproblemas;
    }
    // Cadastros vazios: derivam do diagnóstico que já vive dentro dos Programas.
    if (!base.diagnosticos.length && !base.problemas.length && !base.causas.length && !base.subcausas.length) {
        Object.assign(base, diagnosticoDosProgramas(base.programas ?? []));
    }

    // Estado gravado antes de existir o cadastro de usuários.
    if (!base.usuarios) base.usuarios = usuariosIniciais();
    // Usuários gravados quando a situação era só "ativo"/"inativo" e não havia login.
    for (const u of base.usuarios) {
        if (u.situacao === "ativo") u.situacao = "aprovado";
        if (u.situacao === "inativo") u.situacao = "revogado";
        if (!u.login) u.login = (u.email ?? "").split("@")[0];
    }

    // O valor previsto deixou de ser campo: passou a ser a soma das Ações
    // Orçamentárias vinculadas. Planos gravados com o número digitado o perdem.
    for (const ppa of base.ppas) {
        delete ppa.valorPrevisto;
        if (!ppa.situacao) ppa.situacao = "elaboracao";
    }
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
    Object.assign(estado, diagnosticoDosProgramas(estado.programas));
    estado.usuarios = usuariosIniciais();
    gravar();
}

/* ---------- Cadastros (diagnóstico, problema, causa, subcausa) ---------- */

/**
 * CRUD genérico das coleções de cadastro. Todas têm a mesma forma —
 * identificação, descrição e o vínculo com o nível acima — então uma função
 * serve as quatro.
 */
export function addItem(colecao, item) {
    estado[colecao].push({ ...item, id: item.id || `${colecao}-${uid()}`, criadoEm: hoje() });
    gravar();
}

export function updItem(colecao, id, patch) {
    const item = estado[colecao].find((x) => x.id === id);
    if (!item) return;
    Object.assign(item, patch);
    gravar();
}

export function removeItem(colecao, id) {
    estado[colecao] = estado[colecao].filter((x) => x.id !== id);
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
        situacao: "elaboracao",
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
