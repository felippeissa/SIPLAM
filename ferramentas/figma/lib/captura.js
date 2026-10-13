/* Funções de captura: abrem uma página num iframe 1440px, preparam o estado, extraem e enviam à ponte. */
(async () => {
    (0, eval)(await (await fetch("http://localhost:9230/lib/extrator.js")).text());
    window.esp = (ms) => new Promise((r) => setTimeout(r, ms));
    window.setv = (d, sel, v) => {
        const e = typeof sel === "string" ? d.querySelector(sel) : sel;
        e.focus();
        e.value = v;
        e.dispatchEvent(new Event("input", { bubbles: true }));
        e.dispatchEvent(new Event("change", { bubbles: true }));
    };
    window.clk = (d, sel) => (typeof sel === "string" ? d.querySelector(sel) : sel).click();
    window.porTexto = (d, seletor, texto) => [...d.querySelectorAll(seletor)].find((e) => e.textContent.replace(/\s+/g, " ").trim().includes(texto));
    window.capturar = async function (url, nome, preparo, larg = 1440, fixo = false) {
        const f = document.createElement("iframe");
        f.style.cssText = `position:fixed;left:-9000px;top:0;width:${larg}px;height:900px;border:0`;
        f.src = url;
        document.body.appendChild(f);
        await new Promise((r) => (f.onload = r));
        await esp(1500);
        if (preparo) {
            await preparo(f.contentWindow, f.contentDocument, f);
            await esp(800);
        }
        // janelas modais: a animação de entrada não roda fora da tela, então vai direto ao estado final
        f.contentDocument.querySelectorAll(".modal.show").forEach((m) => {
            m.style.setProperty("transition", "none", "important");
            m.style.setProperty("opacity", "1", "important");
            const dl = m.querySelector(".modal-dialog");
            if (dl) { dl.style.setProperty("transition", "none", "important"); dl.style.setProperty("transform", "none", "important"); dl.style.setProperty("opacity", "1", "important"); }
        });
        f.contentDocument.querySelectorAll(".modal-backdrop").forEach((b) => { b.style.setProperty("transition", "none", "important"); b.style.setProperty("opacity", "0.5", "important"); });
        const h = fixo ? 900 : Math.max(900, f.contentDocument.documentElement.scrollHeight);
        f.style.height = h + "px";
        await esp(600);
        const dados = extrairTela(f.contentWindow, f.contentDocument);
        if (fixo) dados.h = 900;
        const r = await fetch("http://localhost:9230/salvar?nome=" + nome, { method: "POST", body: JSON.stringify(dados) });
        const j = await r.json();
        f.remove();
        const cont = (a) => a.reduce((s, n) => s + 1 + (n.f ? cont(n.f) : 0), 0);
        return { nome, h: dados.h, nos: cont(dados.f), bytes: j.bytes };
    };
    window.cap = async (nome, url, o = {}) => {
        for (const k of o.rm || []) localStorage.removeItem(k);
        for (const [k, v] of Object.entries(o.ls || {})) localStorage.setItem(k, v);
        return capturar(url, nome, o.prep, 1440, !!o.fixo);
    };
    window.__capOk = true;
})();
