/**
 * Relatório consolidado de finalísticas — Área Central.
 *
 * O outro relatório olha o plano pela estrutura; este olha pela **entrega**:
 * o que cada órgão contribuiu, em que estado está, e o que falta para a
 * consolidação fechar.
 *
 * A pergunta que a tela responde é de acompanhamento, não de conferência:
 * quais órgãos ainda não enviaram, onde estão as devoluções, quanto do
 * previsto já passou pela validação. Por isso a unidade de análise é o órgão,
 * e a tabela do fim é o consolidado dele — não a lista de Entregas, que é
 * grande demais para caber numa leitura.
 *
 * Enquanto "área finalística" não existir no modelo, o órgão é o corte
 * disponível. Trocar um pelo outro depois é mudar a chave de agrupamento, não
 * a tela.
 */
import { ppaCorrente } from "../dados/store.js";
import {
    STATUS_CURTO,
    entregasDaIniciativa,
    recursosDaIniciativa,
    executadoDaIniciativa,
    pendenciasIniciativa,
    resumoPendencias,
    moeda,
    moedaCurta,
} from "../dados/regras.js";
import { linhasDaIniciativa } from "../dados/financeiro.js";
import { ANOS } from "../dados/seed.js";
import { montarShell, barraTitulo } from "../shell.js";
import { esc, chip, faixaIndicadores } from "../ui.js";
import { criarFiltros } from "../filtros.js";
import { grafico, cartaoGrafico, CORES } from "../grafico.js";

const { estado } = montarShell();

const plano = ppaCorrente(estado);
const programaPorId = (id) => estado.programas.find((p) => p.id === id);

// Um PPA por vez: a contribuição pertence ao plano do Programa em que ela foi
// feita. É o Programa que carrega o vínculo, não a Iniciativa.
const doPlano = (ini) => {
    const p = programaPorId(ini.programaId);
    return !p?.ppaId || !plano || p.ppaId === plano.id;
};

const iniciativas = () => estado.iniciativas.filter(doPlano);

/* ---------- o consolidado de cada órgão ---------- */

function consolidado() {
    const mapa = new Map();

    for (const ini of iniciativas()) {
        const atual = mapa.get(ini.orgao) ?? {
            orgao: ini.orgao,
            programas: new Set(),
            eixos: new Set(),
            iniciativas: 0,
            entregas: 0,
            previsto: 0,
            executado: 0,
            porStatus: {},
            impeditivos: 0,
            alertas: 0,
            porAno: Object.fromEntries(ANOS.map((a) => [a, 0])),
        };

        const p = programaPorId(ini.programaId);
        atual.programas.add(ini.programaId);
        if (p?.eixo) atual.eixos.add(p.eixo);
        atual.iniciativas += 1;
        atual.entregas += entregasDaIniciativa(estado, ini.id).length;
        atual.previsto += recursosDaIniciativa(estado, ini.id);
        atual.executado += executadoDaIniciativa(estado, ini.id);
        atual.porStatus[ini.status] = (atual.porStatus[ini.status] ?? 0) + 1;

        // `pendenciasIniciativa` recebe a Iniciativa, não o identificador dela.
        const r = resumoPendencias(pendenciasIniciativa(estado, ini));
        atual.impeditivos += r.impeditivos;
        atual.alertas += r.alertas;

        for (const l of linhasDaIniciativa(estado, ini.id)) {
            for (const ano of ANOS) atual.porAno[ano] += l.anos[ano] ?? 0;
        }

        mapa.set(ini.orgao, atual);
    }

    return [...mapa.values()].sort((a, b) => b.previsto - a.previsto || a.orgao.localeCompare(b.orgao, "pt-BR"));
}

const TODOS = consolidado();

/** Situação do órgão, derivada do estado das suas contribuições. */
function situacao(o) {
    if (o.impeditivos > 0) return { id: "impeditivo", rotulo: "Com pendência impeditiva", tom: "alerta" };
    if ((o.porStatus.validada ?? 0) === o.iniciativas) return { id: "validado", rotulo: "Tudo validado", tom: "ok" };
    if (o.porStatus.devolvida) return { id: "devolvida", rotulo: "Com devolução", tom: "alerta" };
    if (o.porStatus.em_preenchimento) return { id: "preenchendo", rotulo: "Em preenchimento", tom: "neutro" };
    return { id: "analise", rotulo: "Aguardando análise", tom: "info" };
}

