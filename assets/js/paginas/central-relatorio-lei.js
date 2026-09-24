/**
 * Relatório final da lei do PPA — Área Central.
 *
 * É a peça que sai do sistema para virar projeto de lei, e por isso a tela não
 * é um formulário: é análise. Quem a abre precisa responder, antes de mandar o
 * plano para a Assembleia, se ele **fecha** — se todo eixo tem objetivo, se
 * todo objetivo tem Programa, se todo Programa tem diagnóstico, e onde o
 * dinheiro está.
 *
 * Por isso os gráficos vêm antes da tabela. O anexo — eixo, objetivo, Programa,
 * valor — é o que a lei carrega, mas ler 26 linhas não diz se o plano está
 * desequilibrado; a barra por eixo diz na primeira olhada.
 *
 * Tudo sai do plano escolhido no cabeçalho. Um PPA por vez, aqui também.
 */
import { ppaCorrente } from "../dados/store.js";
import { entregasDaIniciativa, recursosDaIniciativa, moeda, moedaCurta } from "../dados/regras.js";
import { linhasDoPrograma } from "../dados/financeiro.js";
import { ANOS } from "../dados/seed.js";
import { montarShell, barraTitulo } from "../shell.js";
import { esc, faixaIndicadores } from "../ui.js";
import { criarFiltros } from "../filtros.js";
import { grafico, cartaoGrafico, CORES } from "../grafico.js";

const { estado } = montarShell();

const plano = ppaCorrente(estado);
const doPlano = (r) => !r.ppaId || !plano || r.ppaId === plano.id;

/* ---------- o que o plano tem ---------- */

const programas = () => estado.programas.filter(doPlano);
const eixosDoPlano = () => estado.eixos.filter(doPlano);
const objetivosDoPlano = () => estado.objetivos.filter(doPlano);

const iniciativasDo = (pid) => estado.iniciativas.filter((i) => i.programaId === pid);
const entregasDo = (pid) => iniciativasDo(pid).reduce((s, i) => s + entregasDaIniciativa(estado, i.id).length, 0);
const previstoDo = (pid) => iniciativasDo(pid).reduce((s, i) => s + recursosDaIniciativa(estado, i.id), 0);

/** Previsto por ano do ciclo, somado sobre os Programas dados. */
const previstoPorAno = (lista) =>
    ANOS.map((ano) => lista.reduce((s, p) => s + linhasDoPrograma(estado, p.id).reduce((t, l) => t + (l.anos[ano] ?? 0), 0), 0));

/** O que falta a um Programa para ir para a lei. */
function falta(p) {
    const f = [];
    if (!p.problema?.trim()) f.push("problema");
    if (!p.objetivo?.trim()) f.push("objetivo");
    if ((p.causas ?? []).length === 0) f.push("causas");
    if ((p.indicadores ?? []).length === 0) f.push("indicadores");
    return f;
}

/** Uma linha do anexo: o caminho inteiro do Programa, do eixo ao valor. */
const linhasDoAnexo = () =>
    programas()
        .map((p) => ({
            programa: p,
            eixo: p.eixo || "Sem eixo",
            objetivo: p.objetivoEstrategico || "Sem objetivo",
            iniciativas: iniciativasDo(p.id).length,
            entregas: entregasDo(p.id),
            previsto: previstoDo(p.id),
            falta: falta(p),
        }))
        .sort((a, b) => a.eixo.localeCompare(b.eixo, "pt-BR") || a.programa.codigo.localeCompare(b.programa.codigo, "pt-BR"));

/** Soma por chave, em ordem decrescente — é como todo gráfico daqui nasce. */
function porChave(linhas, chave, valor) {
    const mapa = new Map();
    for (const l of linhas) mapa.set(chave(l), (mapa.get(chave(l)) ?? 0) + valor(l));
    return [...mapa.entries()].sort((a, b) => b[1] - a[1]);
}

/* ---------- filtros ---------- */

