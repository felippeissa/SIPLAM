/**
 * Cadastro de Usuários — Área Central.
 *
 * O SIPLAM não cria conta nem guarda senha: quem autentica é o Aplicações
 * Expresso, pelo ID Goiás ou pelo gov.br. Esta tela concede o acesso e define
 * o papel de quem já existe lá — por isso o formulário não tem senha.
 *
 * Duas escolhas que valem explicação:
 *
 * 1. Perfis é lista. A mesma pessoa pode acumular papéis, como confirmado com
 *    desenvolvimento, e é isso que faz a tela de escolha de perfil existir.
 * 2. Não há excluir, só inativar. O sistema registra quem preencheu, enviou e
 *    aprovou cada coisa; apagar a pessoa deixaria esse histórico órfão. Como
 *    quem escreve também pode aprovar, o registro é o único controle que resta.
 */
import { obterEstado, addItem, updItem } from "../dados/store.js";
import { montarShell, cabecalhoPagina, somenteLeitura } from "../shell.js";
import { ORGAOS } from "../dados/seed.js";
import { chip, esc, faixaIndicadores } from "../ui.js";
import { avisar } from "../toast.js";
import { campoErro, validar, limparAoDigitar } from "../validacao.js";

const { estado } = montarShell();
const leitura = somenteLeitura();

/** Espelha `assets/js/acesso.js`. Setorial exige órgão; central, não. */
const PERFIS = [
    { id: "setorial", nome: "Setorial", visao: "setorial" },
    { id: "gestao-setorial", nome: "Alta gestão setorial", visao: "setorial" },
    { id: "admin-central", nome: "Administrador central", visao: "central" },
    { id: "gestao-central", nome: "Alta gestão central", visao: "central" },
    { id: "controle", nome: "Órgãos de controle", visao: "central" },
];

const nomeDoPerfil = (id) => PERFIS.find((p) => p.id === id)?.nome ?? id;
const exigeOrgao = (perfis) => perfis.some((id) => PERFIS.find((p) => p.id === id)?.visao === "setorial");

let edicao = null;
let novo = false;
let busca = "";
let filtroPerfil = "todos";

const usuarios = () => estado.usuarios ?? [];

function visiveis() {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return usuarios().filter((u) => {
        if (filtroPerfil !== "todos" && !u.perfis.includes(filtroPerfil)) return false;
        if (!termo) return true;
        return [u.nome, u.email, u.orgao].join(" ").toLocaleLowerCase("pt-BR").includes(termo);
    });
}

function filtros() {
    return `
    <div class="d-flex flex-wrap gap-2 align-items-center">
        <select class="form-select form-select-sm w-auto" id="filtro-perfil">
            <option value="todos">Todos os perfis</option>
            ${PERFIS.map((p) => `<option value="${p.id}" ${filtroPerfil === p.id ? "selected" : ""}>${p.nome}</option>`).join("")}
        </select>
        <div class="app-search">
            <input type="search" class="form-control form-control-sm" id="busca" placeholder="Buscar por nome, e-mail ou órgão" value="${esc(busca)}" />
            <i class="app-search-icon ti ti-search"></i>
        </div>
        ${leitura ? "" : `<button class="btn btn-sm btn-primary" id="novo"><i class="ti ti-plus me-1"></i>Novo usuário</button>`}
    </div>`;
}

function indicadores() {
    const lista = usuarios();
    const ativos = lista.filter((u) => u.situacao === "ativo");
    return faixaIndicadores(
        [
            { valor: lista.length, rotulo: "Usuários" },
            { valor: ativos.length, rotulo: "Com acesso ativo" },
            { valor: ativos.filter((u) => exigeOrgao(u.perfis)).length, rotulo: "De órgãos setoriais" },
            { valor: ativos.filter((u) => u.perfis.length > 1).length, rotulo: "Com mais de um perfil" },
        ],
        "O acesso é autenticado pelo Aplicações Expresso. Aqui se define o papel de quem já tem conta — o sistema não guarda senha."
    );
}