/* ---------- filtros ---------- */

const filtros = criarFiltros({
    livre: { rotulo: "Órgão", texto: (o) => `${o.orgao} ${[...o.eixos].join(" ")}` },
    campos: [
        {
            id: "eixo",
            rotulo: "Eixo",
            icone: "ti-layout-grid",
            opcoes: () =>
                [...new Set(TODOS.flatMap((o) => [...o.eixos]))].sort((a, b) => a.localeCompare(b, "pt-BR")).map((e) => ({ valor: e, rotulo: e })),
            valorDe: (o) => [...o.eixos],
        },
        {
            id: "status",
            rotulo: "Estado das contribuições",
            icone: "ti-send",
            opcoes: () =>
                Object.entries(STATUS_CURTO)
                    .filter(([id]) => TODOS.some((o) => o.porStatus[id]))
                    .map(([id, rotulo]) => ({ valor: id, rotulo })),
            valorDe: (o) => Object.keys(o.porStatus),
        },
        {
            id: "situacao",
            rotulo: "Situação do órgão",
            icone: "ti-progress",
            opcoes: () => {
                const vistas = new Map();
                for (const o of TODOS) {
                    const s = situacao(o);
                    vistas.set(s.id, { valor: s.id, rotulo: s.rotulo });
                }
                return [...vistas.values()];
            },
            valorDe: (o) => [situacao(o).id],
        },
    ],
    exportar: "relatorio-finalisticas",
});

const visiveis = () => TODOS.filter((o) => filtros.passa(o));

/* ---------- desenho ---------- */

function numeros(lista) {
    const inis = lista.reduce((s, o) => s + o.iniciativas, 0);
    const validadas = lista.reduce((s, o) => s + (o.porStatus.validada ?? 0), 0);
    return faixaIndicadores(
        [
            { valor: lista.length, rotulo: "Órgãos com contribuição" },
            { valor: new Set(lista.flatMap((o) => [...o.programas])).size, rotulo: "Programas alcançados" },
            { valor: inis, rotulo: "Iniciativas" },
            { valor: lista.reduce((s, o) => s + o.entregas, 0), rotulo: "Entregas" },
            { valor: `${validadas}/${inis}`, rotulo: "Iniciativas validadas" },
            { valor: moedaCurta(lista.reduce((s, o) => s + o.previsto, 0)), rotulo: "Previsto consolidado" },
        ]
    );
}

function corpo(lista) {
    if (!lista.length) {
        return '<tr><td colspan="8" class="text-center text-muted py-4 fs-12">Nenhum órgão corresponde ao filtro.</td></tr>';
    }
    return lista
        .map((o) => {
            const s = situacao(o);
            return `
        <tr>
            <td class="fw-medium">
                ${esc(o.orgao)}
                <div class="fs-12 text-muted">${esc([...o.eixos].join(" · ") || "—")}</div>
            </td>
            <td class="num">${o.programas.size}</td>
            <td class="num">${o.iniciativas}</td>
            <td class="num">${o.entregas || "—"}</td>
            <td class="num">${o.previsto ? moedaCurta(o.previsto) : "—"}</td>
            <td class="num">${o.executado ? moedaCurta(o.executado) : "—"}</td>
            <td>${chip(s.rotulo, s.tom)}</td>
            <td class="num">${o.impeditivos ? chip(String(o.impeditivos), "alerta") : "—"}</td>
        </tr>`;
        })
        .join("");
}

