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
import { CONTATOS_EXEMPLO, CONVERSAS_EXEMPLO } from "./dados/chat-exemplo.js";

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

/** "dd/mm/aaaa hh:mm" → número que ordena. */
const ordem = (em) => {
    const [d, h = "00:00"] = String(em ?? "").split(" ");
    const [dia, mes, ano] = d.split("/");
    return Number(`${ano ?? 0}${mes ?? 0}${dia ?? 0}${h.replace(":", "")}`) || 0;
};
/** Recebida e ainda não aberta. Mensagem sem `de` é das antigas, todas enviadas por quem escreveu. */
const naoLida = (x) => x.de === "outro" && x.lida === false;

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
.chat-fab{position:fixed;right:20px;bottom:20px;z-index:1050;height:42px;min-width:42px;padding:0 10px;border-radius:21px;border:1px solid var(--theme-border-color,#dfe3ea);background:var(--theme-body-bg,#fff);color:var(--theme-primary,#1ab394);box-shadow:0 2px 6px rgba(0,0,0,.12);display:flex;align-items:center;justify-content:center;font-size:20px;transition:box-shadow .2s,padding .45s cubic-bezier(.3,1.3,.5,1)}
.chat-fab:hover{box-shadow:0 3px 10px rgba(0,0,0,.18)}
.chat-fab .chat-nao-lidas{position:absolute;top:-3px;right:-3px;min-width:16px;height:16px;padding:0 4px;font-size:10px;line-height:16px;font-weight:600}
/* A bolinha se transforma: alonga-se numa pílula com "Chat da equipe" e volta a ser bolinha. */
.chat-rotulo{display:inline-block;max-width:0;overflow:hidden;white-space:nowrap;opacity:0;font-size:12px;font-weight:600;color:var(--theme-body-color,#4c4c5c);transition:max-width .45s cubic-bezier(.3,1.3,.5,1),opacity .25s,margin .45s}
.chat-rotulo b{color:var(--theme-primary,#1ab394);font-weight:600}
.chat-fab:hover,.chat-fab.apresentando{padding:0 16px 0 12px}
.chat-fab:hover .chat-rotulo,.chat-fab.apresentando .chat-rotulo{max-width:200px;opacity:1;margin-left:8px;transition-delay:0s,.12s,0s}
.chat-fab.apresentando .ti{animation:chat-balao 1s ease-in-out 1}
.chat-fab .chat-nao-lidas::after{content:"";position:absolute;inset:-3px;border-radius:999px;border:2px solid var(--theme-primary,#1ab394);opacity:0;animation:chat-onda 2.4s ease-out 3}
@keyframes chat-balao{0%,100%{transform:rotate(0)}25%{transform:rotate(-14deg) scale(1.12)}50%{transform:rotate(10deg) scale(1.12)}75%{transform:rotate(-4deg)}}
@keyframes chat-onda{0%{opacity:.6;transform:scale(1)}100%{opacity:0;transform:scale(1.9)}}
@media (prefers-reduced-motion:reduce){.chat-fab,.chat-rotulo{transition:none}.chat-fab.apresentando .ti,.chat-fab .chat-nao-lidas::after{animation:none}}
.chat-fab .chat-nao-lidas{position:absolute;top:-3px;right:-3px;min-width:16px;height:16px;padding:0 4px;font-size:10px;line-height:16px;font-weight:600}
.chat-janela{position:fixed;right:20px;bottom:20px;z-index:1051;width:360px;max-width:calc(100vw - 24px);height:480px;max-height:calc(100vh - 40px);background:#fff;color:#4c4c5c;border:1px solid var(--theme-border-color,#edf2f9);border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,.22);display:flex;flex-direction:column;overflow:hidden}
.chat-janela[hidden]{display:none}
/* A janela é a bolinha crescida: nasce do canto do botão, com a mesma curva do hover, e volta para ele ao fechar. */
.chat-janela.abrindo{animation:chat-crescer .45s cubic-bezier(.3,1.15,.5,1) both}
.chat-janela.fechando{animation:chat-crescer .3s cubic-bezier(.5,0,.75,0) reverse both}
.chat-janela.abrindo>*,.chat-janela.fechando>*{animation:chat-conteudo .45s ease both}
.chat-janela.fechando>*{animation-duration:.15s;animation-direction:reverse}
@keyframes chat-crescer{from{clip-path:inset(calc(100% - 42px) 0 0 calc(100% - 42px) round 21px)}to{clip-path:inset(0 round 12px)}}
@keyframes chat-conteudo{0%,35%{opacity:0}100%{opacity:1}}
.chat-fab.escondido{opacity:0;transform:scale(.6);pointer-events:none;transition:opacity .15s,transform .15s}
@media (prefers-reduced-motion:reduce){.chat-janela.abrindo,.chat-janela.fechando,.chat-janela.abrindo>*,.chat-janela.fechando>*{animation:none}}
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
    // Com quem se conversa: a equipe do plano e, para o chat não nascer vazio, os contatos de exemplo.
    const daEquipe = equipeDoPlano(estado, ppa);
    const equipe = [...daEquipe, ...CONTATOS_EXEMPLO.filter((c) => !daEquipe.some((x) => x.id === c.id))];

    // Na primeira vez de cada perfil, as conversas de exemplo entram — sem apagar nada do que já se escreveu.
    try {
        const marca = `siplam.chatExemplo|${eu}`;
        if (!localStorage.getItem(marca)) {
            const tudo = lerChat();
            for (const [id, msgs] of Object.entries(CONVERSAS_EXEMPLO)) tudo[`${eu}|${id}`] ??= msgs.map((x) => ({ ...x }));
            localStorage.setItem(CHAVE_CHAT, JSON.stringify(tudo));
            localStorage.setItem(marca, "1");
        }
    } catch {}

    document.head.insertAdjacentHTML("beforeend", `<style>${CSS_CHAT}</style>`);
    document.body.insertAdjacentHTML(
        "beforeend",
        `<button type="button" class="chat-fab" id="chat-fab" aria-label="Chat da equipe"><i class="ti ti-message-circle"></i><span class="chat-rotulo" aria-hidden="true">Chat da equipe</span></button>
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

    /** O número de não lidas no botão do chat. */
    function pintarContador() {
        const tudo = lerChat();
        const n = equipe.reduce((t, m) => t + (tudo[chaveDe(m.id)] ?? []).filter(naoLida).length, 0);
        fab.querySelector(".chat-nao-lidas")?.remove();
        if (n) fab.insertAdjacentHTML("beforeend", `<span class="chat-nao-lidas badge rounded-pill text-bg-primary">${n}</span>`);
        fab.querySelector(".chat-rotulo").innerHTML = n ? `Chat da equipe · <b>${n} nova${n > 1 ? "s" : ""}</b>` : "Chat da equipe";
        fab.setAttribute("aria-label", n ? `Chat da equipe, ${n} mensagens não lidas` : "Chat da equipe");
    }

    function pintarLista() {
        const tudo = lerChat();
        // Mais recente primeiro; quem nunca conversou fica no fim.
        const conversas = equipe
            .map((m) => {
                const ms = tudo[chaveDe(m.id)] ?? [];
                return { m, ult: ms.at(-1), naoLidas: ms.filter(naoLida).length };
            })
            .sort((a, b) => ordem(b.ult?.em) - ordem(a.ult?.em));
        const total = conversas.reduce((t, c) => t + c.naoLidas, 0);
        janela.innerHTML = `
        <div class="chat-cab"><i class="ti ti-message-circle fs-18 text-primary"></i><div class="flex-grow-1"><div class="fw-semibold fs-14">Chat da equipe</div><div class="text-muted fs-xxs">PPA ${esc(String(ppa.primeiroAno))}–${esc(String(ppa.ultimoAno))}${total ? ` · ${total} não lida${total > 1 ? "s" : ""}` : ""}</div></div>
            <button type="button" class="btn-close" data-fechar aria-label="Fechar"></button></div>
        <div class="chat-lista flex-grow-1 overflow-auto">${conversas
            .map(({ m, ult, naoLidas }) => {
                const hora = ult ? (ult.em.startsWith(new Date().toLocaleDateString("pt-BR")) ? ult.em.slice(11) : ult.em.slice(0, 5)) : "";
                const previa = ult ? `${ult.de === "outro" ? "" : "Você: "}${ult.texto || "Trecho da tela"}` : m.funcao;
                return `<button type="button" class="item" data-com="${esc(m.id)}">
                    <span class="avatar avatar-sm flex-shrink-0"><span class="avatar-title rounded-circle text-bg-primary">${esc(m.nome.charAt(0))}</span></span>
                    <span class="flex-grow-1" style="min-width:0"><span class="d-flex align-items-baseline gap-2"><span class="fs-13 ${naoLidas ? "fw-bold" : "fw-medium"} text-truncate flex-grow-1">${esc(m.nome)}</span><span class="fs-xxs ${naoLidas ? "text-primary fw-semibold" : "text-muted"} flex-shrink-0">${esc(hora)}</span></span>
                    <span class="d-flex align-items-center gap-2"><span class="d-block fs-xxs ${naoLidas ? "text-body fw-semibold" : "text-muted"} text-truncate flex-grow-1">${esc(previa)}</span>${naoLidas ? `<span class="badge rounded-pill text-bg-primary flex-shrink-0">${naoLidas}</span>` : ""}</span></span></button>`;
            })
            .join("")}</div>`;
        pintarContador();
    }

    function pintarConversa() {
        const m = equipe.find((x) => x.id === aberto.com);
        if (!m) {
            aberto.com = null;
            salvar();
            return pintarLista();
        }
        // Abrir a conversa é ler o que chegou.
        const tudoAgora = lerChat();
        const ms = tudoAgora[chaveDe(m.id)] ?? [];
        if (ms.some(naoLida)) {
            ms.forEach((x) => naoLida(x) && (x.lida = true));
            tudoAgora[chaveDe(m.id)] = ms;
            try {
                localStorage.setItem(CHAVE_CHAT, JSON.stringify(tudoAgora));
            } catch {}
        }
        pintarContador();
        janela.innerHTML = `
        <div class="chat-cab"><button type="button" class="btn btn-light btn-sm btn-icon rounded-circle" data-voltar title="Conversas" aria-label="Voltar"><i class="ti ti-arrow-left"></i></button>
            <div class="flex-grow-1" style="min-width:0"><div class="fw-semibold fs-14 text-truncate">${esc(m.nome)}</div><div class="text-muted fs-xxs text-truncate">${esc(m.funcao)}</div></div>
            <button type="button" class="btn-close" data-fechar aria-label="Fechar"></button></div>
        <div class="chat-msgs" id="chat-msgs">${
            ms.length
                ? ms
                      .map(
                          (x, i) => `<div class="d-flex flex-column ${x.de === "outro" ? "align-items-start" : "align-items-end"} mb-2"><div class="chat-bolha rounded px-3 py-2 ${x.de === "outro" ? "bg-light-subtle border text-body" : "text-bg-primary"} fs-13">${x.trecho ? `<button type="button" class="chat-trecho" data-trecho="${i}"><i class="ti ti-viewfinder me-1"></i>Trecho da tela: “${esc(x.trecho.texto || x.trecho.seletor)}”<span class="d-block fs-xxs opacity-75">${esc(x.trecho.titulo)} · Ver na tela</span></button>` : ""}${x.texto ? esc(x.texto) : ""}</div><span class="text-muted fs-xxs mt-1">${esc(x.em)}</span></div>`
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
                { de: "eu", texto, trecho: pendente ?? undefined, em: `${agora.toLocaleDateString("pt-BR")} ${agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` },
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
        const estava = !janela.hidden;
        fab.classList.toggle("escondido", aberto.janela);
        if (!aberto.janela) {
            if (!estava) return;
            // Fecha encolhendo de volta para o botão.
            janela.classList.remove("abrindo");
            janela.classList.add("fechando");
            setTimeout(() => {
                janela.classList.remove("fechando");
                if (!aberto.janela) janela.hidden = true;
            }, 300);
            return;
        }
        janela.hidden = false;
        if (!estava) {
            janela.classList.remove("fechando", "abrindo");
            void janela.offsetWidth;
            janela.classList.add("abrindo");
            setTimeout(() => janela.classList.remove("abrindo"), 500);
        }
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
    pintarContador();

    // Na primeira tela da sessão, o botão se apresenta: o balão balança e o rótulo "Chat da equipe" desliza ao lado.
    if (!aberto.janela && !lerSessao("siplam.chatApresentado")) {
        gravarSessao("siplam.chatApresentado", true);
        setTimeout(() => fab.classList.add("apresentando"), 800);
        setTimeout(() => fab.classList.remove("apresentando"), 5000);
    }

    // Chegou aqui por um “Ver na tela”.
    const destaque = lerSessao(CHAVE_DESTAQUE);
    if (destaque) {
        gravarSessao(CHAVE_DESTAQUE, null);
        setTimeout(() => destacar(destaque), 600);
    }
}
