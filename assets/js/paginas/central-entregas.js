/**
 * Entregas do PPA — visão transversal da Área Central.
 * Porta `central_.entregas.tsx`.
 *
 * Acréscimo: filtros estruturados por órgão, programa e situação, que o
 * protótipo não tinha — lá tudo dependia de acertar o termo na busca (T5.2.3).
 */
import { obterEstado } from "../dados/store.js";
import { moedaCurta, situacaoEntrega, recursosDaEntrega, STATUS_CURTO } from "../dados/regras.js";
import { ANOS } from "../dados/seed.js";
import { acoesDaEntrega } from "../dados/financeiro.js";
import { montarShell, cabecalhoPagina } from "../shell.js";
import { chip, statusChip, esc, faixaIndicadores } from "../ui.js";

const { estado } = montarShell();

let busca = "";
let orgao = "todos";
let programa = "todos";
let situacao = "todas";

function metaTotal(e) {
    return ANOS.reduce((s, a) => s + (e.metas[a] ?? 0), 0);
}

function linhas() {
    const q = busca.trim().toLowerCase();

    return estado.entregas
        .map((e) => {
            const ini = estado.iniciativas.find((i) => i.id === e.iniciativaId);
            const prog = ini ? estado.programas.find((p) => p.id === ini.programaId) : null;
            return { entrega: e, ini, prog, sit: situacaoEntrega(estado, e) };
        })
        .filter((l) => l.ini)
        .filter((l) => {
            if (orgao !== "todos" && l.ini.orgao !== orgao) return false;
            if (programa !== "todos" && l.ini.programaId !== programa) return false;
            if (situacao !== "todas" && l.sit.tom !== situacao) return false;
            if (!q) return true;
            const campos = [
                l.entrega.nome,
                l.ini.orgao,
                l.ini.nome,
                l.prog?.nome,
                ...l.entrega.territorio.regioes,
            ];
            return campos.some((c) => (c ?? "").toLowerCase().includes(q));
        });
}

function filtros() {
    const orgaos = [...new Set(estado.iniciativas.map((i) => i.orgao))].sort((a, b) => a.localeCompare(b));
    return `
    <div class="app-search">
        <input type="search" id="busca" class="form-control form-control-sm" placeholder="Entrega, órgão, Programa, Iniciativa ou região" value="${esc(busca)}" style="min-width:20rem" />
        <i class="ti ti-search app-search-icon text-muted"></i>
    </div>
    <select class="form-select form-select-sm w-auto" id="orgao">
        <option value="todos">Todos os órgãos</option>
        ${orgaos.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join("")}
    </select>
    <select class="form-select form-select-sm w-auto" id="programa">
        <option value="todos">Todos os Programas</option>
        ${estado.programas.map((p) => `<option value="${p.id}">${esc(p.codigo)} — ${esc(p.nome)}</option>`).join("")}
    </select>
    <select class="form-select form-select-sm w-auto" id="situacao">
        <option value="todas">Todas as situações</option>
        <option value="impeditivo">Com pendência impeditiva</option>
        <option value="alerta">Com alerta</option>
        <option value="ok">Completas</option>
    </select>`;
}

function render() {
    const ls = linhas();
    const previsto = ls.reduce((s, l) => s + recursosDaEntrega(estado, l.entrega.id), 0);
    const semAcao = ls.filter((l) => acoesDaEntrega(estado, l.entrega.id).length === 0).length;

    document.getElementById("conteudo").innerHTML = `
    ${cabecalhoPagina("Entregas do PPA", "Entregas de todos os órgãos, com meta e previsão financeira.", filtros())}
    ${faixaIndicadores(
        [
            { valor: ls.length, rotulo: "Entregas no recorte" },
            { valor: new Set(ls.map((l) => l.ini.orgao)).size, rotulo: "Órgãos" },
            { valor: new Set(ls.map((l) => l.ini.programaId)).size, rotulo: "Programas" },
            { valor: semAcao, rotulo: "Sem Ação vinculada" },
            { valor: moedaCurta(previsto), rotulo: "Previsto no recorte" },
        ],
        "O previsto deriva das Ações Orçamentárias vinculadas a cada Entrega."
    )}
    <div class="card">
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th>Entrega</th>
                        <th style="width:14rem">Órgão</th>
                        <th style="width:15rem">Iniciativa</th>
                        <th style="width:13rem">Programa</th>
                        <th class="num" style="width:7rem">Meta total</th>
                        <th class="num" style="width:8rem">Previsto</th>
                        <th style="width:11rem">Situação</th>
                        <th style="width:6rem">Ações</th>
                    </tr>
                </thead>
                <tbody>
                ${
                    ls.length === 0
                        ? '<tr><td colspan="8" class="text-center text-muted py-4 fs-12">Nenhuma Entrega corresponde ao filtro.</td></tr>'
                        : ls
                              .map(
                                  (l) => `
                    <tr>
                        <td>
                            <a href="entrega.html?id=${l.entrega.id}" class="fw-medium">${esc(l.entrega.nome || "Sem nome")}</a>
                            <div class="fs-12 text-muted">${esc(l.entrega.unidadeMedida || "unidade não informada")}</div>
                        </td>
                        <td class="fs-12">${esc(l.ini.orgao)}</td>
                        <td class="fs-12 text-muted">${esc(l.ini.nome)}</td>
                        <td class="fs-12 text-muted">${esc(l.prog?.nome ?? "—")}</td>
                        <td class="num">${metaTotal(l.entrega).toLocaleString("pt-BR")}</td>
                        <td class="num">${moedaCurta(recursosDaEntrega(estado, l.entrega.id))}</td>
                        <td>${chip(l.sit.texto, l.sit.tom)}<div class="fs-12 text-muted mt-1">${STATUS_CURTO[l.ini.status]}</div></td>
                        <td><a href="entrega.html?id=${l.entrega.id}" class="btn btn-sm btn-outline-primary">Abrir</a></td>
                    </tr>`
                              )
                              .join("")
                }
                </tbody>
            </table>
        </div>
    </div>`;

    document.getElementById("busca").value = busca;
    document.getElementById("orgao").value = orgao;
    document.getElementById("programa").value = programa;
    document.getElementById("situacao").value = situacao;
}

const conteudo = document.getElementById("conteudo");

conteudo.addEventListener("input", (e) => {
    if (e.target.id === "busca") {
        busca = e.target.value;
        render();
        const campo = document.getElementById("busca");
        campo.focus();
        campo.setSelectionRange(campo.value.length, campo.value.length);
    }
});

conteudo.addEventListener("change", (e) => {
    if (e.target.id === "orgao") orgao = e.target.value;
    else if (e.target.id === "programa") programa = e.target.value;
    else if (e.target.id === "situacao") situacao = e.target.value;
    else return;
    render();
});

render();
