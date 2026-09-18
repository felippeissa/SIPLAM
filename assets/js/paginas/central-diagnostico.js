import { montarCadastro } from "../cadastro-crud.js";
import { esc } from "../ui.js";

/**
 * Cadastro de Diagnóstico.
 *
 * Três coisas: o nome, os problemas que ele caracteriza e a descrição.
 *
 * O diagnóstico não pertence a ninguém — ele **aponta** para os problemas. É o
 * primeiro elo da cadeia que o plano usa para explicar o que enfrenta:
 *
 *   Diagnóstico → Problemas → Causas → Iniciativas
 */

/** O Choices mantém o `<select>` por baixo em dia, então basta lê-lo. */
const marcados = () => [...(document.getElementById("f-problemas")?.selectedOptions ?? [])].map((o) => o.value);

montarCadastro({
    colecao: "diagnosticos",
    titulo: "Cadastro de Diagnóstico",
    subtitulo: "O que o plano identificou, com as evidências que o sustentam.",
    novoRotulo: "Novo diagnóstico",
    singular: "Diagnóstico",

    extra: {
        coluna: {
            rotulo: "Problemas",
            valor: (item) => {
                const total = (item.problemaIds ?? []).length;
                return total ? `${total} ${total === 1 ? "problema" : "problemas"}` : '<span class="text-muted">—</span>';
            },
        },

        html(item, estado) {
            const escolhidos = new Set(item.problemaIds ?? []);
            const lista = estado.problemas ?? [];

            if (!lista.length) {
                return `
                <label class="form-label">Problemas</label>
                <div class="alert alert-warning py-2 px-3 fs-13 mb-0">
                    Nenhum problema cadastrado ainda. Comece pelo
                    <a href="central-problema.html" class="fw-semibold">Cadastro de Problemas</a>.
                </div>`;
            }

            return `
            <label class="form-label" for="f-problemas">Problemas que este diagnóstico caracteriza <span class="text-danger">*</span></label>
            <select class="form-control" id="f-problemas" multiple>
                ${lista
                    .map((pb) => `<option value="${pb.id}"${escolhidos.has(pb.id) ? " selected" : ""}>${esc(pb.nome)}</option>`)
                    .join("")}
            </select>
            <div class="invalid-feedback d-block" id="f-problemas-erro"></div>`;
        },

        ligar(escopo) {
            const campo = escopo.querySelector("#f-problemas");
            if (!campo || typeof Choices === "undefined") return;

            // O inicializador do template roda no DOMContentLoaded, e o modal só
            // existe depois. Aqui usamos as mesmas opções do `data-choices-removeItem`.
            const escolha = new Choices(campo, {
                removeItemButton: true,
                searchEnabled: true,
                shouldSort: false,
                allowHTML: false,
                placeholderValue: "Buscar problema",
                noResultsText: "Nenhum problema encontrado",
                noChoicesText: "Todos os problemas já foram escolhidos",
                itemSelectText: "",
            });

            campo.addEventListener("change", () => {
                document.getElementById("f-problemas-erro").textContent = "";
            });

            // O Choices ouve cliques no documento; sem desmontar, cada abertura
            // do modal deixaria um ouvinte para trás.
            escopo.addEventListener("hidden.bs.modal", () => escolha.destroy(), { once: true });
        },

        ler: () => ({ problemaIds: marcados() }),

        // A mensagem fica sempre visível (`d-block`), então precisa ser limpa a
        // cada tentativa — senão um erro antigo sobrevive a uma correção.
        regras(dados) {
            const erro = document.getElementById("f-problemas-erro");
            if (erro) erro.textContent = "";
            return [
                {
                    campo: "f-problemas",
                    valido: (dados.problemaIds ?? []).length > 0,
                    mensagem: "Escolha ao menos um problema.",
                },
            ];
        },
    },
});
