import { esc } from "../ui.js";
import { ORGAOS, UNIDADES, PERIODICIDADES } from "../dados/seed.js";
import { campoErro } from "../validacao.js";

/**
 * Cadastro de Indicadores.
 *
 * Os campos vieram do sistema atual. Quatro listas apareciam fechadas no
 * registro de tela e foram preenchidas aqui com o vocabulário que o domínio
 * pede — **polaridade, fonte, abrangência e situação**. São as que precisam de
 * conferência com os requisitos.
 *
 * Unidade de medida e periodicidade reaproveitam as listas que o protótipo já
 * usa nas Entregas: duas listas para a mesma coisa acabariam divergindo.
 */

/** O sentido em que o indicador melhora. Sem isso, subir pode ser bom ou ruim. */
const POLARIDADES = ["Quanto maior, melhor", "Quanto menor, melhor", "Quanto mais próximo da meta, melhor"];

/** Até onde o número enxerga. Acompanha o vocabulário de território das Entregas. */
const ABRANGENCIAS = ["Estadual", "Regional", "Municipal"];

/** De onde o dado vem — não confundir com fonte de recurso, que é do financeiro. */
const FONTES = [
    "IBGE",
    "INEP",
    "DATASUS",
    "Cadastro Único",
    "SIAFIC",
    "Sistema próprio do órgão",
    "Órgão federal",
    "Pesquisa contratada",
];

/** Onde o indicador está na vida dele. */
const SITUACOES = ["Novo", "Em uso", "Em revisão", "Inativo"];

const LIMITE = { nome: 255, descricao: 4000, formula: 4000, site: 255 };

const valor = (id) => document.getElementById(id)?.value.trim() ?? "";

/** Quem está com a sessão aberta responde pelo indicador que cadastra. */
function responsavelAtual() {
    try {
        return localStorage.getItem("siplam.usuario") || "—";
    } catch (e) {
        return "—";
    }
}

/* ---------- peças de formulário ---------- */

const contador = (id, limite) => `<div class="form-text fs-12" data-contador="${id}" data-limite="${limite}"></div>`;

function areaTexto(id, rotulo, atual, limite, obrigatorio, exemplo = "") {
    return `
    <div class="mb-3">
        <label class="form-label" for="${id}">${esc(rotulo)}${obrigatorio ? ' <span class="text-danger">*</span>' : ""}</label>
        <textarea class="form-control" id="${id}" rows="3" maxlength="${limite}"
                  placeholder="${esc(exemplo)}">${esc(atual ?? "")}</textarea>
        ${contador(id, limite)}
        ${campoErro(id)}
    </div>`;
}

function lista(id, rotulo, atual, opcoes, obrigatorio) {
    return `
    <div class="mb-3">
        <label class="form-label" for="${id}">${esc(rotulo)}${obrigatorio ? ' <span class="text-danger">*</span>' : ""}</label>
        <select class="form-select" id="${id}">
            <option value="">Selecione</option>
            ${opcoes.map((o) => `<option value="${esc(o)}"${o === atual ? " selected" : ""}>${esc(o)}</option>`).join("")}
        </select>
        ${campoErro(id)}
    </div>`;
}

function texto(id, rotulo, atual, obrigatorio, opcoes = {}) {
    const { tipo = "text", limite = null, exemplo = "", classe = "" } = opcoes;
    return `
    <div class="mb-3">
        <label class="form-label" for="${id}">${esc(rotulo)}${obrigatorio ? ' <span class="text-danger">*</span>' : ""}</label>
        <input type="${tipo}" class="form-control ${classe}" id="${id}" value="${esc(atual ?? "")}"
               ${limite ? `maxlength="${limite}"` : ""} placeholder="${esc(exemplo)}" />
        ${limite ? contador(id, limite) : ""}
        ${campoErro(id)}
    </div>`;
}

/* ---------- o cadastro ---------- */

