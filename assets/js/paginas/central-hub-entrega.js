/**
 * Hub de Entregas — Área Central.
 *
 * O Hub de Programas responde "como está o Programa?". Este responde a pergunta
 * de baixo, que é onde a discussão costuma travar: "esta Entrega está de pé?".
 *
 * A Entrega é o ponto onde três mundos se encontram — a meta do PPA, a Ação
 * Orçamentária da LOA e o Projeto do GOMAP. Hoje cada um mora numa tela
 * diferente, e é justamente a divergência entre eles que ninguém enxerga.
 *
 * É tela de leitura e navegação. Editar continua na ficha da Iniciativa.
 */
import {
    COMPORTAMENTOS,
    TERRITORIO_LABEL,
    entregasDaIniciativa,
    projetosDaEntrega,
    recursosDaEntrega,
    executadoDaEntrega,
    situacaoEntrega,
    pendenciasEntrega,
    descompassoProjeto,
    ipofsDaEntrega,
    moeda,
    moedaCurta,
    pct,
} from "../dados/regras.js";
import { acoesDaEntrega, linhasDaEntrega } from "../dados/financeiro.js";
import { montarShell, cabecalhoPagina } from "../shell.js";
import { chip, statusChip, esc, faixaIndicadores, secao, contexto, medidor, faisca } from "../ui.js";

const { estado } = montarShell();
const ANOS = ["2028", "2029", "2030", "2031"];

const params = new URLSearchParams(location.search);
let entregaId = params.get("entrega");
let aba = params.get("aba") || "geral";
let busca = "";

/* ---------- contexto da Entrega ---------- */

/** A Entrega não se explica sozinha: vem sempre com a Iniciativa e o Programa. */
function cadeia(entregaId) {
    const e = estado.entregas.find((x) => x.id === entregaId);
    if (!e) return null;
    const ini = estado.iniciativas.find((i) => i.id === e.iniciativaId) ?? null;
    const prog = ini ? estado.programas.find((p) => p.id === ini.programaId) ?? null : null;
    return { e, ini, prog };
}

const todas = () =>
    estado.iniciativas.flatMap((ini) => {
        const prog = estado.programas.find((p) => p.id === ini.programaId) ?? null;
        return entregasDaIniciativa(estado, ini.id).map((e) => ({ e, ini, prog }));
    });

const nomeComportamento = (id) => COMPORTAMENTOS.find((c) => c.id === id)?.nome ?? "—";

/** Previsto por ano desta Entrega. Dinheiro é a mesma unidade: pode somar. */
const previstoPorAno = (id) => {
    const linhas = linhasDaEntrega(estado, id);
    return ANOS.map((a) => linhas.reduce((s, l) => s + (l.anos[a] ?? 0), 0));
};

/* ---------- escolha da Entrega ---------- */

function listaEntregas() {
    const termo = busca.trim().toLowerCase();
    const itens = todas().filter(
        ({ e, ini, prog }) =>
            !termo ||
            e.nome.toLowerCase().includes(termo) ||
            ini.orgao.toLowerCase().includes(termo) ||
            (prog?.nome ?? "").toLowerCase().includes(termo)
    );

    return `
${cabecalhoPagina(
    "Hub de Entregas",
    "Escolha uma Entrega para ver a meta, o orçamento e o projeto lado a lado.",
    `<div class="app-search">
        <input type="search" id="busca" class="form-control form-control-sm" placeholder="Buscar Entrega, órgão ou Programa" value="${esc(busca)}" />
        <i class="ti ti-search app-search-icon text-muted"></i>
    </div>`
)}
<div class="card">
    <div class="table-responsive">
        <table class="table table-hover mb-0">
            <thead>
                <tr>
                    <th style="min-width:20rem">Entrega</th>
                    <th style="width:13rem">Programa</th>
                    <th style="width:11rem">Órgão</th>
                    <th class="num" style="width:8rem">Previsto</th>
                    <th style="width:11rem">Situação</th>
                </tr>
            </thead>
            <tbody>
            ${
                itens.length === 0
                    ? `<tr><td colspan="5" class="text-center text-muted py-4 fs-12">Nenhuma Entrega corresponde à busca.</td></tr>`
                    : itens
                          .map(({ e, ini, prog }) => {
                              const s = situacaoEntrega(estado, e);
                              return `
                <tr class="cursor-pointer" data-abrir="${e.id}">
                    <td>
                        <div class="fw-medium">${esc(e.nome) || '<span class="text-muted">Sem nome</span>'}</div>
                        <div class="fs-12 text-muted">${esc(ini.nome)}</div>
                    </td>
                    <td class="fs-13">${esc(prog ? `${prog.codigo} · ${prog.nome}` : "—")}</td>
                    <td class="fs-13">${esc(ini.orgao)}</td>
                    <td class="num">${moedaCurta(recursosDaEntrega(estado, e.id))}</td>
                    <td>${chip(s.texto, s.tom)}</td>
                </tr>`;
                          })
                          .join("")
            }
            </tbody>
        </table>
    </div>
</div>`;
}

