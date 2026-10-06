/**
 * Os campos da Iniciativa, como a matriz de mapeamento os define.
 *
 *   Nome da iniciativa* · Status* · Descrição da iniciativa · Programa ·
 *   Problema · Causa e subcausa · Motivo (só quando o status é "reportar
 *   divergência")
 *
 * Servem a duas telas — a ficha, que grava a cada tecla, e a de criação, que
 * grava ao confirmar —, por isso moram num módulo só: dois desenhos do mesmo
 * cadastro acabariam discordando sobre o que ele tem.
 *
 * **O status é quem manda no fluxo.** A matriz o põe como campo, com opções por
 * visão:
 *
 *   setorial — em preenchimento, enviada, reportar divergência
 *   central  — em análise, devolvida, validada
 *
 * Escolher uma opção não troca só um texto: dispara a transição que o sistema já
 * tinha (enviar abre a conferência de pendências; validar e devolver pedem
 * confirmação).
 *
 * **O status é campo de texto**, como a matriz o define (componente TEXTO), mas
 * de texto com poucas respostas válidas: o campo sugere as que a situação atual
 * permite e qualquer outra é recusada — a tela volta ao status que a Iniciativa
 * tem. Um campo livre que aceitasse "quase pronta" deixaria o fluxo sem sentido.
 */
import { esc } from "./ui.js";
import { ppaCorrente } from "./dados/store.js";
import { STATUS_LABEL } from "./dados/regras.js";

export const STATUS_SETORIAL = [
    ["em_preenchimento", "Em preenchimento"],
    ["enviada", "Enviada"],
    ["divergencia", "Reportar divergência"],
];

export const STATUS_CENTRAL = [
    ["em_analise", "Em análise"],
    ["devolvida", "Devolvida"],
    ["validada", "Validada"],
];

/** Para onde cada status pode ir, em cada visão. Fora disso, o campo fica travado. */
const DESTINOS = {
    setorial: {
        em_preenchimento: ["enviada", "divergencia"],
        devolvida: ["em_preenchimento", "enviada", "divergencia"],
        divergencia: ["em_preenchimento", "enviada"],
    },
    central: {
        enviada: ["em_analise"],
        em_analise: ["devolvida", "validada"],
    },
};

