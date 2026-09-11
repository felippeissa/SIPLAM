/**
 * Projetos GOMAP no PPA — Área Central.
 * Porta `central_.analises.projetos.tsx`.
 *
 * O Projeto descreve *como* a Entrega é produzida. Seu valor global nunca é o
 * valor da Entrega — a diferença entre os dois é o que esta tela mostra.
 */
import { obterEstado } from "../dados/store.js";
import { PROJETOS } from "../dados/seed.js";
import { moedaCurta, moeda, descompassoProjeto } from "../dados/regras.js";
import { linhasDoProjeto, entregasDoProjeto } from "../dados/financeiro.js";
import { montarShell, cabecalhoPagina } from "../shell.js";
import { chip, esc, faixaIndicadores } from "../ui.js";
import { quadroFinanceiro } from "../ui-financeiro.js";

const { estado } = montarShell();

let busca = new URLSearchParams(location.search).get("q") ?? "";
let somenteDescompasso = false;
const abertos = new Set();

function linhas() {
    const q = busca.trim().toLowerCase();

    return PROJETOS.map((p) => {
        const linhasFin = linhasDoProjeto(estado, p.id);
        const noPpa = linhasFin.reduce((s, l) => s + l.total, 0);
        const entregas = [...new Set(linhasFin.map((l) => l.entregaId))];
        const vinculadas = estado.vinculos.filter((v) => v.projetoId === p.id).length;
        const diferenca = p.valorGlobal - noPpa;
        return {
            projeto: p,
            linhasFin,
            noPpa,
            entregas,
            vinculadas,
            diferenca,
            proporcao: p.valorGlobal > 0 ? Math.abs(diferenca) / p.valorGlobal : 0,
            ipofs: new Set(linhasFin.map((l) => l.ipof.id)).size,
            programas: new Set(linhasFin.map((l) => l.programaId)).size,
        };
    })
        .filter((l) => !q || [l.projeto.nome, l.projeto.codigo, l.projeto.orgao].some((c) => c.toLowerCase().includes(q)))
        .filter((l) => !somenteDescompasso || l.proporcao > 0.3 || l.noPpa === 0);
}

function linhaProjeto(l) {
    const aberto = abertos.has(l.projeto.id);
    const p = l.projeto;
    const semReflexo = l.noPpa === 0;
    const grande = l.proporcao > 0.3 && !semReflexo;

    return `
    <tr>
        <td style="width:2.5rem">
            <button class="btn-expandir" data-projeto="${p.id}" aria-expanded="${aberto}" aria-label="${aberto ? "Recolher" : "Expandir"}">
                <i class="ti ti-chevron-right"></i>
            </button>
        </td>
        <td>
            <div class="fw-medium"><span class="codigo text-muted me-2">${esc(p.codigo)}</span>${esc(p.nome)}</div>
            <div class="fs-12 text-muted">${esc(p.fase)} · ${esc(p.cronograma)}</div>
        </td>
        <td class="fs-12">${esc(p.orgao)}</td>
        <td class="num">${l.entregas.length || l.vinculadas || "—"}</td>
        <td class="num">${l.programas || "—"}</td>
        <td class="num">${l.ipofs || "—"}</td>
        <td class="num">${moedaCurta(p.valorGlobal)}</td>
        <td class="num">${l.noPpa ? moedaCurta(l.noPpa) : "—"}</td>
        <td>
            ${
                semReflexo
                    ? chip("Sem reflexo no PPA", "alerta")
                    : grande
                      ? chip(`Descompasso de ${moedaCurta(Math.abs(l.diferenca))}`, "alerta")
                      : chip("Compatível", "ok")
            }
        </td>
    </tr>
    ${
        aberto
            ? `<tr class="linha-filha"><td></td><td colspan="8" class="py-3">
        <div class="row g-3">
            <div class="col-lg-5">
                <div class="rotulo-secao mb-2">O Projeto no GOMAP</div>
                <ul class="list-group list-group-flush fs-13">
                    <li class="list-group-item px-0 d-flex justify-content-between"><span class="text-muted">Fase</span><span>${esc(p.fase)}</span></li>
                    <li class="list-group-item px-0 d-flex justify-content-between"><span class="text-muted">Execução física</span><span>${p.execucao}%</span></li>
                    <li class="list-group-item px-0 d-flex justify-content-between"><span class="text-muted">Conclusão prevista</span><span>${esc(p.conclusaoPrevista)}</span></li>
                    <li class="list-group-item px-0 d-flex justify-content-between"><span class="text-muted">Última atualização</span><span>${esc(p.ultimaAtualizacao)}</span></li>
                    <li class="list-group-item px-0 d-flex justify-content-between"><span class="text-muted">Valor global</span><span class="fw-semibold">${moeda(p.valorGlobal)}</span></li>
                    <li class="list-group-item px-0 d-flex justify-content-between"><span class="text-muted">Apropriado ao PPA</span><span class="fw-semibold">${moeda(l.noPpa)}</span></li>
                </ul>
                <p class="fs-12 text-muted mt-2 mb-0">
                    A diferença pode estar em Entregas de outros órgãos, fora do período do plano, ou em
                    Ações ainda não vinculadas.
                </p>
            </div>
            <div class="col-lg-7">
                <div class="rotulo-secao mb-2">Entregas do PPA financiadas por IPOFs deste Projeto</div>
                ${quadroFinanceiro(l.linhasFin, { dimensao: "entrega", detalhe: "fonte", vazio: "Nenhuma Entrega do PPA reflete este Projeto." })}
            </div>
        </div>
    </td></tr>`
            : ""
    }`;
}

