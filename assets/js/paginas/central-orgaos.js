/**
 * Órgãos participantes — Área Central.
 * Porta `central_.orgaos.tsx`.
 *
 * Corrige T5.3.5: o protótipo listava apenas quem já contribuiu, então o órgão
 * silencioso — justamente o que precisa ser cobrado — era invisível.
 */
import { obterEstado } from "../dados/store.js";
import { ORGAOS } from "../dados/seed.js";
import {
    moedaCurta,
    pct,
    resumoOrgao,
    entregasDaIniciativa,
    situacaoEntrega,
    STATUS_CURTO,
} from "../dados/regras.js";
import { montarShell, cabecalhoPagina } from "../shell.js";
import { chip, statusChip, esc, faixaIndicadores } from "../ui.js";

const { estado } = montarShell();

let busca = "";
let mostrarSilenciosos = true;
const abertos = new Set();
const programasAbertos = new Set();
const iniciativasAbertas = new Set();

function linhas() {
    const q = busca.trim().toLowerCase();

    return ORGAOS.filter((o) => !q || o.toLowerCase().includes(q))
        .map((o) => resumoOrgao(estado, o))
        .filter((r) => mostrarSilenciosos || r.inis.length > 0)
        .sort((a, b) => b.inis.length - a.inis.length || a.orgao.localeCompare(b.orgao));
}

function chipsSituacao(r) {
    const partes = [];
    if (r.emPreenchimento) partes.push(chip(`${r.emPreenchimento} em preenchimento`, "neutro"));
    if (r.enviadas + r.emAnalise) partes.push(chip(`${r.enviadas + r.emAnalise} em análise`, "info"));
    if (r.devolvidas) partes.push(chip(`${r.devolvidas} devolvidas`, "alerta"));
    if (r.validadas) partes.push(chip(`${r.validadas} validadas`, "ok"));
    if (partes.length === 0) partes.push(chip("Sem contribuição", "alerta"));
    return partes.join(" ");
}

function blocoIniciativa(i) {
    const chave = `ini|${i.id}`;
    const aberta = iniciativasAbertas.has(chave);
    const entregas = entregasDaIniciativa(estado, i.id);

    return `
    <tr>
        <td style="width:2rem">
            <button class="btn-expandir" data-iniciativa="${esc(chave)}" aria-expanded="${aberta}" aria-label="${aberta ? "Recolher" : "Expandir"}">
                <i class="ti ti-chevron-right"></i>
            </button>
        </td>
        <td>${esc(i.nome)}</td>
        <td>${statusChip(i.status)}</td>
        <td class="num">${entregas.length}</td>
        <td><a href="central-iniciativa.html?id=${i.id}" class="btn btn-sm btn-outline-primary">Abrir análise</a></td>
    </tr>
    ${
        aberta
            ? `<tr><td></td><td colspan="4" class="pb-2">
        <table class="table table-sm tabela-aninhada mb-0">
            <thead><tr><th>Entrega</th><th style="width:10rem">Unidade</th><th style="width:12rem">Situação</th></tr></thead>
            <tbody>
                ${
                    entregas.length === 0
                        ? '<tr><td colspan="3" class="fs-12 text-muted">Iniciativa ainda sem Entregas.</td></tr>'
                        : entregas
                              .map((e) => {
                                  const s = situacaoEntrega(estado, e);
                                  return `<tr>
                        <td><a href="entrega.html?id=${e.id}">${esc(e.nome || "Sem nome")}</a></td>
                        <td class="fs-12 text-muted">${esc(e.unidadeMedida || "—")}</td>
                        <td>${chip(s.texto, s.tom)}</td>
                    </tr>`;
                              })
                              .join("")
                }
            </tbody>
        </table>
    </td></tr>`
            : ""
    }`;
}

function blocoPrograma(r, programaId) {
    const chave = `${r.orgao}|${programaId}`;
    const aberto = programasAbertos.has(chave);
    const p = estado.programas.find((x) => x.id === programaId);
    const inis = r.inis.filter((i) => i.programaId === programaId);

    return `
    <tr>
        <td style="width:2rem">
            <button class="btn-expandir" data-programa="${esc(chave)}" aria-expanded="${aberto}" aria-label="${aberto ? "Recolher" : "Expandir"}">
                <i class="ti ti-chevron-right"></i>
            </button>
        </td>
        <td><span class="codigo text-muted me-2">${esc(p?.codigo ?? "")}</span>${esc(p?.nome ?? "—")}</td>
        <td class="fs-12 text-muted">${esc(p?.eixo ?? "")}</td>
        <td class="num">${inis.length}</td>
    </tr>
    ${
        aberto
            ? `<tr><td></td><td colspan="3" class="pb-2">
        <table class="table table-sm tabela-aninhada mb-0">
            <thead><tr><th style="width:2rem"></th><th>Iniciativa</th><th style="width:11rem">Status</th><th class="num" style="width:6rem">Entregas</th><th style="width:9rem">Ações</th></tr></thead>
            <tbody>${inis.map(blocoIniciativa).join("")}</tbody>
        </table>
    </td></tr>`
            : ""
    }`;
}

