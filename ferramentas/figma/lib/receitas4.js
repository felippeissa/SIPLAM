/* Receitas de captura — Marcadores (Entrega 02): telas novas e telas modificadas, com as anotações. */
(() => {
    const ADM = { "siplam.perfilSessao": "admin-central", "siplam.sessao": "ativa", "siplam.ppaSelecionado": "ppa-2028" };
    const SET = { ...ADM, "siplam.perfilSessao": "setorial" };
    const GC = { ...ADM, "siplam.perfilSessao": "gestao-central" };
    const clique = async (d, sel, ms = 500) => { const e = typeof sel === "string" ? d.querySelector(sel) : sel; e.click(); await esp(ms); };
    window.R4 = {};

    /** Captura uma tela e, se pedido, grava os retângulos dos elementos a anotar (coordenadas da tela). */
    const c4 = async (nome, url, o = {}) => {
        sessionStorage.clear();
        const anot = o.anot || [];
        const prep = o.prep;
        const rects = [];
        const r = await cap(nome, url, {
            ls: o.ls || ADM,
            rm: ["siplam.tema"],
            fixo: !!o.fixo,
            prep: async (w, d, f) => {
                if (prep) await prep(w, d, f);
                await esp(300);
                for (const a of anot) {
                    const el = typeof a.alvo === "function" ? a.alvo(d) : d.querySelector(a.alvo);
                    if (!el) { rects.push({ ...a, alvo: undefined, falta: true }); continue; }
                    const b = el.getBoundingClientRect();
                    rects.push({ tipo: a.tipo, rotulo: a.rotulo, texto: a.texto, x: b.left + (a.dx || 0), y: b.top + (a.dy || 0) + (a.sobe ? 0 : 0), w: a.w ?? b.width, h: a.h ?? b.height, fantasma: !!a.fantasma });
                }
            },
        });
        if (anot.length) await fetch("http://localhost:9230/salvar?nome=an_" + nome, { method: "POST", body: JSON.stringify(rects) });
        return r.nome + ":" + r.nos + (rects.some((x) => x.falta) ? " (anotação sem alvo)" : "");
    };
    window.c4 = c4;

    /** Estado dos exemplos: Programas com marcadores e observações. Devolve o que restaurar. */
    R4.preparar = async () => {
        const base = localStorage.getItem("siplam.estado.v1");
        window.__snapMk = base;
        const e = JSON.parse(base);
        const ps = e.programas.filter((p) => p.ppaId === "ppa-2028");
        ps[0].marcadorIds = ["marcadores-ex01", "marcadores-ex02", "marcadores-ex03", "marcadores-ex09"];
        ps[0].marcadorObs = { "marcadores-ex01": "Acompanhar com o gabinete.", "marcadores-ex09": "Cronograma apertado." };
        ps[1].marcadorIds = ["marcadores-ex07"];
        ps[2].marcadorIds = ["marcadores-ex13", "marcadores-ex25"];
        ps[3].marcadorIds = ["marcadores-ex05"];
        window.__pid0 = ps[0].id;
        localStorage.setItem("siplam.estado.v1", JSON.stringify(e));
        return ps.slice(0, 5).map((p) => p.id + " " + p.nome);
    };
    R4.restaurar = () => { if (window.__snapMk) localStorage.setItem("siplam.estado.v1", window.__snapMk); sessionStorage.clear(); };

    const abrirFiltro = async (d, id) => {
        const c = d.querySelector("#" + id).closest(".choices");
        c.classList.add("is-open", "is-focused");
        const dd = c.querySelector(".choices__list--dropdown");
        dd.classList.add("is-active");
        await esp(300);
    };

    R4.novas = async () => {
        const R = [];
        const lista = "/central-marcador.html", criar = "/central-marcador/criar.html", editar = (id) => `/central-marcador/editar.html?id=${id}`;
        // M1 — listagem e busca
        R.push(await c4("mk1_01_lista", lista));
        R.push(await c4("mk1_02_busca", lista, { prep: async (w, d) => { setv(d, "#filtro-livre", "prioridade"); await clique(d, "#filtro-buscar", 500); } }));
        R.push(await c4("mk1_03_sem_resultado", lista, { prep: async (w, d) => { setv(d, "#filtro-livre", "zzzz"); await clique(d, "#filtro-buscar", 500); } }));
        R.push(await c4("mk1_04_lista_setorial", lista, { ls: SET }));
        // M2 — criar
        R.push(await c4("mk2_01_criar_admin", criar, { fixo: true }));
        R.push(await c4("mk2_02_erros", criar, { fixo: true, prep: async (w, d) => { await clique(d, "#salvar", 400); } }));
        R.push(await c4("mk2_03_preenchido", criar, { fixo: true, prep: async (w, d) => {
            setv(d, "#f-nome", "Meta do governador"); setv(d, "#f-area", "perfil:gestao-setorial");
            setv(d, "#f-descricao", "Programas com meta acompanhada direto pelo governador no ciclo.");
            d.querySelector('input[name="f-cor"][value="#7266BA"]').click(); await esp(300);
            setv(d, "#f-nome", "Meta do governador"); } }));
        R.push(await c4("mk2_04_criar_setorial", criar, { fixo: true, ls: SET, prep: async (w, d) => { setv(d, "#f-nome", "Rever com o gabinete"); await esp(200); } }));
        // M3 — editar e excluir
        R.push(await c4("mk3_01_editar", editar("marcadores-ex01"), { fixo: true }));
        R.push(await c4("mk3_02_leitura_setorial", editar("marcadores-ex01"), { fixo: true, ls: SET }));
        R.push(await c4("mk3_03_excluir", editar("marcadores-ex10"), { fixo: true, prep: async (w, d) => { await clique(d, "#excluir", 1000); } }));
        R.push(await c4("mk3_04_excluir_bloqueado", editar("marcadores-ex05"), { fixo: true }));
        return R;
    };

    R4.programas = async () => {
        const R = [];
        const cad = "/central-programas.html";
        R.push(await c4("mk4_01_cadastro", cad));
        R.push(await c4("mk4_02_dica", cad, { fixo: true, prep: async (w, d) => {
            const el = d.querySelector("#corpo-lista [data-marcador-nome]"); w.bootstrap.Tooltip.getInstance(el).show(); await esp(500);
            d.querySelectorAll(".tooltip").forEach((t) => t.style.setProperty("opacity", "1", "important")); } }));
        R.push(await c4("mk4_03_filtro", cad, { fixo: true, prep: async (w, d) => { await abrirFiltro(d, "filtro-marcador"); } }));
        R.push(await c4("mk4_04_janela_dropdown", cad, { fixo: true, prep: async (w, d) => {
            const bots = [...d.querySelectorAll("#corpo-lista tr")].find((t) => !t.querySelector("[data-marcador-nome]")).querySelector("[data-marcar]"); bots.click(); await esp(1000); } }));
        R.push(await c4("mk4_05_janela_previa", cad, { fixo: true, prep: async (w, d) => {
            const bots = [...d.querySelectorAll("#corpo-lista tr")].find((t) => !t.querySelector("[data-marcador-nome]")).querySelector("[data-marcar]"); bots.click(); await esp(1000);
            const s = d.getElementById("mm-escolha"); s.value = "marcadores-ex11"; s.dispatchEvent(new w.Event("change", { bubbles: true }));
            setv(d, "#mm-obs", "Depende da assinatura do convênio com a União."); await esp(300); } }));
        R.push(await c4("mk4_06_janela_lista", cad, { fixo: true, prep: async (w, d) => {
            d.querySelector("#corpo-lista tr [data-marcar]").click(); await esp(1000); } }));
        R.push(await c4("mk4_07_formulario", "/central-programas/editar.html?id=" + window.__pid0, { fixo: true, prep: async (w, d) => {
            d.getElementById("f-marcadores-botao").click(); await esp(500); } }));
        R.push(await c4("mk4_08_home", "/ppa-detalhe.html?id=ppa-2028"));
        R.push(await c4("mk4_09_setorial", "/programas.html", { ls: SET }));
        return R;
    };

    /** Só as telas de menu (as âncoras do menu têm href absoluto). */
    R4.menus = async () => {
        const R = [];
        const md = await R4.modificadas();
        return md.filter((x) => /^md_0[126]/.test(x));
    };

    /** As telas modificadas, com os retângulos de anotação. */
    R4.modificadas = async () => {
        const R = [];
        const filtroDe = (id) => (d) => d.querySelector("#" + id).closest(".choices");
        R.push(await c4("md_01_menu_admin", "/central-marcador.html", { fixo: true, anot: [
            { alvo: (d) => d.querySelector('.side-nav a[href$="central-marcador.html"]'), tipo: "novo", rotulo: "ADICIONADO", texto: "Item Marcadores no grupo Gestão" },
            { alvo: (d) => d.querySelector('.side-nav a[href$="central-marcador.html"]'), dy: 44, tipo: "exc", rotulo: "EXCLUÍDO", texto: "Histórico saiu do menu Gestão", fantasma: true },
        ] }));
        R.push(await c4("md_02_menu_gestao_central", "/central-marcador.html", { fixo: true, ls: GC, anot: [
            { alvo: (d) => d.querySelector('.side-nav a[href$="central-marcador.html"]'), tipo: "mod", rotulo: "ALTERADO", texto: "Alta gestão central volta a ver Gestão, só com Marcadores" },
        ] }));
        R.push(await c4("md_03_cadastro_programa", "/central-programas.html", { anot: [
            { alvo: (d) => d.querySelector("thead th:first-child"), tipo: "novo", rotulo: "ADICIONADO", texto: "Coluna Marcador, com selo na cor e dica" },
            { alvo: filtroDe("filtro-marcador"), tipo: "novo", rotulo: "ADICIONADO", texto: "Filtro Marcador" },
            { alvo: (d) => d.querySelector("#corpo-lista tr [data-marcar]"), tipo: "novo", rotulo: "ADICIONADO", texto: "Botão Adicionar marcadores" },
            { alvo: (d) => d.querySelector("thead th.coluna-acoes"), tipo: "mod", rotulo: "ALTERADO", texto: "Coluna Ações mais larga, com dois botões" },
        ] }));
        R.push(await c4("md_04_formulario_programa", "/central-programas/editar.html?id=" + window.__pid0, { fixo: true, anot: [
            { alvo: (d) => d.querySelector("#f-marcadores"), tipo: "novo", rotulo: "ADICIONADO", texto: "Campo Marcadores (dropdown com caixas de marcar)" },
            { alvo: (d) => d.querySelector("#f-nome").closest(".col-md-5"), tipo: "mod", rotulo: "ALTERADO", texto: "Nome do programa passou de 8 para 5 colunas" },
        ] }));
        R.push(await c4("md_05_home_programas", "/ppa-detalhe.html?id=ppa-2028", { anot: [
            { alvo: (d) => d.querySelector("#t-programas thead th:first-child"), tipo: "novo", rotulo: "ADICIONADO", texto: "Coluna Marcador" },
            { alvo: (d) => d.querySelector("#t-programas [data-marcador]").closest(".filtro-campo"), tipo: "novo", rotulo: "ADICIONADO", texto: "Filtro Marcador" },
            { alvo: (d) => d.querySelector("#t-programas [data-marcar]"), tipo: "novo", rotulo: "ADICIONADO", texto: "Botão Adicionar marcadores" },
            { alvo: (d) => d.querySelector("#t-programas thead th:nth-child(2)"), tipo: "mod", rotulo: "ALTERADO", texto: "Programa passa a 2ª coluna; a exportação traz os marcadores" },
        ] }));
        R.push(await c4("md_06_programas_setorial", "/programas.html", { ls: SET, anot: [
            { alvo: (d) => d.querySelector("thead th:nth-child(2)"), tipo: "novo", rotulo: "ADICIONADO", texto: "Coluna Marcador, só para consulta" },
            { alvo: (d) => d.querySelector("#marcador"), tipo: "novo", rotulo: "ADICIONADO", texto: "Filtro Todos os Marcadores" },
            { alvo: (d) => d.querySelector('.side-nav a[href$="central-marcador.html"]'), tipo: "novo", rotulo: "ADICIONADO", texto: "Marcadores no menu do setorial" },
        ] }));
        return R;
    };
})();
