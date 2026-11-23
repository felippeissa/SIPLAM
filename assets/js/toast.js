/**
 * Aviso de resultado — o toast do Bootstrap, no canto superior direito.
 *
 * Serve para o que já aconteceu: "criado", "editado", "excluído". O que ainda
 * não aconteceu — campo em branco, vínculo impedindo a exclusão — é validação
 * no formulário, não toast.
 *
 * Duas formas de usar:
 *   avisar(texto)        — a ação terminou e a pessoa continua nesta tela.
 *   avisarDepois(texto)  — a ação termina e a tela troca logo em seguida (salvar
 *                          e voltar para a lista). Um toast criado aqui morreria
 *                          junto com a página, então o aviso fica guardado e a
 *                          próxima tela o mostra (`mostrarAvisosPendentes`, que o
 *                          shell chama em toda tela).
 */
import { esc } from "./ui.js";

// Severidade → cor, ícone e título padrão (GESIS Padrões UX 3.2.1: Sucesso / Informação / Atenção / Erro).
const TOM = {
    ok: { classe: "text-bg-success", icone: "ti-circle-check", titulo: "Sucesso" },
    info: { classe: "text-bg-info", icone: "ti-info-circle", titulo: "Informação" },
    alerta: { classe: "text-bg-warning", icone: "ti-alert-triangle", titulo: "Atenção" },
    erro: { classe: "text-bg-danger", icone: "ti-alert-circle", titulo: "Erro" },
};

/** Limites do guia: título numa linha (34 caracteres); descrição em até duas linhas (81 caracteres). */
export const LIMITE_TITULO = 34;
export const LIMITE_DESCRICAO = 81;

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
 * Toast com título + descrição, de 350 px de largura e altura que acompanha o texto.
 * @param {string} texto  a descrição (até 81 caracteres)
 * @param {"ok"|"info"|"alerta"|"erro"} [tom]
 * @param {string} [titulo]  só quando precisar fugir do padrão da severidade (até 34 caracteres)
 */
export function avisar(texto, tom = "ok", titulo = "") {
    const { classe, icone, titulo: padrao } = TOM[tom] || TOM.ok;
    const nome = titulo || padrao;
    if (nome.length > LIMITE_TITULO) console.warn(`Toast: título com ${nome.length} caracteres (máximo ${LIMITE_TITULO}).`);
    if (texto.length > LIMITE_DESCRICAO) console.warn(`Toast: descrição com ${texto.length} caracteres (máximo ${LIMITE_DESCRICAO}).`);
    const el = document.createElement("div");
    el.className = `toast shadow-lg border-0 ${classe}`;
    el.style.width = "350px";
    el.setAttribute("role", "alert");
    el.setAttribute("aria-live", "assertive");
    el.setAttribute("aria-atomic", "true");
    el.innerHTML = `
    <div class="d-flex align-items-start gap-2 p-3">
        <i class="ti ${icone} fs-20 flex-shrink-0"></i>
        <div class="flex-grow-1" style="min-width:0">
            <div class="fw-semibold fs-14 text-truncate">${esc(nome)}</div>
            <div class="fs-13">${esc(texto)}</div>
        </div>
        <button type="button" class="btn-close btn-close-white flex-shrink-0"
                data-bs-dismiss="toast" aria-label="Fechar"></button>
    </div>`;

    container().appendChild(el);
    // GESIS Padrões UX 3.2.1: 3000 ms por padrão, e não se pode diminuir.
    const toast = new bootstrap.Toast(el, { delay: 3000 });
    el.addEventListener("hidden.bs.toast", () => el.remove());
    toast.show();
}

const CHAVE_AVISOS = "siplam.avisos";

/** Guarda um aviso para a próxima tela: use quando a navegação vem logo depois da ação. */
export function avisarDepois(texto, tom = "ok") {
    try {
        const fila = JSON.parse(sessionStorage.getItem(CHAVE_AVISOS) || "[]");
        fila.push({ texto, tom });
        sessionStorage.setItem(CHAVE_AVISOS, JSON.stringify(fila));
    } catch {
        // Sem sessionStorage o aviso se perde, mas a ação já foi feita.
    }
}

/** Mostra os avisos guardados pela tela anterior. O shell chama isto em toda tela. */
export function mostrarAvisosPendentes() {
    try {
        const fila = JSON.parse(sessionStorage.getItem(CHAVE_AVISOS) || "[]");
        sessionStorage.removeItem(CHAVE_AVISOS);
        for (const a of fila) avisar(a.texto, a.tom);
    } catch {
        // fila ilegível: segue sem avisos
    }
}