function linhaOrgao(r) {
    const aberto = abertos.has(r.orgao);
    const silencioso = r.inis.length === 0;

    return `
    <tr${silencioso ? ' class="text-muted"' : ""}>
        <td style="width:2.5rem">
            ${
                silencioso
                    ? ""
                    : `<button class="btn-expandir" data-orgao="${esc(r.orgao)}" aria-expanded="${aberto}" aria-label="${aberto ? "Recolher" : "Expandir"} ${esc(r.orgao)}">
                <i class="ti ti-chevron-right"></i>
            </button>`
            }
        </td>
        <td class="fw-medium">${esc(r.orgao)}</td>
        <td class="num">${r.programas.length || "—"}</td>
        <td class="num">${r.inis.length || "—"}</td>
        <td class="num">${r.entregas || "—"}</td>
        <td>${chipsSituacao(r)}</td>
        <td class="num">${r.previsto ? moedaCurta(r.previsto) : "—"}</td>
        <td class="num">${r.executado ? moedaCurta(r.executado) : "—"}</td>
        <td class="num">${pct(r.previsto > 0 ? (r.executado / r.previsto) * 100 : null)}</td>
    </tr>
    ${
        aberto && !silencioso
            ? `<tr class="linha-filha"><td></td><td colspan="8" class="py-3">
        <table class="table table-sm tabela-aninhada mb-0">
            <thead><tr><th style="width:2rem"></th><th>Programa</th><th style="width:14rem">Eixo</th><th class="num" style="width:7rem">Iniciativas</th></tr></thead>
            <tbody>${r.programas.map((pid) => blocoPrograma(r, pid)).join("")}</tbody>
        </table>
    </td></tr>`
            : ""
    }`;
}

function render() {
    const ls = linhas();
    const comContribuicao = ls.filter((r) => r.inis.length > 0);
    const silenciosos = ls.length - comContribuicao.length;

    document.getElementById("conteudo").innerHTML = `
    ${cabecalhoPagina(
        "Órgãos participantes",
        "Situação das contribuições de cada órgão ao plano.",
        `
        <div class="app-search">
            <input type="search" id="busca" class="form-control form-control-sm" placeholder="Buscar órgão" value="${esc(busca)}" />
            <i class="ti ti-search app-search-icon text-muted"></i>
        </div>
        <div class="form-check form-check-inline mb-0">
            <input class="form-check-input" type="checkbox" id="silenciosos" ${mostrarSilenciosos ? "checked" : ""} />
            <label class="form-check-label fs-13" for="silenciosos">Mostrar órgãos sem contribuição</label>
        </div>`
    )}
    ${faixaIndicadores(
        [
            { valor: comContribuicao.length, rotulo: "Órgãos com contribuição" },
            { valor: silenciosos, rotulo: "Sem contribuição" },
            { valor: comContribuicao.reduce((s, r) => s + r.inis.length, 0), rotulo: "Iniciativas" },
            { valor: comContribuicao.reduce((s, r) => s + r.entregas, 0), rotulo: "Entregas" },
            {
                valor: comContribuicao.reduce((s, r) => s + r.enviadas + r.emAnalise, 0),
                rotulo: "Aguardando análise",
            },
            { valor: moedaCurta(comContribuicao.reduce((s, r) => s + r.previsto, 0)), rotulo: "Previsto" },
        ],
        "A execução é financeira, apurada no SIAFIC, e não indica desempenho físico."
    )}
    <div class="card">
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th></th>
                        <th>Órgão</th>
                        <th class="num" style="width:6rem">Programas</th>
                        <th class="num" style="width:6rem">Iniciativas</th>
                        <th class="num" style="width:6rem">Entregas</th>
                        <th style="width:20rem">Situação</th>
                        <th class="num" style="width:8rem">Previsto</th>
                        <th class="num" style="width:8rem">Executado</th>
                        <th class="num" style="width:5rem">%</th>
                    </tr>
                </thead>
                <tbody>
                ${
                    ls.length === 0
                        ? '<tr><td colspan="9" class="text-center text-muted py-4 fs-12">Nenhum órgão corresponde ao filtro.</td></tr>'
                        : ls.map(linhaOrgao).join("")
                }
                </tbody>
            </table>
        </div>
    </div>`;

    document.getElementById("busca").value = busca;
}

const conteudo = document.getElementById("conteudo");

conteudo.addEventListener("click", (e) => {
    const orgao = e.target.closest("[data-orgao]");
    if (orgao) {
        const k = orgao.dataset.orgao;
        abertos.has(k) ? abertos.delete(k) : abertos.add(k);
        return render();
    }
    const prog = e.target.closest("[data-programa]");
    if (prog) {
        const k = prog.dataset.programa;
        programasAbertos.has(k) ? programasAbertos.delete(k) : programasAbertos.add(k);
        return render();
    }
    const ini = e.target.closest("[data-iniciativa]");
    if (ini) {
        const k = ini.dataset.iniciativa;
        iniciativasAbertas.has(k) ? iniciativasAbertas.delete(k) : iniciativasAbertas.add(k);
        return render();
    }
});

conteudo.addEventListener("input", (e) => {
    if (e.target.id === "busca") {
        busca = e.target.value;
        render();
        document.getElementById("busca").focus();
    }
});

conteudo.addEventListener("change", (e) => {
    if (e.target.id === "silenciosos") {
        mostrarSilenciosos = e.target.checked;
        render();
    }
});

render();
