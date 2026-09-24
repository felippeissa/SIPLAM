/**
 * Shell do SIPLAM — topbar, sidenav e rodapé.
 *
 * O markup espelha o do Inspinia, porque o CSS do template depende da estrutura:
 *  - `.topbar-menu` é `justify-content: space-between` e espera **dois** filhos,
 *    o grupo da esquerda e o da direita;
 *  - `.logo-topbar` fica oculto e só aparece quando a sidenav está em offcanvas,
 *    então a marca do sistema vive na sidenav;
 *  - a sidenav precisa de `.button-on-hover`, `.button-close-offcanvas` e do
 *    wrapper `.scrollbar[data-simplebar]` para funcionar nos três tamanhos.
 *
 * Substitui `src/components/ppa/shell.tsx` do protótipo.
 */
import { obterEstado, ppaCorrente, situacaoPpa, selecionarPpa } from "./dados/store.js";
import { esc } from "./ui.js";
import { confirmarExclusao } from "./confirmar.js";
import { instalarBusca } from "./busca.js";
import { instalarAtena } from "./atena.js";
import { instalarNotificacoes } from "./notificacoes.js";

/** Menu da visão setorial — o órgão preenche e envia. */
const MENU_SETORIAL = [
    { href: "programas.html", rotulo: "Programas", icone: "ti-layout-grid" },
    { href: "iniciativas.html", rotulo: "Iniciativas", icone: "ti-list-check" },
    { href: "entregas.html", rotulo: "Entregas", icone: "ti-box" },
    { href: "indicadores.html", rotulo: "Indicadores", icone: "ti-target" },
];

/** Menu da área central — o analista analisa, valida e administra. */
const MENU_CENTRAL = [
    { href: "central.html", rotulo: "Visão Geral", icone: "ti-gauge" },
    { href: "central-hub.html", rotulo: "Visão por Programas", icone: "ti-layout-dashboard" },
    { grupo: "Cadastros Estratégicos" },
    { href: "central-ppa.html", rotulo: "PPA", icone: "ti-calendar-stats" },
    { href: "central-eixo.html", rotulo: "Eixos", icone: "ti-layout-columns" },
    { href: "central-objetivo.html", rotulo: "Objetivos Estratégicos", icone: "ti-target-arrow" },
    { href: "central-causa.html", rotulo: "Causas", icone: "ti-binary-tree" },
    { href: "central-subcausa.html", rotulo: "Subcausas", icone: "ti-git-branch" },
    { href: "central-indicador.html", rotulo: "Indicadores", icone: "ti-chart-dots" },
    { href: "central-problema.html", rotulo: "Problemas", icone: "ti-alert-triangle" },
    { href: "central-programas.html", rotulo: "Programa", icone: "ti-layout-grid" },
    { grupo: "Relatórios" },
    { href: "central-relatorio-lei.html", rotulo: "Relatório final da lei do PPA", icone: "ti-file-text" },
    { href: "central-relatorio-finalisticas.html", rotulo: "Relatório consolidado de finalísticas", icone: "ti-report" },
    { grupo: "Administração" },
    { href: "central-usuarios.html", rotulo: "Usuários", icone: "ti-users" },
];


/**
 * Perfis do sistema. A visão, o modo de leitura e o menu decorrem daqui.
 * Espelha `assets/js/acesso.js`, que é a fonte usada no fluxo de acesso.
 *
 * `construcao: true` marca o perfil cuja tela inicial ainda não existe: ele não
 * tem menu, para não oferecer caminho que não é dele.
 *
 * `leitura: true` é só dos órgãos de controle. A alta gestão preenche e ainda
 * aprova — ela só está em construção porque a tela inicial dela não existe.
 */
const PERFIL = {
    setorial: {
        nome: "Planejamento setorial",
        visao: "setorial",
        leitura: false,
        construcao: false,
        descricao: "Preenche e envia a contribuição do órgão",
    },
    "admin-central": {
        nome: "Administrador central",
        visao: "central",
        leitura: false,
        construcao: false,
        descricao: "Analisa, valida e administra os Programas",
    },
    "gestao-setorial": {
        nome: "Alta gestão setorial",
        visao: "setorial",
        leitura: false,
        construcao: true,
        descricao: "Faz tudo do Planejamento setorial e aprova a proposta do órgão",
    },
    "gestao-central": {
        nome: "Alta gestão central",
        visao: "central",
        leitura: true,
        construcao: true,
        descricao: "Faz tudo do Administrador central e aprova a consolidação",
    },
    controle: {
        nome: "Consulta",
        visao: "central",
        leitura: true,
        construcao: true,
        descricao: "Consulta o plano, sem escrever",
    },
};