/* ---------- abas ---------- */

const ABAS = [
    { id: "geral", rotulo: "Visão geral", icone: "ti-file-description" },
    { id: "financeiro", rotulo: "Financeiro", icone: "ti-coins" },
    { id: "projetos", rotulo: "Projetos", icone: "ti-git-branch" },
    { id: "pendencias", rotulo: "Pendências", icone: "ti-alert-triangle" },
    { id: "apontamentos", rotulo: "Apontamentos", icone: "ti-message-2" },
];

function apontamentosDa(id) {
    return (estado.comentarios ?? []).filter((c) => c.alvoTipo === "entrega" && c.alvoId === id);
}

function navAbas({ e }) {
    const conta = {
        financeiro: acoesDaEntrega(estado, e.id).length,
        projetos: projetosDaEntrega(estado, e.id).length,
        pendencias: pendenciasEntrega(estado, e).filter((p) => p.nivel !== "informacao").length,
        apontamentos: apontamentosDa(e.id).filter((c) => !c.resolvido).length,
    };
    return `
<ul class="nav nav-tabs nav-bordered mb-3">
    ${ABAS.map(
        (a) => `
    <li class="nav-item">
        <a href="#" class="nav-link ${a.id === aba ? "active" : ""}" data-aba="${a.id}">
            <i class="ti ${a.icone} me-1"></i>${a.rotulo}
            ${conta[a.id] !== undefined ? `<span class="badge bg-light text-muted ms-1">${conta[a.id]}</span>` : ""}
        </a>
    </li>`
    ).join("")}
</ul>`;
}

