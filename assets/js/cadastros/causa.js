import { esc } from "../ui.js";
import { campoErro } from "../validacao.js";
import { catalogo } from "../catalogo.js";

/**
 * Cadastro de Causas.
 *
 * Os campos são os da matriz de mapeamento: **nome**, **justificativa** e
 * **descrição** — e, dentro da mesma tela, as **subcausas** da causa.
 *
 * A subcausa não tem cadastro próprio no menu: a matriz diz que ela "é
 * realizada na tela de causa" e que "toda subcausa deve ter causa atrelada".
 * Por isso o catálogo abre a janela de cadastro de dentro daqui, e a causa guarda
 * só os identificadores — o texto vive num lugar só, na coleção de subcausas.
 *
 * Evidência e Iniciativas relacionadas saíram em 06/10/2026: a matriz não as
 * lista. Os dados antigos continuam guardados, só não aparecem.
 */

const valor = (id) => document.getElementById(id)?.value.trim() ?? "";

const subcausas = catalogo({
    colecao: "subcausas",
    singular: "Subcausa",
    plural: "Subcausas",
    artigo: "a",
    prefixo: "sub",
    campos: [
        { id: "justificativa", rotulo: "Justificativa", ajuda: "Por que ela origina a causa" },
        { id: "descricao", rotulo: "Descrição", ajuda: "O que caracteriza esta subcausa" },
    ],

    // Quantas causas usam esta subcausa. A janela de edição avisa quando é mais
    // de uma: o texto é compartilhado, e corrigi-lo aqui corrige em todas.
    usos: (id, estado) => (estado.causas ?? []).filter((c) => (c.subcausaIds ?? []).includes(id)).length,
});

const area = (id, rotulo, atual, ajuda) => `
<div class="mb-3">
    <label class="form-label" for="${id}">${esc(rotulo)}</label>
    <textarea class="form-control" id="${id}" rows="3" placeholder="${esc(ajuda)}">${esc(atual ?? "")}</textarea>
    ${campoErro(id)}
</div>`;

export const causa = {
    colecao: "causas",
    pasta: "central-causa",
    listagem: "central-causa.html",
    titulo: "Cadastro de Causas",
    subtitulo: "O que origina os problemas do plano.",
    novoRotulo: "Nova causa",
    singular: "Causa",
    rotuloNome: "Nome da causa",
    genero: "f",
    exemplo: "Déficit de vagas em creche",
    podeExcluir: true,

    // Justificativa e descrição ficam no corpo, logo abaixo do nome; a descrição
    // genérica do formulário não se aplica aqui.
    semDescricao: true,

    filtros: [
        { tipo: "vinculo", id: "subcausas", rotulo: "Subcausas", colecao: "subcausas", campo: "subcausaIds" },
    ],

    extra: {
        colunas: [
            {
                rotulo: "Subcausas",
                valor: (item) => {
                    const total = (item.subcausaIds ?? []).length;
                    return total
                        ? `${total} ${total === 1 ? "subcausa" : "subcausas"}`
                        : '<span class="text-muted">—</span>';
                },
            },
            {
                rotulo: "Justificativa",
                valor: (item) => (item.justificativa ? esc(item.justificativa) : '<span class="text-muted">—</span>'),
            },
        ],

        html(item) {
            return `
            ${area("f-justificativa", "Justificativa", item.justificativa, "Por que esta causa origina os problemas que explica")}
            ${area("f-descricao", "Descrição", item.descricao, "O que caracteriza esta causa")}
            ${subcausas.html(item.subcausaIds ?? [])}`;
        },

        ligar(escopo) {
            subcausas.ligar(escopo);
        },

        ler: () => ({
            justificativa: valor("f-justificativa"),
            descricao: valor("f-descricao"),
            subcausaIds: subcausas.ler(),
        }),
    },
};
