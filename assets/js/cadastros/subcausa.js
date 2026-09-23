import { esc } from "../ui.js";
import { obterEstado, updItem } from "../dados/store.js";
import { campoErro } from "../validacao.js";

/**
 * Cadastro de Subcausas.
 *
 * A subcausa detalha a origem de uma causa — nome, justificativa e evidência.
 * É cadastro do sistema, e não campo de dentro da Causa: a mesma subcausa
 * costuma explicar mais de uma causa.
 *
 * Esta tela é a lista completa, e não a única porta de entrada: subcausa
 * cadastrada de dentro de outra tela, pelo campo de busca da Causa, aparece
 * aqui sem mais nada — as duas escrevem na mesma coleção.
 */

const valor = (id) => document.getElementById(id)?.value.trim() ?? "";

/** As causas que apontam para esta subcausa. */
const causasQueUsam = (item, estado) =>
    (estado.causas ?? []).filter((c) => (c.subcausaIds ?? []).includes(item.id));

const area = (id, rotulo, atual, ajuda) => `
<div class="mb-3">
    <label class="form-label" for="${id}">${esc(rotulo)}</label>
    <textarea class="form-control" id="${id}" rows="3" placeholder="${esc(ajuda)}">${esc(atual ?? "")}</textarea>
    ${campoErro(id)}
</div>`;

export const subcausa = {
    colecao: "subcausas",
    pasta: "central-subcausa",
    listagem: "central-subcausa.html",
    titulo: "Cadastro de Subcausas",
    subtitulo: "O que detalha a origem das causas do plano.",
    novoRotulo: "Nova subcausa",
    singular: "Subcausa",
    rotuloNome: "Nome",
    genero: "f",
    exemplo: "Falta de vagas no turno integral",
    ajuda: "A subcausa detalha por que uma causa existe. A mesma subcausa pode explicar mais de uma causa.",
    podeExcluir: true,
    semDescricao: true,

    extra: {
        colunas: [
            {
                rotulo: "Justificativa",
                valor: (i) => (i.justificativa ? esc(i.justificativa) : '<span class="text-muted">—</span>'),
            },
            {
                rotulo: "Evidência",
                valor: (i) => (i.evidencia ? esc(i.evidencia) : '<span class="text-muted">—</span>'),
            },
            {
                rotulo: "Causas",
                valor: (i, estado) => {
                    const total = causasQueUsam(i, estado).length;
                    return total ? `${total} ${total === 1 ? "causa" : "causas"}` : '<span class="text-muted">—</span>';
                },
            },
        ],

        html: (item) => `
            ${area("f-justificativa", "Justificativa", item.justificativa, "Por que ela origina a causa")}
            ${area("f-evidencia", "Evidência", item.evidencia, "O número, a série ou o estudo que a sustenta")}`,

        ler: () => ({
            justificativa: valor("f-justificativa"),
            evidencia: valor("f-evidencia"),
        }),
    },

    // Quem usa esta subcausa, mostrado no cartão lateral: excluir sem saber
    // quantas causas dependem dela é decidir no escuro.
    apoio: (item, estado) => {
        if (!item.id) return [];
        const causas = causasQueUsam(item, estado);
        return [
            {
                rotulo: "Causas que a usam",
                valor: causas.length ? causas.map((c) => c.nome).join(" · ") : "Nenhuma.",
            },
        ];
    },

    /**
     * Excluir a subcausa desfaz também os vínculos.
     *
     * Sem isso a causa ficaria apontando para um registro que não existe mais, e
     * a linha da tabela dela sumiria sem explicação.
     */
    aoExcluir(item) {
        const estado = obterEstado();
        for (const c of causasQueUsam(item, estado)) {
            updItem("causas", c.id, { subcausaIds: c.subcausaIds.filter((id) => id !== item.id) });
        }
    },
};
