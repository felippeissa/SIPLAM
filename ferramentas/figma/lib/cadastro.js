/* Captura de um cadastro (lista, criar, editar, excluir). Usa as funções de captura.js. */
(() => {
    window.abrirQuieto = async (url) => {
        const f = document.createElement("iframe");
        f.style.cssText = "position:fixed;left:-9000px;width:1440px;height:900px";
        f.src = url;
        document.body.appendChild(f);
        await new Promise((r) => (f.onload = r));
        await esp(1400);
        return f;
    };
    window.lerLista = async (url) => {
        const f = await abrirQuieto(url);
        const d = f.contentDocument;
        const linhas = [...d.querySelectorAll("#corpo-lista tr")].map((tr) => {
            const a = tr.querySelector("a[href*='editar.html']");
            const id = a ? new URL(a.href).searchParams.get("id") : null;
            return { id, nome: tr.querySelector("td.fw-medium, td")?.textContent.trim() };
        });
        f.remove();
        return linhas.filter((l) => l.id);
    };
    window.acharExcluivel = async (pasta, ids) => {
        let livre = null, bloqueado = null;
        for (const id of ids.slice(0, 14)) {
            const f = await abrirQuieto(`/${pasta}/editar.html?id=${encodeURIComponent(id)}`);
            const b = f.contentDocument.getElementById("excluir");
            if (b) {
                if (b.disabled && !bloqueado) bloqueado = id;
                if (!b.disabled && !livre) livre = id;
            }
            f.remove();
            if (livre && bloqueado) break;
        }
        return { livre, bloqueado };
    };
    /** c: { k, pasta, lista, preencher, extraCriar: [[sufixo, titulo, prep]] } */
    window.capCad = async (c) => {
        const R = [];
        const so = c.so;
        const lin = await lerLista(c.lista);
        const primeiro = lin[0];
        const palavra = (primeiro?.nome || "a").split(/\s+/).sort((a, b) => b.length - a.length)[0] || "a";
        if (!so || so === "lista") {
        R.push(await cap(c.k + "_01_lista", c.lista));
        R.push(await cap(c.k + "_02_busca", c.lista, { prep: async (w, d) => { setv(d, "#filtro-livre", palavra); d.getElementById("filtro-buscar").click(); await esp(400); } }));
        if (c.filtro) R.push(await cap(c.k + "_03_filtro", c.lista, { prep: async (w, d) => { d.querySelector("#barra-filtros .choices").click(); await esp(600); } }));
        R.push(await cap(c.k + "_04_sem_resultado", c.lista, { prep: async (w, d) => { setv(d, "#filtro-livre", "zzzz"); d.getElementById("filtro-buscar").click(); await esp(400); } }));
        }
        const criar = `/${c.pasta}/criar.html`;
        if (!so || so === "criar") {
        R.push(await cap(c.k + "_05_criar", criar));
        R.push(await cap(c.k + "_06_criar_erros", criar, { prep: async (w, d) => { d.getElementById("salvar").click(); await esp(400); } }));
        for (const [suf, , prep] of c.extraCriar || []) R.push(await cap(c.k + "_" + suf, criar, { prep }));
        if (c.preencher) R.push(await cap(c.k + "_09_criar_preenchido", criar, { prep: c.preencher }));
        }
        if (so === "lista" || so === "criar") return { telas: R.map((r) => r.nome + ":" + r.nos) };
        R.push(await cap(c.k + "_10_editar", `/${c.pasta}/editar.html?id=${encodeURIComponent(primeiro.id)}`));
        const { livre, bloqueado } = await acharExcluivel(c.pasta, lin.map((l) => l.id));
        const info = { primeiro: primeiro.id, livre, bloqueado, linhas: lin.length };
        if (livre) R.push(await cap(c.k + "_11_excluir", `/${c.pasta}/editar.html?id=${encodeURIComponent(livre)}`, { prep: async (w, d) => { d.getElementById("excluir").click(); await esp(900); } }));
        if (bloqueado) R.push(await cap(c.k + "_12_bloqueado", `/${c.pasta}/editar.html?id=${encodeURIComponent(bloqueado)}`));
        return { info, telas: R.map((r) => r.nome + ":" + r.nos) };
    };
})();