export const indicador = {
    colecao: "indicadores",
    pasta: "central-indicador",
    listagem: "central-indicador.html",
    titulo: "Cadastro de Indicadores",
    subtitulo: "O que o plano mede, e como cada medida é apurada.",
    novoRotulo: "Novo indicador",
    singular: "Indicador",
    // Aqui o nome é um campo entre muitos, não o registro inteiro.
    rotuloNome: "Nome",
    exemplo: "Cobertura de esgotamento sanitário",
    podeExcluir: true,

    // O código é do sistema, não de quem cadastra: sequencial dentro do plano.
    codigo: (item, estado) => {
        if (!item.id) return "Novo";
        const indice = (estado.indicadores ?? []).findIndex((i) => i.id === item.id);
        return String(indice + 1).padStart(3, "0");
    },

    // A descrição vem no meio do formulário, entre o nome e a fórmula, e não no
    // fim como nos outros cadastros.
    semDescricao: true,

    // O código abre o formulário, como no sistema atual: é por ele que o
    // indicador é chamado nas outras telas.
    antes: (item, estado) => `
    <div class="mb-3">
        <label class="form-label" for="f-codigo">Código</label>
        <input type="text" class="form-control codigo" id="f-codigo"
               value="${indicador.codigo(item, estado)}" disabled />
        <div class="form-text fs-12">Gerado pelo sistema quando o indicador é cadastrado.</div>
    </div>`,

    // Preenchidos pelo sistema; a pessoa confere, não digita.
    apoio: (item) => [
        { rotulo: "Responsável técnico", valor: item.responsavelTecnico || responsavelAtual() },
        { rotulo: "Data de criação", valor: item.criadoEm || new Date().toLocaleDateString("pt-BR") },
    ],

    filtros: [
        { tipo: "texto", id: "unidade", rotulo: "Unidade", campo: "unidade" },
        { tipo: "texto", id: "periodicidade", rotulo: "Periodicidade", campo: "periodicidade" },
        { tipo: "texto", id: "situacao", rotulo: "Situação", campo: "situacao" },
    ],

    extra: {
        colunas: [
            { rotulo: "Unidade", valor: (i) => (i.unidade ? esc(i.unidade) : '<span class="text-muted">—</span>') },
            { rotulo: "Periodicidade", valor: (i) => (i.periodicidade ? esc(i.periodicidade) : '<span class="text-muted">—</span>') },
            { rotulo: "Situação", valor: (i) => (i.situacao ? esc(i.situacao) : '<span class="text-muted">—</span>') },
        ],

        html(item, estado) {
            const responsaveis = new Set(item.orgaos ?? []);

            return `
            ${areaTexto("f-descricao", "Descrição", item.descricao, LIMITE.descricao, true)}
            ${areaTexto(
                "f-formula",
                "Fórmula",
                item.formula,
                LIMITE.formula,
                true,
                "(municípios atendidos ÷ municípios prioritários) × 100"
            )}

            <div class="row">
                <div class="col-md-6">${lista("f-polaridade", "Polaridade", item.polaridade, POLARIDADES, true)}</div>
                <div class="col-md-6">${lista("f-periodicidade", "Periodicidade de monitoramento", item.periodicidade, PERIODICIDADES, true)}</div>
                <div class="col-md-6">${lista("f-unidade", "Unidade de medida", item.unidade, UNIDADES, true)}</div>
                <div class="col-md-6">${lista("f-fonte", "Fonte", item.fonte, FONTES, true)}</div>
                <div class="col-12">${texto("f-site", "Site", item.site, false, { tipo: "url", limite: LIMITE.site, exemplo: "https://" })}</div>
                <div class="col-md-6">${lista("f-abrangencia", "Abrangência", item.abrangencia, ABRANGENCIAS, true)}</div>
                <div class="col-md-3">${texto("f-linhaBase", "Linha de base", item.linhaBase, true, { exemplo: "0,00", classe: "codigo" })}</div>
                <div class="col-md-3">${texto("f-dataLinhaBase", "Data da linha de base", item.dataLinhaBase, true, { tipo: "date" })}</div>
            </div>

            <div class="mb-3">
                <label class="form-label" for="f-orgaos">Órgão(s) responsável(is) <span class="text-danger">*</span></label>
                <select class="form-control" id="f-orgaos" multiple>
                    ${ORGAOS.map((o) => `<option value="${esc(o)}"${responsaveis.has(o) ? " selected" : ""}>${esc(o)}</option>`).join("")}
                </select>
                <div class="invalid-feedback d-block" id="f-orgaos-erro"></div>
            </div>

            ${lista("f-situacao", "Situação", item.situacao || "Novo", SITUACOES, true)}`;
        },

        ligar(escopo) {
            // “255 caracteres restantes”: o limite só ajuda se aparecer antes de
            // a pessoa esbarrar nele.
            const atualizar = (campo) => {
                const aviso = escopo.querySelector(`[data-contador="${campo.id}"]`);
                if (!aviso) return;
                const restam = Number(aviso.dataset.limite) - campo.value.length;
                aviso.textContent = `${restam} ${restam === 1 ? "caractere restante" : "caracteres restantes"}`;
            };
            escopo.querySelectorAll("[data-contador]").forEach((aviso) => {
                const campo = document.getElementById(aviso.dataset.contador);
                if (!campo) return;
                atualizar(campo);
                campo.addEventListener("input", () => atualizar(campo));
            });

            const orgaos = escopo.querySelector("#f-orgaos");
            if (orgaos && typeof Choices !== "undefined") {
                new Choices(orgaos, {
                    removeItemButton: true,
                    searchEnabled: true,
                    shouldSort: false,
                    allowHTML: false,
                    placeholderValue: "Buscar órgão",
                    noResultsText: "Nenhum órgão encontrado",
                    noChoicesText: "Todos os órgãos já foram escolhidos",
                    itemSelectText: "",
                });
                orgaos.addEventListener("change", () => {
                    document.getElementById("f-orgaos-erro").textContent = "";
                });
            }
        },

        ler: () => ({
            responsavelTecnico: responsavelAtual(),
            formula: valor("f-formula"),
            polaridade: valor("f-polaridade"),
            periodicidade: valor("f-periodicidade"),
            unidade: valor("f-unidade"),
            fonte: valor("f-fonte"),
            site: valor("f-site"),
            abrangencia: valor("f-abrangencia"),
            linhaBase: valor("f-linhaBase"),
            dataLinhaBase: valor("f-dataLinhaBase"),
            orgaos: [...(document.getElementById("f-orgaos")?.selectedOptions ?? [])].map((o) => o.value),
            situacao: valor("f-situacao"),
        }),

        regras(dados) {
            const erro = document.getElementById("f-orgaos-erro");
            if (erro) erro.textContent = "";
            return [
                { campo: "f-descricao", valido: !!dados.descricao, mensagem: "Descreva o que o indicador mede." },
                { campo: "f-formula", valido: !!dados.formula, mensagem: "Informe a fórmula de cálculo." },
                { campo: "f-polaridade", valido: !!dados.polaridade, mensagem: "Escolha a polaridade." },
                { campo: "f-periodicidade", valido: !!dados.periodicidade, mensagem: "Escolha a periodicidade." },
                { campo: "f-unidade", valido: !!dados.unidade, mensagem: "Escolha a unidade de medida." },
                { campo: "f-fonte", valido: !!dados.fonte, mensagem: "Escolha a fonte do dado." },
                { campo: "f-abrangencia", valido: !!dados.abrangencia, mensagem: "Escolha a abrangência." },
                { campo: "f-linhaBase", valido: !!dados.linhaBase, mensagem: "Informe a linha de base." },
                {
                    campo: "f-dataLinhaBase",
                    valido: !!dados.dataLinhaBase,
                    mensagem: "Informe a data da linha de base — um valor sem data não se compara com nada.",
                },
                { campo: "f-orgaos", valido: (dados.orgaos ?? []).length > 0, mensagem: "Escolha ao menos um órgão responsável." },
                { campo: "f-situacao", valido: !!dados.situacao, mensagem: "Escolha a situação." },
            ];
        },
    },
};
