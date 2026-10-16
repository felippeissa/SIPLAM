/**
 * Chat da equipe do PPA — janela flutuante, presente em todas as telas.
 *
 * Fica por cima da página sem bloqueá-la: dá para conversar e continuar navegando. A conversa
 * pode levar um trecho da tela, marcado com o mouse, para dizer onde se precisa de ajuda.
 *
 * Sem servidor nem identidade de usuário: a conversa fica no navegador, e quem escreve aparece
 * pelo perfil com que entrou. Uma conversa por perfil e por pessoa da equipe.
 */
import { ppaCorrente } from "./dados/store.js";
import { equipeDoPlano } from "./ppa-equipe-dados.js";
import { perfilAtual, url } from "./shell.js";
import { esc } from "./ui.js";

const CHAVE_CHAT = "siplam.chat";
const CHAVE_ABERTO = "siplam.chatAberto"; // sessionStorage: conversa aberta, para seguir entre telas
const CHAVE_DESTAQUE = "siplam.chatDestaque"; // sessionStorage: trecho a destacar ao chegar na tela

const lerChat = () => {
    try {
        return JSON.parse(localStorage.getItem(CHAVE_CHAT)) ?? {};
    } catch {
        return {};
    }
};
const lerSessao = (k) => {
    try {
        return JSON.parse(sessionStorage.getItem(k));
    } catch {
        return null;
    }
};
const gravarSessao = (k, v) => {
    try {
        v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, JSON.stringify(v));
    } catch {}
};

const pagina = () => location.pathname.split("/").pop() || "index.html";

/** Um caminho CSS que reencontra o elemento na mesma tela. */
function seletorDe(el) {
    const partes = [];
    while (el && el.nodeType === 1 && el !== document.body) {
        if (el.id) {
            partes.unshift(`#${CSS.escape(el.id)}`);
            break;
        }
        const irmaos = [...el.parentNode.children].filter((x) => x.tagName === el.tagName);
        partes.unshift(`${el.tagName.toLowerCase()}${irmaos.length > 1 ? `:nth-of-type(${irmaos.indexOf(el) + 1})` : ""}`);
        el = el.parentNode;
    }
    return partes.join(" > ");
}

const resumo = (t) => {
    const s = t.replace(/\s+/g, " ").trim();
    return s.length > 110 ? `${s.slice(0, 110)}…` : s;
};

function destacar(seletor) {
    let alvo = null;
    try {
        alvo = document.querySelector(seletor);
    } catch {}
    if (!alvo) return false;
    alvo.scrollIntoView({ block: "center", behavior: "smooth" });
    const r = alvo.getBoundingClientRect();
    const moldura = document.createElement("div");
    moldura.className = "chat-moldura chat-moldura-fixa";
    document.body.appendChild(moldura);
    setTimeout(() => {
        const b = alvo.getBoundingClientRect();
        Object.assign(moldura.style, { left: `${b.left - 4}px`, top: `${b.top - 4}px`, width: `${b.width + 8}px`, height: `${b.height + 8}px` });
    }, 350);
    Object.assign(moldura.style, { left: `${r.left - 4}px`, top: `${r.top - 4}px`, width: `${r.width + 8}px`, height: `${r.height + 8}px` });
    setTimeout(() => moldura.remove(), 4500);
    return true;
}

