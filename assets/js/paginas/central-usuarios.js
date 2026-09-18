/**
 * Gestão de usuários — Área Central.
 *
 * A pessoa se registra sozinha em `registrar.html` e cai aqui como
 * **aguardando aprovação**, sem perfil. O Administrador central lê os dados,
 * aprova ou reprova, e **é na aprovação que o perfil é escolhido** — o papel é
 * concedido, não pedido.
 *
 * Por isso a tela não edita cadastro: quem aprova confere o que a pessoa
 * declarou e decide. Mudar o nome ou o órgão dela aqui seria decidir sobre um
 * dado que não é nosso.
 *
 * Depois de aprovado, as ações são de acesso, não de cadastro: revogar e
 * reativar. Senha não passa por aqui — quem autentica é o Aplicações Expresso.
 */
import { obterEstado, updItem, SITUACOES_USUARIO, situacaoUsuario } from "../dados/store.js";
import { montarShell, cabecalhoPagina, somenteLeitura } from "../shell.js";
import { chip, esc, faixaIndicadores } from "../ui.js";
import { avisar } from "../toast.js";
import { campoErro, validar, limparAoDigitar } from "../validacao.js";

const { estado } = montarShell();
const leitura = somenteLeitura();

/** Espelha `assets/js/acesso.js`. Setorial exige órgão; central, não. */
const PERFIS = [
    { id: "setorial", nome: "Planejamento setorial", visao: "setorial" },
    { id: "gestao-setorial", nome: "Alta gestão setorial", visao: "setorial" },
    { id: "admin-central", nome: "Administrador central", visao: "central" },
    { id: "gestao-central", nome: "Alta gestão central", visao: "central" },
    { id: "controle", nome: "Consulta", visao: "central" },
];

const nomeDoPerfil = (id) => PERFIS.find((p) => p.id === id)?.nome ?? id;

let analisando = null;
let busca = "";
let filtro = "todos";

const usuarios = () => estado.usuarios ?? [];

/**
 * A ordem é por urgência, não por cadastro: quem aguarda decisão vem primeiro.
 * Uma solicitação nova entra no fim da lista e, com dezenas de aprovados na
 * frente, some da tela — justamente a linha que exige ação.
 */
const URGENCIA = { aguardando: 0, aprovado: 1, revogado: 2, reprovado: 3 };

function visiveis() {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return usuarios()
        .filter((u) => {
            if (filtro !== "todos" && u.situacao !== filtro) return false;
            if (!termo) return true;
            return [u.nome, u.email, u.login, u.orgao].join(" ").toLocaleLowerCase("pt-BR").includes(termo);
        })
        .sort(
            (a, b) =>
                (URGENCIA[a.situacao] ?? 9) - (URGENCIA[b.situacao] ?? 9) ||
                a.nome.localeCompare(b.nome, "pt-BR")
        );
}

function filtros() {
    return `
    <div class="d-flex flex-wrap gap-2 align-items-center">
        <select class="form-select form-select-sm w-auto" id="filtro">
            <option value="todos">Todas as situações</option>
            ${SITUACOES_USUARIO.map((s) => `<option value="${s.id}" ${filtro === s.id ? "selected" : ""}>${s.rotulo}</option>`).join("")}
        </select>
        <div class="app-search">
            <input type="search" class="form-control form-control-sm" id="busca" placeholder="Buscar por nome, e-mail, login ou órgão" value="${esc(busca)}" />
            <i class="app-search-icon ti ti-search"></i>
        </div>
    </div>`;
}

function indicadores() {
    const lista = usuarios();
    const conta = (s) => lista.filter((u) => u.situacao === s).length;
    return faixaIndicadores(
        [
            { valor: conta("aguardando"), rotulo: "Aguardando aprovação" },
            { valor: conta("aprovado"), rotulo: "Com acesso ativo" },
            { valor: conta("revogado"), rotulo: "Acesso revogado" },
            { valor: conta("reprovado"), rotulo: "Reprovados" },
        ],
        "O cadastro é feito pela própria pessoa. O perfil é definido aqui, no momento da aprovação."
    );
}