function linha(u) {
    const inativo = u.situacao !== "ativo";
    return `
    <tr class="${inativo ? "text-muted" : ""}">
        <td>
            <span class="fw-medium">${esc(u.nome)}</span>
            <span class="fs-12 text-muted d-block">${esc(u.email)}</span>
        </td>
        <td>${u.orgao ? esc(u.orgao) : '<span class="text-muted">—</span>'}</td>
        <td>
            <div class="d-flex flex-wrap gap-1">
                ${u.perfis.map((id) => chip(nomeDoPerfil(id), "neutro")).join("")}
            </div>
        </td>
        <td>${inativo ? chip("Sem acesso", "impeditivo") : chip("Ativo", "ok")}</td>
        <td class="text-end">
            ${
                leitura
                    ? ""
                    : `<div class="dropdown">
                <button class="btn btn-sm btn-light" data-bs-toggle="dropdown" aria-label="Ações de ${esc(u.nome)}"><i class="ti ti-dots-vertical"></i></button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><button class="dropdown-item" data-editar="${u.id}">Editar</button></li>
                    <li><button class="dropdown-item ${inativo ? "" : "text-danger"}" data-situacao="${u.id}">
                        ${inativo ? "Reativar acesso" : "Suspender acesso"}
                    </button></li>
                </ul>
            </div>`
            }
        </td>
    </tr>`;
}

function formulario() {
    const u = edicao ?? { nome: "", email: "", orgao: "", perfis: [], situacao: "ativo" };
    return `
    <div class="modal-header">
        <h5 class="modal-title">${novo ? "Novo usuário" : "Editar usuário"}</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
    </div>
    <div class="modal-body" id="form-usuario">
        <div class="mb-3">
            <label class="form-label" for="u-nome">Nome<span class="text-danger">*</span></label>
            <input class="form-control" id="u-nome" value="${esc(u.nome)}" />
            ${campoErro("u-nome")}
        </div>
        <div class="mb-3">
            <label class="form-label" for="u-email">E-mail institucional<span class="text-danger">*</span></label>
            <input class="form-control" id="u-email" type="email" value="${esc(u.email)}" />
            <div class="form-text fs-12">É por ele que o Aplicações Expresso reconhece a pessoa.</div>
            ${campoErro("u-email")}
        </div>
        <div class="mb-3">
            <label class="form-label" for="u-perfis">Perfis<span class="text-danger">*</span></label>
            <div class="d-flex flex-column gap-1" id="u-perfis">
                ${PERFIS.map(
                    (p) => `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="${p.id}" id="perfil-${p.id}" data-perfil ${u.perfis.includes(p.id) ? "checked" : ""} />
                    <label class="form-check-label" for="perfil-${p.id}">
                        ${p.nome}
                        <span class="fs-12 text-muted">· visão ${p.visao}</span>
                    </label>
                </div>`
                ).join("")}
            </div>
            <div class="form-text fs-12">A mesma pessoa pode acumular papéis.</div>
            ${campoErro("u-perfis")}
        </div>
        <div class="mb-0">
            <label class="form-label" for="u-orgao">Órgão</label>
            <select class="form-select" id="u-orgao">
                <option value="">Sem órgão — perfil da Área Central</option>
                ${ORGAOS.map((o) => `<option value="${esc(o)}" ${u.orgao === o ? "selected" : ""}>${esc(o)}</option>`).join("")}
            </select>
            <div class="form-text fs-12" id="ajuda-orgao">Obrigatório para perfis da visão setorial.</div>
            ${campoErro("u-orgao")}
        </div>
    </div>
    <div class="modal-footer">
        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-primary" id="salvar">Salvar</button>
    </div>`;
}

function render() {
    const lista = visiveis();
    document.getElementById("conteudo").innerHTML = `
    ${cabecalhoPagina("Cadastro de Usuários", "Quem acessa o SIPLAM e com qual papel.", filtros())}
    ${indicadores()}

    <div class="card">
        <div class="table-responsive">
            <table class="table table-sm table-densa align-middle mb-0">
                <thead>
                    <tr>
                        <th>Usuário</th>
                        <th>Órgão</th>
                        <th>Perfis</th>
                        <th>Situação</th>
                        <th class="text-end">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${
                        lista.length
                            ? lista.map(linha).join("")
                            : `<tr><td colspan="5" class="text-center text-muted py-4">
                                   ${busca || filtroPerfil !== "todos" ? "Nenhum usuário encontrado com esse recorte." : "Nenhum usuário. Comece por “Novo usuário”."}
                               </td></tr>`
                    }
                </tbody>
            </table>
        </div>
    </div>

    <div class="modal fade" id="modal-usuario" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content" id="modal-conteudo"></div>
        </div>
    </div>`;

    ligar();
}

