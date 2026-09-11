/**
 * Confirmação de exclusão.
 *
 * Usa o modal do Bootstrap, como o resto do sistema, e a validação padrão do
 * template — campo em vermelho com `is-invalid` e a mensagem em
 * `invalid-feedback`, do mesmo jeito que os formulários das outras telas.
 *
 * Antes isto usava o SweetAlert2: a mensagem de erro dele tem visual próprio,
 * fora do padrão, e ele disputa com o modal do Bootstrap o ajuste de scrollbar
 * no `body`, o que deslocava a caixa na tela.
 *
 * Para o que é pesado de perder — um plano inteiro — pede que a pessoa digite o
 * nome exato, para a exclusão não acontecer por reflexo.
 */
import { esc } from "./ui.js";

const ID = "modal-confirmar-exclusao";

/**
 * @param {object} opcoes
 * @param {string} opcoes.titulo
 * @param {string} opcoes.texto         o que será removido
 * @param {string} [opcoes.confirmar]   rótulo do botão
 * @param {string} [opcoes.digitar]     texto exato que a pessoa precisa digitar
 * @returns {Promise<boolean>}
 */
export function confirmarExclusao({ titulo, texto, confirmar = "Excluir", digitar = null }) {
    document.getElementById(ID)?.remove();

    document.body.insertAdjacentHTML(
        "beforeend",
        `
    <div class="modal fade" id="${ID}" tabindex="-1" aria-labelledby="${ID}-titulo" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title fs-15" id="${ID}-titulo">${esc(titulo)}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>
                <div class="modal-body">
                    <div class="d-flex gap-3">
                        <span class="avatar-sm bg-danger-subtle text-danger rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                            <i class="ti ti-alert-triangle fs-18"></i>
                        </span>
                        <div class="flex-grow-1">
                            <p class="fs-13 mb-0">${esc(texto)}</p>
                            ${
                                digitar
                                    ? `<div class="mt-3">
                                <label class="form-label fs-13 d-block mb-2" for="${ID}-campo">
                                    Digite <span class="nome-a-digitar">${esc(digitar)}</span> para confirmar
                                </label>
                                <input type="text" class="form-control" id="${ID}-campo"
                                       autocomplete="off" autocapitalize="off" spellcheck="false" />
                                <div class="invalid-feedback">O nome digitado não confere.</div>
                            </div>`
                                    : ""
                            }
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-danger" id="${ID}-ok">${esc(confirmar)}</button>
                </div>
            </div>
        </div>
    </div>`
    );

    const el = document.getElementById(ID);
    const campo = digitar ? document.getElementById(`${ID}-campo`) : null;
    const modal = new bootstrap.Modal(el);

    return new Promise((resolve) => {
        let confirmado = false;

        function tentar() {
            // O nome aparece em caixa alta no rótulo; quem copia o que vê digita
            // em caixa alta. Comparar ignorando maiúsculas evita punir isso.
            const igual = campo && campo.value.trim().toLocaleLowerCase("pt-BR") === digitar.toLocaleLowerCase("pt-BR");
            if (campo && !igual) {
                campo.classList.add("is-invalid");
                campo.focus();
                campo.select();
                return;
            }
            confirmado = true;
            modal.hide();
        }

        document.getElementById(`${ID}-ok`).addEventListener("click", tentar);

        if (campo) {
            // Some com o erro assim que a pessoa recomeça a digitar.
            campo.addEventListener("input", () => campo.classList.remove("is-invalid"));
            campo.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    tentar();
                }
            });
            el.addEventListener("shown.bs.modal", () => campo.focus(), { once: true });
        }

        el.addEventListener(
            "hidden.bs.modal",
            () => {
                el.remove();
                resolve(confirmado);
            },
            { once: true }
        );

        modal.show();
    });
}
