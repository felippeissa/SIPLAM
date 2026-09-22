/**
 * Visão por Programas — Área Central.
 *
 * Visão consolidada de um Programa: tudo o que pende dele, reunido num lugar só.
 * Hoje essa informação está espalhada por seis telas, e ninguém consegue
 * responder "como está o Programa 001?" sem abrir todas.
 *
 * É tela de leitura e navegação. Editar continua onde sempre esteve — daqui se
 * vai até lá, nunca se altera no caminho.
 */
import {
    APTIDAO_LABEL,
    DISPONIBILIZACAO_LABEL,
    TERRITORIO_LABEL,
    COMPORTAMENTOS,
    entregasDaIniciativa,
    projetosDaEntrega,
    recursosDaEntrega,
    recursosDaIniciativa,
    executadoDaEntrega,
    situacaoEntrega,
    moeda,
    moedaCurta,
    pct,
} from "../dados/regras.js";
import { ANOS } from "../dados/seed.js";
import { ppaCorrente } from "../dados/store.js";
import { linhasDoPrograma } from "../dados/financeiro.js";
import { montarShell, cabecalhoPagina } from "../shell.js";
import { chip, statusChip, esc, faixaIndicadores, secao, medidor, faisca } from "../ui.js";

const { estado } = montarShell();


const params = new URLSearchParams(location.search);
let programaId = params.get("programa");
let aba = params.get("aba") || "geral";
let busca = "";

/* ---------- consultas do Programa ---------- */

const iniciativasDo = (pid) => estado.iniciativas.filter((i) => i.programaId === pid);

const entregasDo = (pid) =>
    iniciativasDo(pid).flatMap((i) => entregasDaIniciativa(estado, i.id).map((e) => ({ e, ini: i })));

const projetosDo = (pid) => {
    const mapa = new Map();
    for (const { e, ini } of entregasDo(pid))
        for (const p of projetosDaEntrega(estado, e.id)) {
            const atual = mapa.get(p.id) ?? { projeto: p, entregas: [], orgaos: new Set() };
            atual.entregas.push({ e, ini });
            atual.orgaos.add(ini.orgao);
            mapa.set(p.id, atual);
        }
    return [...mapa.values()];
};

const previstoDo = (pid) => iniciativasDo(pid).reduce((s, i) => s + recursosDaIniciativa(estado, i.id), 0);

/** Previsto por ano do ciclo. Dinheiro é sempre a mesma unidade: pode somar. */
const previstoPorAno = (pid) => {
    const linhas = linhasDoPrograma(estado, pid);
    return ANOS.map((a) => linhas.reduce((s, l) => s + (l.anos[a] ?? 0), 0));
};

/* ---------- escolha do Programa ---------- */

function listaProgramas() {
    const termo = busca.trim().toLowerCase();
    // Um PPA por vez: só os Programas do plano escolhido no cabeçalho.
    const plano = ppaCorrente(estado);
    const programas = estado.programas.filter(
        (p) => (!p.ppaId || !plano || p.ppaId === plano.id) && (!termo || p.nome.toLowerCase().includes(termo) || p.codigo.includes(termo) || p.eixo.toLowerCase().includes(termo))
    );

    return `
${cabecalhoPagina(
    "Visão por Programas",
    "Escolha um Programa para ver tudo o que pende dele num lugar só.",
    `<div class="app-search">
        <input type="search" id="busca" class="form-control form-control-sm" placeholder="Buscar Programa" value="${esc(busca)}" />
        <i class="ti ti-search app-search-icon text-muted"></i>
    </div>`
)}
<div class="card">
    <div class="table-responsive">
        <table class="table table-hover mb-0">
            <thead>
                <tr>
                    <th style="width:6rem">Código</th>
                    <th>Programa</th>
                    <th style="width:14rem">Órgão coordenador</th>
                    <th class="num" style="width:8rem">Iniciativas</th>
                    <th class="num" style="width:8rem">Entregas</th>
                    <th style="width:11rem">Aptidão</th>
                </tr>
            </thead>
            <tbody>
            ${
                programas.length === 0
                    ? `<tr><td colspan="6" class="text-center text-muted py-4 fs-12">Nenhum Programa corresponde à busca.</td></tr>`
                    : programas
                          .map((p) => {
                              const inis = iniciativasDo(p.id);
                              const ents = entregasDo(p.id);
                              return `
                <tr class="cursor-pointer" data-abrir="${p.id}">
                    <td class="codigo">${esc(p.codigo)}</td>
                    <td>
                        <div class="fw-medium">${esc(p.nome)}</div>
                        <div class="fs-12 text-muted">${esc(p.eixo)}</div>
                    </td>
                    <td class="fs-13">${esc(p.orgaoCoordenador || "—")}</td>
                    <td class="num">${inis.length || "—"}</td>
                    <td class="num">${ents.length || "—"}</td>
                    <td>${chip(APTIDAO_LABEL[p.aptidao], p.aptidao === "apto" ? "ok" : "alerta")}</td>
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
    { id: "iniciativas", rotulo: "Iniciativas", icone: "ti-list-check" },
    { id: "entregas", rotulo: "Entregas", icone: "ti-box" },
    { id: "projetos", rotulo: "Projetos", icone: "ti-git-branch" },
    { id: "documentos", rotulo: "Documentos", icone: "ti-paperclip" },
];