function abrirModal() {
    const el = document.getElementById("modal-usuario");
    document.getElementById("modal-conteudo").innerHTML = formulario();
    const modal = new bootstrap.Modal(el);
    modal.show();

    const escopo = document.getElementById("form-usuario");
    limparAoDigitar(escopo);

    // O órgão só é exigido de quem tem perfil setorial: a ajuda acompanha a escolha.
    const ajuda = document.getElementById("ajuda-orgao");
    const marcados = () => [...escopo.querySelectorAll("[data-perfil]:checked")].map((c) => c.value);
    const atualizarAjuda = () => {
        ajuda.textContent = exigeOrgao(marcados())
            ? "Obrigatório: há perfil da visão setorial marcado."
            : "Não se aplica aos perfis da Área Central.";
    };
    escopo.querySelectorAll("[data-perfil]").forEach((c) => c.addEventListener("change", atualizarAjuda));
    atualizarAjuda();

    document.getElementById("salvar").addEventListener("click", () => {
        const nome = document.getElementById("u-nome").value.trim();
        const email = document.getElementById("u-email").value.trim();
        const orgao = document.getElementById("u-orgao").value;
        const perfis = marcados();

        const ok = validar(escopo, [
            { campo: "u-nome", valido: nome.length > 0, mensagem: "Informe o nome." },
            { campo: "u-email", valido: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), mensagem: "Informe um e-mail institucional válido." },
            {
                campo: "u-email",
                valido: !usuarios().some((u) => u.email.toLocaleLowerCase("pt-BR") === email.toLocaleLowerCase("pt-BR") && u.id !== edicao?.id),
                mensagem: "Já existe um usuário com esse e-mail.",
            },
            { campo: "u-perfis", valido: perfis.length > 0, mensagem: "Escolha ao menos um perfil." },
            { campo: "u-orgao", valido: !exigeOrgao(perfis) || orgao !== "", mensagem: "Perfil da visão setorial exige um órgão." },
        ]);
        if (!ok) return;

        // Perfil só da Área Central não carrega órgão, mesmo que um tenha sido
        // escolhido antes de a pessoa trocar os perfis.
        const dados = { nome, email, perfis, orgao: exigeOrgao(perfis) ? orgao : "" };

        if (novo) {
            addItem("usuarios", { ...dados, situacao: "ativo" });
            avisar("Usuário cadastrado com sucesso.");
        } else {
            updItem("usuarios", edicao.id, dados);
            avisar("Usuário atualizado com sucesso.");
        }
        bootstrap.Modal.getInstance(el).hide();
        render();
    });

    el.addEventListener("hidden.bs.modal", () => {
        edicao = null;
        novo = false;
    });
}

function ligar() {
    const campoBusca = document.getElementById("busca");
    campoBusca?.addEventListener("input", (e) => {
        busca = e.target.value;
        const foco = document.activeElement === campoBusca;
        render();
        if (foco) {
            const novoCampo = document.getElementById("busca");
            novoCampo.focus();
            novoCampo.setSelectionRange(novoCampo.value.length, novoCampo.value.length);
        }
    });

    document.getElementById("filtro-perfil")?.addEventListener("change", (e) => {
        filtroPerfil = e.target.value;
        render();
    });

    document.getElementById("novo")?.addEventListener("click", () => {
        edicao = null;
        novo = true;
        abrirModal();
    });

    document.querySelectorAll("[data-editar]").forEach((b) =>
        b.addEventListener("click", () => {
            edicao = usuarios().find((u) => u.id === b.dataset.editar);
            novo = false;
            abrirModal();
        })
    );

    document.querySelectorAll("[data-situacao]").forEach((b) =>
        b.addEventListener("click", () => {
            const u = usuarios().find((x) => x.id === b.dataset.situacao);
            if (!u) return;
            const suspendendo = u.situacao === "ativo";
            updItem("usuarios", u.id, { situacao: suspendendo ? "inativo" : "ativo" });
            avisar(suspendendo ? "Acesso suspenso." : "Acesso reativado.");
            render();
        })
    );
}

render();
