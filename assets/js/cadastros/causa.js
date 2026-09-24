import { esc } from "../ui.js";
import { campoErro } from "../validacao.js";
import { catalogo } from "../catalogo.js";

/**
 * Cadastro de Causas.
 *
 * Nome, justificativa, evidência e as Subcausas que a detalham.
 *
 * A causa **não aponta para Iniciativas aqui**. O vínculo entre causa e
 * Iniciativa nasce do outro lado: é o órgão que, ao escrever a Iniciativa, diz
 * quais causas ela enfrenta.
 *
 * A Subcausa deixou de morar dentro da causa e virou cadastro do sistema: a
 * mesma subcausa costuma explicar mais de uma causa, e guardada dentro de uma
 * delas teria de ser redigitada — com outra grafia — em cada uma. Aqui a causa
 * guarda só os identificadores; o texto vive num lugar só.
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
        { id: "evidencia", rotulo: "Evidência", ajuda: "O número, a série ou o estudo que a sustenta" },
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
    rotuloNome: "Nome",
    genero: "f",
    exemplo: "Déficit de vagas em creche",
    podeExcluir: true,

    // Justificativa e evidência ficam no corpo, logo abaixo do nome; a descrição
    // genérica não se aplica aqui.
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
                rotulo: "Evidência",
                valor: (item) => (item.evidencia ? esc(item.evidencia) : '<span class="text-muted">—</span>'),
            },
        ],

        html(item) {
            return `
            ${area("f-justificativa", "Justificativa da causa", item.justificativa, "Por que ela origina os problemas que explica")}
            ${area("f-evidencia", "Evidência da causa", item.evidencia, "O número, a série ou o estudo que a sustenta")}
            ${subcausas.html(item.subcausaIds ?? [])}`;
        },

        ligar(escopo) {
            subcausas.ligar(escopo);
        },

        ler: () => ({
            justificativa: valor("f-justificativa"),
            evidencia: valor("f-evidencia"),
            subcausaIds: subcausas.ler(),
        }),
    },
};
