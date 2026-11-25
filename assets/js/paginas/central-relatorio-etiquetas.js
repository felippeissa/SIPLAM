/**
 * Relatório de etiquetas — Área Central.
 *
 * As etiquetas são a classificação que as pessoas põem no plano. Este relatório responde três perguntas:
 * **o que está sendo etiquetado** (uso por grupo e dimensão, as mais usadas), **onde** (o cruzamento com os eixos)
 * e **o que está parado** (etiquetas que ninguém usa e Programas que ninguém etiquetou).
 *
 * Como o outro relatório, tem duas visões: a sintética, para ler de uma vez, e a analítica, linha por etiqueta,
 * que se filtra e se exporta.
 */
import { ppaCorrente } from "../dados/store.js";
import { montarShell, barraTitulo } from "../shell.js";
import { esc, chip, faixaIndicadores, medidor } from "../ui.js";
import { criarFiltros } from "../filtros.js";
import { grafico, cartaoGrafico, CORES } from "../grafico.js";
import { visivel, perfisQueVeem } from "../cadastros/marcador.js";
import { nomeDoPerfil } from "../usuarios-decisao.js";

const { estado } = montarShell();
const plano = ppaCorrente(estado);

const doPlano = (r) => !r.ppaId || !plano || r.ppaId === plano.id;
const programas = (estado.programas ?? []).filter(doPlano);
const idsProgramas = new Set(programas.map((p) => p.id));
const iniciativas = (estado.iniciativas ?? []).filter((i) => idsProgramas.has(i.programaId));
const nomeDoGrupo = (id) => (estado.dimensoesMarcador ?? []).find((d) => d.id === id)?.nome ?? "Sem grupo";

/* ---------- o uso de cada etiqueta ---------- */

const TODAS = (estado.marcadores ?? []).filter(visivel).map((m) => {
    const emProgramas = programas.filter((p) => (p.marcadorIds ?? []).includes(m.id));
    const emIniciativas = iniciativas.filter((i) => (i.marcadorIds ?? []).includes(m.id));
    const comObservacao = [...emProgramas, ...emIniciativas].filter((r) => r.marcadorObs?.[m.id]).length;
    return {
        ...m,
        grupo: nomeDoGrupo(m.dimensao),
        programas: emProgramas.length,
        iniciativas: emIniciativas.length,
        total: emProgramas.length + emIniciativas.length,
        comObservacao,
        eixos: [...new Set(emProgramas.map((p) => p.eixo).filter(Boolean))],
        orgaos: [...new Set(emIniciativas.map((i) => i.orgao).filter(Boolean))],
    };
});

/* ---------- filtros ---------- */

