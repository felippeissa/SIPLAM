/* Receitas de captura — telas novas: Home do setorial, documentos, Histórico e chat. */
(() => {
    window.R3 = {};
    const home = "/ppa-detalhe.html?id=ppa-2028";
    const comDocumentos = async (fn) => {
        const S = await import("/assets/js/dados/store.js");
        S.obterEstado();
        const base = localStorage.getItem("siplam.estado.v1");
        try {
            S.updPpa("ppa-2028", { documentos: [
                { nome: "Minuta do PPA 2028-2031.pdf", tamanho: 842000, em: "09/10/2026", descricao: "Texto-base enviado à Assembleia Legislativa, versão de 09/10.", dados: "data:application/pdf;base64,JVBERi0=" },
                { nome: "Parecer da Procuradoria.pdf", tamanho: 213000, em: "11/10/2026", descricao: "Parecer sobre a minuta do plano.", dados: "data:application/pdf;base64,JVBERi0=" },
            ] });
            return await fn();
        } finally { localStorage.setItem("siplam.estado.v1", base); }
    };
    R3.home = async () => {
        const R = [];
        R.push(await capN("f03_08_home_setorial", home, { ls: { ...ADM, "siplam.perfilSessao": "setorial" } }));
        await comDocumentos(async () => {
            R.push(await capN("f03_09_documentos", home, { prep: async (w, d) => { d.querySelector("#arquivo-documento").closest(".p-3").scrollIntoView(); } }));
            R.push(await capN("f03_10_excluir_documento", home, { fixo: true, prep: async (w, d) => { await clique(d, "[data-remover]", 1000); } }));
            R.push(await capN("f03_11_documentos_setorial", home, { ls: { ...ADM, "siplam.perfilSessao": "setorial" } }));
        });
        return R.map((r) => r.nome + ":" + r.nos);
    };
    R3.historico = async () => {
        const R = [], h = "/central-historico.html";
        R.push(await capN("f16_01_lista", h));
        R.push(await capN("f16_02_busca", h, { prep: async (w, d) => { setv(d, "#filtro-livre", "Eixo"); await clique(d, "#filtro-buscar", 600); } }));
        R.push(await capN("f16_03_filtro", h, { prep: async (w, d) => { await clique(d, "#barra-filtros .choices", 700); } }));
        R.push(await capN("f16_04_ficha_edicao", h, { fixo: true, prep: async (w, d) => { const tr = [...d.querySelectorAll("#corpo-lista tr")].find((x) => /Editou/.test(x.textContent)); tr.click(); await esp(1000); } }));
        R.push(await capN("f16_05_ficha_exclusao", h, { fixo: true, prep: async (w, d) => { const tr = [...d.querySelectorAll("#corpo-lista tr")].find((x) => /Excluiu/.test(x.textContent)); tr.click(); await esp(1000); } }));
        R.push(await capN("f16_06_sem_acesso", h, { ls: { ...ADM, "siplam.perfilSessao": "setorial" } }));
        return R.map((r) => r.nome + ":" + r.nos);
    };
    R3.chat = async () => {
        const R = [], pg = "/ppa-detalhe.html?id=ppa-2028";
        const abrir = async (d) => { await clique(d, "#chat-fab", 600); };
        R.push(await capN("f17_01_botao", pg, { fixo: true }));
        R.push(await capN("f17_02_conversas", pg, { fixo: true, prep: async (w, d) => { await abrir(d); } }));
        R.push(await capN("f17_03_conversa", pg, { fixo: true, prep: async (w, d) => { await abrir(d); await clique(d, "[data-com]", 600); } }));
        R.push(await capN("f17_04_trecho_marcado", pg, { fixo: true, prep: async (w, d) => {
            await abrir(d); await clique(d, "[data-com]", 600); await clique(d, "#chat-marcar", 400);
            const alvo = d.querySelector("h3"); const b = alvo.getBoundingClientRect();
            const ev = (t) => new w.MouseEvent(t, { clientX: b.left + 5, clientY: b.top + 5, bubbles: true, cancelable: true });
            d.dispatchEvent(ev("mousemove")); d.dispatchEvent(ev("click")); await esp(500); setv(d, "#chat-texto", "Pode me ajudar com este trecho?"); } }));
        R.push(await capN("f17_05_mensagem_enviada", pg, { fixo: true, prep: async (w, d) => {
            await abrir(d); await clique(d, "[data-com]", 600); await clique(d, "#chat-marcar", 400);
            const alvo = d.querySelector("h3"); const b = alvo.getBoundingClientRect();
            const ev = (t) => new w.MouseEvent(t, { clientX: b.left + 5, clientY: b.top + 5, bubbles: true, cancelable: true });
            d.dispatchEvent(ev("mousemove")); d.dispatchEvent(ev("click")); await esp(500);
            setv(d, "#chat-texto", "Pode me ajudar com este trecho?");
            d.getElementById("chat-form").dispatchEvent(new w.Event("submit", { cancelable: true, bubbles: true })); await esp(600); } }));
        localStorage.removeItem("siplam.chat");
        return R.map((r) => r.nome + ":" + r.nos);
    };
})();
