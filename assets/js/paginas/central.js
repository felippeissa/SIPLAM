/**
 * Visão Geral da Área Central — consolidação dos Programas.
 * Porta `prototipo-lovable/src/routes/central.tsx`.
 *
 * Corrige três problemas do protótipo:
 *  - lê os Programas do estado, não do seed fixo (T5.1.10);
 *  - separa "enviadas" de "em análise" e mostra "em preenchimento", para as
 *    colunas fecharem com o total (T5.1.11);
 *  - "Ver órgãos participantes" também recolhe a linha já aberta (T5.1.12).
 */
import { obterEstado, noPlano } from "../dados/store.js";
import { entregasDaIniciativa, STATUS_CURTO } from "../dados/regras.js";
import { montarShell, barraTitulo } from "../shell.js";
import { criarFiltros, opcoesDe } from "../filtros.js";
import { chip, statusChip, esc, faixaIndicadores } from "../ui.js";

const { estado } = montarShell();

const programasAbertos = new Set([noPlano(estado).programas[0]?.id]);
const orgaosAbertos = new Set();

/* ---------- dados da tela ---------- */

function linhasBase() {
    return noPlano(estado).programas.map((p) => {
        const inis = estado.iniciativas.filter((i) => i.programaId === p.id);
        const conta = (status) => inis.filter((i) => i.status === status).length;
        return {
            programa: p,
            inis,
            orgaos: [...new Set(inis.map((i) => i.orgao))],
            emPreenchimento: conta("em_preenchimento"),
            enviadas: conta("enviada"),
            emAnalise: conta("em_analise"),
            devolvidas: conta("devolvida"),
            validadas: conta("validada"),
        };
    });
}

const linhas = () => linhasBase().filter((l) => filtros.passa(l));

// O mesmo componente de filtros das demais telas: campos com rótulo, e o filtro só vale ao clicar em Filtrar.
const filtros = criarFiltros({
    livre: { rotulo: "Programa", texto: (l) => `${l.programa.codigo} ${l.programa.nome}` },
    campos: [
        {
            id: "situacao",
            rotulo: "Situação",
            opcoes: () => [
                { valor: "com_analise", rotulo: "Com Iniciativas aguardando análise" },
                { valor: "com_devolucao", rotulo: "Com Iniciativas devolvidas" },
            ],
            valorDe: (l) => [...(l.enviadas + l.emAnalise > 0 ? ["com_analise"] : []), ...(l.devolvidas > 0 ? ["com_devolucao"] : [])],
        },
    ],
    exportar: "programas-do-ppa",
});

/* ---------- pedaços de markup ---------- */

function totais(ls) {
    const inis = ls.reduce((s, l) => s + l.inis.length, 0);
    const aguardando = ls.reduce((s, l) => s + l.enviadas + l.emAnalise, 0);
    const devolvidas = ls.reduce((s, l) => s + l.devolvidas, 0);
    const validadas = ls.reduce((s, l) => s + l.validadas, 0);
    const orgaos = new Set(ls.flatMap((l) => l.orgaos)).size;

    return faixaIndicadores(
        [
            { valor: ls.length, rotulo: "Programas" },
            { valor: orgaos, rotulo: "Órgãos contribuindo" },
            { valor: inis, rotulo: "Iniciativas" },
            { valor: aguardando, rotulo: "Aguardando análise" },
            { valor: devolvidas, rotulo: "Devolvidas" },
            { valor: validadas, rotulo: "Validadas" },
        ],
        "Contagens do recorte atual. Uma Iniciativa em preenchimento ainda não chegou à Área Central."
    );
}

/**
 * As linhas filhas usam as mesmas colunas da tabela-mãe: o número de Iniciativas
 * de um órgão cai sob "Iniciativas", e a contagem por status sob a coluna
 * daquele status. Com sub-tabela própria, cada nível tinha largura distinta e os
 * números apareciam sob o cabeçalho errado.
 */
