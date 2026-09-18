import { montarCadastro } from "../cadastro-crud.js";
import { esc } from "../ui.js";

/**
 * Cadastro de Problemas.
 *
 * Três coisas: o nome, as causas que o explicam e a descrição.
 *
 * O problema não pertence a uma causa — ele **aponta** para elas. Assim uma
 * mesma causa pode explicar mais de um problema, o que uma hierarquia proibiria.
 */

/** O Choices mantém o `<select>` por baixo em dia, então basta lê-lo. */
const marcadas = () => [...(document.getElementById("f-causas")?.selectedOptions ?? [])].map((o) => o.value);

montarCadastro({
    colecao: "problemas",
    titulo: "Cadastro de Problemas",
    subtitulo: "O problema e as causas que o explicam.",
    novoRotulo: "Novo problema",
    singular: "Problema",

    extra: {
        coluna: {
            rotulo: "Causas",
            valor: (item) => {
                const total = (item.causaIds ?? []).length;
                return total ? `${total} ${total === 1 ? "causa" : "causas"}` : '<span class="text-muted">—</span>';
            },
        },

        html(item, estado) {
            const escolhidas = new Set(item.causaIds ?? []);
            const lista = estado.causas ?? [];

            if (!lista.length) {
                return `
                <label class="form-label">Causas</label>
                <div class="alert alert-warning py-2 px-3 fs-13 mb-0">
                    Nenhuma causa cadastrada ainda. Comece pelo
                    <a href="central-causa.html" class="fw-semibold">Cadastro de Causas</a>.
                </div>`;
            }

            return `
            <label class="form-label" for="f-causas">Causas que explicam este problema <span class="text-danger">*</span></label>
            <select class="form-control" id="f-causas" multiple>
                ${lista
                    .map((c) => `<option value="${c.id}"${escolhidas.has(c.id) ? " selected" : ""}>${esc(c.nome)}</option>`)
                    .join("")}
            </select>
            <div class="invalid-feedback d-block" id="f-causas-erro"></div>`;
        },

        ligar(escopo) {
            const campo = escopo.querySelector("#f-causas");
            if (!campo || typeof Choices === "undefined") return;

            // O inicializador do template roda no DOMContentLoaded, e o modal só
            // existe depois. Aqui usamos as mesmas opções do `data-choices-removeItem`.
            const escolha = new Choices(campo, {
                removeItemButton: true,
                searchEnabled: true,
                shouldSort: false,
                allowHTML: false,
                placeholderValue: "Buscar causa",
                noResultsText: "Nenhuma causa encontrada",
                noChoicesText: "Todas as causas já foram escolhidas",
                itemSelectText: "",
            });

            campo.addEventListener("change", () => {
                document.getElementById("f-causas-erro").textContent = "";
            });

            // O Choices ouve cliques no documento; sem desmontar, cada abertura
            // do modal deixaria um ouvinte para trás.
            escopo.addEventListener("hidden.bs.modal", () => escolha.destroy(), { once: true });
        },

        ler: () => ({ causaIds: marcadas() }),

        // A mensagem fica sempre visível (`d-block`), então precisa ser limpa a
        // cada tentativa — senão um erro antigo sobrevive a uma correção.
        regras(dados) {
            const erro = document.getElementById("f-causas-erro");
            if (erro) erro.textContent = "";
            return [
                {
                    campo: "f-causas",
                    valido: (dados.causaIds ?? []).length > 0,
                    mensagem: "Escolha ao menos uma causa.",
                },
            ];
        },
    },
});