const ordenadas = (valores) => [...new Set(valores.filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR")).map((v) => ({ valor: v, rotulo: v }));

const filtros = criarFiltros({
    livre: { rotulo: "Etiqueta", texto: (e) => `${e.nome} ${e.descricao ?? ""}` },
    campos: [
        { id: "grupo", rotulo: "Grupo", opcoes: () => ordenadas(TODAS.map((e) => e.grupo)), valorDe: (e) => [e.grupo] },
        { id: "dimensao", rotulo: "Dimensão", opcoes: () => ordenadas(TODAS.map((e) => e.tipo)), valorDe: (e) => [e.tipo] },
        {
            id: "uso",
            rotulo: "Uso",
            opcoes: () => [
                { valor: "em-uso", rotulo: "Em uso" },
                { valor: "sem-uso", rotulo: "Sem uso" },
            ],
            valorDe: (e) => [e.total ? "em-uso" : "sem-uso"],
        },
        { id: "eixo", rotulo: "Eixo", opcoes: () => ordenadas(TODAS.flatMap((e) => e.eixos)), valorDe: (e) => e.eixos },
    ],
    exportar: "relatorio-etiquetas",
});

const visiveis = () => TODAS.filter((e) => filtros.passa(e));

/* ---------- visão ---------- */

let visao = "sintetico";

const seletorDeVisao = () => `
    <div class="btn-group" role="group" aria-label="Visão do relatório">
        <button type="button" class="btn btn-sm ${visao === "sintetico" ? "btn-primary" : "btn-light"}" data-visao="sintetico">
            <i class="ti ti-chart-donut me-1"></i>Sintético
        </button>
        <button type="button" class="btn btn-sm ${visao === "analitico" ? "btn-primary" : "btn-light"}" data-visao="analitico">
            <i class="ti ti-table me-1"></i>Analítico
        </button>
    </div>`;

document.addEventListener("click", (e) => {
    const botao = e.target.closest("[data-visao]");
    if (!botao || botao.dataset.visao === visao) return;
    visao = botao.dataset.visao;
    render();
});

/* ---------- números ---------- */

const pct = (parte, total) => (total ? Math.round((parte / total) * 100) : 0);

function numeros(lista) {
    const emUso = lista.filter((e) => e.total).length;
    const ids = new Set(lista.map((e) => e.id));
    const etiquetado = (r) => (r.marcadorIds ?? []).some((id) => ids.has(id));
    const progs = programas.filter(etiquetado).length;
    const inis = iniciativas.filter(etiquetado).length;
    return faixaIndicadores([
        { valor: lista.length, rotulo: "Etiquetas" },
        { valor: `${emUso}/${lista.length}`, rotulo: "Etiquetas em uso" },
        { valor: lista.reduce((s, e) => s + e.total, 0), rotulo: "Aplicações" },
        { valor: `${pct(progs, programas.length)}%`, rotulo: "Programas etiquetados" },
        { valor: `${pct(inis, iniciativas.length)}%`, rotulo: "Iniciativas etiquetadas" },
        { valor: new Set(lista.map((e) => e.grupo)).size, rotulo: "Grupos" },
    ]);
}

/* ---------- sintético ---------- */

function desenharGraficos(lista) {
    // Uso por grupo: quantas vezes as etiquetas de cada grupo foram postas.
    const porGrupo = [...lista.reduce((m, e) => m.set(e.grupo, (m.get(e.grupo) ?? 0) + e.total), new Map())].filter(([, n]) => n > 0);
    grafico("g-grupos", {
        chart: { type: "donut", height: 300 },
        series: porGrupo.map(([, n]) => n),
        labels: porGrupo.map(([g]) => g),
        legend: { position: "bottom" },
        tooltip: { y: { formatter: (v) => `${v} ${v === 1 ? "aplicação" : "aplicações"}` } },
        plotOptions: { pie: { donut: { size: "62%", labels: { show: true, total: { show: true, label: "Aplicações", formatter: () => String(porGrupo.reduce((s, [, n]) => s + n, 0)) } } } } },
    });

    // As dez mais usadas, separando Programa de Iniciativa.
    const topo = [...lista].filter((e) => e.total).sort((a, b) => b.total - a.total).slice(0, 10);
    grafico("g-topo", {
        chart: { type: "bar", height: Math.max(280, topo.length * 34), stacked: true },
        series: [
            { name: "Programas", data: topo.map((e) => e.programas) },
            { name: "Iniciativas", data: topo.map((e) => e.iniciativas) },
        ],
        xaxis: { categories: topo.map((e) => e.nome) },
        plotOptions: { bar: { horizontal: true, barHeight: "62%", borderRadius: 3, borderRadiusApplication: "end" } },
        legend: { position: "top", horizontalAlign: "right" },
        colors: [CORES[0], CORES[1]],
    });

    // Mapa de calor: em que eixo cada grupo aparece (Programas etiquetados).
    const grupos = [...new Set(lista.map((e) => e.grupo))].sort((a, b) => a.localeCompare(b, "pt-BR"));
    const eixos = [...new Set(programas.map((p) => p.eixo).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
    const porId = new Map(lista.map((e) => [e.id, e]));
    grafico("g-calor", {
        chart: { type: "heatmap", height: Math.max(240, grupos.length * 60 + 60) },
        series: grupos.map((g) => ({
            name: g,
            data: eixos.map((eixo) => ({
                x: eixo,
                y: programas.filter((p) => p.eixo === eixo && (p.marcadorIds ?? []).some((id) => porId.get(id)?.grupo === g)).length,
            })),
        })),
        dataLabels: { enabled: true, style: { fontSize: "12px" } },
        plotOptions: { heatmap: { shadeIntensity: 0.6, radius: 3, colorScale: { ranges: [{ from: 0, to: 0, color: "#e9edf2", name: "nenhum" }] } } },
        colors: [CORES[0]],
        xaxis: { type: "category" },
        tooltip: { y: { formatter: (v) => `${v} ${v === 1 ? "Programa" : "Programas"}` } },
    });

    // Dimensões: as que mais aparecem, para ver onde a classificação se concentra.
    const porDimensao = [...lista.reduce((m, e) => m.set(e.tipo, (m.get(e.tipo) ?? 0) + e.total), new Map())]
        .filter(([d, n]) => d && n > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
    grafico("g-dimensoes", {
        chart: { type: "bar", height: 300 },
        series: [{ name: "Aplicações", data: porDimensao.map(([, n]) => n) }],
        xaxis: { categories: porDimensao.map(([d]) => d), labels: { rotate: -35, trim: true } },
        plotOptions: { bar: { columnWidth: "50%", borderRadius: 3, borderRadiusApplication: "end", distributed: true } },
        legend: { show: false },
    });
}

/** Os pontos de atenção: o que está parado ou pede revisão. */
function atencao(lista) {
    const semUso = lista.filter((e) => !e.total);
    const progsSem = programas.filter((p) => !(p.marcadorIds ?? []).length);
    const concentradas = lista.filter((e) => e.total >= 5 && !e.comObservacao);
    const item = (icone, tom, titulo, texto, nomes) => `
        <div class="col-md-4">
            <div class="border rounded p-3 h-100">
                <div class="d-flex align-items-center gap-2 mb-1"><i class="ti ${icone} fs-18 text-${tom}"></i><span class="fw-semibold">${titulo}</span></div>
                <p class="fs-12 text-muted mb-2">${texto}</p>
                <div class="fs-13">${nomes.length ? nomes.slice(0, 6).map(esc).join(", ") + (nomes.length > 6 ? ` e mais ${nomes.length - 6}` : "") : '<span class="text-muted">Nada a apontar.</span>'}</div>
            </div>
        </div>`;
    return `
    <div class="card mb-3">
        <div class="card-header d-block p-3"><h4 class="card-title mb-1">Pontos de atenção</h4>
            <p class="text-muted mb-0 fs-12">O que está parado ou merece revisão na classificação do plano.</p></div>
        <div class="card-body pt-0"><div class="row g-3">
            ${item("ti-tag-off", "warning", `${semUso.length} etiquetas sem uso`, "Cadastradas e nunca postas em Programa ou Iniciativa. Candidatas a revisão ou exclusão.", semUso.map((e) => e.nome))}
            ${item("ti-layout-grid", "danger", `${progsSem.length} Programas sem etiqueta`, "Programas do plano que ninguém classificou ainda.", progsSem.map((p) => p.nome))}
            ${item("ti-message-off", "info", `${concentradas.length} etiquetas sem observação`, "Usadas cinco vezes ou mais sem nenhuma observação que explique o porquê.", concentradas.map((e) => e.nome))}
        </div></div>
    </div>`;
}

/* ---------- analítico ---------- */

function corpo(lista) {
    if (!lista.length) return '<tr><td colspan="8" class="text-center text-muted py-4 fs-12">Nenhuma etiqueta corresponde ao filtro.</td></tr>';
    const maior = Math.max(1, ...lista.map((e) => e.total));
    return [...lista]
        .sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome, "pt-BR"))
        .map((e) => {
            const perfis = perfisQueVeem(e);
            const quemVe = perfis.includes("eu") ? "Só para quem criou" : perfis.length >= 5 ? "Todos os perfis" : perfis.map(nomeDoPerfil).join(", ");
            return `
        <tr>
            <td class="fw-medium"><span class="d-inline-flex align-items-center"><span class="rounded-circle flex-shrink-0 me-2" style="width:10px;height:10px;background:${esc(e.cor ?? CORES[0])}"></span>${esc(e.nome)}</span>
                <div class="fs-12 text-muted">${esc(quemVe)}</div></td>
            <td class="fs-13">${esc(e.grupo)}</td>
            <td class="fs-13">${esc(e.tipo || "—")}</td>
            <td class="num">${e.programas || "—"}</td>
            <td class="num">${e.iniciativas || "—"}</td>
            <td style="width:10rem"><div class="d-flex align-items-center gap-2">${medidor(e.total, maior, { pequeno: true, de: "a etiqueta mais usada" })}<span class="num">${e.total}</span></div></td>
            <td class="num">${e.comObservacao || "—"}</td>
            <td>${e.total ? chip("Em uso", "ok") : chip("Sem uso", "alerta")}</td>
        </tr>`;
        })
        .join("");
}

function render() {
    const lista = visiveis();
    const sintetico = visao === "sintetico";

    document.getElementById("conteudo").innerHTML = `
    ${barraTitulo("Relatório de etiquetas")}

    <div class="d-flex justify-content-end mb-3">${seletorDeVisao()}</div>

    <div id="faixa">${numeros(lista)}</div>

    ${
        sintetico
            ? `
    <div class="row g-3 mb-3">
        <div class="col-xl-4">${cartaoGrafico("g-grupos", "Uso por grupo", "Quantas vezes as etiquetas de cada grupo foram postas.")}</div>
        <div class="col-xl-8">${cartaoGrafico("g-topo", "Etiquetas mais usadas", "As dez mais aplicadas, em Programas e em Iniciativas.")}</div>
        <div class="col-xl-7">${cartaoGrafico("g-calor", "Grupos por eixo", "Quantos Programas de cada eixo têm etiqueta de cada grupo.")}</div>
        <div class="col-xl-5">${cartaoGrafico("g-dimensoes", "Dimensões mais presentes", "Onde a classificação do plano se concentra.")}</div>
    </div>
    ${atencao(lista)}`
            : `
    <div class="card">
        ${filtros.html()}
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th>Etiqueta</th>
                        <th style="width:12rem">Grupo</th>
                        <th style="width:14rem">Dimensão</th>
                        <th class="num" style="width:7rem">Programas</th>
                        <th class="num" style="width:7rem">Iniciativas</th>
                        <th style="width:10rem">Total</th>
                        <th class="num" style="width:8rem">Observações</th>
                        <th style="width:7rem">Uso</th>
                    </tr>
                </thead>
                <tbody id="corpo-lista">${corpo(lista)}</tbody>
            </table>
        </div>
    </div>`
    }`;

    if (sintetico) {
        desenharGraficos(lista);
        return;
    }

    filtros.ligar(() => {
        const atuais = visiveis();
        document.getElementById("corpo-lista").innerHTML = corpo(atuais);
        document.getElementById("faixa").innerHTML = numeros(atuais);
    });
}

render();
