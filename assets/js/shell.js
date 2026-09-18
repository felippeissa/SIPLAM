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
    { href: "central-programas.html", rotulo: "Programa", icone: "ti-layout-grid" },
    { href: "central-diagnostico.html", rotulo: "Diagnóstico", icone: "ti-stethoscope" },
    { href: "central-problema.html", rotulo: "Problemas", icone: "ti-alert-triangle" },
    { href: "central-causa.html", rotulo: "Causas", icone: "ti-binary-tree" },
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

function paginaAtual() {
    return location.pathname.split("/").pop() || "programas.html";
}

function inicio(visao) {
    return visao === "central" ? "central.html" : "programas.html";
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
                       placeholder="Buscar…" readonly aria-label="Abrir a busca" />
                <i class="ti ti-search app-search-icon text-muted"></i>
                <kbd class="app-search-atalho d-none d-xl-block">Ctrl K</kbd>
            </div>

            <!-- Não há comutador de visão: a visão é o perfil, escolhido no acesso. -->
            <div class="topbar-item d-none d-md-flex ms-1 align-items-center">
                <span class="chip chip-info">${quem.papel}</span>
                ${quem.orgao ? `<span class="fs-12 text-muted ms-2">${quem.orgao}</span>` : ""}
                ${somenteLeitura() ? `<span class="chip chip-neutro ms-2" title="Este perfil acompanha o plano, sem operá-lo"><i class="ti ti-eye me-1"></i>Somente leitura</span>` : ""}
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
                            <h5 class="my-0 fs-13">${quem.nome}</h5>
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
    const menu = emConstrucao() ? [] : visao === "central" ? MENU_CENTRAL : MENU_SETORIAL;
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
    if (!perfil || perfil.construcao) return "em-construcao.html";
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
        window.location.href = "index.html";
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
    instalarReinicio();
    instalarBusca(estado, visao);
    instalarNotificacoes(estado, visao);
    instalarAtena(estado);

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
