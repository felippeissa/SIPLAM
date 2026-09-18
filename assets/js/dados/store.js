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
    { id: "elaboracao", rotulo: "Em elaboração", tom: "info", editavel: true, ajuda: "Em construção pelos órgãos e pela Área Central." },
    { id: "submetido", rotulo: "Submetido para aprovação", tom: "alerta", editavel: false, ajuda: "Encaminhado para apreciação; não se edita mais." },
    { id: "aprovado", rotulo: "Aprovado", tom: "ok", editavel: false, ajuda: "Aprovado, aguardando o início da vigência." },
    { id: "reprovado", rotulo: "Reprovado", tom: "impeditivo", editavel: false, ajuda: "Não aprovado. Para corrigir, o plano volta à elaboração." },
    { id: "vigente", rotulo: "Vigente", tom: "ok", editavel: false, ajuda: "Em execução. Mudanças só por alteração do plano." },
    { id: "encerrado", rotulo: "Encerrado", tom: "neutro", editavel: false, ajuda: "Ciclo concluído. Permanece para consulta." },
];

export const situacaoPpa = (id) => SITUACOES_PPA.find((s) => s.id === id) ?? SITUACOES_PPA[0];

/**
 * O ano em que um plano é elaborado: o anterior ao primeiro de vigência.
 * O PPA é construído no ano que antecede o ciclo que ele rege.
 */
export const anoDeElaboracao = (ppa) => Number(ppa.primeiroAno) - 1;

/**
 * O plano a que pertencem os cadastros feitos agora.
 *
 * A visão do sistema é de um PPA por vez: o que está em elaboração é o que
 * recebe cadastro. Não havendo nenhum, vale o vigente e, por último, o mais
 * recente — para nada ficar órfão.
 */
export function ppaCorrente(estado) {
    const ppas = estado?.ppas ?? [];
    return (
        ppas.find((p) => p.situacao === "elaboracao") ??
        ppas.find((p) => p.situacao === "vigente") ??
        [...ppas].sort((a, b) => Number(b.primeiroAno) - Number(a.primeiroAno))[0] ??
        null
    );
}

/** Os anos cobertos por um plano. */
export function anosDoPpa(ppa) {
    const anos = [];
    for (let a = Number(ppa.primeiroAno); a <= Number(ppa.ultimoAno); a++) anos.push(a);
    return anos;
}

/** Outro plano que ocupa algum dos mesmos anos. Dois PPAs não se sobrepõem. */
export function ppaQueColide(estado, candidato) {
    const anos = new Set(anosDoPpa(candidato));
    return (estado.ppas ?? []).find((p) => p.id !== candidato.id && anosDoPpa(p).some((a) => anos.has(a))) ?? null;
}

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
        // Número do processo no SEI. Vem de lá, não daqui.
        processoSei: "202600006001287",
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
 * causas e consequências. As telas de cadastro foram construídas
 * depois, com uma estrutura própria, e nasciam vazias: o sistema mostrava no
 * Hub causas que o Cadastro de Causa jurava não existir.
 *
 * Nada aqui é hierarquia rígida: causa, problema e iniciativa se apontam.
 *
 *   Diagnóstico → aponta para os problemas que ele caracteriza
 *   Problema    → aponta para as causas que o explicam
 *   Causa       → aponta para as Iniciativas que a enfrentam
 *
 * Assim uma mesma causa pode explicar mais de um problema e ser enfrentada por
 * mais de uma Iniciativa, o que uma árvore não permitiria.
 *
 * Só roda quando as coleções estão vazias, para não passar por cima do que
 * alguém tenha cadastrado à mão.
 */
function diagnosticoDosProgramas(programas, iniciativas = [], ppaId = "") {
    const diagnosticos = [];
    const problemas = [];
    const causas = [];

    for (const p of programas) {
        diagnosticos.push({
            id: `dg-${p.id}`,
            ppaId,
            nome: `Diagnóstico ${p.codigo}`,
            descricao: (p.evidencias ?? []).join(" · "),
            problemaIds: p.problema ? [`pb-${p.id}`] : [],
        });

        // Cada Iniciativa guarda, em `causas`, o identificador local das causas
        // que ataca — local porque só é único dentro do Programa. Aqui o vínculo
        // é virado para o lado da causa, com o id inteiro, que não é ambíguo.
        const doPrograma = iniciativas.filter((i) => i.programaId === p.id);
        const vinculadas = [];

        for (const c of p.causas ?? []) {
            const causaId = `ca-${p.id}-${c.id}`;
            causas.push({
                id: causaId,
                ppaId,
                nome: c.texto,
                descricao: "",
                iniciativaIds: doPrograma.filter((i) => (i.causas ?? []).includes(c.id)).map((i) => i.id),
            });
            vinculadas.push(causaId);
        }

        if (!p.problema) continue;
        problemas.push({
            id: `pb-${p.id}`,
            ppaId,
            nome: p.problema,
            descricao: (p.consequencias ?? []).join(" · "),
            causaIds: vinculadas,
        });
    }

    return { diagnosticos, problemas, causas };
}