function render() {
    const ls = linhas();
    const global = ls.reduce((s, l) => s + l.projeto.valorGlobal, 0);
    const noPpa = ls.reduce((s, l) => s + l.noPpa, 0);
    const semReflexo = ls.filter((l) => l.noPpa === 0).length;

    document.getElementById("conteudo").innerHTML = `
    ${cabecalhoPagina(
        "Projetos GOMAP no PPA",
        "Como os Projetos do GOMAP se refletem no plano — e quanto fica de fora.",
        `
        <div class="app-search">
            <input type="search" id="busca" class="form-control form-control-sm" placeholder="Código, nome ou órgão do Projeto" value="${esc(busca)}" style="min-width:18rem" />
            <i class="ti ti-search app-search-icon text-muted"></i>
        </div>
        <div class="form-check form-check-inline mb-0">
            <input class="form-check-input" type="checkbox" id="descompasso" ${somenteDescompasso ? "checked" : ""} />
            <label class="form-check-label fs-13" for="descompasso">Só com descompasso</label>
        </div>`
    )}
    ${faixaIndicadores(
        [
            { valor: ls.length, rotulo: "Projetos" },
            { valor: moedaCurta(global), rotulo: "Valor global no GOMAP" },
            { valor: moedaCurta(noPpa), rotulo: "Apropriado ao PPA" },
            { valor: moedaCurta(global - noPpa), rotulo: "Diferença" },
            { valor: semReflexo, rotulo: "Sem reflexo no PPA" },
        ],
        "O valor global do Projeto nunca é o valor da Entrega: o financeiro do PPA vem das Ações Orçamentárias."
    )}
    <div class="card">
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th></th>
                        <th>Projeto GOMAP</th>
                        <th style="width:14rem">Órgão</th>
                        <th class="num" style="width:6rem">Entregas</th>
                        <th class="num" style="width:6rem">Programas</th>
                        <th class="num" style="width:5rem">IPOFs</th>
                        <th class="num" style="width:8rem">Valor global</th>
                        <th class="num" style="width:8rem">No PPA</th>
                        <th style="width:12rem">Situação</th>
                    </tr>
                </thead>
                <tbody>
                ${
                    ls.length === 0
                        ? '<tr><td colspan="9" class="text-center text-muted py-4 fs-12">Nenhum Projeto corresponde ao filtro.</td></tr>'
                        : ls.map(linhaProjeto).join("")
                }
                </tbody>
            </table>
        </div>
    </div>`;

    document.getElementById("busca").value = busca;
}

const conteudo = document.getElementById("conteudo");

conteudo.addEventListener("click", (e) => {
    const p = e.target.closest("[data-projeto]");
    if (p) {
        const id = p.dataset.projeto;
        abertos.has(id) ? abertos.delete(id) : abertos.add(id);
        render();
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
    if (e.target.id === "descompasso") {
        somenteDescompasso = e.target.checked;
        render();
    }
});

render();
