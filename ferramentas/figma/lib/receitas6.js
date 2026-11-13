/* Receitas de captura — Entrega 03 · Iniciativas.
 * Usa a Iniciativa ini-1 como exemplo e a leva pelas etapas do fluxo. Carregue depois de captura.js e receitas5.js (usa `c5`). */
(() => {
    const KEY = "siplam.estado.v1";
    const ADM = { "siplam.perfilSessao": "admin-central", "siplam.sessao": "ativa", "siplam.ppaSelecionado": "ppa-2028" };
    const SET = { ...ADM, "siplam.perfilSessao": "setorial" };
    const ok = (rotulo) => ({ decisao: "ok", justificativa: "", rotulo });
    const R_ = { nome: "Nome da iniciativa", descricao: "Descrição da iniciativa", programa: "Programa", indicadores: "Indicadores", causas: "Causa e subcausa" };
    const todosOk = () => Object.fromEntries(Object.entries(R_).map(([c, r]) => [c, ok(r)]));
    const nomeReprovado = () => ({ ...todosOk(), nome: { decisao: "reprovado", justificativa: "O nome está genérico: diga o que a Iniciativa entrega e para quem.", rotulo: R_.nome } });
    const clique = async (d, sel, ms = 400) => { const e = typeof sel === "string" ? d.querySelector(sel) : sel; e.click(); await esp(ms); };
    window.R6 = {};

    /** Guarda o estado do navegador e parte de um estado limpo, com ini-1 como Iniciativa de exemplo. */
    R6.preparar = async () => {
        localStorage.setItem("siplam.backup6", localStorage.getItem(KEY));
        const seed = await import("/assets/js/dados/seed.js");
        const base = JSON.parse(localStorage.getItem(KEY));
        base.iniciativas = JSON.parse(JSON.stringify(seed.estadoInicial().iniciativas));
        const ind = (base.indicadores ?? []).find((x) => /aliment|fome|segur/i.test(x.nome)) ?? base.indicadores[0];
        const ini = base.iniciativas.find((i) => i.id === "ini-1");
        Object.assign(ini, {
            nome: "Ampliação da rede pública de alimentação",
            causas: ["c2", "c2a"],
            indicadorIds: [ind.id],
            status: "em_preenchimento",
            versao: 1,
            justificativaDevolucao: "",
            avaliacao: null,
            avaliacaoRascunho: null,
            analista: null,
        });
        localStorage.setItem(KEY, JSON.stringify(base));
        return "ok · indicador " + ind.nome;
    };
    R6.restaurar = () => {
        const b = localStorage.getItem("siplam.backup6");
        if (b) localStorage.setItem(KEY, b);
        sessionStorage.clear();
        return "restaurado";
    };
    /** Leva a Iniciativa de exemplo a outra etapa. */
    R6.estagio = (patch) => {
        const e = JSON.parse(localStorage.getItem(KEY));
        Object.assign(e.iniciativas.find((i) => i.id === "ini-1"), patch);
        localStorage.setItem(KEY, JSON.stringify(e));
    };

    const ficha = "/iniciativa.html?id=ini-1";
    const fichaC = "/central-iniciativa.html?id=ini-1";
    const marcar = async (d, campo, dec) => { await clique(d, `[data-decisao="${dec}"][data-campo="${campo}"]`, 250); };
    const justificar = async (d, campo, texto) => { setv(d, `[data-justificativa="${campo}"]`, texto); await esp(200); };

    R6.novas = async () => {
        const R = [];
        // I1 — Planejamento setorial
        R6.estagio({ status: "em_preenchimento", avaliacao: null, justificativaDevolucao: "" });
        R.push(await c5("i1_01_lista", "/iniciativas.html", { ls: SET }));
        R.push(await c5("i1_02_nova", "/iniciativa/criar.html", { ls: SET, fixo: true }));
        R.push(await c5("i1_03_nova_preenchida", "/iniciativa/criar.html", { ls: SET, fixo: true, prep: async (w, d) => {
            setv(d, "#f-nome", "Ampliação da rede pública de alimentação");
            setv(d, "#f-descricao", "Expandir e qualificar restaurantes e cozinhas comunitárias nos territórios de maior insegurança alimentar.");
            const p = d.getElementById("f-programa"); p.value = "pg-fome"; p.dispatchEvent(new Event("change", { bubbles: true })); await esp(500);
            for (const c of [...d.querySelectorAll("[data-causa]")].slice(0, 2)) c.click();
            const b = d.getElementById("iind-busca"); b.focus(); b.dispatchEvent(new Event("focus")); await esp(400);
            d.querySelector("[data-iind-por]")?.click(); await esp(400);
        } }));
        R.push(await c5("i1_04_ficha", ficha, { ls: SET }));
        R.push(await c5("i1_05_ficha_nao_salva", ficha, { ls: SET, prep: async (w, d) => { setv(d, "#f-nome", "Ampliação da rede pública de alimentação e cozinhas comunitárias"); await esp(300); } }));
        R.push(await c5("i1_06_envio", ficha, { ls: SET, prep: async (w, d) => { await clique(d, "#abrir-envio", 900); } }));
        R6.estagio({ status: "enviada", enviadoEm: "13/11/2026" });
        R.push(await c5("i1_07_enviada", ficha, { ls: SET }));

        // I2 — avaliação da Central
        R.push(await c5("i2_01_lista", "/central-iniciativas.html", { ls: ADM }));
        R.push(await c5("i2_02_inicio", fichaC, { ls: ADM }));
        R.push(await c5("i2_03_avaliando", fichaC, { ls: ADM, prep: async (w, d) => {
            await marcar(d, "nome", "reprovado"); await justificar(d, "nome", "O nome está genérico: diga o que a Iniciativa entrega e para quem.");
            await marcar(d, "descricao", "ok"); await marcar(d, "programa", "ok");
        } }));
        R.push(await c5("i2_04_completa", fichaC, { ls: ADM, prep: async (w, d) => {
            await clique(d, "#aprovar-todos", 300); await marcar(d, "nome", "reprovado");
            await justificar(d, "nome", "O nome está genérico: diga o que a Iniciativa entrega e para quem.");
        } }));
        R6.estagio({ status: "devolvida", avaliacao: nomeReprovado(), justificativaDevolucao: "Nome da iniciativa: O nome está genérico: diga o que a Iniciativa entrega e para quem.", analista: "Maria Fonseca" });
        R.push(await c5("i2_05_devolvida", fichaC, { ls: ADM }));

        // I3 — ciclo de devolução
        R.push(await c5("i3_01_ficha_devolvida", ficha, { ls: SET }));
        R.push(await c5("i3_02_corrigindo", ficha, { ls: SET, prep: async (w, d) => { setv(d, "#f-nome", "Ampliação da rede pública de alimentação nos 20 municípios prioritários"); await esp(300); } }));
        const mantidos = Object.fromEntries(Object.entries(todosOk()).filter(([c]) => c !== "nome"));
        R6.estagio({ status: "enviada", versao: 2, nome: "Ampliação da rede pública de alimentação nos 20 municípios prioritários", avaliacao: mantidos, justificativaDevolucao: "" });
        R.push(await c5("i3_03_reavaliacao", fichaC, { ls: ADM }));
        R6.estagio({ status: "validada", avaliacao: todosOk() });
        R.push(await c5("i3_04_validada_central", fichaC, { ls: ADM }));
        R.push(await c5("i3_05_validada_setorial", ficha, { ls: SET }));
        return R;
    };

    R6.modificadas = async () => {
        const R = [];
        R6.estagio({ status: "em_preenchimento", versao: 1, nome: "Ampliação da rede pública de alimentação", avaliacao: null, justificativaDevolucao: "" });
        R.push(await c5("mm_01_lista_setorial", "/iniciativas.html", { ls: SET, anot: [
            { alvo: (d) => d.querySelector("#faixa"), tipo: "novo", rotulo: "ADICIONADO", texto: "Big numbers coloridos com a contagem por status da Iniciativa, na ordem do fluxo; só informam, sem clique" },
            { alvo: (d) => [...d.querySelectorAll("a.btn-primary")].find((a) => /Criar iniciativa/.test(a.textContent)), tipo: "novo", rotulo: "ADICIONADO", texto: "Botão Criar iniciativa, que abre o formulário de nova Iniciativa" },
            { alvo: (d) => d.querySelector("#corpo-lista"), tipo: "mod", rotulo: "ALTERADO", texto: "Uma linha por Iniciativa: nome sem link, Programa como código-nome, Problema e Causas cortados com “…” e tooltip com o texto inteiro" },
            { alvo: (d) => d.querySelector("#corpo-lista tr .coluna-acoes"), tipo: "novo", rotulo: "ADICIONADO", texto: "Ícone de pendências (bloqueado quando não há nenhuma) e ícone de editar a Iniciativa" },
        ] }));
        R6.estagio({ status: "enviada" });
        R.push(await c5("mm_02_lista_central", "/central-iniciativas.html", { ls: ADM, anot: [
            { alvo: (d) => d.querySelector("#faixa"), tipo: "mod", rotulo: "ALTERADO", texto: "Os big numbers deixaram de ser Entregas e valores financeiros: agora são os status da Iniciativa" },
            { alvo: (d) => d.querySelector("#corpo-lista tr .coluna-acoes"), tipo: "mod", rotulo: "ALTERADO", texto: "Editar virou avaliar: a Central só aprova ou reprova; pendências viram um botão que abre a lista" },
            { alvo: (d) => d.querySelector("thead th:nth-last-child(3)"), dx: -4, dy: 0, w: 110, h: 28, tipo: "exc", rotulo: "EXCLUÍDO", texto: "Coluna Previsto e o botão Nova Iniciativa saíram: a Central não cria Iniciativa", fantasma: true },
        ] }));
        R.push(await c5("mm_03_ficha_setorial", ficha, { ls: SET, anot: [
            { alvo: (d) => d.querySelector(".ilha"), tipo: "mod", rotulo: "ALTERADO", texto: "O título da Iniciativa virou uma ilha, com Cancelar, Salvar e Enviar para avaliação; as alterações só valem ao salvar" },
            { alvo: (d) => d.querySelector("#iind-bloco").closest(".mb-3"), tipo: "novo", rotulo: "ADICIONADO", texto: "Indicadores, escolhidos por busca entre os cadastrados, no lugar do campo Problema" },
            { alvo: (d) => d.querySelector("#f-status").closest(".mb-3"), tipo: "mod", rotulo: "ALTERADO", texto: "Status só para ver: ele muda pelo fluxo, não se digita" },
            { alvo: (d) => d.querySelector("#bloco-causas"), dy: 120, h: 70, tipo: "exc", rotulo: "EXCLUÍDO", texto: "Saíram as Entregas, a faixa de números, os Apontamentos e o Histórico da ficha", fantasma: true },
        ] }));
        R.push(await c5("mm_04_ficha_central", fichaC, { ls: ADM, anot: [
            { alvo: (d) => d.querySelector("#aprovar-todos").parentElement, tipo: "novo", rotulo: "ADICIONADO", texto: "Aprovar todos, Reprovar todos, Salvar (guarda a avaliação para continuar depois) e Devolver iniciativa (só habilita com todos os campos avaliados)" },
            { alvo: (d) => d.querySelector(".aval-botoes"), tipo: "novo", rotulo: "ADICIONADO", texto: "Aprovar (✓) ou reprovar (✗) cada campo; ao reprovar, a justificativa é obrigatória" },
        ] }));
        R.push(await c5("mm_05_programas_setorial", "/programas.html", { ls: SET, anot: [
            { alvo: (d) => d.querySelector("[data-marcar]"), tipo: "novo", rotulo: "ADICIONADO", texto: "Botão para adicionar marcadores ao Programa, na coluna Ações" },
        ] }));
        R.push(await c5("mm_06_ppa_editar", "/central-ppa/editar.html?id=ppa-2028", { ls: ADM, fixo: true, anot: [
            { alvo: (d) => d.querySelector("#f-descricao"), dy: 0, h: 50, tipo: "exc", rotulo: "EXCLUÍDO", texto: "A Janela de aprovações saiu do formulário do PPA; será discutida depois", fantasma: true },
        ] }));
        R.push(await c5("mm_07_perfil", "/perfil.html", { ls: ADM, fixo: true, anot: [
            { alvo: (d) => d.querySelector("#sel-perfil"), tipo: "mod", rotulo: "ALTERADO", texto: "Todos os perfis podem ser escolhidos, também no GitHub Pages" },
        ] }));
        return R;
    };
})();
