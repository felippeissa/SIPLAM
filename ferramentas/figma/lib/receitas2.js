/* Receitas de captura — telas de editar/excluir dos cadastros (Entrega 02), que mudaram com a regra de exclusão. */
(() => {
    window.R2 = {};
    R2.cads = async () => {
        const defs = [
            ["f07", "central-eixo", "/central-eixo.html"],
            ["f08", "central-objetivo", "/central-objetivo.html"],
            ["f09", "central-causa", "/central-causa.html"],
            ["f10", "central-indicador", "/central-indicador.html"],
            ["f11", "central-problema", "/central-problema.html"],
            ["f12", "central-programas", "/central-programas.html"],
        ];
        const out = {};
        for (const [k, pasta, lista] of defs) {
            for (const kk of ["siplam.tema"]) localStorage.removeItem(kk);
            for (const [a, b] of Object.entries(ADM)) localStorage.setItem(a, b);
            out[k] = await capCad({ k, pasta, lista, so: "editar" });
        }
        return out;
    };
    R2.f06 = async () => {
        const R = [];
        const S = await import("/assets/js/dados/store.js");
        const base = localStorage.getItem("siplam.estado.v1");
        R.push(await capN("f06_09_editar", "/central-ppa/editar.html?id=ppa-2028"));
        R.push(await capN("f06_10_editar_vigente", "/central-ppa/editar.html?id=ppa-2024"));
        R.push(await capN("f06_12_excluir_bloqueado", "/central-ppa/editar.html?id=ppa-2028"));
        // um plano de exemplo, sem nada dentro, para mostrar a exclusão
        S.obterEstado();
        S.addPpa({ ...S.ppaVazio(), id: "ppa-2032", nome: "Plano Plurianual 2032–2035", primeiroAno: "2032", ultimoAno: "2035", situacao: "elaboracao", descricao: "Ciclo de exemplo, sem Programas ainda." });
        R.push(await capN("f06_11_excluir", "/central-ppa/editar.html?id=ppa-2032", { prep: async (w, d) => { await clique(d, "#excluir", 1000); } }));
        localStorage.setItem("siplam.estado.v1", base);
        return R.map((r) => r.nome + ":" + r.nos);
    };
    R2.livres = async () => {
        const out = [];
        const S = await import("/assets/js/dados/store.js");
        S.obterEstado();
        const base = localStorage.getItem("siplam.estado.v1");
        try {
            const mk = [["f07", "eixos", "central-eixo", { nome: "Eixo de exemplo", descricao: "Registro novo, sem nenhum vínculo.", ppaId: "ppa-2028" }],
                ["f08", "objetivos", "central-objetivo", { nome: "Objetivo de exemplo", descricao: "Registro novo, sem nenhum vínculo.", ppaId: "ppa-2028", eixoIds: [] }],
                ["f09", "causas", "central-causa", { nome: "Causa de exemplo", justificativa: "Registro novo, sem nenhum vínculo.", descricao: "Exemplo.", subcausaIds: [], ppaId: "ppa-2028" }],
                ["f11", "problemas", "central-problema", { nome: "Problema de exemplo", descricao: "Registro novo, sem nenhum vínculo.", consequencias: "Exemplo.", populacaoIds: [], causaIds: [], ppaId: "ppa-2028" }]];
            for (const [k, col, pasta, reg] of mk) {
                const r = S.addItem(col, reg);
                out.push((await capN(k + "_11_excluir", "/" + pasta + "/editar.html?id=" + r.id, { prep: async (w, d) => { await clique(d, "#excluir", 1000); } })).nos);
            }
        } finally { localStorage.setItem("siplam.estado.v1", base); }
        return out;
    };
    R2.f12x = async () => {
        const R = [];
        R.push(await capN("f12_11_editar_erros", "/central-programas/editar.html?id=pg-saude", { prep: async (w, d) => { setv(d, "#f-nome", ""); await clique(d, "#salvar", 600); } }));
        R.push(await capN("f12_12_ver_consulta", "/central-programas/editar.html?id=pg-saude", { ls: { ...ADM, "siplam.perfilSessao": "controle" } }));
        return R.map((r) => r.nome + ":" + r.nos);
    };
})();
