/**
 * Executor do PROTOTESTE (comparação da coluna Ações: A = direita, B = esquerda).
 *
 * Roda 100 rodadas no navegador automatizado (Edge, modo headless), contra o protótipo local:
 *   5 protopersonas × (10 execuções na variante A + 10 na B), em 10 pares por persona
 *   (5 pares A→B e 5 pares B→A). Cada rodada abre um contexto novo de navegador (storage limpo).
 *
 * Isto é uma avaliação AUTOMATIZADA: os tempos e as interações são os do script, não de pessoas.
 * As estratégias abaixo foram fixadas antes da execução e não mudam conforme o resultado.
 *
 * Uso:  PROTO_NODE_MODULES=<pasta com puppeteer-core> node prototeste/executar.cjs
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");
const puppeteer = require(path.join(process.env.PROTO_NODE_MODULES, "puppeteer-core"));

const RAIZ = path.resolve(__dirname, "..");
const SAIDA = process.env.PROTO_SAIDA ? path.resolve(process.env.PROTO_SAIDA) : path.join(__dirname, "resultados");
const EVID = path.join(SAIDA, "evidencias");
const BASE = process.env.PROTO_BASE || "http://127.0.0.1:8899";
const EDGE = process.env.PROTO_EDGE || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
// Janela da análise: 1440 × 900 por padrão (análise principal); PROTO_LARGURA/PROTO_ALTURA para a análise adicional.
const VIEWPORT = { width: Number(process.env.PROTO_LARGURA || 1440), height: Number(process.env.PROTO_ALTURA || 900) };
const NOME_ORIGINAL = "Saúde Integral";
const NOME_NOVO = "Saúde Integral 1";
const USUARIO_TESTE = "teste.prototeste"; // fictício: o login do protótipo é de demonstração
const SENHA_TESTE = "SenhaTeste1"; // fictícia

const VARIANTES = {
    A: { id: "A-direita", valor: "direita" },
    B: { id: "B-esquerda", valor: "esquerda" },
};
const PERSONAS = ["P1", "P2", "P3", "P4", "P5"];
// Só para o piloto do executor: PROTO_PARES=1 roda apenas o 1º par de cada persona. Na execução oficial fica vazio (10 pares).
const PARES = Number(process.env.PROTO_PARES || 10);

const agora = () => Number(process.hrtime.bigint()) / 1e6;
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const sha = (arq) => crypto.createHash("sha256").update(fs.readFileSync(path.join(RAIZ, arq))).digest("hex").slice(0, 12);

/* ---------- passos comuns ---------- */

async function fazerLogin(page, ct) {
    await page.goto(`${BASE}/index.html`, { waitUntil: "domcontentloaded" });
    await page.type("#usuario", USUARIO_TESTE);
    await page.type("#senha", SENHA_TESTE);
    ct.cliques++;
    await Promise.all([page.waitForNavigation({ waitUntil: "domcontentloaded" }), page.click("#form-acesso .btn-primary")]);
    await page.waitForSelector("#aceitar");
    ct.cliques++;
    await Promise.all([page.waitForNavigation({ waitUntil: "domcontentloaded" }), page.click("#aceitar")]);
    await page.waitForSelector("#continuar");
    ct.cliques++;
    await Promise.all([page.waitForNavigation({ waitUntil: "domcontentloaded" }), page.click("#continuar")]);
    await page.waitForSelector("#sel-perfil option[value='admin-central']");
    await espera(500); // a lista de perfis é montada por um módulo assíncrono
    await page.select("#sel-perfil", "admin-central");
    ct.cliques++;
    await Promise.all([page.waitForNavigation({ waitUntil: "domcontentloaded" }), page.click('[data-plano="ppa-2028"]')]);
}

async function irParaProgramas(page, ct) {
    ct.cliques++;
    await page.click('.sidenav-menu a[href="#menu-cadastros"]');
    await page.waitForSelector('.sidenav-menu a[href="/central-programas.html"]', { visible: true });
    ct.cliques++;
    await Promise.all([page.waitForNavigation({ waitUntil: "domcontentloaded" }), page.click('.sidenav-menu a[href="/central-programas.html"]')]);
    await page.waitForSelector("#corpo-lista tr");
}

