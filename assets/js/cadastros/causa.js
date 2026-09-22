import { esc } from "../ui.js";

/**
 * Cadastro de Causas.
 *
 * Nome, Iniciativas que a enfrentam e descrição.
 *
 * A causa não pertence a ninguém — ela **aponta** para as Iniciativas. É o que
 * permite a uma mesma causa ser enfrentada por várias, de órgãos diferentes, e
 * a uma Iniciativa atacar mais de uma causa.
 */

/** O Choices mantém o `<select>` por baixo em dia, então basta lê-lo. */
const marcadas = () => [...(document.getElementById("f-iniciativas")?.selectedOptions ?? [])].map((o) => o.value);

export const causa = {
    colecao: "causas",
    pasta: "central-causa",
    listagem: "central-causa.html",
    titulo: "Cadastro de Causas",
    subtitulo: "O que origina os problemas, e quem as enfrenta.",
    novoRotulo: "Nova causa",
    singular: "Causa",
    genero: "f",
    exemplo: "Déficit de vagas em creche",
    ajuda: "A causa explica por que um problema acontece. É a ela que as Iniciativas dos órgãos se vinculam.",
    podeExcluir: true,

    extra: {
        coluna: {
            rotulo: "Iniciativas",
            valor: (item) => {
                const total = (item.iniciativaIds ?? []).length;
                return total
                    ? `${total} ${total === 1 ? "iniciativa" : "iniciativas"}`
                    : '<span class="text-muted">—</span>';
            },
        },

        html(item, estado) {
            const escolhidas = new Set(item.iniciativaIds ?? []);
            const lista = estado.iniciativas ?? [];

            if (!lista.length) {
                return `
                <label class="form-label">Iniciativas</label>
                <div class="alert alert-warning py-2 px-3 fs-13 mb-0">Nenhuma Iniciativa cadastrada ainda.</div>`;
            }

            return `
            <label class="form-label" for="f-iniciativas">Iniciativas que enfrentam esta causa</label>
            <select class="form-control" id="f-iniciativas" multiple>
                ${lista
                    .map((i) => `<option value="${i.id}"${escolhidas.has(i.id) ? " selected" : ""}>${esc(i.nome)}</option>`)
                    .join("")}
            </select>`;
        },

        ligar(escopo) {
            const campo = escopo.querySelector("#f-iniciativas");
            if (!campo || typeof Choices === "undefined") return;

            // O inicializador do template roda no DOMContentLoaded; aqui a tela é
            // montada depois. Mesmas opções do `data-choices-removeItem`.
            new Choices(campo, {
                removeItemButton: true,
                searchEnabled: true,
                shouldSort: false,
                allowHTML: false,
                placeholderValue: "Buscar iniciativa",
                noResultsText: "Nenhuma Iniciativa encontrada",
                noChoicesText: "Todas as Iniciativas já foram escolhidas",
                itemSelectText: "",
            });
        },

        ler: () => ({ iniciativaIds: marcadas() }),
    },
};