function linhaIniciativa(i) {
    const rotulo =
        i.status === "enviada" ? "Iniciar revisão" : i.status === "em_analise" ? "Continuar revisão" : "Visualizar";
    const marca = (status) => (i.status === status ? statusChip(i.status) : "—");

    return `
    <tr class="nivel-3">
        <td></td>
        <td></td>
        <td class="recuo-3">
            <span>${esc(i.nome)}</span>
            <div class="fs-12 text-muted">
                ${entregasDaIniciativa(estado, i.id).length} entrega(s) · atualizada em ${esc(i.atualizadoEm)}
                · analista ${esc(i.analista ?? "não atribuído")}
            </div>
        </td>
        <td></td>
        <td class="num">1</td>
        <td class="num">${marca("em_preenchimento")}</td>
        <td class="num">${marca("enviada")}</td>
        <td class="num">${marca("em_analise")}</td>
        <td class="num">${marca("devolvida")}</td>
        <td class="num">${marca("validada")}</td>
        <td><a href="central-iniciativa.html?id=${i.id}" class="btn btn-sm btn-icon btn-terciario" title="${rotulo}" aria-label="${rotulo}: ${esc(i.nome)}"><i class="ti ${i.status === "enviada" || i.status === "em_analise" ? "ti-checklist" : "ti-eye"} fs-16"></i></a></td>
    </tr>`;
}

function linhasOrgao(l, orgao) {
    const chave = `${l.programa.id}|${orgao}`;
    const inis = l.inis.filter((i) => i.orgao === orgao);
    const aberto = orgaosAbertos.has(chave);
    const conta = (status) => inis.filter((i) => i.status === status).length;
    const entregas = inis.reduce((s, i) => s + entregasDaIniciativa(estado, i.id).length, 0);
    const ou = (n) => n || "—";

    const linha = `
    <tr class="nivel-2">
        <td></td>
        <td></td>
        <td class="recuo-2">
            <button class="btn-expandir" data-orgao="${esc(chave)}" aria-expanded="${aberto}" aria-label="${aberto ? "Recolher" : "Expandir"} ${esc(orgao)}">
                <i class="ti ti-chevron-right"></i>
            </button>
            <span class="fw-medium ms-1">${esc(orgao)}</span>
            <div class="fs-12 text-muted">${entregas} entrega(s)</div>
        </td>
        <td></td>
        <td class="num">${inis.length}</td>
        <td class="num">${ou(conta("em_preenchimento"))}</td>
        <td class="num">${ou(conta("enviada"))}</td>
        <td class="num">${ou(conta("em_analise"))}</td>
        <td class="num">${ou(conta("devolvida"))}</td>
        <td class="num">${ou(conta("validada"))}</td>
        <td></td>
    </tr>`;

    return linha + (aberto ? inis.map(linhaIniciativa).join("") : "");
}

function linhaPrograma(l) {
    const aberto = programasAbertos.has(l.programa.id);
    const p = l.programa;

    return `
    <tr>
        <td style="width:2.5rem">
            <button class="btn-expandir" data-programa="${p.id}" aria-expanded="${aberto}" aria-label="${aberto ? "Recolher" : "Expandir"} ${esc(p.nome)}">
                <i class="ti ti-chevron-right"></i>
            </button>
        </td>
        <td class="codigo text-muted">${esc(p.codigo)}</td>
        <td>
            <div class="fw-medium">${esc(p.nome)}</div>
            <div class="fs-12 text-muted">${esc(p.eixo)}</div>
        </td>
        <td class="num">${l.orgaos.length}</td>
        <td class="num">${l.inis.length}</td>
        <td class="num">${l.emPreenchimento || "—"}</td>
        <td class="num">${l.enviadas || "—"}</td>
        <td class="num">${l.emAnalise || "—"}</td>
        <td class="num">${l.devolvidas || "—"}</td>
        <td class="num">${l.validadas || "—"}</td>
        <td>
            <div class="dropdown">
                <button class="btn btn-sm btn-terciario btn-icon" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Ações do Programa" title="Mais ações">
                    <i class="ti ti-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end fs-13">
                    <li><a class="dropdown-item" href="programa.html?id=${p.id}">Visualizar Programa</a></li>
                    <li><button class="dropdown-item" data-cobertura="${p.id}">Cobertura causal</button></li>
                    <li><button class="dropdown-item" data-programa="${p.id}">${aberto ? "Recolher" : "Ver"} órgãos participantes</button></li>
                </ul>
            </div>
        </td>
    </tr>
    ${
        aberto
            ? l.orgaos.length === 0
                ? `<tr class="nivel-2"><td></td><td></td><td colspan="9" class="recuo-2 fs-12 text-muted">Nenhum órgão cadastrou Iniciativas neste Programa.</td></tr>`
                : l.orgaos.map((o) => linhasOrgao(l, o)).join("")
            : ""
    }`;
}