/**
 * Uma ação por situação, sempre no mesmo lugar: o menu de três pontos ao fim da
 * linha. Botões diferentes em colunas diferentes fariam o olho procurar a ação
 * a cada linha.
 */
function acoes(u) {
    if (leitura) return "";

    const itens = {
        aguardando: { rotulo: "Analisar solicitação", atributo: `data-analisar="${u.id}"`, tom: "" },
        reprovado: { rotulo: "Rever decisão", atributo: `data-analisar="${u.id}"`, tom: "" },
        aprovado: { rotulo: "Revogar acesso", atributo: `data-acesso="${u.id}"`, tom: "text-danger" },
        revogado: { rotulo: "Ativar acesso", atributo: `data-acesso="${u.id}"`, tom: "" },
    };
    const item = itens[u.situacao];
    if (!item) return "";

    return `
    <div class="dropdown">
        <button class="btn btn-sm btn-light" data-bs-toggle="dropdown" aria-label="Ações de ${esc(u.nome)}"><i class="ti ti-dots-vertical"></i></button>
        <ul class="dropdown-menu dropdown-menu-end">
            <li><button class="dropdown-item ${item.tom}" ${item.atributo}>${item.rotulo}</button></li>
        </ul>
    </div>`;
}

function linha(u) {
    const s = situacaoUsuario(u.situacao);
    const semAcesso = u.situacao === "revogado" || u.situacao === "reprovado";
    return `
    <tr class="${semAcesso ? "text-muted" : ""}">
        <td>
            <span class="fw-medium">${esc(u.nome)}</span>
            <span class="fs-12 text-muted d-block">${esc(u.email)}</span>
        </td>
        <td class="codigo">${esc(u.login)}</td>
        <td>${u.orgao ? esc(u.orgao) : '<span class="text-muted">—</span>'}</td>
        <td>
            ${
                u.perfis.length
                    ? `<div class="d-flex flex-wrap gap-1">${u.perfis.map((id) => chip(nomeDoPerfil(id), "neutro")).join("")}</div>`
                    : '<span class="text-muted fs-12">definido na aprovação</span>'
            }
        </td>
        <td>${chip(s.rotulo, s.tom)}</td>
        <td class="text-end">${acoes(u)}</td>
    </tr>`;
}

function render() {
    const lista = visiveis();
    document.getElementById("conteudo").innerHTML = `
    ${cabecalhoPagina("Gestão de usuários", "Solicitações de acesso e perfis concedidos.", filtros())}
    ${indicadores()}

    <div class="card">
        <div class="table-responsive">
            <table class="table table-sm table-densa align-middle mb-0">
                <thead>
                    <tr>
                        <th>Usuário</th>
                        <th style="width:10rem">Login</th>
                        <th style="width:16rem">Órgão</th>
                        <th style="width:14rem">Perfil</th>
                        <th style="width:11rem">Situação</th>
                        <th class="text-end" style="width:7rem">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${
                        lista.length
                            ? lista.map(linha).join("")
                            : `<tr><td colspan="6" class="text-center text-muted py-4 fs-12">
                                   ${busca || filtro !== "todos" ? "Nenhum usuário com esse recorte." : "Nenhuma solicitação de acesso."}
                               </td></tr>`
                    }
                </tbody>
            </table>
        </div>
    </div>

    <div class="modal fade" id="modal-analise" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content" id="modal-conteudo"></div>
        </div>
    </div>`;

    ligar();
}

/** Os dados declarados por quem se registrou. Leitura, nunca edição. */
function ficha(u) {
    const campo = (rotulo, valor) => `
    <div class="col-6">
        <div class="rotulo-secao mb-1">${rotulo}</div>
        <p class="fs-13 mb-0">${valor ? esc(valor) : "—"}</p>
    </div>`;
    return `
    <div class="row g-3 mb-3">
        ${campo("Nome", u.nome)}
        ${campo("E-mail", u.email)}
        ${campo("Login", u.login)}
        ${campo("Órgão", u.orgao)}
    </div>`;
}