function desenharGraficos(lista) {
    const topo = [...lista].sort((a, b) => b.entregas - a.entregas).slice(0, 10);

    grafico("g-entregas-orgao", {
        chart: { type: "bar", height: Math.max(280, topo.length * 34) },
        series: [
            { name: "Entregas", data: topo.map((o) => o.entregas) },
            { name: "Iniciativas", data: topo.map((o) => o.iniciativas) },
        ],
        xaxis: { categories: topo.map((o) => o.orgao) },
        plotOptions: { bar: { horizontal: true, barHeight: "62%", borderRadius: 3, borderRadiusApplication: "end" } },
        legend: { position: "top", horizontalAlign: "right" },
        colors: [CORES[0], CORES[1]],
    });

    const porStatus = Object.entries(STATUS_CURTO)
        .map(([id, rotulo]) => [rotulo, lista.reduce((s, o) => s + (o.porStatus[id] ?? 0), 0)])
        .filter(([, n]) => n > 0);

    grafico("g-status", {
        chart: { type: "donut", height: 300 },
        series: porStatus.map(([, n]) => n),
        labels: porStatus.map(([r]) => r),
        legend: { position: "bottom" },
        tooltip: { y: { formatter: (v) => `${v} ${v === 1 ? "Iniciativa" : "Iniciativas"}` } },
        plotOptions: {
            pie: {
                donut: {
                    size: "62%",
                    labels: {
                        show: true,
                        total: { show: true, label: "Iniciativas", formatter: () => String(porStatus.reduce((s, [, n]) => s + n, 0)) },
                    },
                },
            },
        },
    });

    const cinco = [...lista].sort((a, b) => b.previsto - a.previsto).slice(0, 5);
    grafico("g-previsto-ano", {
        chart: { type: "bar", height: 300, stacked: true },
        series: cinco.map((o) => ({ name: o.orgao, data: ANOS.map((a) => o.porAno[a]) })),
        xaxis: { categories: ANOS },
        yaxis: { labels: { formatter: (v) => moedaCurta(v) } },
        plotOptions: { bar: { columnWidth: "45%", borderRadius: 3, borderRadiusApplication: "end" } },
        tooltip: { y: { formatter: (v) => moeda(v) } },
        legend: { position: "bottom" },
    });

    const inis = lista.reduce((s, o) => s + o.iniciativas, 0);
    const validadas = lista.reduce((s, o) => s + (o.porStatus.validada ?? 0), 0);
    const semPendencia = lista.filter((o) => o.impeditivos === 0).length;

    grafico("g-consolidacao", {
        chart: { type: "radialBar", height: 300 },
        series: [inis ? Math.round((validadas / inis) * 100) : 0, lista.length ? Math.round((semPendencia / lista.length) * 100) : 0],
        labels: ["Iniciativas validadas", "Órgãos sem impeditivo"],
        plotOptions: {
            radialBar: {
                hollow: { size: "48%" },
                dataLabels: {
                    name: { fontSize: "12px" },
                    value: { fontSize: "20px", fontWeight: 600, formatter: (v) => `${v}%` },
                    total: { show: true, label: "Consolidação", fontSize: "12px", formatter: () => `${inis ? Math.round((validadas / inis) * 100) : 0}%` },
                },
            },
        },
        colors: [CORES[0], CORES[1]],
    });
}

function render() {
    const lista = visiveis();

    document.getElementById("conteudo").innerHTML = `
    ${barraTitulo("Relatório consolidado de finalísticas")}
    <div id="faixa">${numeros(lista)}</div>

    <div class="row g-3 mb-3">
        <div class="col-xl-6">${cartaoGrafico("g-entregas-orgao", "Contribuição por órgão", "Os dez órgãos com mais Entregas no plano.")}</div>
        <div class="col-xl-6">${cartaoGrafico("g-status", "Estado das contribuições", "Onde estão as Iniciativas no fluxo de aprovação.")}</div>
        <div class="col-xl-8">${cartaoGrafico("g-previsto-ano", "Previsto por ano, pelos cinco maiores órgãos", "Empilhado: a coluna é o ano do ciclo.")}</div>
        <div class="col-xl-4">${cartaoGrafico("g-consolidacao", "Consolidação", "O quanto já está validado e livre de impeditivo.")}</div>
    </div>

    <div class="card">
        ${filtros.html()}
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th>Órgão</th>
                        <th class="num" style="width:7rem">Programas</th>
                        <th class="num" style="width:7rem">Iniciativas</th>
                        <th class="num" style="width:7rem">Entregas</th>
                        <th class="num" style="width:9rem">Previsto</th>
                        <th class="num" style="width:9rem">Executado</th>
                        <th style="width:14rem">Situação</th>
                        <th class="num" style="width:8rem">Impeditivos</th>
                    </tr>
                </thead>
                <tbody id="corpo-lista">${corpo(lista)}</tbody>
            </table>
        </div>
    </div>`;

    desenharGraficos(lista);

    filtros.ligar(() => {
        const atuais = visiveis();
        document.getElementById("corpo-lista").innerHTML = corpo(atuais);
        document.getElementById("faixa").innerHTML = numeros(atuais);
        desenharGraficos(atuais);
    });
}

render();