const CSS_CHAT = `
.chat-fab{position:fixed;right:20px;bottom:20px;z-index:1050;width:52px;height:52px;border-radius:50%;border:0;background:var(--theme-primary,#1ab394);color:#fff;box-shadow:0 4px 14px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;font-size:24px}
.chat-fab .chat-nao-lidas{position:absolute;top:-2px;right:-2px}
.chat-janela{position:fixed;right:20px;bottom:84px;z-index:1050;width:360px;max-width:calc(100vw - 24px);height:480px;max-height:calc(100vh - 110px);background:#fff;color:#4c4c5c;border:1px solid var(--theme-border-color,#edf2f9);border-radius:10px;box-shadow:0 8px 28px rgba(0,0,0,.28);display:flex;flex-direction:column;overflow:hidden}
.chat-janela[hidden]{display:none}
[data-bs-theme=dark] .chat-janela{background:#1f2227;color:#dee2e6}
.chat-cab{background:#f6f7f9}
[data-bs-theme=dark] .chat-cab{background:#272b31}
.chat-cab{padding:10px 12px;border-bottom:1px solid var(--theme-border-color,#edf2f9);display:flex;align-items:center;gap:8px}
.chat-lista button.item{width:100%;text-align:left;background:none;border:0;border-bottom:1px dashed var(--theme-border-color,#edf2f9);padding:10px 12px;display:flex;gap:10px;align-items:center;color:inherit}
.chat-lista button.item:hover{background:var(--theme-tertiary-bg,#f6f7fb)}
.chat-msgs{flex:1;overflow:auto;padding:12px}
.chat-bolha{max-width:88%;white-space:pre-wrap;word-break:break-word}
.chat-trecho{display:block;width:100%;text-align:left;border:1px dashed currentColor;border-radius:6px;background:rgba(255,255,255,.12);color:inherit;padding:6px 8px;margin-bottom:6px;font-size:12px}
.chat-moldura{position:absolute;z-index:1060;pointer-events:none;border:2px solid #f59f00;background:rgba(245,159,0,.14);border-radius:4px;transition:all .06s}
.chat-moldura-fixa{position:fixed;animation:chat-pisca 1s ease-in-out 3}
@keyframes chat-pisca{50%{background:rgba(245,159,0,.4)}}
.chat-selecionando,.chat-selecionando *{cursor:crosshair!important}
.chat-aviso-selecao{position:fixed;left:50%;top:16px;transform:translateX(-50%);z-index:1070;background:#212529;color:#fff;padding:8px 14px;border-radius:8px;font-size:13px;box-shadow:0 4px 14px rgba(0,0,0,.3)}
`;

