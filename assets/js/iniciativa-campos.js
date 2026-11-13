/**
 * Os campos da Iniciativa, como a matriz de mapeamento os define.
 *
 *   Nome da iniciativa* · Status* · Descrição da iniciativa · Programa ·
 *   Indicadores · Causa e subcausa · Motivo (só quando o status é "reportar
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
 *   central  — aprovada (validada) ou reprovada (devolvida)
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
import { catalogo } from "./catalogo.js";
import { ppaCorrente } from "./dados/store.js";
import { STATUS_LABEL } from "./dados/regras.js";

/**
 * Indicadores da Iniciativa: os do cadastro de Indicadores, escolhidos por busca. O
 * indicador tem cadastro próprio; aqui só se escolhe o que já existe. Guardado em
 * `indicadorIds`. Quem monta a tela diz o que fazer ao escolher, com `aoMudarIndicadores`.
 */
let aoMudar = () => {};
export const aoMudarIndicadores = (fn) => (aoMudar = fn);
export const catalogoIndicadores = catalogo({
    colecao: "indicadores",
    singular: "Indicador",
    plural: "Indicadores",
    artigo: "o",
    prefixo: "iind",
    semCriar: true,
    campos: [],
    colunasExtra: [
        { rotulo: "Tipo", valor: (i) => (i.tipo ? esc(i.tipo) : '<span class="text-muted">—</span>') },
        { rotulo: "Unidade", valor: (i) => (i.unidade ? esc(i.unidade) : '<span class="text-muted">—</span>') },
        { rotulo: "Linha de base", valor: (i) => (i.linhaBase ? esc(i.linhaBase) : '<span class="text-muted">—</span>') },
    ],
    detalhe: (i) => [i.tipo, i.unidade].filter(Boolean).join(" · "),
    aoMudar: (ids) => aoMudar(ids),
});

export const STATUS_SETORIAL = [
    ["em_preenchimento", "Em preenchimento"],
    ["enviada", "Enviada"],
    ["divergencia", "Reportar divergência"],
];

// A Central só avalia: Aprovada leva a Iniciativa a "validada"; Reprovada a devolve
// ao setorial, que é quem faz os ajustes.
export const STATUS_CENTRAL = [
    ["validada", "Aprovada"],
    ["devolvida", "Reprovada"],
];

/** Para onde cada status pode ir, em cada visão. Fora disso, o campo fica travado. */
const DESTINOS = {
    setorial: {
        em_preenchimento: ["enviada", "divergencia"],
        devolvida: ["em_preenchimento", "enviada", "divergencia"],
        divergencia: ["em_preenchimento", "enviada"],
    },
    central: {
        enviada: ["devolvida", "validada"],
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

function seletorDeStatus({ ini, visao }) {
    // O status é só para ver: ele é consequência do fluxo (criar, enviar, avaliar), nunca se digita.
    return `<input type="text" class="form-control" id="f-status" value="${esc(rotuloDoStatus(ini.status, visao))}" disabled />`;
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
 * @param {Set<string>|null} [o.liberados]  se informado, só estes campos se editam (os reprovados pela Central)
 * @param {(campo: string) => string} [o.marca]  o selo "apontado" da análise
 * @param {(campo: string) => string} [o.avaliador]  os botões de aprovar/reprovar do campo (visão da Central)
 */
export function camposDaIniciativa({ ini, estado, visao, travado, liberados = null, statusTravado = false, marca = () => "", avaliador = () => "" }) {
    // `liberados`: quando a Iniciativa volta da Central, só os campos reprovados se editam.
    const trava = (campo) => travado || (liberados !== null && !liberados.has(campo));
    const d = (campo) => (trava(campo) ? " disabled" : "");
    const dis = travado ? " disabled" : "";
    const programa = (estado.programas ?? []).find((p) => p.id === ini.programaId);

    return `
    <div class="mb-3">
        <label class="form-label" for="f-nome">Nome da iniciativa <span class="text-danger">*</span> ${marca("nome")}</label>
        <input type="text" class="form-control" id="f-nome" value="${esc(ini.nome ?? "")}"${d("nome")} />
        <div class="invalid-feedback" id="f-nome-erro"></div>
        ${avaliador("nome")}
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
        <textarea class="form-control" id="f-descricao" rows="3"${d("descricao")}>${esc(ini.descricao ?? "")}</textarea>
        ${avaliador("descricao")}
    </div>

    <div class="mb-3">
        <label class="form-label" for="f-programa">Programa</label>
        <select class="form-select" id="f-programa"${d("programa")}>
            <option value="">Selecione o Programa</option>
            ${programasDoPlano(estado)
                .map((p) => `<option value="${p.id}"${p.id === ini.programaId ? " selected" : ""}>${esc(p.codigo)} — ${esc(p.nome)}</option>`)
                .join("")}
        </select>
        ${avaliador("programa")}
    </div>

    <div class="mb-3">${catalogoIndicadores.html(ini.indicadorIds ?? [])}${avaliador("indicadores")}</div>

    <div class="mb-0" id="bloco-causas">${blocoDeCausas(programa, ini.causas ?? [], trava("causas"))}${avaliador("causas")}</div>`;
}