/** Visão geral — o que a Entrega promete entregar, e em que ritmo. */
function abaGeral({ e, ini, prog }) {
    const comp = e.comportamento ?? e.comportamentoSugerido;
    const ajuda = COMPORTAMENTOS.find((c) => c.id === comp)?.ajuda ?? "";
    const previsto = recursosDaEntrega(estado, e.id);
    const executado = executadoDaEntrega(e.id);

    const metas = `
<div class="table-responsive"><table class="table table-sm mb-0">
    <thead><tr><th style="width:22rem">Ano</th>${ANOS.map((a) => `<th class="num" style="width:6rem">${a}</th>`).join("")}<th style="width:7rem">Trajetória</th></tr></thead>
    <tbody><tr>
        <td class="fs-13 text-muted">Meta em ${esc(e.unidadeMedida) || "unidade não informada"}</td>
        ${ANOS.map(
            (a) =>
                `<td class="num fw-medium">${
                    e.metas[a] === null || e.metas[a] === undefined
                        ? '<span class="text-muted">—</span>'
                        : e.metas[a].toLocaleString("pt-BR")
                }</td>`
        ).join("")}
        <td>${faisca(
            ANOS.map((a) => e.metas[a]),
            ANOS.map((a) => `${a}: ${e.metas[a] ?? "—"}`).join(" · ")
        )}</td>
    </tr></tbody>
</table></div>
${ajuda ? `<p class="nota-grafico mt-2 mb-0">${esc(nomeComportamento(comp))} — ${esc(ajuda)}</p>` : ""}`;

    const territorio =
        e.territorio?.tipo === "territorializavel" && (e.territorio.regioes ?? []).length
            ? `${esc(TERRITORIO_LABEL[e.territorio.tipo])} · ${e.territorio.regioes.map(esc).join(", ")}`
            : esc(TERRITORIO_LABEL[e.territorio?.tipo] ?? "Não informada");

    return `
${secao(
    "Metas do ciclo",
    metas,
    e.comportamentoValidado
        ? chip("Comportamento validado", "ok")
        : chip("Comportamento não validado pelo órgão", "alerta")
)}
<div class="row g-3">
    <div class="col-lg-7">
        ${secao(
            "A Entrega",
            `<dl class="ficha mb-0">
            <dt>Descrição</dt><dd>${esc(e.descricao) || "—"}</dd>
            <dt>Unidade de medida</dt><dd>${esc(e.unidadeMedida) || "—"}</dd>
            <dt>Método de comprovação</dt><dd>${esc(e.metodoComprovacao) || "—"}</dd>
            <dt>Relação com o território</dt><dd>${territorio}</dd>
        </dl>`
        )}
    </div>
    <div class="col-lg-5">
        ${secao(
            "Origem",
            `<dl class="ficha mb-0">
            <dt>Programa</dt><dd>${esc(prog ? `${prog.codigo} · ${prog.nome}` : "—")}</dd>
            <dt>Iniciativa</dt><dd>${esc(ini.nome)}</dd>
            <dt>Órgão</dt><dd>${esc(ini.orgao)}</dd>
            <dt>Status da Iniciativa</dt><dd>${statusChip(ini.status)}</dd>
        </dl>`
        )}
        ${secao(
            "Financeiro",
            `<div class="d-flex justify-content-between align-items-baseline mb-1">
            <span class="fs-13">Executado</span><span class="fw-bold">${moedaCurta(executado)}</span>
        </div>
        ${medidor(executado, previsto, { de: "previsto", titulo: `${moeda(executado)} de ${moeda(previsto)}` })}
        <div class="nota-grafico mt-1">de ${moedaCurta(previsto)} previstos · fonte SIAFIC</div>`
        )}
    </div>
</div>`;
}

/** Financeiro — as Ações Orçamentárias que bancam a Entrega. */
function abaFinanceiro({ e }) {
    const acoes = acoesDaEntrega(estado, e.id);
    const previsto = recursosDaEntrega(estado, e.id);
    const ipofs = ipofsDaEntrega(estado, e.id);

    if (acoes.length === 0)
        return `
<div class="card">
    <div class="card-body text-center py-5">
        <span class="avatar-lg bg-warning-subtle text-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
            <i class="ti ti-coin-off fs-24"></i>
        </span>
        <h5 class="fw-bold mb-2">Sem Ação Orçamentária vinculada</h5>
        <p class="text-muted fs-13 mb-0 mx-auto" style="max-width:34rem">
            Esta Entrega não tem financeiro no PPA. O valor previsto de uma Entrega vem
            sempre da Ação Orçamentária da LOA — nunca é digitado.
        </p>
    </div>
</div>`;

    const porAno = previstoPorAno(e.id);

    return `
${secao(
    "Previsto por ano",
    `<div id="grafico-anos" style="min-height:200px"></div>`,
    `<span class="fs-13 text-muted">Total ${moedaCurta(previsto)}</span>`
)}
<div class="card mb-3">
    <div class="card-header"><h6 class="rotulo-secao mb-0">Ações Orçamentárias</h6></div>
    <div class="table-responsive">
        <table class="table table-hover mb-0">
            <thead>
                <tr>
                    <th style="width:9rem">Código</th>
                    <th>Ação</th>
                    <th style="width:12rem">Órgão</th>
                    <th style="width:10rem">Situação</th>
                    <th class="num" style="width:9rem">No PPA</th>
                </tr>
            </thead>
            <tbody>
            ${acoes
                .map((a) => {
                    const total = linhasDaEntrega(estado, e.id)
                        .filter((l) => l.acao.id === a.id)
                        .reduce((s, l) => s + l.total, 0);
                    return `
                <tr>
                    <td class="codigo">${esc(a.codigo)}</td>
                    <td class="fs-13">${esc(a.nome)}</td>
                    <td class="fs-13">${esc(a.orgao)}</td>
                    <td class="fs-13 text-muted">${esc(a.situacao)}</td>
                    <td class="num">
                        <div>${moedaCurta(total)}</div>
                        ${medidor(total, previsto, { pequeno: true, de: "previsto da Entrega", titulo: `${pct((total / previsto) * 100)} do previsto` })}
                    </td>
                </tr>`;
                })
                .join("")}
            </tbody>
        </table>
    </div>
</div>
${
    ipofs.length
        ? `<div class="card">
    <div class="card-header"><h6 class="rotulo-secao mb-0">IPOFs</h6></div>
    <div class="table-responsive">
        <table class="table table-hover mb-0">
            <thead><tr><th style="width:9rem">Código</th><th>IPOF</th><th style="width:12rem">Órgão</th><th style="width:14rem">Projeto</th><th class="num" style="width:9rem">Na Entrega</th></tr></thead>
            <tbody>
            ${ipofs
                .map(
                    ({ ipof, projeto, total }) => `
                <tr>
                    <td class="codigo">${esc(ipof.codigo)}</td>
                    <td class="fs-13">${esc(ipof.nome)}</td>
                    <td class="fs-13">${esc(ipof.orgao)}</td>
                    <td class="fs-13 text-muted">${esc(projeto ? projeto.nome : "—")}</td>
                    <td class="num">${moedaCurta(total)}</td>
                </tr>`
                )
                .join("")}
            </tbody>
        </table>
    </div>
</div>`
        : ""
}`;
}