/* ---------- cobertura causal ---------- */

function abrirCobertura(programaId) {
    const p = estado.programas.find((x) => x.id === programaId);
    if (!p) return;

    const itens = p.causas
        .map((c) => {
            const rel = estado.iniciativas.filter((i) => i.programaId === p.id && i.causas.includes(c.id));
            const orgaos = new Set(rel.map((i) => i.orgao)).size;
            return `
        <li class="list-group-item d-flex justify-content-between align-items-start gap-3">
            <span>${esc(c.texto)}</span>
            ${
                rel.length === 0
                    ? chip("Nenhuma Iniciativa", "alerta")
                    : `<span class="fs-12 text-muted text-nowrap">${orgaos} órgão(s) · ${rel.length} Iniciativa(s)</span>`
            }
        </li>`;
        })
        .join("");

    document.getElementById("corpo-cobertura").innerHTML = `
        <p class="fs-12 text-muted">Causas com Iniciativas relacionadas. Não confundir com participação dos órgãos.</p>
        <ul class="list-group list-group-flush">${itens}</ul>`;
    document.getElementById("titulo-cobertura").textContent = `Cobertura causal — ${p.codigo} ${p.nome}`;
    bootstrap.Modal.getOrCreateInstance(document.getElementById("modal-cobertura")).show();
}

/* ---------- render ---------- */

/** Monta a tela uma vez: a barra de filtros fica de pé, e só a faixa e o corpo da tabela se refazem. */
function montar() {
    document.getElementById("conteudo").innerHTML = `
    ${barraTitulo("Programas do PPA")}
    <div id="faixa" class="mt-3"></div>
    <div class="card">
        ${filtros.html()}
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th></th>
                        <th style="width:5rem">Código</th>
                        <th>Programa</th>
                        <th class="num" style="width:5rem">Órgãos</th>
                        <th class="num" style="width:6rem">Iniciativas</th>
                        <th class="num" style="width:8rem">Em preenchimento</th>
                        <th class="num" style="width:6rem">Enviadas</th>
                        <th class="num" style="width:6rem">Em análise</th>
                        <th class="num" style="width:6rem">Devolvidas</th>
                        <th class="num" style="width:6rem">Validadas</th>
                        <th style="width:4rem">Ações</th>
                    </tr>
                </thead>
                <tbody id="corpo-programas"></tbody>
            </table>
        </div>
    </div>`;
    filtros.ligar(() => render());
}

function render() {
    const ls = linhas();
    document.getElementById("faixa").innerHTML = totais(ls);
    document.getElementById("corpo-programas").innerHTML =
        ls.length === 0
            ? '<tr><td colspan="11" class="text-center text-muted py-4 fs-12">Nenhum Programa corresponde ao filtro.</td></tr>'
            : ls.map(linhaPrograma).join("");
}

/* ---------- eventos ---------- */

document.getElementById("conteudo").addEventListener("click", (e) => {
    const programa = e.target.closest("[data-programa]");
    if (programa) {
        const id = programa.dataset.programa;
        programasAbertos.has(id) ? programasAbertos.delete(id) : programasAbertos.add(id);
        render();
        return;
    }

    const orgao = e.target.closest("[data-orgao]");
    if (orgao) {
        const chave = orgao.dataset.orgao;
        orgaosAbertos.has(chave) ? orgaosAbertos.delete(chave) : orgaosAbertos.add(chave);
        render();
        return;
    }

    const cobertura = e.target.closest("[data-cobertura]");
    if (cobertura) abrirCobertura(cobertura.dataset.cobertura);
});

montar();
render();