const normaliza = (s) =>
    String(s ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();

const opcoesDaVisao = (visao) => (visao === "central" ? STATUS_CENTRAL : STATUS_SETORIAL);

/** O texto digitado → o identificador do status; vazio se não for um dos da visão. */
export function idDoStatus(texto, visao) {
    const n = normaliza(texto);
    return opcoesDaVisao(visao).find(([k, rotulo]) => normaliza(rotulo) === n || normaliza(k) === n)?.[0] ?? "";
}

/** A Iniciativa pode ir do status em que está para o escolhido, nesta visão? */
export const podeIr = (visao, atual, destino) => (DESTINOS[visao]?.[atual] ?? []).includes(destino);

/** O rótulo de um status, na visão ou, fora dela, o que o sistema usa. */
const rotuloDoStatus = (k, visao) => opcoesDaVisao(visao).find(([id]) => id === k)?.[1] ?? STATUS_LABEL[k] ?? k;

/** Um PPA por vez: só o que pertence ao plano escolhido no cabeçalho. */
const doPlano = (estado) => {
    const plano = ppaCorrente(estado);
    return (r) => !r.ppaId || !plano || r.ppaId === plano.id;
};

export const programasDoPlano = (estado) => (estado.programas ?? []).filter(doPlano(estado));
export const problemasDoPlano = (estado) => (estado.problemas ?? []).filter(doPlano(estado));

/** O problema da Iniciativa: o que ela guarda ou, nas anteriores a esse campo, o do Programa. */
export function problemaDaIniciativa(estado, ini) {
    if (ini.problemaId) return ini.problemaId;
    const doPrograma = (estado.problemas ?? []).find((p) => p.id === `pb-${ini.programaId}`);
    return doPrograma?.id ?? "";
}

/* ---------- peças ---------- */

function seletorDeStatus({ ini, visao, travado }) {
    // `travado` aqui é só o perfil sem escrita; o resto quem decide é o fluxo.
    const permitidos = DESTINOS[visao]?.[ini.status] ?? [];

    return `
    <input type="text" class="form-control" id="f-status" list="lista-status" autocomplete="off"
           value="${esc(rotuloDoStatus(ini.status, visao))}" ${travado || permitidos.length === 0 ? "disabled" : ""} />
    <datalist id="lista-status">
        ${[ini.status, ...permitidos].map((k) => `<option value="${esc(rotuloDoStatus(k, visao))}"></option>`).join("")}
    </datalist>`;
}

/** As causas do Programa escolhido. Trocar o Programa troca a lista. */
export function blocoDeCausas(programa, selecionadas, travado) {
    const causas = programa?.causas ?? [];
    return `
    <label class="form-label">Causa e subcausa</label>
    ${
        causas.length === 0
            ? '<div class="alert alert-warning py-2 px-3 fs-12 mb-0">O Programa não tem causas cadastradas. Sem ao menos uma, esta Iniciativa não pode ser enviada.</div>'
            : causas
                  .map(
                      (c) => `
    <div class="form-check">
        <input class="form-check-input" type="checkbox" value="${c.id}" id="ca-${c.id}" data-causa ${selecionadas.includes(c.id) ? "checked" : ""}${travado ? " disabled" : ""} />
        <label class="form-check-label" for="ca-${c.id}">${esc(c.texto)}</label>
    </div>`
                  )
                  .join("")
    }`;
}

/**
 * @param {object} o
 * @param {object} o.ini       a Iniciativa, ou o rascunho dela
 * @param {object} o.estado
 * @param {"setorial"|"central"} o.visao
 * @param {boolean} o.travado  os campos não se editam
 * @param {boolean} [o.statusTravado]  o status não se escolhe — só o perfil sem escrita.
 *   Separado dos campos porque a Central os trava e escolhe o status: é por ele que analisa.
 * @param {(campo: string) => string} [o.marca]  o selo "apontado" da análise
 */
export function camposDaIniciativa({ ini, estado, visao, travado, statusTravado = false, marca = () => "" }) {
    const dis = travado ? " disabled" : "";
    const programa = (estado.programas ?? []).find((p) => p.id === ini.programaId);
    const problemaId = problemaDaIniciativa(estado, ini);

    return `
    <div class="mb-3">
        <label class="form-label" for="f-nome">Nome da iniciativa <span class="text-danger">*</span> ${marca("nome")}</label>
        <input type="text" class="form-control" id="f-nome" value="${esc(ini.nome ?? "")}"${dis} />
        <div class="invalid-feedback" id="f-nome-erro"></div>
    </div>

    <div class="mb-3">
        <label class="form-label" for="f-status">Status <span class="text-danger">*</span></label>
        ${seletorDeStatus({ ini, visao, travado: statusTravado })}
        <div class="invalid-feedback" id="f-status-erro"></div>
    </div>

    <div class="mb-3" id="bloco-motivo" ${ini.status === "divergencia" ? "" : "hidden"}>
        <label class="form-label" for="f-motivo">Motivo</label>
        <textarea class="form-control" id="f-motivo" rows="3" placeholder="O que está inconsistente ou divergente"${dis}>${esc(ini.motivo ?? "")}</textarea>
    </div>

    <div class="mb-3">
        <label class="form-label" for="f-descricao">Descrição da iniciativa ${marca("descricao")}</label>
        <textarea class="form-control" id="f-descricao" rows="3"${dis}>${esc(ini.descricao ?? "")}</textarea>
    </div>

    <div class="mb-3">
        <label class="form-label" for="f-programa">Programa</label>
        <select class="form-select" id="f-programa"${dis}>
            <option value="">Selecione o Programa</option>
            ${programasDoPlano(estado)
                .map((p) => `<option value="${p.id}"${p.id === ini.programaId ? " selected" : ""}>${esc(p.codigo)} — ${esc(p.nome)}</option>`)
                .join("")}
        </select>
    </div>

    <div class="mb-3">
        <label class="form-label" for="f-problema">Problema</label>
        <select class="form-select" id="f-problema"${dis}>
            <option value="">Selecione o problema</option>
            ${problemasDoPlano(estado)
                .map((p) => `<option value="${p.id}"${p.id === problemaId ? " selected" : ""}>${esc(p.nome)}</option>`)
                .join("")}
        </select>
    </div>

    <div class="mb-0" id="bloco-causas">${blocoDeCausas(programa, ini.causas ?? [], travado)}</div>`;
}
