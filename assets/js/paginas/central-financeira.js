/**
 * Análise Financeira — Área Central.
 * Porta `central_.analises.financeira.tsx`.
 *
 * Corrige T5.5.6: o protótipo mostrava só o previsto nesta tela, embora o
 * executado do SIAFIC exista no modelo e apareça em Órgãos.
 */
import { obterEstado } from "../dados/store.js";
import { ANOS } from "../dados/seed.js";
import { moedaCurta, moeda, pct, executadoDaEntrega } from "../dados/regras.js";
import { linhasFinanceiras, DIMENSAO_LABEL } from "../dados/financeiro.js";
import { montarShell, barraTitulo } from "../shell.js";
import { criarFiltros, opcoesDe } from "../filtros.js";
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

const programaDe = (l) => estado.programas.find((x) => x.id === l.programaId);

// O mesmo componente de filtros das demais telas: campos com rótulo, e o filtro só vale ao clicar em Filtrar.
// Sem busca livre: esta tela nunca teve, e ela somaria um sétimo campo à linha.
const filtros = criarFiltros({
    livre: null,
    campos: [
        { id: "ano", rotulo: "Ano", opcoes: () => ANOS.map((a) => ({ valor: String(a), rotulo: String(a) })), valorDe: (l) => ANOS.filter((a) => l.anos[a] > 0).map(String) },
        { id: "eixo", rotulo: "Eixo", opcoes: () => opcoesDe(estado.programas, (p) => p.eixo), valorDe: (l) => (programaDe(l)?.eixo ? [programaDe(l).eixo] : []) },
        {
            id: "objetivo",
            rotulo: "Objetivo estratégico",
            opcoes: () => opcoesDe(estado.programas, (p) => p.objetivoEstrategico),
            valorDe: (l) => (programaDe(l)?.objetivoEstrategico ? [programaDe(l).objetivoEstrategico] : []),
        },
        {
            id: "programa",
            rotulo: "Programa",
            opcoes: () => estado.programas.map((p) => ({ valor: p.id, rotulo: `${p.codigo} — ${p.nome}` })),
            valorDe: (l) => (l.programaId ? [l.programaId] : []),
        },
        { id: "orgao", rotulo: "Órgão", opcoes: () => opcoesDe(linhasFinanceiras(estado), (l) => l.orgao), valorDe: (l) => (l.orgao ? [l.orgao] : []) },
        { id: "fonte", rotulo: "Fonte", opcoes: () => opcoesDe(linhasFinanceiras(estado), (l) => l.fonte), valorDe: (l) => (l.fonte ? [l.fonte] : []) },
    ],
    exportar: "analise-financeira",
});

const recorte = () => linhasFinanceiras(estado).filter((l) => filtros.passa(l));

/** Os anos marcados no filtro: com algum marcado, o total do recorte soma só esses anos. */
const anosEscolhidos = () => [...(document.getElementById("filtro-ano")?.selectedOptions ?? [])].map((o) => o.value);

function montar() {
    document.getElementById("conteudo").innerHTML = `
    ${barraTitulo("Análise Financeira")}
    <div id="faixa" class="mt-3"></div>
    <div class="card mb-3">${filtros.html()}</div>
    <div id="quadro"></div>`;
    filtros.ligar(() => render());
}

function render() {
    const linhas = recorte();
    const anos = anosEscolhidos();
    const total = linhas.reduce((s, l) => s + (anos.length ? anos.reduce((t, a) => t + (l.anos[a] || 0), 0) : l.total), 0);
    const entregas = [...new Set(linhas.map((l) => l.entregaId))];
    const executado = entregas.reduce((s, id) => s + executadoDaEntrega(id), 0);

    document.getElementById("faixa").innerHTML = faixaIndicadores(
        [
            { valor: moedaCurta(total), rotulo: "Previsto no recorte" },
            { valor: moedaCurta(executado), rotulo: "Executado (SIAFIC)" },
            { valor: pct(total > 0 ? (executado / total) * 100 : null), rotulo: "% de execução" },
            { valor: new Set(linhas.map((l) => l.fonte)).size, rotulo: "Fontes de recursos" },
            { valor: new Set(linhas.map((l) => l.orgao)).size, rotulo: "Órgãos" },
            { valor: entregas.length, rotulo: "Entregas com recursos" },
        ],
        "Nenhum valor é digitado: tudo vem das parcelas do IPOF, pela Ação vinculada a cada Entrega. A execução é financeira e não indica desempenho físico."
    );
    document.getElementById("quadro").innerHTML = `
    <div class="card">
        <div class="card-header d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
                <h6 class="rotulo-secao mb-0">Quadro plurianual por ${esc(DIMENSAO_LABEL[dimensao])}</h6>
                <span class="fs-12 text-muted">${linhas.length} linha(s) no recorte · expanda para ver por ${esc(DIMENSAO_LABEL[DETALHE[dimensao]])}</span>
            </div>
            <div class="d-flex align-items-center gap-2">
                <label class="form-label mb-0 text-nowrap" for="dimensao">Agrupar por</label>
                <select class="form-select form-select-sm" style="width:14rem" id="dimensao">
                    ${DIMENSOES.map((d) => `<option value="${d}"${d === dimensao ? " selected" : ""}>${esc(DIMENSAO_LABEL[d])}</option>`).join("")}
                </select>
            </div>
        </div>
        <div class="card-body p-0">
            ${quadroFinanceiro(linhas, { dimensao, detalhe: DETALHE[dimensao], curto: false, vazio: "Nenhum recurso no recorte escolhido." })}
        </div>
    </div>`;
}

const conteudo = document.getElementById("conteudo");

conteudo.addEventListener("change", (e) => {
    if (e.target.id !== "dimensao") return;
    dimensao = e.target.value;
    render();
});

montar();
render();
