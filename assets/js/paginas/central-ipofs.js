/**
 * IPOFs — Área Central.
 * Porta `central_.analises.ipofs.tsx`.
 *
 * O IPOF é a programação financeira no SIAFIC. A fonte, a Ação e a
 * classificação pertencem à parcela — nunca ao IPOF.
 */
import { obterEstado } from "../dados/store.js";
import { IPOFS, ANOS } from "../dados/seed.js";
import { moedaCurta, moeda } from "../dados/regras.js";
import {
    totalDoIpof,
    totalDoIpofAno,
    fontesDoIpof,
    projetoPorIdSimples,
    entregaDaAcao,
    acaoPorId,
} from "../dados/financeiro.js";
import { montarShell, cabecalhoPagina } from "../shell.js";
import { chip, esc, faixaIndicadores } from "../ui.js";

const { estado } = montarShell();

let busca = new URLSearchParams(location.search).get("q") ?? "";
let somenteFora = false;
const abertos = new Set();

/** Quanto de um IPOF chega ao PPA: parcelas cuja Ação financia alguma Entrega. */
function reflexo(ipof) {
    let dentro = 0;
    let fora = 0;
    const porAno = Object.fromEntries(ANOS.map((a) => [a, { dentro: 0, fora: 0, total: 0 }]));
    const entregas = new Map();

    for (const parcela of ipof.parcelas) {
        const entregaId = entregaDaAcao(estado, parcela.acaoId);
        const destino = entregaId ? "dentro" : "fora";
        if (entregaId) dentro += parcela.valor;
        else fora += parcela.valor;

        if (porAno[parcela.ano]) {
            porAno[parcela.ano][destino] += parcela.valor;
            porAno[parcela.ano].total += parcela.valor;
        }

        if (entregaId) {
            const chave = `${entregaId}|${parcela.acaoId}`;
            const atual = entregas.get(chave) ?? {
                entregaId,
                acaoId: parcela.acaoId,
                anos: Object.fromEntries(ANOS.map((a) => [a, 0])),
                total: 0,
            };
            if (atual.anos[parcela.ano] !== undefined) atual.anos[parcela.ano] += parcela.valor;
            atual.total += parcela.valor;
            entregas.set(chave, atual);
        }
    }

    return { dentro, fora, porAno, entregas: [...entregas.values()].sort((a, b) => b.total - a.total) };
}

function linhas() {
    const q = busca.trim().toLowerCase();

    return IPOFS.map((ipof) => {
        const projeto = projetoPorIdSimples(ipof.projetoId);
        return { ipof, projeto, total: totalDoIpof(ipof), fontes: fontesDoIpof(ipof), ...reflexo(ipof) };
    })
        .filter(
            (l) =>
                !q ||
                [l.ipof.codigo, l.ipof.nome, l.ipof.orgao, l.projeto?.codigo ?? "", ...l.fontes].some((c) =>
                    (c ?? "").toLowerCase().includes(q)
                )
        )
        .filter((l) => !somenteFora || l.fora > 0);
}

function detalhe(l) {
    const anos = ANOS.map(
        (a) => `<tr>
        <td>${a}</td>
        <td class="num">${moeda(totalDoIpofAno(l.ipof, a))}</td>
        <td class="num">${moeda(l.porAno[a].dentro)}</td>
        <td class="num">${l.porAno[a].fora ? moeda(l.porAno[a].fora) : "—"}</td>
    </tr>`
    ).join("");

    const financiadas = l.entregas
        .map((e) => {
            const entrega = estado.entregas.find((x) => x.id === e.entregaId);
            const ini = entrega ? estado.iniciativas.find((i) => i.id === entrega.iniciativaId) : null;
            const prog = ini ? estado.programas.find((p) => p.id === ini.programaId) : null;
            const acao = acaoPorId(e.acaoId);
            return `<tr>
            <td><a href="entrega.html?id=${e.entregaId}">${esc(entrega?.nome ?? "—")}</a></td>
            <td class="fs-12"><span class="codigo">${esc(acao?.codigo ?? "")}</span> ${esc(acao?.nome ?? "")}</td>
            <td class="fs-12 text-muted">${esc(ini?.nome ?? "—")}</td>
            <td class="fs-12 text-muted">${esc(prog?.nome ?? "—")}</td>
            <td class="fs-12 text-muted">${esc(ini?.orgao ?? "—")}</td>
            ${ANOS.map((a) => `<td class="num">${e.anos[a] ? moedaCurta(e.anos[a]) : "—"}</td>`).join("")}
            <td class="num fw-semibold">${moedaCurta(e.total)}</td>
        </tr>`;
        })
        .join("");

    return `
    <tr class="linha-filha"><td></td><td colspan="8" class="py-3">
        <div class="row g-3">
            <div class="col-lg-4">
                <div class="rotulo-secao mb-2">Parcelas por ano</div>
                <table class="table table-sm tabela-aninhada mb-2">
                    <thead><tr><th>Ano</th><th class="num">SIAFIC</th><th class="num">No PPA</th><th class="num">Fora</th></tr></thead>
                    <tbody>${anos}</tbody>
                </table>
                <div class="fs-12 text-muted">
                    ${esc(l.ipof.parcelas.length)} parcela(s) · fontes: ${esc(l.fontes.join(", "))}
                    ${l.projeto ? `<br />Projeto ${esc(l.projeto.codigo)} — ${esc(l.projeto.nome)}` : "<br />Sem Projeto GOMAP relacionado"}
                </div>
            </div>
            <div class="col-lg-8">
                <div class="rotulo-secao mb-2">Entregas financiadas</div>
                ${
                    l.entregas.length === 0
                        ? '<p class="fs-12 text-muted mb-0">Nenhuma Ação deste IPOF está vinculada a uma Entrega do PPA. Todo o valor fica fora do plano.</p>'
                        : `<div class="table-responsive"><table class="table table-sm tabela-aninhada mb-0">
                    <thead><tr>
                        <th>Entrega</th><th>Ação</th><th>Iniciativa</th><th>Programa</th><th>Órgão</th>
                        ${ANOS.map((a) => `<th class="num">${a}</th>`).join("")}<th class="num">Total</th>
                    </tr></thead>
                    <tbody>${financiadas}</tbody>
                </table></div>`
                }
            </div>
        </div>
    </td></tr>`;
}