/** O perfil ainda não tem telas construídas? */
export function emConstrucao() {
    return PERFIL[perfilDaSessao()]?.construcao === true;
}

/** Só o perfil de Consulta não escreve; a alta gestão preenche e ainda aprova. */
export function somenteLeitura() {
    return PERFIL[perfilDaSessao()]?.leitura === true;
}

/** O perfil desta sessão, para as telas que restringem por papel. */
export function perfilAtual() {
    return perfilDaSessao();
}

/**
 * Visão de quem está olhando — consequência do perfil, não do nome do arquivo.
 *
 * Telas como `programa.html`, `iniciativa.html` e `entrega.html` servem às duas
 * visões. Decidir pelo nome do arquivo fazia o menu do Administrador central
 * virar o menu do órgão só por ele abrir um Programa a partir do cadastro.
 */
export function visaoAtual() {
    const doPerfil = PERFIL[perfilDaSessao()]?.visao;
    if (doPerfil) return doPerfil;
    // Sem perfil na sessão — tela aberta direto — o nome do arquivo é o que sobra.
    return paginaAtual().startsWith("central") ? "central" : "setorial";
}

/** Perfil escolhido no acesso. */
function perfilDaSessao() {
    try {
        return localStorage.getItem("siplam.perfilSessao") || localStorage.getItem("siplam.perfil");
    } catch (e) {
        return null;
    }
}

/**
 * A raiz da aplicação, deduzida de onde este módulo mora.
 *
 * As telas de criar e editar ficam em subpastas — `central-ppa/criar.html` —, e
 * um link relativo como `central-eixo.html` resolveria para dentro da subpasta.
 * Como `shell.js` está sempre em `assets/js/`, dois níveis acima dele é a raiz,
 * valha o endereço que valer: `/` no local, `/SIPLAM/` no GitHub Pages.
 */
export const RAIZ = new URL("../../", import.meta.url).pathname;

/** Endereço de uma tela a partir da raiz, funcione de onde funcionar. */
export const url = (caminho) => RAIZ + caminho;

function paginaAtual() {
    const partes = location.pathname.split("/").filter(Boolean);
    const arquivo = partes.at(-1) || "programas.html";
    // Numa subpasta, o menu deve marcar a listagem: `central-ppa/criar.html`
    // pertence ao item `central-ppa.html`.
    if (arquivo === "criar.html" || arquivo === "editar.html") {
        return partes.at(-2) + ".html";
    }
    return arquivo;
}

function inicio(visao) {
    return url(visao === "central" ? "central.html" : "programas.html");
}

/**
 * O plano em que se está trabalhando.
 *
 * Tudo que se cadastra nasce vinculado a um PPA, e o sistema atende um por vez.
 * Sem isso à vista, quem cadastra não tem como saber em qual ciclo está
 * mexendo — e quando houver dois planos, a pergunta fica sem resposta na tela.
 *
 * Tamanho normal, não "sm": a busca ao lado é um form-control de altura cheia, e
 * um select mais baixo desalinharia a linha do cabeçalho.
 */
function chipDoPlano(estado) {
    const ppa = ppaCorrente(estado);
    if (!ppa) return "";

    const planos = [...(estado.ppas ?? [])].sort((a, b) => Number(b.primeiroAno) - Number(a.primeiroAno));

    return `
    <select class="form-select w-auto ms-2" id="seletor-ppa"
            aria-label="Plano em que você está trabalhando"
            title="Plano em que você está trabalhando">
        ${planos
            .map(
                (p) => `
        <option value="${p.id}"${p.id === ppa.id ? " selected" : ""}>
            ${esc(p.primeiroAno)}–${esc(p.ultimoAno)} · ${esc(situacaoPpa(p.situacao).rotulo)}
        </option>`
            )
            .join("")}
    </select>`;
}

/**
 * Trocar de plano muda o que as telas mostram e a que plano o próximo cadastro
 * se vincula. Recarrega em vez de redesenhar: toda tela lê o estado na abertura,
 * e meia tela atualizada seria pior que esperar um instante.
 */