/** Marca a linha do Programa de teste (instrumentação: um atributo, sem efeito visual) e devolve o que se sabe dela. */
async function marcarAlvo(page) {
    return page.evaluate((nome) => {
        const linhas = [...document.querySelectorAll("#corpo-lista tr")];
        const exata = linhas.filter((tr) => (tr.querySelector("a.fw-medium")?.textContent || "").trim() === nome);
        const contem = linhas.filter((tr) => tr.textContent.includes(nome));
        exata[0]?.setAttribute("data-proto-alvo", "1");
        const ths = [...document.querySelectorAll("#corpo-lista")].map((tb) => tb.closest("table"))[0]?.querySelectorAll("thead th") || [];
        const posAcoes = [...ths].findIndex((th) => th.textContent.trim() === "Ações");
        const tabela = document.querySelector("#corpo-lista").closest(".table-responsive");
        return {
            linhas_visiveis: linhas.length,
            candidatas_exatas: exata.length,
            candidatas_que_contem_o_texto: contem.length,
            posicao_da_coluna_acoes: posAcoes,
            total_de_colunas: ths.length,
            rolagem_horizontal: tabela ? tabela.scrollWidth > tabela.clientWidth : null,
            indice_da_linha_alvo: linhas.indexOf(exata[0]),
        };
    }, NOME_ORIGINAL);
}

async function nomeAcessivel(page, handle) {
    try {
        const snap = await page.accessibility.snapshot({ root: handle, interestingOnly: false });
        return snap ? { papel: snap.role, nome: snap.name || "" } : { papel: null, nome: "" };
    } catch {
        return { papel: null, nome: "" };
    }
}

/** Os controles da coluna Ações da linha-alvo, com o nome acessível de cada um. */
async function acoesDaLinhaAlvo(page) {
    const hs = await page.$$('tr[data-proto-alvo] .coluna-acoes a, tr[data-proto-alvo] .coluna-acoes button');
    const lista = [];
    for (const h of hs) {
        const dados = await h.evaluate((el) => ({ tag: el.tagName.toLowerCase(), texto: el.textContent.trim(), ariaLabel: el.getAttribute("aria-label") || "", title: el.getAttribute("title") || "" }));
        lista.push({ ...dados, acessivel: await nomeAcessivel(page, h) });
    }
    return lista;
}

async function handleEditar(page) {
    return (await page.$('tr[data-proto-alvo] a[href*="central-programas/editar.html?id=pg-saude"]'));
}

/* ---------- estratégias por protopersona (fixadas antes da execução) ---------- */

const ESTRATEGIAS = {
    // P1: localizar por busca e usar a ação direta.
    async P1(page, ct, fatos) {
        ct.cliques++;
        await page.click("#filtro-livre");
        await page.type("#filtro-livre", NOME_ORIGINAL);
        ct.digitacoes++;
        await page.waitForFunction((n) => [...document.querySelectorAll("#corpo-lista tr")].some((t) => t.textContent.includes(n)), {}, NOME_ORIGINAL);
        await espera(400); // o filtro redesenha a tabela
        const info = await marcarAlvo(page);
        fatos.push(`Busca por "${NOME_ORIGINAL}": ${info.linhas_visiveis} linha(s) restaram, ${info.candidatas_exatas} com nome exato.`);
        return { info, identificado: agora() };
    },
    // P2: ler nome e dados principais antes de acionar Editar.
    async P2(page, ct, fatos) {
        const info = await marcarAlvo(page);
        const lido = await page.evaluate(() => [...document.querySelectorAll("#corpo-lista tr")].map((tr) => ({ codigo: (tr.querySelector(".codigo")?.textContent || "").trim(), nome: (tr.querySelector("a.fw-medium")?.textContent || "").trim(), eixo: (tr.querySelector("a.fw-medium")?.nextElementSibling?.textContent || "").trim() })));
        fatos.push(`Leu código, nome e eixo de ${lido.length} linha(s) antes de agir; ${info.candidatas_que_contem_o_texto} linha(s) contêm o texto "${NOME_ORIGINAL}" (em nome ou eixo).`);
        return { info, identificado: agora() };
    },
    // P3: identificar o rótulo/ícone de edição e confirmar o contexto.
    async P3(page, ct, fatos) {
        const info = await marcarAlvo(page);
        const acoes = await acoesDaLinhaAlvo(page);
        const contexto = await page.$eval("tr[data-proto-alvo]", (tr) => `${(tr.querySelector(".codigo")?.textContent || "").trim()} · ${(tr.querySelector("a.fw-medium")?.textContent || "").trim()}`);
        fatos.push(`Controles de ação da linha: ${acoes.map((a) => `${a.tag}[texto="${a.texto}", aria-label="${a.ariaLabel}", nome acessível="${a.acessivel.nome}"]`).join("; ")}. Contexto confirmado: ${contexto}.`);
        return { info, identificado: agora() };
    },
    // P4: verificar explicitamente o nome antes de salvar (feito no passo do formulário) e depois.
    async P4(page, ct, fatos) {
        const info = await marcarAlvo(page);
        const outros = await page.$$eval("#corpo-lista tr a.fw-medium", (as) => as.map((a) => a.textContent.trim()));
        fatos.push(`Registrou os ${outros.length} nomes da página para conferir depois que nenhum outro foi alterado.`);
        return { info, identificado: agora(), nomesAntes: outros };
    },
};