/**
 * Eixo e Objetivo Estratégico como cadastro, derivados dos Programas.
 *
 * Os dois sempre existiram dentro do Programa, como texto solto: `eixo` e
 * `objetivoEstrategico`. Os filtros do sistema já os tratavam como estrutura —
 * escolher um eixo restringe os objetivos —, mas não havia onde cadastrá-los.
 *
 *   Eixo → Objetivo Estratégico → Programa
 *
 * Os Programas ganham `eixoId` e `objetivoId` para que o vínculo seja por
 * identidade, não por texto igual. Os campos de texto continuam onde estavam:
 * as telas que filtram por eles seguem funcionando.
 */
function estruturaDosProgramas(programas, ppaId = "") {
    const eixos = [];
    const objetivos = [];
    const porEixo = new Map();
    const porObjetivo = new Map();

    for (const p of programas) {
        if (p.eixo && !porEixo.has(p.eixo)) {
            const eixo = { id: `ex-${porEixo.size + 1}`, ppaId, nome: p.eixo, descricao: "" };
            porEixo.set(p.eixo, eixo);
            eixos.push(eixo);
        }
        const chave = p.objetivoEstrategico;
        if (chave && !porObjetivo.has(chave)) {
            const objetivo = {
                id: `ob-${porObjetivo.size + 1}`,
                ppaId,
                eixoId: porEixo.get(p.eixo)?.id ?? "",
                nome: chave,
                descricao: "",
            };
            porObjetivo.set(chave, objetivo);
            objetivos.push(objetivo);
        }
        p.ppaId = ppaId;
        p.eixoId = porEixo.get(p.eixo)?.id ?? "";
        p.objetivoId = porObjetivo.get(chave)?.id ?? "";
    }

    eixos.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    objetivos.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    return { eixos, objetivos };
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

    // Estrutura do plano: eixos e objetivos, derivados dos Programas.
    for (const colecao of ["eixos", "objetivos"]) {
        if (!base[colecao]) base[colecao] = [];
    }
    if (!base.eixos.length && !base.objetivos.length) {
        Object.assign(base, estruturaDosProgramas(base.programas ?? [], ppaCorrente(base)?.id ?? ""));
    }

    // Coleções de cadastro do diagnóstico.
    for (const colecao of ["diagnosticos", "problemas", "causas"]) {
        if (!base[colecao]) base[colecao] = [];
    }
    // O nível abaixo da causa deixou de existir, e a causa deixou de pendurar no
    // problema. Estado gravado em qualquer dessas formas é refeito do seed.
    delete base.subproblemas;
    delete base.subcausas;
    const forma = base.causas.some((c) => c.problemaId !== undefined || c.diagnosticoId !== undefined);
    if (forma || (!base.diagnosticos.length && !base.problemas.length && !base.causas.length)) {
        Object.assign(base, diagnosticoDosProgramas(base.programas ?? [], base.iniciativas ?? [], ppaCorrente(base)?.id ?? ""));
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
        if (ppa.processoSei === undefined) ppa.processoSei = "";
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
    Object.assign(estado, estruturaDosProgramas(estado.programas, ppaCorrente(estado)?.id ?? ""));
    Object.assign(estado, diagnosticoDosProgramas(estado.programas, estado.iniciativas, ppaCorrente(estado)?.id ?? ""));
    estado.usuarios = usuariosIniciais();
    gravar();
}

/* ---------- Cadastros (diagnóstico, problema, causa) ---------- */

/**
 * CRUD genérico das coleções de cadastro. Todas têm a mesma forma —
 * identificação, descrição e o vínculo com o nível acima — então uma função
 * serve as quatro.
 */
export function addItem(colecao, item) {
    // O PPA é o vínculo de tudo que se cadastra dentro dele.
    const novo = {
        ppaId: ppaCorrente(estado)?.id ?? "",
        ...item,
        id: item.id || `${colecao}-${uid()}`,
        criadoEm: hoje(),
    };
    estado[colecao].push(novo);
    gravar();
    return novo;
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
        // Em branco até o plano ser cadastrado no SEI e o número voltar de lá.
        processoSei: "",
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