export function instalarChat(estado) {
    const ppa = ppaCorrente(estado);
    const eu = perfilAtual();
    if (!ppa || !eu) return;
    const equipe = equipeDoPlano(estado, ppa);
    if (!equipe.length) return;

    document.head.insertAdjacentHTML("beforeend", `<style>${CSS_CHAT}</style>`);
    document.body.insertAdjacentHTML(
        "beforeend",
        `<button type="button" class="chat-fab" id="chat-fab" title="Chat da equipe" aria-label="Chat da equipe"><i class="ti ti-message-circle"></i></button>
        <div class="chat-janela" id="chat-janela" hidden role="dialog" aria-label="Chat da equipe"></div>`
    );
    const fab = document.getElementById("chat-fab");
    const janela = document.getElementById("chat-janela");

    let aberto = lerSessao(CHAVE_ABERTO); // { janela: bool, com: id|null }
    aberto = aberto ?? { janela: false, com: null };
    let pendente = null; // trecho marcado, ainda não enviado
    let rascunho = "";

    const salvar = () => gravarSessao(CHAVE_ABERTO, aberto);
    const chaveDe = (id) => `${eu}|${id}`;

    function pintarLista() {
        const tudo = lerChat();
        janela.innerHTML = `
        <div class="chat-cab"><i class="ti ti-messages fs-18"></i><div class="flex-grow-1"><div class="fw-semibold fs-14">Chat da equipe</div><div class="text-muted fs-xxs">PPA ${esc(String(ppa.primeiroAno))}–${esc(String(ppa.ultimoAno))}</div></div>
            <button type="button" class="btn-close" data-fechar aria-label="Fechar"></button></div>
        <div class="chat-lista flex-grow-1 overflow-auto">${equipe
            .map((m) => {
                const ms = tudo[chaveDe(m.id)] ?? [];
                const ult = ms.at(-1);
                return `<button type="button" class="item" data-com="${esc(m.id)}">
                    <span class="avatar avatar-sm"><span class="avatar-title rounded-circle text-bg-primary">${esc(m.nome.charAt(0))}</span></span>
                    <span class="flex-grow-1" style="min-width:0"><span class="d-block fs-13 fw-medium text-truncate">${esc(m.nome)}</span>
                    <span class="d-block fs-xxs text-muted text-truncate">${ult ? esc(ult.texto || "Trecho da tela") : esc(m.funcao)}</span></span></button>`;
            })
            .join("")}</div>`;
    }

    function pintarConversa() {
        const m = equipe.find((x) => x.id === aberto.com);
        if (!m) {
            aberto.com = null;
            salvar();
            return pintarLista();
        }
        const ms = lerChat()[chaveDe(m.id)] ?? [];
        janela.innerHTML = `
        <div class="chat-cab"><button type="button" class="btn btn-light btn-sm btn-icon rounded-circle" data-voltar title="Conversas" aria-label="Voltar"><i class="ti ti-arrow-left"></i></button>
            <div class="flex-grow-1" style="min-width:0"><div class="fw-semibold fs-14 text-truncate">${esc(m.nome)}</div><div class="text-muted fs-xxs text-truncate">${esc(m.funcao)}</div></div>
            <button type="button" class="btn-close" data-fechar aria-label="Fechar"></button></div>
        <div class="chat-msgs" id="chat-msgs">${
            ms.length
                ? ms
                      .map(
                          (x, i) => `<div class="d-flex flex-column align-items-end mb-2"><div class="chat-bolha rounded px-3 py-2 text-bg-primary fs-13">
                        ${x.trecho ? `<button type="button" class="chat-trecho" data-trecho="${i}"><i class="ti ti-viewfinder me-1"></i>Trecho da tela: “${esc(x.trecho.texto || x.trecho.seletor)}”<span class="d-block fs-xxs opacity-75">${esc(x.trecho.titulo)} · Ver na tela</span></button>` : ""}
                        ${x.texto ? esc(x.texto) : ""}</div><span class="text-muted fs-xxs mt-1">${esc(x.em)}</span></div>`
                      )
                      .join("")
                : `<p class="text-muted fs-13 text-center py-4 mb-0">Nenhuma mensagem ainda. Comece a conversa com ${esc(m.nome)}.</p>`
        }</div>
        <form class="border-top p-2" id="chat-form">
            ${pendente ? `<div class="d-flex align-items-center gap-2 border border-dashed rounded px-2 py-1 mb-2 fs-12"><i class="ti ti-viewfinder"></i><span class="flex-grow-1 text-truncate">${esc(pendente.texto || pendente.seletor)}</span><button type="button" class="btn-close btn-sm" data-tirar aria-label="Tirar trecho"></button></div>` : ""}
            <div class="d-flex gap-2">
                <button type="button" class="btn btn-light btn-icon flex-shrink-0" id="chat-marcar" title="Marcar um trecho da tela" aria-label="Marcar um trecho da tela"><i class="ti ti-viewfinder"></i></button>
                <input type="text" class="form-control" id="chat-texto" autocomplete="off" placeholder="Escreva uma mensagem…" value="${esc(rascunho)}" />
                <button type="submit" class="btn btn-primary btn-icon flex-shrink-0" aria-label="Enviar"><i class="ti ti-send"></i></button>
            </div></form>`;
        const lista = janela.querySelector("#chat-msgs");
        lista.scrollTop = lista.scrollHeight;
        const campo = janela.querySelector("#chat-texto");
        campo.addEventListener("input", () => (rascunho = campo.value));
        janela.querySelector("#chat-form").addEventListener("submit", (e) => {
            e.preventDefault();
            const texto = campo.value.trim();
            if (!texto && !pendente) return;
            const tudo = lerChat();
            const agora = new Date();
            tudo[chaveDe(m.id)] = [
                ...(tudo[chaveDe(m.id)] ?? []),
                { texto, trecho: pendente ?? undefined, em: `${agora.toLocaleDateString("pt-BR")} ${agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` },
            ];
            try {
                localStorage.setItem(CHAVE_CHAT, JSON.stringify(tudo));
            } catch {}
            pendente = null;
            rascunho = "";
            pintarConversa();
            janela.querySelector("#chat-texto").focus();
        });
        janela.querySelector("#chat-marcar").addEventListener("click", marcarTrecho);
        janela.querySelector("[data-tirar]")?.addEventListener("click", () => {
            pendente = null;
            pintarConversa();
        });
        janela.querySelectorAll("[data-trecho]").forEach((b) =>
            b.addEventListener("click", () => {
                const t = ms[Number(b.dataset.trecho)].trecho;
                if (t.pagina === pagina() && t.busca === location.search) {
                    if (!destacar(t.seletor)) alert("Esse trecho não está mais nesta tela.");
                } else {
                    gravarSessao(CHAVE_DESTAQUE, t.seletor);
                    location.href = url(t.pagina) + t.busca;
                }
            })
        );
    }

    function pintar() {
        janela.hidden = !aberto.janela;
        if (!aberto.janela) return;
        aberto.com ? pintarConversa() : pintarLista();
    }

    janela.addEventListener("click", (e) => {
        const com = e.target.closest("[data-com]");
        if (com) {
            aberto.com = com.dataset.com;
            salvar();
            pintarConversa();
        } else if (e.target.closest("[data-voltar]")) {
            aberto.com = null;
            pendente = null;
            salvar();
            pintarLista();
        } else if (e.target.closest("[data-fechar]")) {
            aberto.janela = false;
            salvar();
            pintar();
        }
    });
    fab.addEventListener("click", () => {
        aberto.janela = !aberto.janela;
        salvar();
        pintar();
    });
    // Outros pontos da tela abrem a conversa com alguém da equipe.
    window.addEventListener("siplam:chat", (e) => {
        aberto = { janela: true, com: e.detail?.id ?? null };
        salvar();
        pintar();
    });

    /** Escolher com o mouse o trecho da tela de que se precisa ajuda. */
    function marcarTrecho() {
        janela.hidden = true;
        document.body.classList.add("chat-selecionando");
        const moldura = document.createElement("div");
        moldura.className = "chat-moldura";
        const aviso = document.createElement("div");
        aviso.className = "chat-aviso-selecao";
        aviso.textContent = "Clique no trecho da tela que precisa de ajuda · Esc cancela";
        document.body.append(moldura, aviso);
        let alvo = null;
        const fora = (el) => !el || el === document.body || el === document.documentElement || el.closest(".chat-janela, .chat-fab, .chat-aviso-selecao, .chat-moldura");
        const mover = (e) => {
            const el = document.elementFromPoint(e.clientX, e.clientY);
            if (fora(el)) {
                alvo = null;
                moldura.style.width = "0";
                return;
            }
            alvo = el;
            const b = el.getBoundingClientRect();
            Object.assign(moldura.style, { left: `${b.left + scrollX - 2}px`, top: `${b.top + scrollY - 2}px`, width: `${b.width + 4}px`, height: `${b.height + 4}px` });
        };
        const terminar = () => {
            document.removeEventListener("mousemove", mover, true);
            document.removeEventListener("click", clicar, true);
            document.removeEventListener("keydown", tecla, true);
            document.body.classList.remove("chat-selecionando");
            moldura.remove();
            aviso.remove();
            janela.hidden = false;
        };
        const clicar = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (alvo) {
                pendente = { pagina: pagina(), busca: location.search, titulo: document.title.replace(/\s*\|\s*SIPLAM$/, ""), seletor: seletorDe(alvo), texto: resumo(alvo.innerText || alvo.getAttribute("aria-label") || alvo.getAttribute("placeholder") || "") };
            }
            terminar();
            if (alvo) pintarConversa();
        };
        const tecla = (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                terminar();
            }
        };
        document.addEventListener("mousemove", mover, true);
        document.addEventListener("click", clicar, true);
        document.addEventListener("keydown", tecla, true);
    }

    pintar();

    // Chegou aqui por um “Ver na tela”.
    const destaque = lerSessao(CHAVE_DESTAQUE);
    if (destaque) {
        gravarSessao(CHAVE_DESTAQUE, null);
        setTimeout(() => destacar(destaque), 600);
    }
}