/** Projetos — o GOMAP, e o descompasso entre o que ele custa e o que entra no PPA. */
function abaProjetos({ e }) {
    const projs = projetosDaEntrega(estado, e.id);
    if (projs.length === 0)
        return secao(
            "Projetos",
            `<p class="text-muted fs-13 mb-0">Esta Entrega não está vinculada a nenhum Projeto do GOMAP. Nem toda Entrega precisa de Projeto — só as que dependem de obra ou contratação.</p>`
        );

    return `
${projs
    .map((projeto) => {
        const d = descompassoProjeto(estado, projeto.id);
        const noPpa = d ? d.noPpa : 0;
        const dif = d ? d.diferenca : 0;
        return `
<div class="card mb-3">
    <div class="card-header d-flex flex-wrap align-items-center justify-content-between gap-2">
        <h6 class="rotulo-secao mb-0">${esc(projeto.codigo)} · ${esc(projeto.nome)}</h6>
        ${chip(esc(projeto.fase), "info")}
    </div>
    <div class="card-body">
        <div class="row g-3">
            <div class="col-md-5">
                <dl class="ficha mb-0">
                    <dt>Órgão</dt><dd>${esc(projeto.orgao)}</dd>
                    <dt>Situação</dt><dd>${esc(projeto.situacao)}</dd>
                    <dt>Cronograma</dt><dd>${esc(projeto.cronograma)}</dd>
                    <dt>Conclusão prevista</dt><dd>${esc(projeto.conclusaoPrevista)}</dd>
                    <dt>Última atualização</dt><dd>${esc(projeto.ultimaAtualizacao)}</dd>
                </dl>
            </div>
            <div class="col-md-7">
                <div class="d-flex justify-content-between align-items-baseline mb-1">
                    <span class="fs-13">Execução física</span><span class="fw-bold">${pct(projeto.execucao)}</span>
                </div>
                ${medidor(projeto.execucao, 100, { de: "concluído", titulo: `${pct(projeto.execucao)} concluído` })}

                <div class="d-flex justify-content-between align-items-baseline mt-3 mb-1">
                    <span class="fs-13">Apropriado no PPA</span><span class="fw-bold">${moedaCurta(noPpa)}</span>
                </div>
                ${medidor(noPpa, projeto.valorGlobal, { de: "valor global do Projeto", titulo: `${moeda(noPpa)} de ${moeda(projeto.valorGlobal)}` })}
                <div class="nota-grafico mt-1">
                    Valor global no GOMAP: ${moedaCurta(projeto.valorGlobal)}
                    ${
                        Math.abs(dif) > 0
                            ? ` · <strong>${moedaCurta(Math.abs(dif))} ${dif > 0 ? "fora do PPA" : "acima do valor global"}</strong>`
                            : ""
                    }
                </div>
            </div>
        </div>
    </div>
</div>`;
    })
    .join("")}
<div class="alert alert-light py-2 px-3 fs-12 mb-0">
    O Projeto descreve <strong>como</strong> a Entrega é produzida. Seu valor global é o custo da
    obra ou da contratação no GOMAP e <strong>nunca</strong> é o valor financeiro da Entrega no PPA.
    A diferença entre os dois é esperada — o que importa é saber de quanto ela é.
</div>`;
}

