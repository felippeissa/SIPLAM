/* Receitas de captura — Melhorias de usabilidade e logo (Entrega 02): Home, ícone do Programa, logo. */
(() => {
    const ADM = { "siplam.perfilSessao": "admin-central", "siplam.sessao": "ativa", "siplam.ppaSelecionado": "ppa-2028" };
    const SET = { ...ADM, "siplam.perfilSessao": "setorial" };
    const clique = async (d, sel, ms = 500) => { const e = typeof sel === "string" ? d.querySelector(sel) : sel; e.click(); await esp(ms); };
    window.R5 = {};
    const c5 = async (nome, url, o = {}) => {
        sessionStorage.clear();
        const anot = o.anot || [], prep = o.prep, rects = [];
        const r = await cap(nome, url, {
            ls: o.ls || ADM, rm: o.semRm ? [] : ["siplam.tema"], fixo: !!o.fixo,
            prep: async (w, d, f) => {
                if (prep) await prep(w, d, f);
                await esp(300);
                for (const a of anot) {
                    const el = typeof a.alvo === "function" ? a.alvo(d) : d.querySelector(a.alvo);
                    if (!el) { rects.push({ ...a, alvo: undefined, falta: true }); continue; }
                    const b = el.getBoundingClientRect();
                    rects.push({ tipo: a.tipo, rotulo: a.rotulo, texto: a.texto, x: b.left + (a.dx || 0), y: b.top + (a.dy || 0), w: a.w ?? b.width, h: a.h ?? b.height, fantasma: !!a.fantasma });
                }
            },
        });
        if (anot.length) await fetch("http://localhost:9230/salvar?nome=an_" + nome, { method: "POST", body: JSON.stringify(rects) });
        return r.nome + ":" + r.nos + (rects.some((x) => x.falta) ? " (anotação sem alvo: " + rects.filter((x) => x.falta).map((x) => x.texto).join("; ") + ")" : "");
    };
    window.c5 = c5;
    const home = "/ppa-detalhe.html?id=ppa-2028";
    const numero = (d, aba) => d.querySelector(`#numeros-plano [href="#${aba}"]`);
    const verMais = async (d) => { const b = d.getElementById("descricao-alternar"); if (b && !b.classList.contains("d-none")) { b.click(); await esp(400); } };
    const abrirJanela = async (d) => { d.getElementById("f-icone-botao").click(); await esp(900); };
    const escolher = async (d, c) => { d.querySelector(`[data-icone="${c}"]`).click(); await esp(900); };

    R5.preparar = () => { window.__snapIc = localStorage.getItem("siplam.estado.v1"); const e = JSON.parse(window.__snapIc); const p = e.programas.find((x) => x.ppaId === "ppa-2028"); window.__pid5 = p.id; return p.id + " " + p.nome + " " + p.icone; };
    R5.restaurar = () => { if (window.__snapIc) localStorage.setItem("siplam.estado.v1", window.__snapIc); sessionStorage.clear(); };

    R5.novas = async () => {
        const R = [];
        // U1 — Home do plano
        R.push(await c5("u1_01_home", home));
        R.push(await c5("u1_02_descricao", home, { prep: async (w, d) => { await verMais(d); } }));
        R.push(await c5("u1_03_numero_causas", home, { prep: async (w, d) => { await clique(d, numero(d, "t-causas"), 700); } }));
        R.push(await c5("u1_04_numero_indicadores", home, { prep: async (w, d) => { await clique(d, numero(d, "t-indicadores"), 700); } }));
        R.push(await c5("u1_05_home_setorial", home, { ls: SET }));
        // U2 — ícone do Programa
        const ed = "/central-programas/editar.html?id=" + window.__pid5;
        R.push(await c5("u2_01_formulario", ed, { fixo: true }));
        R.push(await c5("u2_02_janela", ed, { fixo: true, prep: async (w, d) => { await abrirJanela(d); } }));
        R.push(await c5("u2_03_busca", ed, { fixo: true, prep: async (w, d) => { await abrirJanela(d); setv(d, "#icone-busca", "escola"); await esp(400); } }));
        R.push(await c5("u2_04_escolhido", ed, { fixo: true, prep: async (w, d) => { await abrirJanela(d); await escolher(d, "ti-rocket"); } }));
        R.push(await c5("u2_05_cadastro", "/central-programas.html"));
        R.push(await c5("u2_06_ficha", "/programa.html?id=" + window.__pid5));
        // U3 — logo
        R.push(await c5("u3_01_login", "/index.html", { fixo: true, ls: {}, semRm: true }));
        R.push(await c5("u3_02_perfil", "/perfil.html", { fixo: true }));
        return R;
    };

    R5.modificadas = async () => {
        const R = [];
        const sec = (d) => [...d.querySelectorAll("h5")].find((h) => h.textContent.trim() === "Situação").closest("div");
        R.push(await c5("mu_01_home", home, { anot: [
            { alvo: (d) => d.querySelector("#descricao-plano").closest(".mb-4"), tipo: "mod", rotulo: "ALTERADO", texto: "Descrição recolhida em poucas linhas, com “Ver mais” e “Ver menos” para ganhar espaço" },
            { alvo: (d) => d.querySelector("#numeros-plano"), tipo: "novo", rotulo: "ADICIONADO", texto: "Seis números grandes (Programas, Eixos, Objetivos, Causas, Indicadores e Problemas), cada um com ícone e cor; o escolhido mostra a tabela abaixo" },
            { alvo: (d) => d.querySelector("#t-programas"), dy: -26, h: 10, tipo: "exc", rotulo: "EXCLUÍDO", texto: "As abas de navegação (nav-tabs) saíram: os números fazem o papel delas", fantasma: true },
            { alvo: (d) => d.querySelector(".card-header h3").parentElement, tipo: "mod", rotulo: "ALTERADO", texto: "A situação “Em elaboração” subiu para a frente do título do plano" },
            { alvo: (d) => sec(d), tipo: "mod", rotulo: "ALTERADO", texto: "Situação virou uma linha do tempo com todas as situações do PPA; a atual fica marcada" },
            { alvo: (d) => [...d.querySelectorAll("h5")].find((h) => h.textContent.trim() === "Informações Institucionais").parentElement, tipo: "novo", rotulo: "ADICIONADO", texto: "Bloco Informações Institucionais: Vigência, Processo SEI e Valor previsto, cada um com ícone" },
        ] }));
        R.push(await c5("mu_02_cadastro_programa", "/central-programas.html", { anot: [
            { alvo: (d) => d.querySelector("#corpo-lista tr .icone-programa"), tipo: "novo", rotulo: "ADICIONADO", texto: "Ícone do Programa ao lado do nome" },
        ] }));
        R.push(await c5("mu_03_formulario_programa", "/central-programas/editar.html?id=" + window.__pid5, { fixo: true, anot: [
            { alvo: (d) => d.querySelector("#f-icone-botao").closest(".mb-3"), tipo: "novo", rotulo: "ADICIONADO", texto: "Campo Ícone do programa: botão que abre a janela com os ícones do sistema" },
            { alvo: (d) => d.querySelector("#f-nome").closest(".col-md-4"), tipo: "mod", rotulo: "ALTERADO", texto: "Nome do programa passou de 5 para 4 colunas e Marcadores de 4 para 3, para abrir espaço ao ícone" },
        ] }));
        R.push(await c5("mu_04_home_programas", home, { anot: [
            { alvo: (d) => d.querySelector("#t-programas tbody tr .icone-programa"), tipo: "novo", rotulo: "ADICIONADO", texto: "Ícone do Programa ao lado do nome" },
        ] }));
        R.push(await c5("mu_05_programas_setorial", "/programas.html", { ls: SET, anot: [
            { alvo: (d) => d.querySelector("tbody tr .icone-programa"), tipo: "novo", rotulo: "ADICIONADO", texto: "Ícone do Programa ao lado do nome" },
        ] }));
        R.push(await c5("mu_06_ficha_programa", "/programa.html?id=" + window.__pid5, { anot: [
            { alvo: (d) => d.querySelector(".icone-programa-grande"), tipo: "novo", rotulo: "ADICIONADO", texto: "Ícone grande ao lado do título da ficha" },
        ] }));
        R.push(await c5("mu_07_menu_logo", "/central-programas.html", { fixo: true, anot: [
            { alvo: (d) => [...d.querySelectorAll(".logo-lg img")].find((i) => i.getBoundingClientRect().width > 0), tipo: "mod", rotulo: "ALTERADO", texto: "Nova logo SIPLAM 3.0 em SVG vetorial, maior e com o letreiro em Montserrat ExtraBold" },
            { alvo: (d) => d.querySelector("#corpo-lista"), dy: 0, h: 190, tipo: "mod", rotulo: "ALTERADO", texto: "Texto de todo o sistema mais escuro, para dar mais contraste" },
        ] }));
        return R;
    };
})();