function render() {
    const ls = linhas();
    const siafic = ls.reduce((s, l) => s + l.total, 0);
    const dentro = ls.reduce((s, l) => s + l.dentro, 0);
    const fora = ls.reduce((s, l) => s + l.fora, 0);
    const orfaos = ls.filter((l) => l.dentro === 0).length;

    document.getElementById("conteudo").innerHTML = `
    ${cabecalhoPagina(
        "IPOFs",
        "Programação financeira do SIAFIC e quanto dela o PPA reflete.",
        `
        <div class="app-search">
            <input type="search" id="busca" class="form-control form-control-sm" placeholder="Código, nome, fonte, órgão ou Projeto" value="${esc(busca)}" style="min-width:20rem" />
            <i class="ti ti-search app-search-icon text-muted"></i>
        </div>
        <div class="form-check form-check-inline mb-0">
            <input class="form-check-input" type="checkbox" id="fora" ${somenteFora ? "checked" : ""} />
            <label class="form-check-label fs-13" for="fora">Só com valor fora do PPA</label>
        </div>`
    )}
    ${faixaIndicadores(
        [
            { valor: ls.length, rotulo: "IPOFs" },
            { valor: moedaCurta(siafic), rotulo: "Valor no SIAFIC" },
            { valor: moedaCurta(dentro), rotulo: "Refletido no PPA" },
            { valor: moedaCurta(fora), rotulo: "Fora do PPA" },
            { valor: orfaos, rotulo: "Sem Entrega vinculada" },
        ],
        "Um valor fica fora do PPA quando a Ação da parcela não financia nenhuma Entrega do plano."
    )}
    <div class="card">
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th></th>
                        <th>IPOF</th>
                        <th style="width:13rem">Órgão</th>
                        <th style="width:13rem">Fontes</th>
                        <th class="num" style="width:8rem">Valor SIAFIC</th>
                        <th class="num" style="width:8rem">No PPA</th>
                        <th class="num" style="width:8rem">Fora do PPA</th>
                        <th class="num" style="width:6rem">Entregas</th>
                    </tr>
                </thead>
                <tbody>
                ${
                    ls.length === 0
                        ? '<tr><td colspan="8" class="text-center text-muted py-4 fs-12">Nenhum IPOF corresponde ao filtro.</td></tr>'
                        : ls
                              .map((l) => {
                                  const aberto = abertos.has(l.ipof.id);
                                  return `
                    <tr>
                        <td style="width:2.5rem">
                            <button class="btn-expandir" data-ipof="${l.ipof.id}" aria-expanded="${aberto}" aria-label="${aberto ? "Recolher" : "Expandir"}">
                                <i class="ti ti-chevron-right"></i>
                            </button>
                        </td>
                        <td>
                            <div class="fw-medium"><span class="codigo text-muted me-2">${esc(l.ipof.codigo)}</span>${esc(l.ipof.nome)}</div>
                            <div class="fs-12 text-muted">${esc(l.ipof.situacao)}</div>
                        </td>
                        <td class="fs-12">${esc(l.ipof.orgao)}</td>
                        <td class="fs-12 text-muted">${esc(l.fontes.join(", "))}</td>
                        <td class="num">${moedaCurta(l.total)}</td>
                        <td class="num">${l.dentro ? moedaCurta(l.dentro) : "—"}</td>
                        <td class="num">${l.fora ? `${moedaCurta(l.fora)} ${chip("fora", "alerta")}` : "—"}</td>
                        <td class="num">${l.entregas.length || "—"}</td>
                    </tr>
                    ${aberto ? detalhe(l) : ""}`;
                              })
                              .join("")
                }
                </tbody>
            </table>
        </div>
    </div>`;

    document.getElementById("busca").value = busca;
}

const conteudo = document.getElementById("conteudo");

conteudo.addEventListener("click", (e) => {
    const i = e.target.closest("[data-ipof]");
    if (i) {
        const id = i.dataset.ipof;
        abertos.has(id) ? abertos.delete(id) : abertos.add(id);
        render();
    }
});

conteudo.addEventListener("input", (e) => {
    if (e.target.id === "busca") {
        busca = e.target.value;
        render();
        // O campo é recriado a cada tecla: sem devolver o cursor ao fim, o
        // texto digitado sai embaralhado.
        const campo = document.getElementById("busca");
        campo.focus();
        campo.setSelectionRange(campo.value.length, campo.value.length);
    }
});

conteudo.addEventListener("change", (e) => {
    if (e.target.id === "fora") {
        somenteFora = e.target.checked;
        render();
    }
});

render();