function instalarTrocaDePlano() {
    document.addEventListener("change", (e) => {
        if (e.target.id !== "seletor-ppa") return;
        selecionarPpa(e.target.value);
        window.location.reload();
    });
}

/** Nome e perfil de quem entrou, vindos do fluxo de acesso. */
function quemEntrou(estado, central) {
    const perfilId = perfilDaSessao();
    let usuario = null;
    try {
        usuario = localStorage.getItem("siplam.usuario");
    } catch (e) {
        /* navegador sem armazenamento */
    }

    return {
        nome: usuario || (central ? estado.analista : estado.usuario),
        papel: PERFIL[perfilId]?.nome || (central ? "Administrador central" : "Planejamento setorial"),
        orgao: central ? null : estado.orgaoAtual,
    };
}

function topbar(estado, visao) {
    const central = visao === "central";
    const quem = quemEntrou(estado, central);
    const raiz = inicio(visao);

    return `
<header class="app-topbar">
    <div class="container-fluid topbar-menu">
        <div class="d-flex align-items-center gap-2">
            <!-- O template só exibe esta marca quando a sidenav está em offcanvas -->
            <div class="logo-topbar">
                <a href="${raiz}" class="logo-light">
                    <span class="logo-lg"><img src="${url("assets/img/logo-siplam.svg")}" alt="SIPLAM" /></span>
                    <span class="logo-sm"><img src="${url("assets/img/logo-siplam-sm.svg")}" alt="SIPLAM" /></span>
                </a>
                <a href="${raiz}" class="logo-dark">
                    <span class="logo-lg"><img src="${url("assets/img/logo-siplam.svg")}" alt="SIPLAM" /></span>
                    <span class="logo-sm"><img src="${url("assets/img/logo-siplam-sm.svg")}" alt="SIPLAM" /></span>
                </a>
            </div>

            <button class="sidenav-toggle-button btn btn-default btn-icon" type="button" aria-label="Recolher ou expandir o menu">
                <i class="ti ti-menu-4"></i>
            </button>

            <div id="search-box" class="app-search d-none d-lg-flex">
                <input type="search" class="form-control topbar-search" id="abrir-busca"
                       placeholder="Buscar…" readonly aria-label="Abrir a busca" />
                <i class="ti ti-search app-search-icon text-muted"></i>
                <kbd class="app-search-atalho d-none d-xl-block">Ctrl K</kbd>
            </div>

            <!--
                Só o plano fica aqui. Perfil e órgão saíram: não se escolhem e não
                mudam durante o uso, então repeti-los em toda tela gastava o lugar
                mais visível do sistema com o que ninguém consulta. Continuam no
                menu do usuário, que é onde se olha para conferir quem se é.
            -->
            <div class="topbar-item d-none d-md-flex ms-1 align-items-center">
                ${chipDoPlano(estado)}
            </div>
        </div>

        <div class="d-flex align-items-center gap-2">
            <div class="topbar-item">
                <button class="topbar-link" type="button" id="abrir-atena" title="Atena — apoio contextual" aria-label="Atena">
                    <i class="ti ti-message-chatbot topbar-link-icon"></i>
                    <span class="badge text-bg-warning badge-circle topbar-badge d-none" id="conta-atena">0</span>
                </button>
            </div>

            <div class="topbar-item">
                <button class="topbar-link" type="button" id="abrir-notificacoes" title="Notificações" aria-label="Notificações">
                    <i class="ti ti-bell topbar-link-icon"></i>
                    <span class="badge text-bg-danger badge-circle topbar-badge" id="conta-notificacoes">0</span>
                </button>
            </div>

            <div class="topbar-item nav-user">
                <div class="dropdown">
                    <a class="topbar-link dropdown-toggle drop-arrow-none px-2" data-bs-toggle="dropdown" href="#!" aria-haspopup="false" aria-expanded="false">
                        <span class="avatar-sm bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center me-lg-2">
                            <i class="ti ti-user"></i>
                        </span>
                        <div class="d-lg-flex align-items-center gap-1 d-none">
                            <span class="d-block text-start lh-sm">
                                <h5 class="my-0 fs-13">${quem.nome}</h5>
                                <span class="fs-11 text-muted">${quem.papel}</span>
                            </span>
                            <i class="ti ti-chevron-down align-middle"></i>
                        </div>
                    </a>
                    <div class="dropdown-menu dropdown-menu-end">
                        <div class="dropdown-header noti-title">
                            <h6 class="text-overflow m-0">${quem.nome}</h6>
                            <span class="fs-12 text-muted d-block">${quem.papel}</span>
                            ${quem.orgao ? `<span class="fs-12 text-muted">${quem.orgao}</span>` : ""}
                        </div>
                        <button type="button" class="dropdown-item" id="trocar-perfil">
                            <i class="ti ti-switch-horizontal me-1 fs-lg align-middle"></i>
                            <span class="align-middle">Trocar perfil</span>
                        </button>
                        <button type="button" class="dropdown-item" id="reiniciar-prototipo">
                            <i class="ti ti-refresh me-1 fs-lg align-middle"></i>
                            <span class="align-middle">Reiniciar protótipo</span>
                        </button>
                        <div class="dropdown-divider"></div>
                        <a href="${url("index.html")}" class="dropdown-item text-danger fw-semibold">
                            <i class="ti ti-logout me-1 fs-lg align-middle"></i>
                            <span class="align-middle">Sair</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</header>`;
}

