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
import { obterEstado } from "./dados/store.js";
import { instalarBusca } from "./busca.js";

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
    { href: "central-entregas.html", rotulo: "Entregas", icone: "ti-box" },
    { href: "central-orgaos.html", rotulo: "Órgãos participantes", icone: "ti-building" },
    { grupo: "Análises" },
    { href: "central-causas.html", rotulo: "Por Causas", icone: "ti-binary-tree" },
    { href: "central-financeira.html", rotulo: "Financeira", icone: "ti-coins" },
    { href: "central-projetos.html", rotulo: "Projetos", icone: "ti-git-branch" },
    { href: "central-ipofs.html", rotulo: "IPOFs", icone: "ti-receipt" },
    { grupo: "Administração" },
    { href: "central-programas.html", rotulo: "Programas do PPA", icone: "ti-settings" },
];

const PERFIL = {
    "tecnico-setorial": "Técnico setorial",
    "ponto-focal": "Ponto focal do órgão",
    "analista-central": "Analista da Área Central",
    "admin-programas": "Administrador de Programas",
    consulta: "Consulta",
};

/** A visão vem do nome do arquivo: tudo que começa com "central" é área central. */
export function visaoAtual() {
    return paginaAtual().startsWith("central") ? "central" : "setorial";
}

function paginaAtual() {
    return location.pathname.split("/").pop() || "programas.html";
}

function inicio(visao) {
    return visao === "central" ? "central.html" : "programas.html";
}

/** Nome e perfil de quem entrou, vindos do fluxo de acesso. */
function quemEntrou(estado, central) {
    let perfilId = null;
    let usuario = null;
    try {
        perfilId = localStorage.getItem("siplam.perfilSessao");
        usuario = localStorage.getItem("siplam.usuario");
    } catch (e) {
        /* navegador sem armazenamento */
    }

    return {
        nome: usuario || (central ? estado.analista : estado.usuario),
        papel: PERFIL[perfilId] || (central ? "Área Central" : estado.orgaoAtual),
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
                    <span class="logo-lg"><img src="assets/img/logo-siplam.svg" alt="SIPLAM" /></span>
                    <span class="logo-sm"><img src="assets/img/logo-siplam-sm.svg" alt="SIPLAM" /></span>
                </a>
                <a href="${raiz}" class="logo-dark">
                    <span class="logo-lg"><img src="assets/img/logo-siplam.svg" alt="SIPLAM" /></span>
                    <span class="logo-sm"><img src="assets/img/logo-siplam-sm.svg" alt="SIPLAM" /></span>
                </a>
            </div>

            <button class="sidenav-toggle-button btn btn-default btn-icon" type="button" aria-label="Recolher ou expandir o menu">
                <i class="ti ti-menu-4"></i>
            </button>

            <div id="search-box" class="app-search d-none d-lg-flex">
                <input type="search" class="form-control topbar-search" id="abrir-busca"
                       placeholder="Buscar Programa, Iniciativa, Entrega…" readonly aria-label="Abrir a busca" />
                <i class="ti ti-search app-search-icon text-muted"></i>
                <kbd class="app-search-atalho">Ctrl K</kbd>
            </div>
        </div>

        <div class="d-flex align-items-center gap-2">
            <div class="topbar-item d-none d-md-flex">
                <div class="btn-group btn-group-sm" role="group" aria-label="Alternar visão">
                    <a href="programas.html" class="btn ${central ? "btn-light" : "btn-primary"}">Visão Setorial</a>
                    <a href="central.html" class="btn ${central ? "btn-primary" : "btn-light"}">Visão Área Central</a>
                </div>
            </div>

            <div class="topbar-item nav-user">
                <div class="dropdown">
                    <a class="topbar-link dropdown-toggle drop-arrow-none px-2" data-bs-toggle="dropdown" href="#!" aria-haspopup="false" aria-expanded="false">
                        <span class="avatar-sm bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center me-lg-2">
                            <i class="ti ti-user"></i>
                        </span>
                        <div class="d-lg-flex align-items-center gap-1 d-none text-start">
                            <div>
                                <h5 class="my-0 fs-13">${quem.nome}</h5>
                                <span class="fs-12 text-muted">${quem.papel}</span>
                            </div>
                            <i class="ti ti-chevron-down align-middle ms-1"></i>
                        </div>
                    </a>
                    <div class="dropdown-menu dropdown-menu-end">
                        <div class="dropdown-header noti-title">
                            <h6 class="text-overflow m-0">${quem.nome}</h6>
                            <span class="fs-12 text-muted">${quem.papel}</span>
                        </div>
                        <a href="perfil.html" class="dropdown-item">
                            <i class="ti ti-switch-horizontal me-1 fs-lg align-middle"></i>
                            <span class="align-middle">Trocar perfil</span>
                        </a>
                        <a href="${central ? "programas.html" : "central.html"}" class="dropdown-item d-md-none">
                            <i class="ti ti-arrows-exchange me-1 fs-lg align-middle"></i>
                            <span class="align-middle">Ir para a ${central ? "Visão Setorial" : "Área Central"}</span>
                        </a>
                        <div class="dropdown-divider"></div>
                        <a href="index.html" class="dropdown-item text-danger fw-semibold">
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
    const menu = visao === "central" ? MENU_CENTRAL : MENU_SETORIAL;
    const atual = paginaAtual();
    const raiz = inicio(visao);

    const itens = menu
        .map((item) => {
            if (item.grupo !== undefined) return `<li class="side-nav-title">${item.grupo}</li>`;
            const ativo = item.href === atual ? " active" : "";
            return `
            <li class="side-nav-item">
                <a href="${item.href}" class="side-nav-link${ativo}">
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
            <span class="logo-lg"><img src="assets/img/logo-siplam.svg" alt="SIPLAM" /></span>
            <span class="logo-sm"><img src="assets/img/logo-siplam-sm.svg" alt="SIPLAM" /></span>
        </span>
        <span class="logo logo-dark">
            <span class="logo-lg"><img src="assets/img/logo-siplam.svg" alt="SIPLAM" /></span>
            <span class="logo-sm"><img src="assets/img/logo-siplam-sm.svg" alt="SIPLAM" /></span>
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
                <li class="side-nav-title">${visao === "central" ? "Área Central" : "Meu órgão"}</li>
                ${itens}
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
                © <span data-current-year></span> <span class="fw-semibold">Estado de Goiás</span> · PPA 2028–2031
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

    instalarBusca(estado, visao);

    return { estado, visao };
}

/** Cabeçalho de página: título, subtítulo e espaço para os filtros. */
export function cabecalhoPagina(titulo, subtitulo, acoes = "") {
    return `
<div class="d-flex flex-wrap align-items-end justify-content-between gap-3 my-3">
    <div>
        <h4 class="fw-bold mb-1">${titulo}</h4>
        <p class="text-muted mb-0 fs-13">${subtitulo}</p>
    </div>
    <div class="barra-filtros">${acoes}</div>
</div>`;
}
