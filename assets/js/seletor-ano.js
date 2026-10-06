/**
 * Seletor de ano: um "calendário" que só tem anos.
 *
 * É o que a matriz de mapeamento pede para a vigência do PPA — "apresentar
 * calendário somente com anos; para registro, será considerado sempre
 * 01/01/ano (início) e 31/12/ano (fim)". Um `select` de anos serve para o
 * olho, mas não diz que o plano vai de um dia de janeiro a um dia de dezembro;
 * o calendário em grade é o gesto que a matriz descreve.
 *
 * O valor mora num `<input readonly>` comum, com o id que a tela escolher. Assim
 * quem lê o formulário continua lendo `value`, e quem escuta `change` é avisado
 * quando o ano muda — o seletor é só o jeito de preencher.
 */

const POR_PAGINA = 12;

/** O HTML do campo. O painel nasce fechado e é desenhado ao abrir. */
export function seletorDeAno({ id, valor = "", desabilitado = false, rotulo = "Ano" }) {
    return `
    <div class="seletor-ano" data-seletor-ano="${id}">
        <div class="input-group">
            <input type="text" class="form-control" id="${id}" value="${valor}" readonly
                   placeholder="aaaa" aria-label="${rotulo}" ${desabilitado ? "disabled" : ""} />
            <button type="button" class="btn btn-light" data-abrir-ano aria-label="Escolher o ano" ${desabilitado ? "disabled" : ""}>
                <i class="ti ti-calendar"></i>
            </button>
        </div>
        <div class="seletor-ano-painel d-none" role="dialog" aria-label="Escolher o ano"></div>
    </div>`;
}

let ouvindoForaDaTela = false;

/** Liga todos os seletores de ano de dentro de `escopo`. */
export function ligarSeletoresDeAno(escopo) {
    for (const seletor of escopo.querySelectorAll("[data-seletor-ano]")) {
        if (seletor.dataset.ligado) continue;
        seletor.dataset.ligado = "1";

        const campo = seletor.querySelector("input");
        const painel = seletor.querySelector(".seletor-ano-painel");
        let inicio = 0;

        /** Onde a grade abre: a página que contém o ano já escolhido, ou a do ano corrente. */
        const paginaDe = (ano) => Math.floor(ano / POR_PAGINA) * POR_PAGINA;
        const anoAtual = () => Number(campo.value) || new Date().getFullYear();

        const desenhar = () => {
            const escolhido = Number(campo.value);
            const anos = Array.from({ length: POR_PAGINA }, (_, n) => inicio + n);
            painel.innerHTML = `
            <div class="d-flex align-items-center justify-content-between mb-2">
                <button type="button" class="btn btn-sm btn-light" data-pagina="-1" aria-label="Anos anteriores"><i class="ti ti-chevron-left"></i></button>
                <span class="fw-semibold fs-13">${anos[0]} – ${anos.at(-1)}</span>
                <button type="button" class="btn btn-sm btn-light" data-pagina="1" aria-label="Próximos anos"><i class="ti ti-chevron-right"></i></button>
            </div>
            <div class="seletor-ano-grade">
                ${anos
                    .map(
                        (a) => `
                <button type="button" class="seletor-ano-item${a === escolhido ? " ativo" : ""}${a === new Date().getFullYear() ? " corrente" : ""}" data-ano="${a}">${a}</button>`
                    )
                    .join("")}
            </div>`;
        };

        const abrir = () => {
            // Um painel aberto por vez.
            document.querySelectorAll(".seletor-ano-painel:not(.d-none)").forEach((p) => p.classList.add("d-none"));
            inicio = paginaDe(anoAtual());
            desenhar();
            painel.classList.remove("d-none");
        };

        const alternar = () => (painel.classList.contains("d-none") ? abrir() : painel.classList.add("d-none"));

        seletor.querySelector("[data-abrir-ano]").addEventListener("click", alternar);
        campo.addEventListener("click", () => {
            if (!campo.disabled) alternar();
        });

        painel.addEventListener("click", (e) => {
            const pagina = e.target.closest("[data-pagina]");
            if (pagina) {
                inicio += Number(pagina.dataset.pagina) * POR_PAGINA;
                desenhar();
                return;
            }

            const item = e.target.closest("[data-ano]");
            if (!item) return;
            campo.value = item.dataset.ano;
            campo.classList.remove("is-invalid");
            painel.classList.add("d-none");
            campo.dispatchEvent(new Event("change", { bubbles: true }));
        });
    }

    // Clicar fora fecha. O ouvido é do documento, que sobrevive ao redesenho da
    // tela; sem a trava, cada redesenho somaria mais um.
    if (!ouvindoForaDaTela) {
        ouvindoForaDaTela = true;
        document.addEventListener("click", (e) => {
            // O caminho do clique é fixado no disparo: trocar de página redesenha
            // a grade, e o botão clicado já saiu da árvore quando o evento chega
            // aqui — `closest` o daria por "fora" do seletor.
            if (e.composedPath().some((n) => n.dataset && n.dataset.seletorAno)) return;
            document.querySelectorAll(".seletor-ano-painel:not(.d-none)").forEach((p) => p.classList.add("d-none"));
        });
        document.addEventListener("keydown", (e) => {
            if (e.key !== "Escape") return;
            document.querySelectorAll(".seletor-ano-painel:not(.d-none)").forEach((p) => p.classList.add("d-none"));
        });
    }
}