function sidenav(visao) {
    const menu = emConstrucao() ? [] : visao === "central" ? MENU_CENTRAL : MENU_SETORIAL;
    const atual = paginaAtual();
    const raiz = inicio(visao);

    const itens = menu
        .map((item) => {
            if (item.grupo !== undefined) return `<li class="side-nav-title">${item.grupo}</li>`;
            const ativo = item.href === atual ? " active" : "";
            return `
            <li class="side-nav-item">
                <a href="${url(item.href)}" class="side-nav-link${ativo}">
                    <span class="menu-icon"><i class="ti ${item.icone}"></i></span>
                    <span class="menu-text">${item.rotulo}</span>
                </a>
            </li>`;
        })
        .join("");

    return `
<div class="sidenav-menu">
    <a href="${raiz}" class="logo">
        <span class="logo logo-light">
            <span class="logo-lg"><img src="${url("assets/img/logo-siplam.svg")}" alt="SIPLAM" /></span>
            <span class="logo-sm"><img src="${url("assets/img/logo-siplam-sm.svg")}" alt="SIPLAM" /></span>
        </span>
        <span class="logo logo-dark">
            <span class="logo-lg"><img src="${url("assets/img/logo-siplam.svg")}" alt="SIPLAM" /></span>
            <span class="logo-sm"><img src="${url("assets/img/logo-siplam-sm.svg")}" alt="SIPLAM" /></span>
        </span>
    </a>

    <button class="button-on-hover" type="button" aria-label="Fixar o menu">
        <span class="btn-on-hover-icon"></span>
    </button>

    <button class="button-close-offcanvas" type="button" aria-label="Fechar o menu">
        <i class="ti ti-x align-middle"></i>
    </button>

    <div class="scrollbar" data-simplebar>
        <div id="sidenav-menu">
            <ul class="side-nav">
                ${
                    emConstrucao()
                        ? `<li class="side-nav-title">Em construção</li>
                           <li class="px-3 py-2 fs-12 text-muted">As telas deste perfil ainda não foram construídas.</li>`
                        : `<li class="side-nav-title">${visao === "central" ? "Área Central" : "Meu órgão"}</li>
                           ${itens}`
                }
            </ul>
        </div>
    </div>
</div>`;
}

function rodape() {
    return `
<footer class="footer">
    <div class="container-fluid">
        <div class="row">
            <div class="col-md-6 text-center text-md-start">
                © <span data-current-year></span> <span class="fw-semibold">Estado de Goiás</span> · SIPLAM
            </div>
            <div class="col-md-6">
                <div class="text-md-end d-none d-md-block text-muted">
                    Protótipo de interface — dados de demonstração
                </div>
            </div>
        </div>
    </div>
</footer>`;
}

/** A tela em que um perfil entra. Sem tela própria, a home provisória. */
function telaInicialDoPerfil(id) {
    const perfil = PERFIL[id];
    if (!perfil || perfil.construcao) return url("em-construcao.html");
    return inicio(perfil.visao);
}

/**
 * Troca de perfil sem sair da tela: um modal com os cinco, o atual marcado.
 *
 * Antes isso levava a `perfil.html`, a mesma tela do primeiro acesso. Sair do
 * sistema para voltar a ele é caro quando a troca serve para conferir como uma
 * tela aparece para outro papel — que é o uso real disto num protótipo.
 */
