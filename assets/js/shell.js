/**
 * Shell do SIPLAM — topbar, sidenav e rodapé.
 *
 * Monta a estrutura do Inspinia em volta do conteúdo da página, para as 16 telas
 * não repetirem o markup. Substitui `src/components/ppa/shell.tsx` do protótipo.
 *
 * Uso na página:
 *   <div class="wrapper">
 *     <div id="shell-topbar"></div>
 *     <div id="shell-sidenav"></div>
 *     <div class="content-page"> … conteúdo … </div>
 *   </div>
 *   <script type="module">import { montarShell } from "./assets/js/shell.js"; montarShell();</script>
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
    { grupo: " " },
    { href: "central-programas.html", rotulo: "Administração de Programas", icone: "ti-settings" },
];

/** A visão vem do nome do arquivo: tudo que começa com "central" é área central. */
export function visaoAtual() {
    const pagina = location.pathname.split("/").pop() || "programas.html";
    return pagina.startsWith("central") ? "central" : "setorial";
}

function paginaAtual() {
    return location.pathname.split("/").pop() || "programas.html";
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

    const PERFIL = {
        "tecnico-setorial": "Técnico setorial",
        "ponto-focal": "Ponto focal do órgão",
        "analista-central": "Analista da Área Central",
        "admin-programas": "Administrador de Programas",
        consulta: "Consulta",
    };

    return {
        nome: usuario || (central ? estado.analista : estado.usuario),
        papel: PERFIL[perfilId] || (central ? "Área Central" : estado.orgaoAtual),
    };
}

function topbar(estado, visao) {
    const central = visao === "central";
    const quem = quemEntrou(estado, central);
    const persona = `<span class="text-body fw-medium">${quem.nome}</span> · ${quem.papel}`;

    return `
<header class="app-topbar">
    <div class="container-fluid topbar-menu">
        <div class="d-flex align-items-center gap-2">
            <div class="logo-topbar">
                <a href="${central ? "central.html" : "programas.html"}" class="logo-light">
                    <span class="logo-lg"><img src="assets/img/logo-siplam.svg" alt="SIPLAM" height="26" /></span>
                </a>
                <a href="${central ? "central.html" : "programas.html"}" class="logo-dark">
                    <span class="logo-lg"><img src="assets/img/logo-siplam.svg" alt="SIPLAM" height="26" /></span>
                </a>
            </div>

            <button class="sidenav-toggle-button btn btn-default btn-icon" type="button">
                <i class="ti ti-menu-4"></i>
            </button>

            <div class="d-none d-md-flex align-items-baseline gap-2 ms-2">
                <span class="fw-semibold">PPA 2028–2031</span>
                <span class="text-muted fs-12">Estado de Goiás</span>
            </div>
        </div>

        <div class="d-flex align-items-center gap-2 ms-3">
            <div class="btn-group" role="group" aria-label="Alternar visão">
                <a href="programas.html" class="btn btn-sm ${central ? "btn-light" : "btn-primary"}">Visão Setorial</a>
                <a href="central.html" class="btn btn-sm ${central ? "btn-primary" : "btn-light"}">Visão Área Central</a>
            </div>
        </div>

        <div class="ms-auto d-flex align-items-center gap-3">
            <button class="btn btn-sm btn-light d-none d-lg-inline-flex align-items-center gap-2" id="abrir-busca" type="button">
                <i class="ti ti-search"></i>
                <span class="text-muted">Buscar…</span>
                <kbd class="bg-body-secondary text-muted">Ctrl K</kbd>
            </button>
            <div class="dropdown">
                <button class="btn btn-sm btn-light dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="ti ti-user me-1"></i>
                    <span class="d-none d-sm-inline">${persona}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end fs-13">
                    <li><a class="dropdown-item" href="perfil.html"><i class="ti ti-switch-horizontal me-2"></i>Trocar perfil</a></li>
                    <li><hr class="dropdown-divider" /></li>
                    <li><a class="dropdown-item" href="index.html"><i class="ti ti-logout me-2"></i>Sair</a></li>
                </ul>
            </div>
        </div>
    </div>
</header>`;
}

function sidenav(visao) {
    const menu = visao === "central" ? MENU_CENTRAL : MENU_SETORIAL;
    const atual = paginaAtual();

    const itens = menu
        .map((item) => {
            if (item.grupo !== undefined) {
                return `<li class="side-nav-title">${item.grupo.trim() || "&nbsp;"}</li>`;
            }
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
    <a href="${visao === "central" ? "central.html" : "programas.html"}" class="logo">
        <span class="logo logo-light">
            <span class="logo-lg"><img src="assets/img/logo-siplam.svg" alt="SIPLAM" height="24" /></span>
            <span class="logo-sm"><img src="inspinia/assets/images/logo-sm.png" alt="SIPLAM" /></span>
        </span>
        <span class="logo logo-dark">
            <span class="logo-lg"><img src="assets/img/logo-siplam.svg" alt="SIPLAM" height="24" /></span>
            <span class="logo-sm"><img src="inspinia/assets/images/logo-sm.png" alt="SIPLAM" /></span>
        </span>
    </a>

    <button class="button-sm-hover" type="button">
        <i class="ti ti-circle align-middle"></i>
    </button>

    <div id="sidenav-menu">
        <ul class="side-nav">
            <li class="side-nav-title mt-2">${visao === "central" ? "Área Central" : "Meu órgão"}</li>
            ${itens}
        </ul>
    </div>
</div>`;
}

function rodape() {
    return `
<footer class="footer">
    <div class="container-fluid">
        <div class="row">
            <div class="col-md-6 text-center text-md-start">
                © <span data-current-year></span> <span class="fw-semibold">Estado de Goiás</span>
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