function abrirAnalise() {
    const u = analisando;
    const el = document.getElementById("modal-analise");
    document.getElementById("modal-conteudo").innerHTML = `
    <div class="modal-header">
        <h5 class="modal-title">Analisar solicitação</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
    </div>
    <div class="modal-body" id="form-analise">
        <p class="text-muted fs-12 mb-3">Solicitado em ${esc(u.criadoEm ?? "—")}.</p>
        ${ficha(u)}
        <hr class="my-3" />
        <label class="form-label" for="a-perfis">Perfil a conceder<span class="text-danger">*</span></label>
        <div class="d-flex flex-column gap-1" id="a-perfis">
            ${PERFIS.map(
                (p) => `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${p.id}" id="a-${p.id}" data-perfil ${u.perfis.includes(p.id) ? "checked" : ""} />
                <label class="form-check-label" for="a-${p.id}">
                    ${p.nome}
                    <span class="fs-12 text-muted">· visão ${p.visao}</span>
                </label>
            </div>`
            ).join("")}
        </div>
        <div class="form-text fs-12">Obrigatório para aprovar. Não se aplica à reprovação.</div>
        ${campoErro("a-perfis")}
    </div>
    <div class="modal-footer">
        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-outline-danger" id="reprovar">Reprovar</button>
        <button type="button" class="btn btn-primary" id="aprovar">Aprovar</button>
    </div>`;

    const modal = new bootstrap.Modal(el);
    modal.show();

    const escopo = document.getElementById("form-analise");
    limparAoDigitar(escopo);

    const decidir = (situacao, perfis) => {
        updItem("usuarios", u.id, {
            situacao,
            perfis,
            decididoEm: new Date().toLocaleDateString("pt-BR"),
            decididoPor: estado.analista,
        });
        avisar(situacao === "aprovado" ? "Usuário aprovado com sucesso." : "Solicitação reprovada.");
        bootstrap.Modal.getInstance(el).hide();
        render();
    };

    document.getElementById("aprovar").addEventListener("click", () => {
        const perfis = [...escopo.querySelectorAll("[data-perfil]:checked")].map((c) => c.value);
        const ok = validar(escopo, [
            { campo: "a-perfis", valido: perfis.length > 0, mensagem: "Escolha ao menos um perfil para aprovar." },
        ]);
        if (!ok) return;
        decidir("aprovado", perfis);
    });

    // Reprovar não concede papel nenhum: o perfil escolhido é descartado.
    document.getElementById("reprovar").addEventListener("click", () => decidir("reprovado", []));

    el.addEventListener("hidden.bs.modal", () => {
        analisando = null;
    });
}

function ligar() {
    const campoBusca = document.getElementById("busca");
    campoBusca?.addEventListener("input", (e) => {
        busca = e.target.value;
        const foco = document.activeElement === campoBusca;
        render();
        if (foco) {
            const novo = document.getElementById("busca");
            novo.focus();
            novo.setSelectionRange(novo.value.length, novo.value.length);
        }
    });

    document.getElementById("filtro")?.addEventListener("change", (e) => {
        filtro = e.target.value;
        render();
    });

    document.querySelectorAll("[data-analisar]").forEach((b) =>
        b.addEventListener("click", () => {
            analisando = usuarios().find((u) => u.id === b.dataset.analisar);
            if (analisando) abrirAnalise();
        })
    );

    document.querySelectorAll("[data-acesso]").forEach((b) =>
        b.addEventListener("click", () => {
            const u = usuarios().find((x) => x.id === b.dataset.acesso);
            if (!u) return;
            const revogando = u.situacao === "aprovado";
            updItem("usuarios", u.id, { situacao: revogando ? "revogado" : "aprovado" });
            avisar(revogando ? "Acesso revogado." : "Acesso reativado.");
            render();
        })
    );
}

render();