const filtros = criarFiltros({
    livre: { rotulo: "Programa", texto: (l) => `${l.programa.codigo} ${l.programa.nome} ${l.eixo} ${l.objetivo}` },
    campos: [
        {
            id: "eixo",
            rotulo: "Eixo",
            icone: "ti-layout-grid",
            opcoes: () => [...new Set(linhasDoAnexo().map((l) => l.eixo))].sort((a, b) => a.localeCompare(b, "pt-BR")).map((e) => ({ valor: e, rotulo: e })),
            valorDe: (l) => [l.eixo],
        },
        {
            id: "objetivo",
            rotulo: "Objetivo estratégico",
            icone: "ti-target",
            opcoes: () =>
                [...new Set(linhasDoAnexo().map((l) => l.objetivo))].sort((a, b) => a.localeCompare(b, "pt-BR")).map((o) => ({ valor: o, rotulo: o })),
            valorDe: (l) => [l.objetivo],
        },
        {
            id: "situacao",
            rotulo: "Situação do Programa",
            icone: "ti-progress",
            opcoes: () => [
                { valor: "completo", rotulo: "Pronto para a lei" },
                { valor: "incompleto", rotulo: "Diagnóstico incompleto" },
            ],
            valorDe: (l) => [l.falta.length ? "incompleto" : "completo"],
        },
    ],
    exportar: "relatorio-lei",
});

const visiveis = () => linhasDoAnexo().filter((l) => filtros.passa(l));

/* ---------- desenho ---------- */

function numeros(linhas) {
    const completos = linhas.filter((l) => !l.falta.length).length;
    return faixaIndicadores(
        [
            { valor: new Set(linhas.map((l) => l.eixo)).size, rotulo: "Eixos" },
            { valor: new Set(linhas.map((l) => l.objetivo)).size, rotulo: "Objetivos estratégicos" },
            { valor: linhas.length, rotulo: "Programas" },
            { valor: linhas.reduce((s, l) => s + l.entregas, 0), rotulo: "Entregas" },
            { valor: `${completos}/${linhas.length}`, rotulo: "Prontos para a lei" },
            { valor: moedaCurta(linhas.reduce((s, l) => s + l.previsto, 0)), rotulo: "Valor previsto" },
        ]
    );
}

function corpo(linhas) {
    if (!linhas.length) {
        return '<tr><td colspan="7" class="text-center text-muted py-4 fs-12">Nenhum Programa corresponde ao filtro.</td></tr>';
    }
    return linhas
        .map(
            (l) => `
        <tr>
            <td class="fs-13">${esc(l.eixo)}</td>
            <td class="fs-13 text-muted">${esc(l.objetivo)}</td>
            <td class="codigo text-muted">${esc(l.programa.codigo)}</td>
            <td class="fw-medium">
                ${esc(l.programa.nome)}
                ${l.falta.length ? `<div class="fs-12 text-warning">Falta: ${esc(l.falta.join(", "))}</div>` : ""}
            </td>
            <td class="num">${l.iniciativas || "—"}</td>
            <td class="num">${l.entregas || "—"}</td>
            <td class="num fw-semibold">${l.previsto ? moedaCurta(l.previsto) : "—"}</td>
        </tr>`
        )
        .join("");
}

