/**
 * Atena — camada de apoio contextual.
 * Porta `src/components/ppa/atena.tsx` do protótipo.
 *
 * Assistente determinística: as sugestões saem de regras sobre os dados já
 * existentes. Ela observa, identifica e sugere — nunca altera dado.
 */
import { sugestoesAtena, responderAtena } from "./dados/atena.js";
import { esc } from "./ui.js";

/**
 * As regras da Atena esperam as rotas do protótipo; aqui traduzimos o arquivo
 * aberto para a rota equivalente.
 */
function rotaEquivalente() {
    const pagina = location.pathname.split("/").pop() || "programas.html";
    const id = new URLSearchParams(location.search).get("id");

    if (pagina === "entrega.html" && id) return `/entrega/${id}`;
    if (pagina === "iniciativa.html" && id) return `/iniciativa/${id}`;
    if (pagina === "central-iniciativa.html" && id) return `/central/iniciativa/${id}`;
    if (pagina.startsWith("central")) return "/central";
    return "/";
}

/** Para onde a sugestão leva, quando ela aponta um componente. */
function destino(s) {
    const id = s.params?.id;
    if (!s.to || !id) return null;
    if (s.to.includes("entrega")) return `entrega.html?id=${id}`;
    if (s.to.includes("iniciativa")) return `iniciativa.html?id=${id}`;
    if (s.to.includes("programa")) return `programa.html?id=${id}`;
    return null;
}

const TOM_NIVEL = { 3: "impeditivo", 2: "alerta", 1: "info" };
const ROTULO_NIVEL = { 3: "Vale rever", 2: "Atenção", 1: "Observação" };

export function instalarAtena(estado) {
    const sugestoes = sugestoesAtena(estado, rotaEquivalente());
    const relevantes = sugestoes.filter((s) => s.nivel >= 2).length;

    const lista = sugestoes.length
        ? sugestoes
              .map((s) => {
                  const ir = destino(s);
                  return `
        <li class="list-group-item px-0 py-3">
            <span class="chip chip-${TOM_NIVEL[s.nivel]}">${ROTULO_NIVEL[s.nivel]}</span>
            <p class="fs-13 mt-2 mb-1">${s.texto}</p>
            ${ir ? `<a href="${ir}" class="fs-12">${esc(s.rotuloAcao ?? "Abrir")}</a>` : ""}
        </li>`;
              })
              .join("")
        : '<li class="list-group-item px-0 py-3 fs-13 text-muted">Nada a observar nesta tela no momento.</li>';

    document.body.insertAdjacentHTML(
        "beforeend",
        `
    <div class="offcanvas offcanvas-end" tabindex="-1" id="painel-atena" aria-labelledby="atena-titulo">
        <div class="offcanvas-header border-bottom">
            <div>
                <h5 class="offcanvas-title" id="atena-titulo">Atena</h5>
                <span class="fs-12 text-muted">Apoio contextual — observa e sugere, não altera dados</span>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Fechar"></button>
        </div>
        <div class="offcanvas-body d-flex flex-column">
            <div class="rotulo-secao mb-1">Nesta tela</div>
            <ul class="list-group list-group-flush mb-3">${lista}</ul>

            <div class="rotulo-secao mb-2">Perguntar</div>
            <div id="atena-conversa" class="flex-grow-1 mb-2" style="overflow-y:auto"></div>
            <div class="input-group input-group-sm">
                <input type="text" class="form-control" id="atena-pergunta" placeholder="Ex.: o que falta para enviar?" />
                <button class="btn btn-primary" type="button" id="atena-enviar" aria-label="Enviar pergunta">
                    <i class="ti ti-send"></i>
                </button>
            </div>
            <p class="form-text fs-12 mb-0">Respostas por regra, a partir dos dados do plano.</p>
        </div>
    </div>`
    );

    const badge = document.getElementById("conta-atena");
    if (badge) {
        badge.textContent = relevantes;
        badge.classList.toggle("d-none", relevantes === 0);
    }

    const conversa = document.getElementById("atena-conversa");
    const campo = document.getElementById("atena-pergunta");

    function dizer(autor, texto) {
        const meu = autor === "usuario";
        conversa.insertAdjacentHTML(
            "beforeend",
            `<div class="d-flex ${meu ? "justify-content-end" : ""} mb-2">
                <div class="px-3 py-2 rounded fs-13 ${meu ? "bg-primary text-white" : "bg-light-subtle border"}" style="max-width:85%">
                    ${esc(texto)}
                </div>
            </div>`
        );
        conversa.scrollTop = conversa.scrollHeight;
    }

    function perguntar() {
        const texto = campo.value.trim();
        if (!texto) return;
        dizer("usuario", texto);
        campo.value = "";
        const resposta =
            responderAtena(estado, texto) ??
            "Ainda não sei responder isso. Nesta versão, respondo sobre pendências, prazos de envio, financeiro e cobertura de causas.";
        setTimeout(() => dizer("atena", resposta), 180);
    }

    document.getElementById("atena-enviar").addEventListener("click", perguntar);
    campo.addEventListener("keydown", (e) => {
        if (e.key === "Enter") perguntar();
    });

    document.getElementById("abrir-atena")?.addEventListener("click", () => {
        bootstrap.Offcanvas.getOrCreateInstance(document.getElementById("painel-atena")).show();
    });
}
