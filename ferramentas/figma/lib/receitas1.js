/* Receitas de captura — fluxos da Entrega 01 (Home, Equipe, Dashboard, Usuários, Relatórios, Menu). */
(() => {
    const ADM = { "siplam.perfilSessao": "admin-central", "siplam.sessao": "ativa", "siplam.ppaSelecionado": "ppa-2028" };
    window.ADM = ADM;
    const clique = async (d, sel, ms = 500) => { const e = typeof sel === "string" ? d.querySelector(sel) : sel; e.click(); await esp(ms); };
    window.clique = clique;
    window.R1 = {};
    const c = (nome, url, o = {}) => cap(nome, url, { fixo: (window.OLDH || {})[nome] === 900, ls: ADM, rm: o.ls && o.ls['siplam.tema'] ? [] : ['siplam.tema'], ...o });
    window.capN = c;

    R1.f03 = async () => {
        const R = [];
        const home = "/ppa-detalhe.html?id=ppa-2028";
        R.push(await cap("f03_01_home", home, { ls: ADM }));
        R.push(await cap("f03_02_aba_indicadores", home, { ls: ADM, prep: async (w, d) => { await clique(d, 'a[href="#t-indicadores"]', 700); } }));
        R.push(await cap("f03_03_filtro", home, { ls: ADM, prep: async (w, d) => {
            const f = d.querySelector('#t-programas [data-busca]'); setv(d, f, "saúde"); await clique(d, '#t-programas [data-buscar]', 600); } }));
        R.push(await cap("f03_04_adicionar", home, { ls: ADM, prep: async (w, d) => { await clique(d, '.card-header .dropdown-toggle', 700); } }));
        R.push(await cap("f03_05_trocar_plano", home, { ls: ADM, fixo: true, prep: async (w, d) => { await clique(d, "#plano-corrente", 1200); } }));
        R.push(await cap("f03_06_plano_vazio", "/ppa-detalhe.html?id=ppa-2020", { ls: ADM }));
        // novas
        R.push(await cap("f03_07_documento", home, { ls: ADM, fixo: true, prep: async (w, d) => {
            const f = d.getElementById("arquivo-documento");
            const dt = new w.DataTransfer(); dt.items.add(new w.File(["x"], "parecer-tecnico.pdf", { type: "application/pdf" }));
            f.files = dt.files; f.dispatchEvent(new w.Event("change", { bubbles: true })); await esp(900);
            const t = d.getElementById("desc-0"); if (t) setv(d, t, "Parecer da Procuradoria sobre a minuta do plano."); } }));
        return R.map((r) => r.nome + ":" + r.nos);
    };
    R1.f04 = async () => {
        const R = [], base = "/ppa-equipe.html?id=ppa-2028", novo = "/ppa-equipe-criar.html?id=ppa-2028";
        R.push(await c("f04_01_lista", base));
        R.push(await c("f04_02_busca", base, { prep: async (w, d) => { setv(d, "#filtro-livre", "maria"); await clique(d, "#filtro-buscar", 500); } }));
        R.push(await c("f04_03_novo", novo));
        R.push(await c("f04_04_busca_pessoa", novo, { prep: async (w, d) => { const e = d.getElementById("f-nome"); e.focus(); setv(d, e, "cl"); await esp(500); } }));
        R.push(await c("f04_05_erros", novo, { prep: async (w, d) => { await clique(d, "#salvar", 400); } }));
        R.push(await c("f04_06_editar", "/ppa-equipe-editar.html?id=ppa-2028&membro=us-3"));
        R.push(await c("f04_07_excluir", "/ppa-equipe-editar.html?id=ppa-2028&membro=us-3", { prep: async (w, d) => { await clique(d, "#excluir", 1000); } }));
        return R.map((r) => r.nome + ":" + r.nos);
    };
    R1.f05 = async () => [(await c("f05_01_dashboard", "/pagina-inicial.html")).nome];
    R1.f13 = async () => {
        const R = [], lista = "/central-usuarios.html", ver = (id) => `/central-usuarios/ver.html?id=${id}`;
        const cpf = (d, v) => { setv(d, "#n-cpf", v); };
        R.push(await c("f13_01_lista", lista));
        R.push(await c("f13_02_busca", lista, { prep: async (w, d) => { setv(d, "#filtro-livre", "renato"); await clique(d, "#filtro-buscar", 500); } }));
        R.push(await c("f13_03_filtro", lista, { prep: async (w, d) => { await clique(d, "#barra-filtros .choices", 700); } }));
        R.push(await c("f13_04_sem_resultado", lista, { prep: async (w, d) => { setv(d, "#filtro-livre", "zzzz"); await clique(d, "#filtro-buscar", 500); } }));
        R.push(await c("f13_05_ver", ver("us-8")));
        R.push(await c("f13_06_aprovar", ver("us-8"), { prep: async (w, d) => { await clique(d, "#aprovar", 900); } }));
        R.push(await c("f13_07_reprovar", ver("us-8"), { prep: async (w, d) => { await clique(d, "#reprovar", 900); } }));
        R.push(await c("f13_08_ver_aprovado", ver("us-1")));
        R.push(await c("f13_09_ver_reprovado", ver("us-11")));
        const abrir = async (d) => { await clique(d, "#novo", 900); };
        R.push(await c("f13_10_novo", lista, { prep: async (w, d) => { await abrir(d); } }));
        R.push(await c("f13_11_novo_cpf", lista, { prep: async (w, d) => { await abrir(d); cpf(d, "52998224725"); await clique(d, "#buscar-cpf", 800); } }));
        R.push(await c("f13_12_novo_encontrado", lista, { prep: async (w, d) => { await abrir(d); cpf(d, "12345678909"); await clique(d, "#buscar-cpf", 800); } }));
        R.push(await c("f13_12_novo_erro", lista, { prep: async (w, d) => { await abrir(d); await clique(d, "#buscar-cpf", 800); } }));
        R.push(await c("f13_13_novo_existente", lista, { prep: async (w, d) => { await abrir(d); cpf(d, "07170974398"); await clique(d, "#buscar-cpf", 800); } }));
        return R.map((r) => r.nome + ":" + r.nos);
    };
    R1.f14 = async () => {
        const R = [], lei = "/central-relatorio-lei.html", fin = "/central-relatorio-finalisticas.html";
        R.push(await c("f14_01_lei_sintetico", lei));
        R.push(await c("f14_02_lei_analitico", lei, { prep: async (w, d) => { await clique(d, '[data-visao="analitico"]', 800); } }));
        R.push(await c("f14_03_fin_sintetico", fin));
        R.push(await c("f14_04_fin_analitico", fin, { prep: async (w, d) => { await clique(d, '[data-visao="analitico"]', 800); } }));
        return R.map((r) => r.nome + ":" + r.nos);
    };
    R1.f15 = async () => {
        const R = [], home = "/central-ppa.html";
        R.push(await c("f15_01_menu_usuario", home, { prep: async (w, d) => { await clique(d, '.app-topbar .dropdown-toggle', 700); } }));
        R.push(await c("f15_02_notificacoes", home, { prep: async (w, d) => { await clique(d, "#abrir-notificacoes", 900); } }));
        R.push(await c("f15_03_atena", home, { prep: async (w, d) => { await clique(d, "#abrir-atena", 1100); } }));
        R.push(await c("f15_04_busca", home, { prep: async (w, d) => { const e = d.getElementById("abrir-busca"); e.click(); e.focus(); await esp(700); } }));
        R.push(await c("f15_05_escuro", home, { ls: { ...ADM, "siplam.tema": "dark" } }));
        return R.map((r) => r.nome + ":" + r.nos);
    };
})();