function instalarTrocaDePerfil() {
    const gatilho = document.getElementById("trocar-perfil");
    if (!gatilho) return;

    const atual = perfilDaSessao();
    const opcoes = Object.entries(PERFIL)
        .map(
            ([id, p]) => `
        <button type="button" class="list-group-item list-group-item-action d-flex align-items-start gap-2 ${
            id === atual ? "active" : ""
        }" data-perfil="${id}">
            <i class="ti ${id === atual ? "ti-circle-check" : "ti-circle"} fs-lg mt-1"></i>
            <span>
                <span class="fw-medium d-block">${p.nome}</span>
                <span class="fs-12 ${id === atual ? "" : "text-muted"}">${p.descricao}</span>
            </span>
        </button>`
        )
        .join("");

    document.body.insertAdjacentHTML(
        "beforeend",
        `<div class="modal fade" id="modal-trocar-perfil" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title fs-15">Trocar perfil</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>
                <div class="modal-body">
                    <p class="fs-13 text-muted mb-3">O perfil define a tela inicial, o menu e o que você pode fazer.</p>
                    <div class="list-group">${opcoes}</div>
                </div>
            </div>
        </div>
    </div>`
    );

    const el = document.getElementById("modal-trocar-perfil");

    gatilho.addEventListener("click", () => bootstrap.Modal.getOrCreateInstance(el).show());

    el.addEventListener("click", (e) => {
        const escolha = e.target.closest("[data-perfil]");
        if (!escolha) return;
        const id = escolha.dataset.perfil;
        if (id === atual) return bootstrap.Modal.getInstance(el).hide();
        try {
            localStorage.setItem("siplam.perfilSessao", id);
        } catch (erro) {
            console.warn("SIPLAM: não foi possível guardar o perfil.", erro);
        }
        window.location.href = telaInicialDoPerfil(id);
    });
}

/**
 * "Reiniciar protótipo": apaga tudo que o navegador guardou — a sessão e o
 * estado — e volta para a entrada com os dados de demonstração.
 *
 * Existe para ninguém precisar abrir o console do navegador para limpar o
 * `localStorage`, que era a única saída quando uma demonstração ficava suja.
 */
function instalarReinicio() {
    document.getElementById("reiniciar-prototipo")?.addEventListener("click", async () => {
        const confirmou = await confirmarExclusao({
            titulo: "Reiniciar protótipo",
            texto: "Tudo o que foi cadastrado nesta sessão é apagado e os dados de demonstração voltam ao estado original. Não dá para desfazer.",
            confirmar: "Reiniciar",
        });
        if (!confirmou) return;
        try {
            localStorage.clear();
            sessionStorage.clear();
        } catch (e) {
            console.warn("SIPLAM: não foi possível limpar o armazenamento.", e);
        }
        window.location.href = url("index.html");
    });
}

/** Monta topbar, sidenav e rodapé nos pontos de ancoragem da página. */
export function montarShell() {
    const estado = obterEstado();
    const visao = visaoAtual();

    const alvoTopbar = document.getElementById("shell-topbar");
    const alvoSidenav = document.getElementById("shell-sidenav");
    const alvoRodape = document.querySelector(".content-page");

    if (alvoTopbar) alvoTopbar.outerHTML = topbar(estado, visao);
    if (alvoSidenav) alvoSidenav.outerHTML = sidenav(visao);
    if (alvoRodape) alvoRodape.insertAdjacentHTML("beforeend", rodape());

    const ano = document.querySelector("[data-current-year]");
    if (ano) ano.textContent = new Date().getFullYear();

    instalarTrocaDePerfil();
    instalarTrocaDePlano();
    instalarReinicio();
    instalarBusca(estado, visao);
    instalarNotificacoes(estado, visao);
    instalarAtena(estado);

    return { estado, visao };
}

/** Cabeçalho de página: título, subtítulo e espaço para os filtros. */
/**
 * Páginas que não estão no menu: de onde vêm e como se chamam.
 *
 * O menu já diz o nome e o lugar de quase tudo. Aqui ficam só as telas que ele
 * não lista — as consultas transversais e as fichas de um registro.
 */