function desenharGraficos(linhas) {
    const porEixo = porChave(linhas, (l) => l.eixo, () => 1);
    const valorPorEixo = porChave(linhas, (l) => l.eixo, (l) => l.previsto).filter(([, v]) => v > 0);
    const completos = linhas.filter((l) => !l.falta.length).length;

    grafico("g-programas-eixo", {
        chart: { type: "bar", height: Math.max(260, porEixo.length * 34) },
        series: [{ name: "Programas", data: porEixo.map(([, n]) => n) }],
        xaxis: { categories: porEixo.map(([e]) => e) },
        plotOptions: { bar: { horizontal: true, barHeight: "55%", borderRadius: 3, borderRadiusApplication: "end", distributed: true } },
        dataLabels: { enabled: true, style: { fontSize: "11px", fontWeight: 600, colors: ["#fff"] } },
        legend: { show: false },
        tooltip: { y: { formatter: (v) => `${v} ${v === 1 ? "Programa" : "Programas"}` } },
    });

    grafico("g-valor-ano", {
        chart: { type: "bar", height: 260 },
        series: [{ name: "Previsto", data: previstoPorAno(linhas.map((l) => l.programa)) }],
        xaxis: { categories: ANOS },
        yaxis: { labels: { formatter: (v) => moedaCurta(v) } },
        plotOptions: { bar: { columnWidth: "45%", borderRadius: 4, borderRadiusApplication: "end", dataLabels: { position: "top" } } },
        dataLabels: { enabled: true, offsetY: -18, formatter: (v) => moedaCurta(v), style: { fontSize: "11px", fontWeight: 600, colors: ["#4c4c5c"] } },
        tooltip: { y: { formatter: (v) => moeda(v) } },
        legend: { show: false },
        colors: [CORES[0]],
    });

    grafico("g-valor-eixo", {
        chart: { type: "donut", height: 300 },
        series: valorPorEixo.map(([, v]) => v),
        labels: valorPorEixo.map(([e]) => e),
        legend: { position: "bottom" },
        tooltip: { y: { formatter: (v) => moeda(v) } },
        plotOptions: { pie: { donut: { size: "62%", labels: { show: true, total: { show: true, label: "Plano", formatter: () => moedaCurta(valorPorEixo.reduce((s, [, v]) => s + v, 0)) } } } } },
    });

    grafico("g-prontidao", {
        chart: { type: "radialBar", height: 300 },
        series: [linhas.length ? Math.round((completos / linhas.length) * 100) : 0],
        labels: ["Prontos para a lei"],
        plotOptions: {
            radialBar: {
                hollow: { size: "58%" },
                dataLabels: {
                    name: { fontSize: "12px", color: "#9ba6b7", offsetY: 24 },
                    value: { fontSize: "26px", fontWeight: 600, offsetY: -12, formatter: (v) => `${v}%` },
                },
            },
        },
        colors: [CORES[0]],
    });
}

function render() {
    const linhas = visiveis();

    document.getElementById("conteudo").innerHTML = `
    ${barraTitulo("Relatório final da lei do PPA")}
    <div id="faixa">${numeros(linhas)}</div>

    <div class="row g-3 mb-3">
        <div class="col-xl-6">${cartaoGrafico("g-programas-eixo", "Programas por eixo", "Onde o plano concentra a sua estrutura.")}</div>
        <div class="col-xl-6">${cartaoGrafico("g-valor-ano", "Previsto por ano do ciclo", "Somado das Ações Orçamentárias vinculadas às Entregas.")}</div>
        <div class="col-xl-8">${cartaoGrafico("g-valor-eixo", "Distribuição do valor por eixo", "O peso financeiro de cada eixo dentro do plano.")}</div>
        <div class="col-xl-4">${cartaoGrafico("g-prontidao", "Prontidão para a lei", "Programas com problema, objetivo, causas e indicadores.")}</div>
    </div>

    <div class="card">
        ${filtros.html()}
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th style="width:16rem">Eixo</th>
                        <th style="width:18rem">Objetivo estratégico</th>
                        <th class="codigo" style="width:5rem">Nº</th>
                        <th>Programa</th>
                        <th class="num" style="width:7rem">Iniciativas</th>
                        <th class="num" style="width:7rem">Entregas</th>
                        <th class="num" style="width:9rem">Previsto</th>
                    </tr>
                </thead>
                <tbody id="corpo-lista">${corpo(linhas)}</tbody>
            </table>
        </div>
    </div>`;

    desenharGraficos(linhas);

    filtros.ligar(() => {
        const atuais = visiveis();
        document.getElementById("corpo-lista").innerHTML = corpo(atuais);
        document.getElementById("faixa").innerHTML = numeros(atuais);
        desenharGraficos(atuais);
    });
}

render();
