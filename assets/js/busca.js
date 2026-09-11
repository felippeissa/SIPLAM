/**
 * Busca global — paleta de comandos com Ctrl+K.
 * Porta `src/components/ppa/busca-global.tsx`.
 *
 * Não há equivalente no Inspinia (o protótipo usava cmdk), então a paleta é
 * construída aqui sobre o modal do Bootstrap.
 *
 * Corrige T3.7: o protótipo cortava em 30 resultados sem avisar.
 */
import { buscaGlobal } from "./dados/regras.js";
import { esc } from "./ui.js";

const GRUPOS = ["Programa", "Iniciativa", "Entrega", "Indicador", "Projeto GOMAP", "Ação Orçamentária", "IPOF"];

/** Rotas do protótipo (TanStack) para os arquivos do SIPLAM. */
function destino(r) {
    const id = r.params?.id;
    switch (r.to) {
        case "/programa/$id":
            return `programa.html?id=${id}`;
        case "/iniciativa/$id":
            return `iniciativa.html?id=${id}`;
        case "/entrega/$id":
            return `entrega.html?id=${id}`;
        case "/central/analises/projetos":
            return `central-projetos.html?q=${encodeURIComponent(r.search?.q ?? "")}`;
        case "/central/analises/ipofs":
            return `central-ipofs.html?q=${encodeURIComponent(r.search?.q ?? "")}`;
        default:
            return "central.html";
    }
}

export function instalarBusca(estado, visao) {
    const LIMITE = 30;

    document.body.insertAdjacentHTML(
        "beforeend",
        `
    <div class="modal fade" id="modal-busca" tabindex="-1" aria-labelledby="busca-titulo" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header py-2">
                    <div class="input-group">
                        <span class="input-group-text bg-transparent border-0 ps-0"><i class="ti ti-search"></i></span>
                        <input type="search" class="form-control border-0 shadow-none" id="busca-termo"
                               placeholder="Buscar Programa, Iniciativa, Entrega, Indicador, Projeto, Ação ou IPOF"
                               aria-label="Termo de busca" autocomplete="off" />
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>
                <div class="modal-body pt-1" id="busca-resultados" style="max-height:60vh;overflow-y:auto"></div>
                <div class="modal-footer py-2 fs-12 text-muted" id="busca-rodape">
                    ${visao === "central" ? "Busca em todos os órgãos." : "Busca limitada às contribuições do seu órgão."}
                </div>
            </div>
        </div>
    </div>`
    );

    const modal = document.getElementById("modal-busca");
    const campo = document.getElementById("busca-termo");
    const alvo = document.getElementById("busca-resultados");
    const rodape = document.getElementById("busca-rodape");
    let ativos = [];
    let indice = 0;

    function pintar() {
        alvo.querySelectorAll(".busca-resultado").forEach((el, i) => {
            el.classList.toggle("ativo", i === indice);
            if (i === indice) el.scrollIntoView({ block: "nearest" });
        });
    }

    function buscar() {
        const termo = campo.value;
        const escopo = visao === "central" ? undefined : estado.orgaoAtual;
        const todos = buscaGlobal(estado, termo, escopo);
        ativos = todos.slice(0, LIMITE);
        indice = 0;

        if (termo.trim().length < 2) {
            alvo.innerHTML = '<p class="fs-12 text-muted px-2 py-3 mb-0">Digite ao menos dois caracteres.</p>';
            rodape.textContent = visao === "central" ? "Busca em todos os órgãos." : "Busca limitada às contribuições do seu órgão.";
            return;
        }

        if (ativos.length === 0) {
            alvo.innerHTML = `<p class="fs-12 text-muted px-2 py-3 mb-0">Nada encontrado para “${esc(termo)}”.</p>`;
            rodape.textContent = "Nenhum resultado.";
            return;
        }

        alvo.innerHTML = GRUPOS.map((g) => {
            const doGrupo = ativos.filter((r) => r.tipo === g);
            if (doGrupo.length === 0) return "";
            return `
            <div class="busca-grupo">${g}</div>
            ${doGrupo
                .map(
                    (r) => `
            <button type="button" class="busca-resultado" data-ir="${esc(destino(r))}">
                <div class="fw-medium">${esc(r.titulo)}</div>
                <div class="fs-12 text-muted">${esc(r.contexto)}</div>
            </button>`
                )
                .join("")}`;
        }).join("");

        // O protótipo cortava em silêncio; aqui o corte é dito.
        rodape.textContent =
            todos.length > LIMITE
                ? `Exibindo ${LIMITE} de ${todos.length} resultados — refine o termo para ver os demais.`
                : `${todos.length} resultado(s).`;
        pintar();
    }

    campo.addEventListener("input", buscar);

    campo.addEventListener("keydown", (e) => {
        const itens = alvo.querySelectorAll(".busca-resultado");
        if (e.key === "ArrowDown") {
            e.preventDefault();
            indice = Math.min(indice + 1, itens.length - 1);
            pintar();
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            indice = Math.max(indice - 1, 0);
            pintar();
        } else if (e.key === "Enter") {
            e.preventDefault();
            itens[indice]?.click();
        }
    });

    alvo.addEventListener("click", (e) => {
        const item = e.target.closest("[data-ir]");
        if (item) location.href = item.dataset.ir;
    });

    modal.addEventListener("shown.bs.modal", () => {
        campo.value = "";
        buscar();
        campo.focus();
    });

    function abrir() {
        bootstrap.Modal.getOrCreateInstance(modal).show();
    }

    document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
            e.preventDefault();
            abrir();
        }
    });

    document.getElementById("abrir-busca")?.addEventListener("click", abrir);
}
