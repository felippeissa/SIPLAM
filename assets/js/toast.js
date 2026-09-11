/**
 * Aviso de resultado — o toast do Bootstrap, no canto superior direito.
 *
 * Serve para o que já aconteceu: "criado", "editado", "excluído". O que ainda
 * não aconteceu — campo em branco, vínculo impedindo a exclusão — é validação
 * no formulário, não toast.
 */
import { esc } from "./ui.js";

const TOM = {
    ok: { classe: "text-bg-success", icone: "ti-circle-check" },
    alerta: { classe: "text-bg-warning", icone: "ti-alert-triangle" },
    erro: { classe: "text-bg-danger", icone: "ti-alert-circle" },
};

function container() {
    let el = document.getElementById("siplam-toasts");
    if (!el) {
        el = document.createElement("div");
        el.id = "siplam-toasts";
        el.className = "toast-container position-fixed top-0 end-0 p-3";
        el.style.zIndex = "1090"; // acima do modal, para o aviso não ficar por baixo
        document.body.appendChild(el);
    }
    return el;
}

/**
 * @param {string} texto
 * @param {"ok"|"alerta"|"erro"} [tom]
 */
export function avisar(texto, tom = "ok") {
    const { classe, icone } = TOM[tom] || TOM.ok;
    const el = document.createElement("div");
    el.className = `toast align-items-center shadow-lg border-0 ${classe}`;
    el.setAttribute("role", "alert");
    el.setAttribute("aria-live", "assertive");
    el.setAttribute("aria-atomic", "true");
    el.innerHTML = `
    <div class="d-flex">
        <div class="toast-body d-flex align-items-center gap-2 fs-13">
            <i class="ti ${icone} fs-18"></i>${esc(texto)}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto"
                data-bs-dismiss="toast" aria-label="Fechar"></button>
    </div>`;

    container().appendChild(el);
    const toast = new bootstrap.Toast(el, { delay: 4000 });
    el.addEventListener("hidden.bs.toast", () => el.remove());
    toast.show();
}
