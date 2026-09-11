/**
 * Notificações — o que exige ação de quem está logado.
 *
 * Não há serviço de notificação no protótipo: a lista é derivada do estado, o
 * que muda conforme a visão. O analista é avisado do que chegou para análise; o
 * órgão, do que voltou e do que já pode enviar.
 */
import {
    comentariosDaIniciativa,
    pendenciasIniciativa,
    resumoPendencias,
    entregasDaIniciativa,
} from "./dados/regras.js";
import { esc } from "./ui.js";

function paraCentral(estado) {
    const itens = [];

    for (const i of estado.iniciativas.filter((x) => x.status === "enviada")) {
        itens.push({
            tom: "info",
            icone: "ti-inbox",
            texto: `<strong>${esc(i.nome)}</strong> foi enviada por ${esc(i.orgao)} e aguarda análise.`,
            href: `central-iniciativa.html?id=${i.id}`,
            quando: i.enviadoEm ?? i.atualizadoEm,
        });
    }

    for (const i of estado.iniciativas.filter((x) => x.status === "em_analise")) {
        itens.push({
            tom: "neutro",
            icone: "ti-progress",
            texto: `<strong>${esc(i.nome)}</strong> está em análise com ${esc(i.analista ?? "você")}.`,
            href: `central-iniciativa.html?id=${i.id}`,
            quando: i.atualizadoEm,
        });
    }

    const semCausas = estado.programas.filter((p) => (p.causas ?? []).length === 0);
    for (const p of semCausas) {
        itens.push({
            tom: "alerta",
            icone: "ti-alert-triangle",
            texto: `O Programa <strong>${esc(p.nome)}</strong> não tem causas cadastradas — nenhum órgão consegue concluir uma Iniciativa nele.`,
            href: "central-programas.html",
            quando: null,
        });
    }

    return itens;
}

function paraSetorial(estado) {
    const itens = [];
    const minhas = estado.iniciativas.filter((i) => i.orgao === estado.orgaoAtual);

    for (const i of minhas.filter((x) => x.status === "devolvida")) {
        const abertos = comentariosDaIniciativa(estado, i.id).filter((c) => !c.resolvido).length;
        itens.push({
            tom: "alerta",
            icone: "ti-arrow-back-up",
            texto: `<strong>${esc(i.nome)}</strong> foi devolvida com ${abertos} apontamento(s) para ajuste.`,
            href: `iniciativa.html?id=${i.id}`,
            quando: i.atualizadoEm,
        });
    }

    for (const i of minhas.filter((x) => x.status === "em_preenchimento")) {
        const r = resumoPendencias(pendenciasIniciativa(estado, i));
        if (r.impeditivos === 0 && entregasDaIniciativa(estado, i.id).length > 0) {
            itens.push({
                tom: "ok",
                icone: "ti-send",
                texto: `<strong>${esc(i.nome)}</strong> não tem pendência impeditiva e já pode ser enviada.`,
                href: `iniciativa.html?id=${i.id}`,
                quando: i.atualizadoEm,
            });
        }
    }

    for (const i of minhas.filter((x) => x.status === "validada")) {
        itens.push({
            tom: "ok",
            icone: "ti-circle-check",
            texto: `<strong>${esc(i.nome)}</strong> foi validada pela Área Central.`,
            href: `iniciativa.html?id=${i.id}`,
            quando: i.atualizadoEm,
        });
    }

    return itens;
}

export function instalarNotificacoes(estado, visao) {
    const itens = visao === "central" ? paraCentral(estado) : paraSetorial(estado);
    const exigemAcao = itens.filter((i) => i.tom === "alerta" || i.tom === "info").length;

    const TOM_COR = { alerta: "warning", info: "info", ok: "success", neutro: "secondary" };

    const lista = itens.length
        ? itens
              .map(
                  (i) => `
        <a href="${i.href}" class="dropdown-item py-2 d-flex gap-2 align-items-start text-wrap" style="max-width:24rem">
            <i class="ti ${i.icone} text-${TOM_COR[i.tom]} mt-1"></i>
            <span>
                <span class="fs-13">${i.texto}</span>
                ${i.quando ? `<span class="d-block fs-12 text-muted">${esc(i.quando)}</span>` : ""}
            </span>
        </a>`
              )
              .join("")
        : '<span class="dropdown-item-text fs-13 text-muted py-3">Nada exige sua atenção agora.</span>';

    const botao = document.getElementById("abrir-notificacoes");
    if (!botao) return;

    // O botão vira o gatilho do dropdown, montado ao lado dele.
    botao.setAttribute("data-bs-toggle", "dropdown");
    botao.parentElement.classList.add("dropdown");
    botao.insertAdjacentHTML(
        "afterend",
        `
    <div class="dropdown-menu dropdown-menu-end" style="min-width:22rem">
        <div class="dropdown-header noti-title d-flex justify-content-between align-items-center">
            <h6 class="m-0">Notificações</h6>
            <span class="fs-12 text-muted">${itens.length}</span>
        </div>
        <div style="max-height:60vh;overflow-y:auto">${lista}</div>
    </div>`
    );

    const badge = document.getElementById("conta-notificacoes");
    if (badge) {
        badge.textContent = exigemAcao;
        badge.classList.toggle("d-none", exigemAcao === 0);
    }
}
