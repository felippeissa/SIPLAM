/**
 * Texto longo em célula de tabela (GESIS 7): reticências e "Ver detalhes".
 *
 * Um só lugar para o sistema inteiro. Toda célula de texto simples com mais de 60 caracteres é limitada a duas
 * linhas, com reticências; se o texto de fato não coube, aparece ao lado o ícone de detalhe, que abre uma janela com
 * o conteúdo completo. Texto que cabe fica como está, sem ícone — nada de ícone que não leva a nada.
 *
 * Só entram as células de texto puro. Célula com título e subtítulo, tags, botões ou campos é desenhada por quem a
 * conhece, e não é cortada aqui.
 */

const LIMITE = 60;

function tratar(td) {
    if (td.dataset.longo || td.children.length || td.closest("[data-sem-corte]")) return;
    const texto = td.textContent.trim().replace(/\s+/g, " ");
    if (texto.length <= LIMITE) return;
    if (!td.offsetParent) return; // oculta (recolhida): fica para quando aparecer

    const corpo = document.createElement("div");
    corpo.className = "celula-truncada";
    corpo.textContent = texto;
    td.textContent = "";
    td.append(corpo);

    td.dataset.longo = "1";
    td.dataset.textoCompleto = texto;
    if (corpo.scrollHeight <= corpo.clientHeight + 1) return; // coube: sem ícone

    td.classList.add("celula-com-detalhe");
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "btn btn-sm btn-icon btn-terciario flex-shrink-0";
    botao.dataset.verDetalhes = "1";
    botao.title = "Ver detalhes";
    botao.setAttribute("aria-label", "Ver detalhes");
    botao.innerHTML = '<i class="ti ti-info-circle fs-16"></i>';
    td.append(botao);
}

function varrer(raiz = document) {
    raiz.querySelectorAll("table td").forEach(tratar);
}

function abrirDetalhe(td) {
    const tabela = td.closest("table");
    const indice = [...td.parentElement.children].indexOf(td);
    const titulo = tabela?.querySelectorAll(":scope > thead th")[indice]?.textContent.trim() || "Detalhes";

    document.getElementById("modal-detalhe-celula")?.remove();
    const el = document.createElement("div");
    el.className = "modal fade";
    el.id = "modal-detalhe-celula";
    el.tabIndex = -1;
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title fs-15"></h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body"><p class="mb-0 campo-estatico"></p></div>
            <div class="modal-footer"><button type="button" class="btn btn-primary" data-bs-dismiss="modal">Fechar</button></div>
        </div>
    </div>`;
    el.querySelector(".modal-title").textContent = titulo;
    el.querySelector(".modal-body p").textContent = td.dataset.textoCompleto;
    document.body.append(el);
    el.addEventListener("hidden.bs.modal", () => el.remove(), { once: true });
    new window.bootstrap.Modal(el).show();
}

let agendado = false;
const agendar = () => {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(() => {
        agendado = false;
        varrer();
    });
};

/** Liga uma vez por página: acompanha as tabelas que as telas desenham depois. */
export function ligarCelulasLongas() {
    if (window.__celulasLongas) return;
    window.__celulasLongas = true;
    new MutationObserver(agendar).observe(document.body, { childList: true, subtree: true });
    document.addEventListener("click", (e) => {
        const b = e.target.closest("[data-ver-detalhes]");
        if (b) abrirDetalhe(b.closest("td"));
    });
    varrer();
}
