/**
 * Análise Financeira — Área Central.
 * Porta `central_.analises.financeira.tsx`.
 *
 * Corrige T5.5.6: o protótipo mostrava só o previsto nesta tela, embora o
 * executado do SIAFIC exista no modelo e apareça em Órgãos.
 */
import { obterEstado } from "../dados/store.js";
import { ANOS } from "../dados/seed.js";
import { moedaCurta, moeda, pct, eixos, objetivos, executadoDaEntrega } from "../dados/regras.js";
import { linhasFinanceiras, DIMENSAO_LABEL } from "../dados/financeiro.js";
import { montarShell, cabecalhoPagina } from "../shell.js";
import { esc, faixaIndicadores } from "../ui.js";
import { quadroFinanceiro } from "../ui-financeiro.js";

const { estado } = montarShell();

const DIMENSOES = ["fonte", "orgao", "programa", "iniciativa", "entrega", "ipof", "projeto", "acao", "classificacao"];
const DETALHE = {
    fonte: "ipof",
    orgao: "programa",
    programa: "entrega",
    iniciativa: "entrega",
    entrega: "fonte",
    ipof: "acao",
    projeto: "entrega",
    acao: "fonte",
    classificacao: "fonte",
};

let dimensao = "fonte";
let ano = "todos";
let eixo = "todos";
let objetivo = "todos";
let programa = "todos";
let orgao = "todos";
let fonte = "todas";

function recorte() {
    return linhasFinanceiras(estado).filter((l) => {
        if (programa !== "todos" && l.programaId !== programa) return false;
        if (orgao !== "todos" && l.orgao !== orgao) return false;
        if (fonte !== "todas" && l.fonte !== fonte) return false;
        if (eixo !== "todos" || objetivo !== "todos") {
            const p = estado.programas.find((x) => x.id === l.programaId);
            if (eixo !== "todos" && p?.eixo !== eixo) return false;
            if (objetivo !== "todos" && p?.objetivoEstrategico !== objetivo) return false;
        }
        if (ano !== "todos" && !(l.anos[ano] > 0)) return false;
        return true;
    });
}

function filtros() {
    const todosOrgaos = [...new Set(linhasFinanceiras(estado).map((l) => l.orgao))].sort((a, b) => a.localeCompare(b));
    const todasFontes = [...new Set(linhasFinanceiras(estado).map((l) => l.fonte))].sort((a, b) => a.localeCompare(b));

    const opcoes = (lista, atual, rotuloTodos, valorTodos) =>
        `<option value="${valorTodos}">${rotuloTodos}</option>` +
        lista
            .map((v) => {
                const val = typeof v === "string" ? v : v.id;
                const rot = typeof v === "string" ? v : v.rotulo;
                return `<option value="${esc(val)}"${val === atual ? " selected" : ""}>${esc(rot)}</option>`;
            })
            .join("");

    return `
    <select class="form-select form-select-sm w-auto" id="dimensao">
        ${DIMENSOES.map(
            (d) => `<option value="${d}"${d === dimensao ? " selected" : ""}>Agrupar por ${esc(DIMENSAO_LABEL[d])}</option>`
        ).join("")}
    </select>
    <select class="form-select form-select-sm w-auto" id="ano">
        <option value="todos">2028–2031</option>
        ${ANOS.map((a) => `<option value="${a}"${a === ano ? " selected" : ""}>${a}</option>`).join("")}
    </select>
    <select class="form-select form-select-sm w-auto" id="eixo">${opcoes(eixos(estado.programas), eixo, "Todos os Eixos", "todos")}</select>
    <select class="form-select form-select-sm w-auto" id="objetivo">${opcoes(objetivos(estado.programas, eixo), objetivo, "Todos os Objetivos", "todos")}</select>
    <select class="form-select form-select-sm w-auto" id="programa">${opcoes(
        estado.programas.map((p) => ({ id: p.id, rotulo: `${p.codigo} — ${p.nome}` })),
        programa,
        "Todos os Programas",
        "todos"
    )}</select>
    <select class="form-select form-select-sm w-auto" id="orgao">${opcoes(todosOrgaos, orgao, "Todos os órgãos", "todos")}</select>
    <select class="form-select form-select-sm w-auto" id="fonte">${opcoes(todasFontes, fonte, "Todas as fontes", "todas")}</select>`;
}

function render() {
    const linhas = recorte();
    const total = linhas.reduce((s, l) => s + (ano === "todos" ? l.total : l.anos[ano] || 0), 0);
    const entregas = [...new Set(linhas.map((l) => l.entregaId))];
    const executado = entregas.reduce((s, id) => s + executadoDaEntrega(id), 0);

    document.getElementById("conteudo").innerHTML = `
    ${cabecalhoPagina(
        "Análise Financeira",
        "Quadro plurianual do PPA, derivado das Ações Orçamentárias vinculadas às Entregas.",
        filtros()
    )}
    ${faixaIndicadores(
        [
            { valor: moedaCurta(total), rotulo: "Previsto no recorte" },
            { valor: moedaCurta(executado), rotulo: "Executado (SIAFIC)" },
            { valor: pct(total > 0 ? (executado / total) * 100 : null), rotulo: "% de execução" },
            { valor: new Set(linhas.map((l) => l.fonte)).size, rotulo: "Fontes de recursos" },
            { valor: new Set(linhas.map((l) => l.orgao)).size, rotulo: "Órgãos" },
            { valor: entregas.length, rotulo: "Entregas com recursos" },
        ],
        "Nenhum valor é digitado: tudo vem das parcelas do IPOF, pela Ação vinculada a cada Entrega. A execução é financeira e não indica desempenho físico."
    )}
    <div class="card">
        <div class="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
            <h6 class="rotulo-secao mb-0">Quadro plurianual por ${esc(DIMENSAO_LABEL[dimensao])}</h6>
            <span class="fs-12 text-muted">${linhas.length} linha(s) no recorte · expanda para ver por ${esc(DIMENSAO_LABEL[DETALHE[dimensao]])}</span>
        </div>
        <div class="card-body p-0">
            ${quadroFinanceiro(linhas, { dimensao, detalhe: DETALHE[dimensao], curto: false, vazio: "Nenhum recurso no recorte escolhido." })}
        </div>
    </div>`;
}

const conteudo = document.getElementById("conteudo");

conteudo.addEventListener("change", (e) => {
    const id = e.target.id;
    if (id === "dimensao") dimensao = e.target.value;
    else if (id === "ano") ano = e.target.value;
    else if (id === "eixo") {
        eixo = e.target.value;
        objetivo = "todos";
    } else if (id === "objetivo") objetivo = e.target.value;
    else if (id === "programa") programa = e.target.value;
    else if (id === "orgao") orgao = e.target.value;
    else if (id === "fonte") fonte = e.target.value;
    else return;
    render();
});

render();
