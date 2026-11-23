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
import { montarShell, barraTitulo } from "../shell.js";
import { criarFiltros } from "../filtros.js";
import { chip, esc, faixaIndicadores } from "../ui.js";

const { estado } = montarShell();

const buscaInicial = new URLSearchParams(location.search).get("q") ?? "";
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

function linhasBase() {
    return IPOFS.map((ipof) => {
        const projeto = projetoPorIdSimples(ipof.projetoId);
        return { ipof, projeto, total: totalDoIpof(ipof), fontes: fontesDoIpof(ipof), ...reflexo(ipof) };
    });
}

const linhas = () => linhasBase().filter((l) => filtros.passa(l));

// O mesmo componente de filtros das demais telas: campos com rótulo, e o filtro só vale ao clicar em Filtrar.
const filtros = criarFiltros({
    livre: { rotulo: "IPOF", texto: (l) => [l.ipof.codigo, l.ipof.nome, l.ipof.orgao, l.projeto?.codigo ?? "", ...l.fontes].join(" ") },
    campos: [
        { id: "fora", rotulo: "Valor fora do PPA", tipo: "booleano", sim: "Com valor fora do PPA", nao: "Sem valor fora do PPA", valorDe: (l) => [l.fora > 0 ? "sim" : "nao"] },
    ],
    exportar: "ipofs",
});

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

/** Monta a tela uma vez: a barra de filtros fica de pé, e só a faixa e o corpo da tabela se refazem. */
function montar() {
    document.getElementById("conteudo").innerHTML = `
    ${barraTitulo("IPOFs")}
    <div id="faixa" class="mt-3"></div>
    <div class="card">
        ${filtros.html()}
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
                <tbody id="corpo-ipofs"></tbody>
            </table>
        </div>
    </div>`;
    filtros.ligar(() => render());
    // O link vindo de outra tela traz o termo na URL (?q=): entra no campo e já vale.
    if (buscaInicial) {
        document.getElementById("filtro-livre").value = buscaInicial;
        document.getElementById("filtro-buscar").click();
    }
}

function render() {
    const ls = linhas();
    const siafic = ls.reduce((s, l) => s + l.total, 0);
    const dentro = ls.reduce((s, l) => s + l.dentro, 0);
    const fora = ls.reduce((s, l) => s + l.fora, 0);
    const orfaos = ls.filter((l) => l.dentro === 0).length;

    document.getElementById("faixa").innerHTML = faixaIndicadores(
        [
            { valor: ls.length, rotulo: "IPOFs" },
            { valor: moedaCurta(siafic), rotulo: "Valor no SIAFIC" },
            { valor: moedaCurta(dentro), rotulo: "Refletido no PPA" },
            { valor: moedaCurta(fora), rotulo: "Fora do PPA" },
            { valor: orfaos, rotulo: "Sem Entrega vinculada" },
        ],
        "Um valor fica fora do PPA quando a Ação da parcela não financia nenhuma Entrega do plano."
    );
    document.getElementById("corpo-ipofs").innerHTML =
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
                  .join("");
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

montar();
render();