/* ---------- uma rodada ---------- */

async function rodada(browser, persona, variante, sequencia, par) {
    const idx = String(par).padStart(2, "0");
    const rec = {
        run_id: `${persona}-${variante.id.split("-")[0]}-${idx}`,
        persona_id: persona,
        variant: variante.id,
        sequence: sequencia,
        pair: par,
        status: "nao_executado",
        success: null,
        time_to_identify_row_ms: null,
        time_to_edit_ms: null,
        total_time_ms: null,
        interaction_count: null,
        interactions: null,
        errors: [],
        evidence_paths: [],
        observed_facts: [],
        synthetic_feedback: { positive_points: [], frictions: [], possible_preference: "nao_avaliada", reasoning: "Ver PROTOTESTE_RESULTADOS.md, seção 10.3: o feedback sintético é por protopersona, não por rodada." },
        meta: { viewport: VIEWPORT, iniciado_em: new Date().toISOString() },
    };
    const ct = { cliques: 0, digitacoes: 0, tabs: 0, teclas: 0, rolagens: 0 };
    const fatos = rec.observed_facts;
    const ctx = await browser.createBrowserContext(); // storage limpo: o Programa de teste nasce com o nome original
    const page = await ctx.newPage();
    await page.setViewport(VIEWPORT);
    page.on("pageerror", (e) => rec.errors.push(`pageerror: ${e.message}`));
    page.on("console", (m) => m.type() === "error" && !/favicon|ERR_FAILED|Failed to load resource/.test(m.text()) && rec.errors.push(`console.error: ${m.text().slice(0, 160)}`));
    page.on("requestfailed", (r) => rec.errors.push(`requestfailed: ${r.url().replace(BASE, "")} · ${r.failure()?.errorText || ""}`));
    page.on("response", (r) => r.status() >= 400 && !/favicon/.test(r.url()) && rec.errors.push(`http ${r.status()}: ${r.url().replace(BASE, "")}`));
    const t0 = agora();
    const foto = async (nome) => {
        if (par !== 1) return; // evidência por captura: só a primeira rodada de cada célula persona × variante
        const arq = path.join(EVID, `${rec.run_id}_${nome}.png`);
        await page.screenshot({ path: arq });
        rec.evidence_paths.push(path.relative(RAIZ, arq).replace(/\\/g, "/"));
    };
    try {
        await fazerLogin(page, ct);
        await page.evaluate((v) => sessionStorage.setItem("siplam.prototeste.acoes", v), variante.valor); // configura a variante (não é ação da pessoa)
        await irParaProgramas(page, ct);

        const base = await marcarAlvo(page);
        if (base.candidatas_exatas !== 1) throw Object.assign(new Error(`Programa "${NOME_ORIGINAL}" não encontrado de forma única (${base.candidatas_exatas}).`), { bloqueio: true });
        fatos.push(`Coluna Ações na posição ${base.posicao_da_coluna_acoes} de ${base.total_de_colunas} (${base.posicao_da_coluna_acoes === 0 ? "esquerda" : "direita"}); rolagem horizontal: ${base.rolagem_horizontal ? "sim" : "não"}.`);
        await page.evaluate(() => document.querySelectorAll("[data-proto-alvo]").forEach((e) => e.removeAttribute("data-proto-alvo")));

        const tLista = agora();
        let identificado, editado;
        const formUrlRe = /central-programas\/editar\.html\?id=pg-saude/;

        if (persona !== "P5") {
            const est = await ESTRATEGIAS[persona](page, ct, fatos);
            identificado = est.identificado;
            rec.time_to_identify_row_ms = Math.round(identificado - tLista);
            await foto("lista");
            const h = await handleEditar(page);
            if (!h) throw new Error("Botão Editar da linha-alvo não encontrado.");
            ct.cliques++;
            editado = agora();
            rec.time_to_edit_ms = Math.round(editado - identificado);
            await Promise.all([page.waitForNavigation({ waitUntil: "domcontentloaded" }), h.click()]);
            await page.waitForSelector("#f-nome");
            // formulário
            const valorAntes = await page.$eval("#f-nome", (e) => e.value);
            if (persona === "P4") {
                const titulo = await page.$eval("h4.page-main-title", (e) => e.textContent.trim());
                fatos.push(`P4 conferiu o registro antes de salvar: campo Nome="${valorAntes}", título da página="${titulo}".`);
                if (valorAntes !== NOME_ORIGINAL) throw new Error(`Registro errado aberto: "${valorAntes}".`);
            }
            await page.click("#f-nome", { clickCount: 3 });
            ct.cliques++;
            await page.type("#f-nome", NOME_NOVO);
            ct.digitacoes++;
            ct.cliques++;
            await Promise.all([page.waitForNavigation({ waitUntil: "domcontentloaded" }), page.click("#salvar")]);
            if (persona === "P4") rec._nomesAntes = est.nomesAntes;
        } else {
            // P5: somente teclado. Parte do início do documento e percorre com Tab.
            const percorrer = async (alvoFn, limite = 300) => {
                for (let i = 0; i < limite; i++) {
                    await page.keyboard.press("Tab");
                    ct.tabs++;
                    if (await page.evaluate(alvoFn)) return true;
                }
                return false;
            };
            await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
            // 1ª vez que o foco entra na linha-alvo = "linha identificada"
            await marcarAlvo(page);
            const tabsAntes = ct.tabs;
            const entrouNaLinha = await percorrer(() => !!document.activeElement?.closest("tr[data-proto-alvo]"));
            if (!entrouNaLinha) throw new Error("O foco nunca chegou à linha-alvo com Tab.");
            identificado = agora();
            rec.time_to_identify_row_ms = Math.round(identificado - tLista);
            const tabsAteLinha = ct.tabs - tabsAntes;
            const primeiroNaLinha = await page.evaluate(() => { const e = document.activeElement; return `${e.tagName.toLowerCase()}[${(e.getAttribute("aria-label") || e.textContent || "").trim().slice(0, 40)}]`; });
            const sel = 'a[href*="central-programas/editar.html?id=pg-saude"]';
            let noEditar = await page.evaluate((s) => document.activeElement?.matches(s), sel);
            const tabsAntesEditar = ct.tabs;
            for (let i = 0; i < 20 && !noEditar; i++) {
                await page.keyboard.press("Tab");
                ct.tabs++;
                noEditar = await page.evaluate((s) => document.activeElement?.matches(s), sel);
            }
            if (!noEditar) throw new Error("O foco não chegou ao Editar da linha-alvo.");
            const tabsAteEditar = tabsAteLinha + (ct.tabs - tabsAntesEditar);
            const alvoEditar = await page.evaluateHandle(() => document.activeElement);
            const foco = await page.evaluate(() => { const e = document.activeElement; const cs = getComputedStyle(e); return { focusVisible: e.matches(":focus-visible"), outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, boxShadow: cs.boxShadow !== "none" }; });
            const acess = await nomeAcessivel(page, alvoEditar.asElement());
            editado = agora();
            rec.time_to_edit_ms = Math.round(editado - identificado);
            fatos.push(`P5: foco entrou na linha-alvo após ${tabsAteLinha} Tab(s) (primeiro controle focado na linha: ${primeiroNaLinha}); chegou ao Editar após ${tabsAteEditar} Tab(s) desde o início da página. Foco visível no Editar: ${foco.focusVisible ? "sim" : "não"} (outline ${foco.outlineStyle} ${foco.outlineWidth}${foco.boxShadow ? ", box-shadow presente" : ""}). Nome acessível do Editar: "${acess.nome}" (papel ${acess.papel}).`);
            rec._p5 = { tabs_ate_linha: tabsAteLinha, tabs_ate_editar: tabsAteEditar, foco_visivel_no_editar: foco.focusVisible, nome_acessivel_editar: acess.nome };
            await foto("lista");
            ct.teclas++;
            await Promise.all([page.waitForNavigation({ waitUntil: "domcontentloaded" }), page.keyboard.press("Enter")]);
            await page.waitForSelector("#f-nome");
            // formulário por teclado: Tab até o campo Nome
            await page.evaluate(() => document.activeElement?.blur());
            let tabsForm = 0;
            let noCampo = false;
            for (let i = 0; i < 80 && !noCampo; i++) { await page.keyboard.press("Tab"); ct.tabs++; tabsForm++; noCampo = await page.evaluate(() => document.activeElement?.id === "f-nome"); }
            if (!noCampo) throw new Error("O foco não chegou ao campo Nome com Tab.");
            await page.keyboard.down("Control"); await page.keyboard.press("a"); await page.keyboard.up("Control"); ct.teclas += 2;
            await page.keyboard.type(NOME_NOVO); ct.digitacoes++;
            // O botão Salvar fica no cabeçalho do cartão, ANTES dos campos na ordem de Tab: depois de digitar, só se
            // chega a ele voltando com Shift+Tab. A rodada registra quantos Shift+Tab foram necessários.
            let noSalvar = false;
            let shiftTabs = 0;
            for (let i = 0; i < 40 && !noSalvar; i++) {
                await page.keyboard.down("Shift"); await page.keyboard.press("Tab"); await page.keyboard.up("Shift");
                ct.tabs++; tabsForm++; shiftTabs++;
                noSalvar = await page.evaluate(() => document.activeElement?.id === "salvar");
            }
            if (!noSalvar) throw new Error("O foco não chegou ao botão Salvar nem com Shift+Tab.");
            rec._p5.shift_tabs_ate_salvar = shiftTabs;
            fatos.push(`P5: no formulário, o foco chegou ao campo Nome após ${tabsForm - shiftTabs} Tab(s) desde o início da página e ao botão Salvar após ${shiftTabs} Shift+Tab(s) de volta (Salvar vem antes dos campos na ordem de foco).`);
            rec._p5.tabs_no_formulario = tabsForm;
            ct.teclas++;
            await Promise.all([page.waitForNavigation({ waitUntil: "domcontentloaded" }), page.keyboard.press("Enter")]);
        }

        // ---------- verificação de persistência ----------
        await page.waitForSelector("#corpo-lista tr");
        const toast = await page.waitForSelector("#siplam-toasts .toast", { timeout: 4000 }).then((h) => h.evaluate((e) => e.textContent.trim())).catch(() => null);
        const lerNome = () => page.evaluate(() => { const tr = [...document.querySelectorAll("#corpo-lista tr")].find((t) => (t.querySelector(".codigo")?.textContent || "").trim() === "1043"); return tr ? (tr.querySelector("a.fw-medium")?.textContent || "").trim() : null; });
        const naLista = await lerNome();
        await page.reload({ waitUntil: "domcontentloaded" });
        await page.waitForSelector("#corpo-lista tr");
        const aposRecarga = await lerNome();
        const noEstado = await page.evaluate(() => (JSON.parse(localStorage.getItem("siplam.estado.v1")).programas.find((p) => p.id === "pg-saude") || {}).nome);
        await foto("depois");
        rec.total_time_ms = Math.round(agora() - t0);
        fatos.push(`Confirmação ao salvar: ${toast ? `"${toast}"` : "nenhuma mensagem visível"}. Nome na lista: "${naLista}"; após recarregar: "${aposRecarga}"; no estado salvo: "${noEstado}".`);
        if (persona === "P4") {
            const depois = await page.$$eval("#corpo-lista tr a.fw-medium", (as) => as.map((a) => a.textContent.trim()));
            const antes = rec._nomesAntes || [];
            const mudaram = depois.filter((n, i) => n !== antes[i]);
            fatos.push(`P4 conferiu depois: ${mudaram.length} nome(s) diferente(s) do registro anterior (esperado: 1) → ${mudaram.join(" | ")}.`);
        }
        rec.success = naLista === NOME_NOVO && aposRecarga === NOME_NOVO && noEstado === NOME_NOVO;
        rec.status = rec.success ? "concluida" : "falha";
        if (!rec.success) rec.errors.push(`Persistência divergente: lista="${naLista}", recarga="${aposRecarga}", estado="${noEstado}".`);

        // ---------- restauração do estado ----------
        await page.evaluate((nome) => { const e = JSON.parse(localStorage.getItem("siplam.estado.v1")); e.programas.find((p) => p.id === "pg-saude").nome = nome; localStorage.setItem("siplam.estado.v1", JSON.stringify(e)); }, NOME_ORIGINAL);
        const restaurado = await page.evaluate(() => JSON.parse(localStorage.getItem("siplam.estado.v1")).programas.find((p) => p.id === "pg-saude").nome);
        fatos.push(`Estado restaurado: nome volta a "${restaurado}" (${restaurado === NOME_ORIGINAL ? "confirmado" : "FALHOU"}).`);
        if (restaurado !== NOME_ORIGINAL) rec.errors.push("Restauração do estado não confirmada.");
        rec.base = base;
        if (rec._p5) rec.teclado = rec._p5;
    } catch (e) {
        rec.total_time_ms = Math.round(agora() - t0);
        rec.status = e.bloqueio ? "bloqueado" : "falha";
        rec.success = false;
        rec.errors.push(e.message);
        try {
            const arq = path.join(EVID, `${rec.run_id}_falha.png`);
            await page.screenshot({ path: arq });
            rec.evidence_paths.push(path.relative(RAIZ, arq).replace(/\\/g, "/"));
        } catch {}
    } finally {
        delete rec._nomesAntes;
        delete rec._p5;
        rec.interaction_count = ct.cliques + ct.digitacoes + ct.tabs + ct.teclas + ct.rolagens;
        rec.interactions = ct;
        rec.meta.concluido_em = new Date().toISOString();
        await ctx.close();
    }
    return rec;
}