/** Pendências — o que impede esta Entrega de ser validada. */
function abaPendencias({ e }) {
    const ps = pendenciasEntrega(estado, e);
    const tom = { impeditivo: "impeditivo", alerta: "alerta", informacao: "info" };
    const rotulo = { impeditivo: "Impeditivo", alerta: "Alerta", informacao: "Informação" };

    if (ps.filter((p) => p.nivel !== "informacao").length === 0)
        return `
<div class="card">
    <div class="card-body text-center py-5">
        <span class="avatar-lg bg-success-subtle text-success rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
            <i class="ti ti-circle-check fs-24"></i>
        </span>
        <h5 class="fw-bold mb-2">Nenhuma pendência</h5>
        <p class="text-muted fs-13 mb-0">Esta Entrega está completa e não impede a validação da Iniciativa.</p>
    </div>
</div>`;

    return `
<div class="card">
    <div class="table-responsive">
        <table class="table table-hover mb-0">
            <thead><tr><th style="width:9rem">Nível</th><th style="width:11rem">Campo</th><th>O que falta</th></tr></thead>
            <tbody>
            ${ps
                .map(
                    (p) => `
                <tr>
                    <td>${chip(rotulo[p.nivel], tom[p.nivel])}</td>
                    <td class="fs-13 text-muted">${esc(p.campo)}</td>
                    <td class="fs-13">${esc(p.texto)}</td>
                </tr>`
                )
                .join("")}
            </tbody>
        </table>
    </div>
</div>`;
}

/** Apontamentos — o que a Área Central escreveu sobre esta Entrega. */
function abaApontamentos({ e, ini }) {
    const cs = apontamentosDa(e.id);
    if (cs.length === 0)
        return secao(
            "Apontamentos",
            `<p class="text-muted fs-13 mb-0">Nenhum apontamento registrado nesta Entrega. Os apontamentos são escritos na análise da Iniciativa e aparecem aqui.</p>`
        );

    return `
<div class="card">
    <div class="card-body">
        ${cs
            .map(
                (c) => `
        <div class="d-flex gap-3 ${c.resolvido ? "opacity-50" : ""} mb-3 pb-3 border-bottom">
            <span class="avatar-sm ${c.resolvido ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"} rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                <i class="ti ${c.resolvido ? "ti-check" : "ti-message-2"} fs-18"></i>
            </span>
            <div class="flex-grow-1">
                <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
                    <span class="fw-medium fs-13">${esc(c.autor)}</span>
                    <span class="fs-12 text-muted">${esc(c.criadoEm)}</span>
                    ${c.campo ? chip(esc(c.campo), "neutro") : ""}
                    ${c.resolvido ? chip("Resolvido", "ok") : ""}
                </div>
                <p class="fs-13 mb-0">${esc(c.texto)}</p>
            </div>
        </div>`
            )
            .join("")}
        <a class="btn btn-sm btn-outline-primary" href="central-iniciativa.html?id=${ini.id}">Abrir a análise da Iniciativa</a>
    </div>
</div>`;
}

/* ---------- hub ---------- */

