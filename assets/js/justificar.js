/**
 * Janela que pede uma justificativa antes de uma ação que precisa ficar explicada no histórico — por exemplo,
 * reavaliar uma Iniciativa já validada.
 *
 * Mesmo padrão do `confirmarExclusao` (modal do Bootstrap, campo em vermelho com `is-invalid`, mínimo de caracteres),
 * mas sem a ênfase de perigo: a ação é séria, não destrutiva.
 */
import { esc } from "./ui.js";

const ID = "modal-justificar";
const MINIMO = 20;

/**
 * @param {object} o
 * @param {string} o.titulo
 * @param {string} o.texto          o que vai acontecer
 * @param {string} [o.rotulo]       rótulo do campo
 * @param {string} [o.exemplo]      texto de apoio dentro do campo
 * @param {string} [o.confirmar]    rótulo do botão
 * @param {string} [o.nota]         aviso sob o campo
 * @returns {Promise<string|false>} a justificativa digitada, ou `false` se a pessoa desistiu
 */
export function pedirJustificativa({ titulo, texto, rotulo = "Justificativa", exemplo = "", confirmar = "Confirmar", nota = "" }) {
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
                    <p class="fs-13">${esc(texto)}</p>
                    <label class="form-label fs-13" for="${ID}-campo">${esc(rotulo)} <span class="text-danger">*</span></label>
                    <textarea class="form-control" id="${ID}-campo" rows="4"
                              placeholder="${esc(exemplo || `Mínimo de ${MINIMO} caracteres`)}"></textarea>
                    <div class="invalid-feedback">Informe a justificativa, com ao menos ${MINIMO} caracteres.</div>
                    ${nota ? `<p class="fs-12 text-muted mt-2 mb-0">${esc(nota)}</p>` : ""}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-primary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="${ID}-ok">${esc(confirmar)}</button>
                </div>
            </div>
        </div>
    </div>`
    );

    const el = document.getElementById(ID);
    const campo = document.getElementById(`${ID}-campo`);
    campo.addEventListener("input", () => campo.classList.remove("is-invalid"));
    const modal = new bootstrap.Modal(el);

    return new Promise((resolve) => {
        let resposta = false;
        document.getElementById(`${ID}-ok`).addEventListener("click", () => {
            const t = campo.value.trim();
            if (t.length < MINIMO) {
                campo.classList.add("is-invalid");
                campo.focus();
                return;
            }
            resposta = t;
            modal.hide();
        });
        el.addEventListener("shown.bs.modal", () => campo.focus(), { once: true });
        el.addEventListener(
            "hidden.bs.modal",
            () => {
                el.remove();
                resolve(resposta);
            },
            { once: true }
        );
        modal.show();
    });
}
