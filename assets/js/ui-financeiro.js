/**
 * Quadro financeiro plurianual e lista de pendências.
 * Porta `src/components/ppa/financeiro.tsx` e a lista de pendências do protótipo.
 */
import { ANOS } from "./dados/seed.js";
import { moeda, moedaCurta } from "./dados/regras.js";
import { quadro, DIMENSAO_LABEL } from "./dados/financeiro.js";
import { esc, chip } from "./ui.js";

let contador = 0;

/**
 * Quadro plurianual a partir das linhas financeiras.
 * Os valores são sempre derivados das Ações vinculadas — nunca digitados.
 */
export function quadroFinanceiro(linhas, { dimensao = "fonte", detalhe = "ipof", curto = true, vazio = "Nenhum recurso apropriado." } = {}) {
    const q = quadro(linhas, dimensao);
    if (q.linhas.length === 0) return `<p class="fs-12 text-muted mb-0">${vazio}</p>`;

    const fmt = curto ? moedaCurta : moeda;
    const id = `quadro-${++contador}`;

    const corpo = q.linhas
        .map((l, idx) => {
            const sub = quadro(l.linhas, detalhe);
            const alvo = `${id}-${idx}`;
            return `
        <tr>
            <td>
                <button class="btn-expandir" data-bs-toggle="collapse" data-bs-target="#${alvo}" aria-expanded="false" aria-controls="${alvo}">
                    <i class="ti ti-chevron-right"></i>
                </button>
                <span class="ms-1">${esc(l.chave)}</span>
            </td>
            ${ANOS.map((a) => `<td class="num">${fmt(l.anos[a] || 0)}</td>`).join("")}
            <td class="num fw-semibold">${fmt(l.total)}</td>
        </tr>
        <tr class="collapse" id="${alvo}">
            <td colspan="${ANOS.length + 2}" class="linha-filha p-0">
                <table class="table table-sm tabela-aninhada mb-0">
                    <thead><tr>
                        <th>${esc(DIMENSAO_LABEL[detalhe])}</th>
                        ${ANOS.map((a) => `<th class="num">${a}</th>`).join("")}
                        <th class="num">Total</th>
                    </tr></thead>
                    <tbody>
                        ${sub.linhas
                            .map(
                                (s) => `<tr>
                            <td>${esc(s.chave)}</td>
                            ${ANOS.map((a) => `<td class="num">${fmt(s.anos[a] || 0)}</td>`).join("")}
                            <td class="num">${fmt(s.total)}</td>
                        </tr>`
                            )
                            .join("")}
                    </tbody>
                </table>
            </td>
        </tr>`;
        })
        .join("");

    return `
<div class="table-responsive">
    <table class="table table-sm mb-0">
        <thead>
            <tr>
                <th>${esc(DIMENSAO_LABEL[dimensao])}</th>
                ${ANOS.map((a) => `<th class="num" style="width:7rem">${a}</th>`).join("")}
                <th class="num" style="width:8rem">Total</th>
            </tr>
        </thead>
        <tbody>${corpo}</tbody>
        <tfoot>
            <tr class="fw-semibold border-top">
                <td>Total</td>
                ${ANOS.map((a) => `<td class="num">${fmt(q.totais[a] || 0)}</td>`).join("")}
                <td class="num">${fmt(q.total)}</td>
            </tr>
        </tfoot>
    </table>
</div>`;
}

const ICONE_NIVEL = {
    impeditivo: { icone: "ti-alert-circle-filled", tom: "impeditivo", rotulo: "Impeditivo" },
    alerta: { icone: "ti-alert-triangle-filled", tom: "alerta", rotulo: "Alerta" },
    informacao: { icone: "ti-info-circle-filled", tom: "info", rotulo: "Informação" },
};

/** Lista de pendências em três níveis, com link para a Entrega de origem. */
export function listaPendencias(pendencias, { linkEntrega = true } = {}) {
    if (pendencias.length === 0) {
        return `<p class="fs-12 text-muted mb-0">${chip("Sem pendências", "ok")} Nada a corrigir nesta altura.</p>`;
    }

    const ordem = { impeditivo: 0, alerta: 1, informacao: 2 };
    const itens = [...pendencias]
        .sort((a, b) => ordem[a.nivel] - ordem[b.nivel])
        .map((p) => {
            const n = ICONE_NIVEL[p.nivel];
            const link =
                linkEntrega && p.entregaId
                    ? ` <a href="entrega.html?id=${p.entregaId}" class="fs-12">abrir Entrega</a>`
                    : "";
            return `
        <li class="list-group-item d-flex align-items-start gap-2 px-0 py-2">
            <i class="ti ${n.icone} text-${p.nivel === "impeditivo" ? "danger" : p.nivel === "alerta" ? "warning" : "info"} mt-1"></i>
            <div>
                <div>${esc(p.texto)}</div>
                <div class="fs-12 text-muted">${n.rotulo} · campo ${esc(p.campo)}${link}</div>
            </div>
        </li>`;
        })
        .join("");

    return `<ul class="list-group list-group-flush">${itens}</ul>`;
}

/** Resumo das pendências em chips. */
export function chipsPendencias(resumo) {
    const partes = [];
    if (resumo.impeditivos) partes.push(chip(`${resumo.impeditivos} impeditiva(s)`, "impeditivo"));
    if (resumo.alertas) partes.push(chip(`${resumo.alertas} alerta(s)`, "alerta"));
    if (resumo.informacoes) partes.push(chip(`${resumo.informacoes} informação(ões)`, "info"));
    if (partes.length === 0) partes.push(chip("Completa", "ok"));
    return partes.join(" ");
}