function navAbas(p) {
    const conta = {
        iniciativas: iniciativasDo(p.id).length,
        entregas: entregasDo(p.id).length,
        projetos: projetosDo(p.id).length,
        documentos: 0,
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

/** Visão geral — o diagnóstico que justifica o Programa. */
function abaGeral(p) {
    const lista = (itens, vazio) =>
        (itens ?? []).length === 0
            ? `<p class="text-muted fs-13 mb-0">${vazio}</p>`
            : `<ul class="mb-0 ps-3 fs-13">${itens.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;

    const causas = (p.causas ?? []).length
        ? `<ul class="mb-0 ps-3 fs-13">
        ${p.causas
            .map(
                (c) => `<li class="mb-1">${esc(c.texto)}</li>`
            )
            .join("")}
    </ul>`
        : `<p class="text-muted fs-13 mb-0">Nenhuma causa cadastrada. Sem causa, o órgão não consegue concluir Iniciativa neste Programa.</p>`;

    const indicadores = (p.indicadores ?? []).length
        ? `<div class="table-responsive"><table class="table table-sm mb-0">
        <thead><tr><th>Indicador</th><th style="width:8rem">Unidade</th><th class="num" style="width:9rem">Linha de base</th><th class="num" style="width:8rem">Meta</th></tr></thead>
        <tbody>${p.indicadores
            .map(
                (i) => `<tr>
            <td class="fs-13">${esc(i.nome)}</td>
            <td class="fs-13 text-muted">${esc(i.unidade)}</td>
            <td class="num">${esc(i.linhaBase)}</td>
            <td class="num fw-medium">${esc(i.meta)}</td>
        </tr>`
            )
            .join("")}</tbody></table></div>`
        : `<p class="text-muted fs-13 mb-0">Nenhum indicador de resultado cadastrado.</p>`;

    const previsto = previstoDo(p.id);
    const executado = entregasDo(p.id).reduce((s, { e }) => s + executadoDaEntrega(e.id), 0);
    const porAno = previstoPorAno(p.id);

    const recursos = secao(
        "Recursos do Programa",
        `<div class="row g-3 align-items-center">
        <div class="col-md-4">
            <div class="d-flex justify-content-between align-items-baseline mb-1">
                <span class="fs-13">Executado</span>
                <span class="fw-bold">${moedaCurta(executado)}</span>
            </div>
            ${medidor(executado, previsto, { de: "previsto", titulo: `${moeda(executado)} de ${moeda(previsto)}` })}
            <div class="nota-grafico mt-1">de ${moedaCurta(previsto)} previstos · fonte SIAFIC</div>
        </div>
        <div class="col-md-8">
            <div id="grafico-anos" style="min-height:190px"></div>
        </div>
    </div>`
    );

    return `
${previsto > 0 ? recursos : ""}
<div class="row g-3">
    <div class="col-lg-7">
        ${secao("Problema central", `<p class="fs-13 mb-0">${esc(p.problema) || '<span class="text-muted">Não informado.</span>'}</p>`)}
        ${secao("Evidências", lista(p.evidencias, "Nenhuma evidência registrada."))}
        ${secao("Causas", causas)}
        ${secao("Consequências", lista(p.consequencias, "Nenhuma consequência registrada."))}
    </div>
    <div class="col-lg-5">
        ${secao(
            "Identificação",
            `<dl class="ficha mb-0">
            <dt>Eixo</dt><dd>${esc(p.eixo) || "—"}</dd>
            <dt>Objetivo estratégico</dt><dd>${esc(p.objetivoEstrategico) || "—"}</dd>
            <dt>Órgão coordenador</dt><dd>${esc(p.orgaoCoordenador) || "—"}</dd>
            <dt>População afetada</dt><dd>${esc(p.populacaoAfetada) || "—"}</dd>
        </dl>`
        )}
        ${secao("Objetivo", `<p class="fs-13 mb-0">${esc(p.objetivo) || '<span class="text-muted">Não informado.</span>'}</p>`)}
        ${secao(
            "Resultado esperado",
            `<p class="fs-13 mb-0">${esc(p.resultadoEsperado) || '<span class="text-muted">Não informado.</span>'}</p>`
        )}
        ${secao("Indicadores de resultado", indicadores)}
    </div>
</div>`;
}

/** Iniciativas — a contribuição de cada órgão ao Programa. */
function abaIniciativas(p) {
    const inis = iniciativasDo(p.id);
    const totalPrograma = previstoDo(p.id);
    if (inis.length === 0)
        return secao(
            "Iniciativas",
            `<p class="text-muted fs-13 mb-0">Nenhum órgão contribuiu com este Programa até agora.</p>`
        );

    return `
<div class="card">
    <div class="table-responsive">
        <table class="table table-hover mb-0">
            <thead>
                <tr>
                    <th>Iniciativa</th>
                    <th style="width:13rem">Órgão</th>
                    <th style="width:11rem">Status</th>
                    <th class="num" style="width:7rem">Entregas</th>
                    <th class="num" style="width:10rem">Previsto</th>
                    <th style="width:10rem">Atualizada em</th>
                    <th style="width:6rem">Ações</th>
                </tr>
            </thead>
            <tbody>
            ${inis
                .map((i) => {
                    const ents = entregasDaIniciativa(estado, i.id);
                    return `
                <tr>
                    <td>
                        <div class="fw-medium">${esc(i.nome)}</div>
                        ${i.analista ? `<div class="fs-12 text-muted">Analista: ${esc(i.analista)}</div>` : ""}
                    </td>
                    <td class="fs-13">${esc(i.orgao)}</td>
                    <td>${statusChip(i.status)}</td>
                    <td class="num">${ents.length || "—"}</td>
                    <td class="num">
                        <div>${moedaCurta(recursosDaIniciativa(estado, i.id))}</div>
                        ${
                            totalPrograma > 0
                                ? medidor(recursosDaIniciativa(estado, i.id), totalPrograma, {
                                      pequeno: true,
                                      de: "previsto do Programa",
                                      titulo: `${pct((recursosDaIniciativa(estado, i.id) / totalPrograma) * 100)} do previsto do Programa`,
                                  })
                                : ""
                        }
                    </td>
                    <td class="fs-13 text-muted">${esc(i.atualizadoEm)}</td>
                    <td><a class="btn btn-sm btn-outline-primary" href="central-iniciativa.html?id=${i.id}">Abrir</a></td>
                </tr>`;
                })
                .join("")}
            </tbody>
        </table>
    </div>
</div>`;
}

/** Entregas — o produto concreto, com metas e situação. */
function abaEntregas(p) {
    const ents = entregasDo(p.id);
    if (ents.length === 0)
        return secao("Entregas", `<p class="text-muted fs-13 mb-0">Nenhuma Entrega cadastrada nas Iniciativas deste Programa.</p>`);

    const nomeComportamento = (id) => COMPORTAMENTOS.find((c) => c.id === id)?.nome ?? "—";

    return `
<div class="card">
    <div class="table-responsive">
        <table class="table table-hover mb-0">
            <thead>
                <tr>
                    <th style="min-width:20rem">Entrega</th>
                    <th style="width:10rem">Órgão</th>
                    <th style="width:6.5rem">Unidade</th>
                    ${ANOS.map((a) => `<th class="num" style="width:4.5rem">${a}</th>`).join("")}
                    <th style="width:5rem">Trajetória</th>
                    <th class="num" style="width:7.5rem">Previsto</th>
                    <th style="width:9.5rem">Situação</th>
                </tr>
            </thead>
            <tbody>
            ${ents
                .map(({ e, ini }) => {
                    const s = situacaoEntrega(estado, e);
                    return `
                <tr>
                    <td>
                        <div class="fw-medium">${esc(e.nome) || '<span class="text-muted">Sem nome</span>'}</div>
                        <div class="fs-12 text-muted">${esc(ini.nome)} · ${esc(nomeComportamento(e.comportamento))} · ${esc(
                        TERRITORIO_LABEL[e.territorio?.tipo] ?? "Território não definido"
                    )}</div>
                    </td>
                    <td class="fs-13">${esc(ini.orgao)}</td>
                    <td class="fs-13 text-muted">${esc(e.unidadeMedida) || "—"}</td>
                    ${ANOS.map(
                        (a) =>
                            `<td class="num">${
                                e.metas[a] === null || e.metas[a] === undefined
                                    ? '<span class="text-muted">—</span>'
                                    : e.metas[a].toLocaleString("pt-BR")
                            }</td>`
                    ).join("")}
                    <td>${faisca(
                        ANOS.map((a) => e.metas[a]),
                        ANOS.map((a) => `${a}: ${e.metas[a] ?? "—"}`).join(" · ")
                    )}</td>
                    <td class="num">${moedaCurta(recursosDaEntrega(estado, e.id))}</td>
                    <td>${chip(s.texto, s.tom)}</td>
                </tr>`;
                })
                .join("")}
            </tbody>
        </table>
    </div>
</div>`;
}

/** Projetos GOMAP — como as Entregas são produzidas. */
function abaProjetos(p) {
    const projs = projetosDo(p.id);
    if (projs.length === 0)
        return secao(
            "Projetos",
            `<p class="text-muted fs-13 mb-0">Nenhuma Entrega deste Programa está vinculada a Projeto do GOMAP.</p>`
        );

    return `
<div class="card">
    <div class="table-responsive">
        <table class="table table-hover mb-0">
            <thead>
                <tr>
                    <th style="width:7rem">Código</th>
                    <th>Projeto</th>
                    <th style="width:12rem">Órgão</th>
                    <th style="width:11rem">Fase</th>
                    <th class="num" style="width:8rem">Execução</th>
                    <th style="width:10rem">Conclusão prevista</th>
                    <th class="num" style="width:10rem">Valor global</th>
                </tr>
            </thead>
            <tbody>
            ${projs
                .map(
                    ({ projeto, entregas }) => `
                <tr>
                    <td class="codigo">${esc(projeto.codigo)}</td>
                    <td>
                        <div class="fw-medium">${esc(projeto.nome)}</div>
                        <div class="fs-12 text-muted">Produz: ${entregas.map((x) => esc(x.e.nome)).join(" · ")}</div>
                    </td>
                    <td class="fs-13">${esc(projeto.orgao)}</td>
                    <td class="fs-13">${esc(projeto.fase)}</td>
                    <td class="num">
                        <div class="fw-medium">${pct(projeto.execucao)}</div>
                        ${medidor(projeto.execucao, 100, { pequeno: true, de: "concluído", titulo: `${pct(projeto.execucao)} concluído` })}
                    </td>
                    <td class="fs-13 text-muted">${esc(projeto.conclusaoPrevista)}</td>
                    <td class="num">${moeda(projeto.valorGlobal)}</td>
                </tr>`
                )
                .join("")}
            </tbody>
        </table>
    </div>
</div>
<div class="alert alert-light py-2 px-3 fs-12 mt-3 mb-0">
    O valor global do Projeto é o custo da obra ou da contratação no GOMAP. Ele
    <strong>nunca</strong> é o valor financeiro da Entrega no PPA, que vem das Ações Orçamentárias.
</div>`;
}

/**
 * Documentos — a aba que ainda não tem dado.
 *
 * Não existe tipo, campo nem exemplo no modelo. Em vez de inventar conteúdo,
 * a tela mostra o que ela será e quais campos precisam ser decididos: é mais
 * fácil o usuário reagir a algo concreto do que responder no abstrato.
 */
function abaDocumentos(p) {
    return `
<div class="card">
    <div class="card-body text-center py-5">
        <span class="avatar-lg bg-light text-muted rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
            <i class="ti ti-paperclip fs-24"></i>
        </span>
        <h5 class="fw-bold mb-2">Ainda não há documentos neste Programa</h5>
        <p class="text-muted fs-13 mb-0 mx-auto" style="max-width:34rem">
            Esta aba reunirá a lei do PPA, ofícios, notas técnicas e anexos das Iniciativas.
            O modelo de dados ainda não tem esse tipo — a proposta de campos está abaixo,
            para ser validada antes de construir.
        </p>
    </div>
</div>

${secao(
    "Campos propostos",
    `<div class="table-responsive"><table class="table table-sm mb-0">
    <thead><tr><th style="width:12rem">Campo</th><th style="width:9rem">Tipo</th><th>Regra</th></tr></thead>
    <tbody>
        <tr><td class="fw-medium fs-13">Nome</td><td class="codigo">String(150)</td><td class="fs-13 text-muted">Como o documento é chamado no dia a dia.</td></tr>
        <tr><td class="fw-medium fs-13">Tipo</td><td class="codigo">Enum</td><td class="fs-13 text-muted">Lei · Decreto · Ofício · Nota técnica · Anexo · Outro. A lista precisa ser confirmada.</td></tr>
        <tr><td class="fw-medium fs-13">Arquivo</td><td class="codigo">Upload</td><td class="fs-13 text-muted">Formatos e tamanho máximo a definir. Guardar link externo também é opção.</td></tr>
        <tr><td class="fw-medium fs-13">Vínculo</td><td class="codigo">FK</td><td class="fs-13 text-muted">Programa, Iniciativa ou Entrega — um documento pode nascer em qualquer nível.</td></tr>
        <tr><td class="fw-medium fs-13">Data</td><td class="codigo">Date</td><td class="fs-13 text-muted">Data do documento, não a do envio.</td></tr>
        <tr><td class="fw-medium fs-13">Anexado por</td><td class="codigo">FK</td><td class="fs-13 text-muted">Derivado do usuário da sessão.</td></tr>
    </tbody>
</table></div>`
)}

${secao(
    "Perguntas para o usuário",
    `<ul class="mb-0 ps-3 fs-13">
        <li>Quem anexa: só a Área Central, ou o órgão também anexa na sua Iniciativa?</li>
        <li>O documento é público para todos os órgãos do Programa ou só para quem o anexou?</li>
        <li>Documento pode ser removido depois de anexado, ou só substituído por uma versão nova?</li>
        <li>Existe documento obrigatório — uma Iniciativa só pode ser enviada com a nota técnica anexada, por exemplo?</li>
    </ul>`
)}`;
}

/* ---------- hub ---------- */

function hub(p) {
    const inis = iniciativasDo(p.id);
    const ents = entregasDo(p.id);
    const orgaos = new Set(inis.map((i) => i.orgao));
    const validadas = inis.filter((i) => i.status === "validada").length;
    const previsto = previstoDo(p.id);
    const executado = ents.reduce((s, { e }) => s + executadoDaEntrega(e.id), 0);

    const corpo = { geral: abaGeral, iniciativas: abaIniciativas, entregas: abaEntregas, projetos: abaProjetos, documentos: abaDocumentos }[aba] ?? abaGeral;

    return `
${cabecalhoPagina(
    `${esc(p.codigo)} · ${esc(p.nome)}`,
    esc(p.objetivoEstrategico),
    `${chip(APTIDAO_LABEL[p.aptidao], p.aptidao === "apto" ? "ok" : "alerta")}
     ${chip(DISPONIBILIZACAO_LABEL[p.disponibilizacao], p.disponibilizacao === "disponivel" ? "info" : "neutro")}
     <a class="btn btn-sm btn-outline-primary" href="central-programas.html">Editar Programa</a>`,
    [`${esc(p.codigo)} · ${esc(p.nome)}`]
)}
${faixaIndicadores(
    [
        { valor: inis.length, rotulo: "Iniciativas" },
        { valor: `${validadas}/${inis.length || 0}`, rotulo: "Validadas" },
        { valor: ents.length, rotulo: "Entregas" },
        { valor: orgaos.size, rotulo: "Órgãos" },
        { valor: moedaCurta(previsto), rotulo: "Previsto" },
        { valor: moedaCurta(executado), rotulo: "Executado SIAFIC" },
    ],
    `${esc(p.eixo)} · Órgão coordenador: ${esc(p.orgaoCoordenador || "não informado")}`
)}
${navAbas(p)}
${corpo(p)}`;
}

/* ---------- ciclo ---------- */

let grafico = null;

/**
 * Coluna por ano do ciclo. Série única, uma matiz — o trabalho aqui é
 * magnitude, não identidade. O valor vai impresso em cada coluna porque o
 * verde da marca não alcança 3:1 contra o branco: a cor acompanha, não informa.
 */
function desenharGrafico(p) {
    const alvo = document.getElementById("grafico-anos");
    if (grafico) { grafico.destroy(); grafico = null; }
    if (!alvo || typeof ApexCharts === "undefined") return;

    grafico = new ApexCharts(alvo, {
        chart: { type: "bar", height: 190, toolbar: { show: false }, fontFamily: "IBM Plex Sans, sans-serif" },
        series: [{ name: "Previsto", data: previstoPorAno(p.id) }],
        xaxis: { categories: ANOS, axisBorder: { show: false }, axisTicks: { show: false },
                 labels: { style: { colors: "#9ba6b7", fontSize: "12px" } } },
        yaxis: { labels: { formatter: (v) => moedaCurta(v), style: { colors: "#9ba6b7", fontSize: "11px" } } },
        grid: { borderColor: "#eef2f7", strokeDashArray: 3, padding: { left: 4, right: 4 } },
        colors: ["#1ab394"],
        plotOptions: { bar: { columnWidth: "42%", borderRadius: 4, borderRadiusApplication: "end", dataLabels: { position: "top" } } },
        dataLabels: { enabled: true, offsetY: -18, formatter: (v) => moedaCurta(v),
                      style: { fontSize: "11px", fontWeight: 600, colors: ["#4c4c5c"] } },
        tooltip: { y: { formatter: (v) => moeda(v) } },
        legend: { show: false },
    });
    grafico.render();
}

function render() {
    const p = programaId ? estado.programas.find((x) => x.id === programaId) : null;
    document.getElementById("conteudo").innerHTML = p ? hub(p) : listaProgramas();
    if (p && aba === "geral") desenharGrafico(p);
    else if (grafico) { grafico.destroy(); grafico = null; }
}

document.addEventListener("click", (e) => {
    const linha = e.target.closest("[data-abrir]");
    if (linha) {
        programaId = linha.dataset.abrir;
        aba = "geral";
        history.replaceState(null, "", `central-hub.html?programa=${programaId}`);
        return render();
    }
    const t = e.target.closest("[data-aba]");
    if (t) {
        e.preventDefault();
        aba = t.dataset.aba;
        history.replaceState(null, "", `central-hub.html?programa=${programaId}&aba=${aba}`);
        return render();
    }
});

document.addEventListener("input", (e) => {
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

render();