function hub(ctx) {
    const { e, ini, prog } = ctx;
    const s = situacaoEntrega(estado, e);
    const previsto = recursosDaEntrega(estado, e.id);
    const executado = executadoDaEntrega(e.id);
    const comp = e.comportamento ?? e.comportamentoSugerido;
    const preenchidas = ANOS.filter((a) => e.metas[a] !== null && e.metas[a] !== undefined).length;

    const corpo =
        { geral: abaGeral, financeiro: abaFinanceiro, projetos: abaProjetos, pendencias: abaPendencias, apontamentos: abaApontamentos }[
            aba
        ] ?? abaGeral;

    return `
${contexto([
    { rotulo: "Hub de Entregas", href: "central-hub-entrega.html" },
    ...(prog ? [{ rotulo: `${prog.codigo} · ${prog.nome}`, href: `central-hub.html?programa=${prog.id}` }] : []),
    { rotulo: e.nome || "Entrega sem nome" },
])}
${cabecalhoPagina(
    esc(e.nome) || "Entrega sem nome",
    `${esc(ini.nome)} · ${esc(ini.orgao)}`,
    `${chip(s.texto, s.tom)}
     <a class="btn btn-sm btn-outline-primary" href="central-iniciativa.html?id=${ini.id}">Abrir a Iniciativa</a>`
)}
${faixaIndicadores(
    [
        { valor: `${preenchidas}/4`, rotulo: "Metas informadas" },
        { valor: esc(e.unidadeMedida) || "—", rotulo: "Unidade de medida" },
        { valor: esc(nomeComportamento(comp)), rotulo: "Comportamento" },
        { valor: acoesDaEntrega(estado, e.id).length || "—", rotulo: "Ações Orçamentárias" },
        { valor: moedaCurta(previsto), rotulo: "Previsto" },
        { valor: moedaCurta(executado), rotulo: "Executado SIAFIC" },
    ],
    `${esc(TERRITORIO_LABEL[e.territorio?.tipo] ?? "Território não informado")}${
        prog ? ` · Programa ${esc(prog.codigo)}` : ""
    }`
)}
${navAbas(ctx)}
${corpo(ctx)}`;
}

/* ---------- ciclo ---------- */

let grafico = null;

/**
 * Coluna por ano. Série única, uma matiz — o trabalho é magnitude, não
 * identidade. O valor vai impresso porque o verde da marca não alcança 3:1
 * contra o branco: a cor acompanha, não informa.
 */
function desenharGrafico(id) {
    const alvo = document.getElementById("grafico-anos");
    if (grafico) {
        grafico.destroy();
        grafico = null;
    }
    if (!alvo || typeof ApexCharts === "undefined") return;

    grafico = new ApexCharts(alvo, {
        chart: { type: "bar", height: 200, toolbar: { show: false }, fontFamily: "IBM Plex Sans, sans-serif" },
        series: [{ name: "Previsto", data: previstoPorAno(id) }],
        xaxis: {
            categories: ANOS,
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { style: { colors: "#9ba6b7", fontSize: "12px" } },
        },
        yaxis: { labels: { formatter: (v) => moedaCurta(v), style: { colors: "#9ba6b7", fontSize: "11px" } } },
        grid: { borderColor: "#eef2f7", strokeDashArray: 3, padding: { left: 4, right: 4 } },
        colors: ["#1ab394"],
        plotOptions: { bar: { columnWidth: "42%", borderRadius: 4, borderRadiusApplication: "end", dataLabels: { position: "top" } } },
        dataLabels: {
            enabled: true,
            offsetY: -18,
            formatter: (v) => moedaCurta(v),
            style: { fontSize: "11px", fontWeight: 600, colors: ["#4c4c5c"] },
        },
        tooltip: { y: { formatter: (v) => moeda(v) } },
        legend: { show: false },
    });
    grafico.render();
}

function render() {
    const ctx = entregaId ? cadeia(entregaId) : null;
    document.getElementById("conteudo").innerHTML = ctx ? hub(ctx) : listaEntregas();
    if (ctx && aba === "financeiro") desenharGrafico(ctx.e.id);
    else if (grafico) {
        grafico.destroy();
        grafico = null;
    }
}

document.addEventListener("click", (ev) => {
    const linha = ev.target.closest("[data-abrir]");
    if (linha) {
        entregaId = linha.dataset.abrir;
        aba = "geral";
        history.replaceState(null, "", `central-hub-entrega.html?entrega=${entregaId}`);
        return render();
    }
    const t = ev.target.closest("[data-aba]");
    if (t) {
        ev.preventDefault();
        aba = t.dataset.aba;
        history.replaceState(null, "", `central-hub-entrega.html?entrega=${entregaId}&aba=${aba}`);
        return render();
    }
});

document.addEventListener("input", (ev) => {
    if (ev.target.id === "busca") {
        busca = ev.target.value;
        render();
        // O campo é recriado a cada tecla: sem devolver o cursor ao fim, o
        // texto digitado sai embaralhado.
        const campo = document.getElementById("busca");
        campo.focus();
        campo.setSelectionRange(campo.value.length, campo.value.length);
    }
});

render();
