/**
 * Texto longo em célula de tabela (GESIS 7): reticências e dica com o texto completo.
 *
 * Um só lugar para o sistema inteiro. Toda célula de texto simples com mais de 60 caracteres é limitada a duas
 * linhas, com reticências; se o texto de fato não coube, o conteúdo completo aparece numa dica ao passar o mouse.
 * Texto que cabe fica como está, sem dica.
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

    // Cortou: o texto completo aparece numa dica ao passar o mouse.
    window.bootstrap?.Tooltip.getOrCreateInstance(corpo, { title: texto, placement: "top", customClass: "dica-celula" });
}

function varrer(raiz = document) {
    raiz.querySelectorAll("table td").forEach(tratar);
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
    varrer();
}
