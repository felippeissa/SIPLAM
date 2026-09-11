/**
 * Componentes compartilhados do SIPLAM.
 * Substitui `src/components/ppa/ui.tsx` e `big-numbers.tsx` do protótipo.
 */
import { STATUS_CURTO } from "./dados/regras.js";

const TOM = {
    ok: "chip-ok",
    alerta: "chip-alerta",
    impeditivo: "chip-impeditivo",
    info: "chip-info",
    neutro: "chip-neutro",
};

const STATUS_TOM = {
    em_preenchimento: "neutro",
    enviada: "info",
    em_analise: "info",
    devolvida: "alerta",
    validada: "ok",
};

/** Pílula semântica em cinco tons. */
export function chip(texto, tom = "neutro") {
    return `<span class="chip ${TOM[tom] || TOM.neutro}">${texto}</span>`;
}

/** Chip do status da Iniciativa. */
export function statusChip(status) {
    return chip(STATUS_CURTO[status], STATUS_TOM[status]);
}

/** Faixa horizontal de indicadores — nunca cards soltos. */
export function faixaIndicadores(itens, rodape = "") {
    const celulas = itens
        .map(
            (i) => `
        <div class="faixa-item">
            <div class="faixa-valor">${i.valor}</div>
            <div class="faixa-rotulo">${i.rotulo}</div>
        </div>`
        )
        .join("");

    return `
<div class="card mb-3">
    <div class="faixa-indicadores">${celulas}</div>
    ${rodape ? `<div class="faixa-rodape">${rodape}</div>` : ""}
</div>`;
}

/** Card com cabeçalho de rótulo e slot de ação. */
export function secao(titulo, conteudo, acao = "") {
    return `
<div class="card mb-3">
    <div class="card-header d-flex flex-wrap align-items-center justify-content-between gap-2">
        <h6 class="rotulo-secao mb-0">${titulo}</h6>
        ${acao}
    </div>
    <div class="card-body">${conteudo}</div>
</div>`;
}

/** Escapa texto vindo dos dados antes de injetar no HTML. */
export function esc(valor) {
    return String(valor ?? "").replace(
        /[&<>"']/g,
        (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
    );
}

/** Trilha de contexto com separador "›". */
export function contexto(elos) {
    return `
<nav class="trilha-contexto">
    ${elos
        .map((e, i) =>
            `${i > 0 ? '<span class="sep">›</span>' : ""}` +
            (e.href ? `<a href="${e.href}">${esc(e.rotulo)}</a>` : `<span>${esc(e.rotulo)}</span>`)
        )
        .join("")}
</nav>`;
}
