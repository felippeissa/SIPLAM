/**
 * Dashboard — Área Central.
 *
 * Desenho do dashboard de e-commerce do Inspinia: quatro cartões de número no
 * alto, o gráfico grande do ciclo, e duas tabelas embaixo. Os números são os do
 * plano corrente — o que está em elaboração, ou o vigente na falta dele.
 */
import { ppaCorrente, situacaoPpa, situacaoUsuario } from "../dados/store.js";
import { entregasDaIniciativa, recursosDaIniciativa, moeda, moedaCurta } from "../dados/regras.js";
import { linhasDoPrograma } from "../dados/financeiro.js";
import { ANOS } from "../dados/seed.js";
import { montarShell, barraTitulo, url } from "../shell.js";
import { esc, chip } from "../ui.js";
import { grafico, CORES } from "../grafico.js";

const { estado } = montarShell();

const plano = ppaCorrente(estado);
const doPlano = (r) => !r.ppaId || !plano || r.ppaId === plano.id;

const programas = estado.programas.filter(doPlano);
const iniciativas = estado.iniciativas.filter((i) => programas.some((p) => p.id === i.programaId));
const entregas = iniciativas.reduce((s, i) => s + entregasDaIniciativa(estado, i.id).length, 0);
const previstoDo = (pid) =>
    estado.iniciativas.filter((i) => i.programaId === pid).reduce((s, i) => s + recursosDaIniciativa(estado, i.id), 0);
const total = programas.reduce((s, p) => s + previstoDo(p.id), 0);
const porAno = ANOS.map((a) =>
    programas.reduce((s, p) => s + linhasDoPrograma(estado, p.id).reduce((t, l) => t + (l.anos[a] ?? 0), 0), 0)
);
const aguardando = (estado.usuarios ?? []).filter((u) => u.situacao === "aguardando");

const cartao = (titulo, valor, nota, icone) => `
    <div class="col-md-6 col-xl-3">
        <div class="card">
            <div class="card-header d-flex border-dashed justify-content-between align-items-center">
                <h5 class="card-title mb-0">${titulo}</h5>
                <i class="ti ${icone} fs-xl text-muted"></i>
            </div>
            <div class="card-body">
                <h3 class="mb-2 fw-normal">${valor}</h3>
                <p class="mb-0 text-muted fs-12">${nota}</p>
            </div>
        </div>
    </div>`;

const topProgramas = programas
    .map((p) => ({ p, v: previstoDo(p.id) }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 6);

const sit = plano ? situacaoPpa(plano.situacao) : null;

document.getElementById("conteudo").innerHTML = `
    ${barraTitulo("Dashboard", [])}

    <div class="row">
        ${cartao("Valor previsto", moedaCurta(total), plano ? `PPA ${esc(plano.nome ?? "")}` : "Nenhum PPA", "ti-coin")}
        ${cartao("Programas", programas.length, "no plano corrente", "ti-stack-2")}
        ${cartao("Iniciativas", iniciativas.length, `${entregas} entregas`, "ti-target-arrow")}
        ${cartao("Acessos pendentes", aguardando.length, "aguardando aprovação", "ti-user-check")}
    </div>

    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header d-flex border-dashed justify-content-between align-items-center">
                    <h4 class="card-title mb-0">Previsto por ano do ciclo</h4>
                    ${sit ? chip(sit.rotulo, sit.tom) : ""}
                </div>
                <div class="card-body"><div id="g-ano" style="min-height:300px"></div></div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-xxl-6">
            <div class="card">
                <div class="card-header d-flex border-dashed justify-content-between align-items-center">
                    <h4 class="card-title mb-0">Maiores Programas</h4>
                    <a href="${url("central-programas.html")}" class="btn btn-sm btn-light">Ver todos</a>
                </div>
                <div class="card-body p-0">
                    <table class="table table-sm mb-0 align-middle">
                        <tbody>${
                            topProgramas
                                .map(
                                    ({ p, v }) => `
                            <tr><td class="ps-3"><span class="fw-medium">${esc(p.nome)}</span><span class="d-block fs-12 text-muted">${esc(p.codigo ?? "")}</span></td>
                            <td class="text-end pe-3">${moeda(v)}</td></tr>`
                                )
                                .join("") || '<tr><td class="text-center text-muted py-4">Sem Programas</td></tr>'
                        }</tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="col-xxl-6">
            <div class="card">
                <div class="card-header d-flex border-dashed justify-content-between align-items-center">
                    <h4 class="card-title mb-0">Acessos aguardando aprovação</h4>
                    <a href="${url("central-usuarios.html")}" class="btn btn-sm btn-light">Ver todos</a>
                </div>
                <div class="card-body p-0">
                    <table class="table table-sm mb-0 align-middle">
                        <tbody>${
                            aguardando
                                .slice(0, 6)
                                .map((u) => {
                                    const s = situacaoUsuario(u.situacao);
                                    return `<tr class="linha-clicavel" onclick="location.href='${url(`central-usuarios/ver.html?id=${encodeURIComponent(u.id)}`)}'">
                            <td class="ps-3"><span class="fw-medium">${esc(u.nome)}</span><span class="d-block fs-12 text-muted">${esc(u.orgao || "—")}</span></td>
                            <td class="text-end pe-3">${chip(s.rotulo, s.tom)}</td></tr>`;
                                })
                                .join("") || '<tr><td class="text-center text-muted py-4">Nenhum acesso pendente</td></tr>'
                        }</tbody>
                    </table>
                </div>
            </div>

            <div class="card">
                <div class="card-header d-flex border-dashed justify-content-between align-items-center">
                    <h4 class="card-title mb-0">Planejado do período</h4>
                    <span class="fs-12 text-muted">${moeda(total)}</span>
                </div>
                <div class="card-body p-0">
                    <table class="table table-sm mb-0 align-middle">
                        <tbody>${ANOS.map(
                            (a, i) => `
                            <tr><td class="ps-3 fw-medium">${a}</td><td class="text-end pe-3">${moeda(porAno[i])}</td></tr>`
                        ).join("")}</tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>`;

grafico("g-ano", {
    chart: { type: "area", height: 300 },
    series: [{ name: "Previsto", data: porAno }],
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { opacityFrom: 0.35, opacityTo: 0.02 } },
    colors: [CORES[0]],
    xaxis: { categories: ANOS.map(String) },
    yaxis: { labels: { formatter: (v) => moedaCurta(v) } },
    tooltip: { y: { formatter: (v) => moeda(v) } },
});