const TRILHAS = {
    // Fora do menu por ora: o Diagnóstico sai da vez e a tela será refeita
    // adiante. O endereço continua respondendo, com trilha, para quem tiver o
    // link guardado.
    "central-diagnostico.html": { rotulo: "Diagnóstico" },
    "central-entregas.html": { rotulo: "Entregas do PPA" },
    "central-financeira.html": { rotulo: "Análise Financeira" },
    "central-ipofs.html": { rotulo: "IPOFs" },
    "central-orgaos.html": { rotulo: "Órgãos participantes" },
    "central-projetos.html": { rotulo: "Projetos GOMAP" },
    "central-causas.html": { rotulo: "Cobertura das Causas" },
    // Fichas de um registro. O rótulo aqui é só o que aparece quando a ficha
    // não diz de quem é — abertas de verdade, quem nomeia a trilha é o registro.
    "central-iniciativa.html": { rotulo: "Iniciativa" },
    "programa.html": { rotulo: "Programa" },
    "iniciativa.html": { rotulo: "Iniciativa" },
    "entrega.html": { rotulo: "Entrega" },
    "em-construcao.html": { rotulo: "Em construção" },
};

/** O menu da visão de quem está olhando. */
const menuAtual = () => (visaoAtual() === "central" ? MENU_CENTRAL : MENU_SETORIAL);

/**
 * A trilha da página, de onde se está até a raiz da visão.
 *
 * Monta-se sozinha a partir do menu: cada tela sabe o seu nome e o seu lugar, e
 * não precisa repeti-los. `elos` acrescenta o que o menu não tem — o registro
 * aberto, ou o “Novo” de um formulário.
 *
 * O último elo nunca é link: é onde a pessoa está.
 */
export function trilha(elos = []) {
    const central = visaoAtual() === "central";
    const arquivo = paginaAtual();

    const caminho = [
        central ? { rotulo: "Área Central", href: "central.html" } : { rotulo: "Programas", href: "programas.html" },
    ];

    const doMenu = menuAtual().find((i) => i.href === arquivo)?.rotulo;
    const proprio = TRILHAS[arquivo]?.rotulo;

    for (const acima of TRILHAS[arquivo]?.acima ?? []) {
        const rotulo = menuAtual().find((i) => i.href === acima)?.rotulo ?? TRILHAS[acima]?.rotulo ?? "";
        if (rotulo && rotulo !== caminho[0].rotulo) caminho.push({ rotulo, href: acima });
    }

    // O nome de uma ficha é genérico — “Iniciativa” — e cede a vez ao registro
    // que a tela está mostrando. O nome de uma tela do menu nunca cede.
    if (doMenu && doMenu !== caminho[0].rotulo) caminho.push({ rotulo: doMenu, href: arquivo });
    else if (!doMenu && proprio && !elos.length) caminho.push({ rotulo: proprio, href: arquivo });

    caminho.push(...elos.map((e) => (typeof e === "string" ? { rotulo: e } : e)));

    return `
    <ol class="breadcrumb m-0 py-0">
        ${caminho
            .map((e, i) => {
                const ultimo = i === caminho.length - 1;
                const texto = esc(e.rotulo);
                return ultimo
                    ? `<li class="breadcrumb-item active">${texto}</li>`
                    : `<li class="breadcrumb-item"><a href="${url(e.href)}">${texto}</a></li>`;
            })
            .join("")}
    </ol>`;
}

/**
 * A barra de título, encostada no cabeçalho.
 *
 * Título à esquerda, trilha à direita. É o `page-title-head` do Inspinia, sem
 * margem própria — o tema já cuida do espaçamento, e acrescentar margem abre um
 * vão entre ela e o cabeçalho.
 */
export function barraTitulo(titulo, elos = []) {
    return `
<div class="page-title-head d-flex align-items-center">
    <div class="flex-grow-1">
        <h4 class="page-main-title m-0">${titulo}</h4>
    </div>
    <div class="text-end">${trilha(elos)}</div>
</div>`;
}

/**
 * O cabeçalho de uma tela de listagem ou painel.
 *
 * O título sobe para a barra, junto da trilha; embaixo ficam a explicação e os
 * filtros. Antes o título vinha aqui e a trilha não existia.
 */
export function cabecalhoPagina(titulo, subtitulo, acoes = "", elos = []) {
    return `
${barraTitulo(titulo, elos)}
<div class="d-flex flex-wrap align-items-end justify-content-between gap-3 my-3">
    <p class="text-muted mb-0 fs-13">${subtitulo}</p>
    <div class="barra-filtros">${acoes}</div>
</div>`;
}