/* ---------- orquestração ---------- */

(async () => {
    fs.mkdirSync(EVID, { recursive: true });
    const arquivoLog = path.join(SAIDA, "execucoes.jsonl");
    fs.writeFileSync(arquivoLog, "");
    let commit = "?", sujo = "?";
    try {
        commit = execSync("git rev-parse --short HEAD", { cwd: RAIZ }).toString().trim();
        sujo = execSync("git status --porcelain", { cwd: RAIZ }).toString().trim().split("\n").filter(Boolean).length;
    } catch {}
    const browser = await puppeteer.launch({ executablePath: EDGE, headless: "new" });
    const ambiente = {
        data: new Date().toISOString(),
        navegador: await browser.version(),
        node: process.version,
        sistema: process.platform,
        base: BASE,
        viewport: VIEWPORT,
        commit_base: commit,
        arquivos_alterados_na_arvore_de_trabalho: sujo,
        sha256_parcial: { "assets/js/paginas/central-programas.js": sha("assets/js/paginas/central-programas.js"), "assets/js/shell.js": sha("assets/js/shell.js"), "assets/js/toast.js": sha("assets/js/toast.js") },
        usuario_de_teste: USUARIO_TESTE,
        observacao: "Login de demonstração do protótipo (sem autenticação real). Dados 100% fictícios, em storage isolado por rodada.",
    };
    fs.writeFileSync(path.join(SAIDA, "ambiente.json"), JSON.stringify(ambiente, null, 2));

    let feitas = 0;
    const inicio = agora();
    for (const persona of PERSONAS) {
        for (let par = 1; par <= PARES; par++) {
            const ordem = par <= 5 ? ["A", "B"] : ["B", "A"]; // 5 pares A→B e 5 pares B→A por persona
            const sequencia = ordem.join("-");
            for (const v of ordem) {
                const rec = await rodada(browser, persona, VARIANTES[v], sequencia, par);
                fs.appendFileSync(arquivoLog, JSON.stringify(rec) + "\n");
                feitas++;
                console.log(`[${feitas}/100] ${rec.run_id} ${rec.sequence} → ${rec.status}${rec.errors.length ? " · " + rec.errors[0].slice(0, 80) : ""} (${rec.total_time_ms} ms)`);
            }
        }
    }
    await browser.close();
    ambiente.duracao_total_s = Math.round((agora() - inicio) / 1000);
    fs.writeFileSync(path.join(SAIDA, "ambiente.json"), JSON.stringify(ambiente, null, 2));
    console.log(`Concluído: ${feitas} rodadas em ${ambiente.duracao_total_s}s.`);
})().catch((e) => { console.error("ERRO FATAL", e); process.exit(1); });
