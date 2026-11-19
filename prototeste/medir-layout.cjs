/**
 * Medição complementar (NÃO faz parte das 100 rodadas): mede, por variante e por largura de tela, se os
 * controles da coluna Ações cabem na primeira tela sem rolagem horizontal. É uma medição determinística de layout
 * (uma por combinação), não uma amostra de comportamento.
 */
const fs = require("fs");
const path = require("path");
const puppeteer = require(path.join(process.env.PROTO_NODE_MODULES, "puppeteer-core"));
const BASE = process.env.PROTO_BASE || "http://127.0.0.1:8898";
const EDGE = process.env.PROTO_EDGE || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const LARGURAS = (process.env.PROTO_LARGURAS || "1280,1440,1920").split(",").map(Number);
const ALTURA = Number(process.env.PROTO_ALTURA || 900);
const SAIDA = process.env.PROTO_SAIDA ? require("path").resolve(process.env.PROTO_SAIDA) : path.join(__dirname, "resultados");

(async () => {
    const browser = await puppeteer.launch({ executablePath: EDGE, headless: "new" });
    const saida = [];
    for (const largura of LARGURAS) {
        for (const variante of ["direita", "esquerda"]) {
            const ctx = await browser.createBrowserContext();
            const page = await ctx.newPage();
            await page.setViewport({ width: largura, height: ALTURA });
            await page.goto(`${BASE}/index.html`);
            await page.type("#usuario", "teste.prototeste");
            await page.type("#senha", "SenhaTeste1");
            await Promise.all([page.waitForNavigation(), page.click("#form-acesso .btn-primary")]);
            await page.waitForSelector("#aceitar");
            await Promise.all([page.waitForNavigation(), page.click("#aceitar")]);
            await page.waitForSelector("#continuar");
            await Promise.all([page.waitForNavigation(), page.click("#continuar")]);
            await page.waitForSelector("#sel-perfil option[value='admin-central']");
            await new Promise((r) => setTimeout(r, 500));
            await page.select("#sel-perfil", "admin-central");
            await Promise.all([page.waitForNavigation(), page.click('[data-plano="ppa-2028"]')]);
            await page.evaluate((v) => sessionStorage.setItem("siplam.prototeste.acoes", v), variante);
            await page.goto(`${BASE}/central-programas.html`);
            await page.waitForSelector("#corpo-lista tr");
            await new Promise((r) => setTimeout(r, 600));
            const m = await page.evaluate(() => {
                const cont = document.querySelector("#corpo-lista").closest(".table-responsive");
                const c = cont.getBoundingClientRect();
                const editar = document.querySelector('#corpo-lista a[href*="editar.html?id=pg-saude"]');
                const marcar = document.querySelector('#corpo-lista [data-marcar="pg-saude"]');
                const nome = [...document.querySelectorAll("#corpo-lista a.fw-medium")].find((a) => a.textContent.trim() === "Saúde Integral");
                const cab = [...cont.querySelectorAll("thead th")].find((t) => t.textContent.trim() === "Ações");
                const vis = (el) => { const r = el.getBoundingClientRect(); const larg = r.width; const visivel = Math.max(0, Math.min(r.right, c.right) - Math.max(r.left, c.left)); return { esquerda: Math.round(r.left), direita: Math.round(r.right), largura: Math.round(larg), parte_visivel_sem_rolar: Math.round((visivel / larg) * 100) / 100 }; };
                return {
                    largura_da_janela: window.innerWidth,
                    largura_visivel_da_tabela: Math.round(cont.clientWidth),
                    largura_total_da_tabela: Math.round(cont.scrollWidth),
                    excesso_horizontal_px: Math.round(cont.scrollWidth - cont.clientWidth),
                    rolagem_horizontal: cont.scrollWidth > cont.clientWidth,
                    botao_editar: vis(editar),
                    botao_marcadores: vis(marcar),
                    nome_do_programa: vis(nome),
                    distancia_horizontal_nome_a_editar_px: Math.round(Math.abs(editar.getBoundingClientRect().left - nome.getBoundingClientRect().left)),
                    colunas_entre_nome_e_editar: (() => { const th = [...cont.querySelectorAll("thead th")]; const i = th.findIndex((t) => t.textContent.trim() === "Programa"); const j = th.findIndex((t) => t.textContent.trim() === "Ações"); return Math.abs(j - i) - 1; })(),
                    cabecalho_acoes: vis(cab),
                    colunas: [...cont.querySelectorAll("thead th")].map((t) => t.textContent.trim()),
                };
            });
            saida.push({ largura, altura: ALTURA, variante, ...m });
            await ctx.close();
        }
    }
    await browser.close();
    fs.writeFileSync(path.join(SAIDA, "medicao_complementar.json"), JSON.stringify(saida, null, 2));
    console.log("| Largura | Variante | Rolagem horizontal | Excesso (px) | Editar visível sem rolar | Marcadores visível sem rolar | Cabeçalho Ações visível sem rolar |");
    console.log("|---:|---|---|---:|---:|---:|---:|");
    for (const s of saida) console.log(`| ${s.largura} | ${s.variante} | ${s.rolagem_horizontal ? "sim" : "não"} | ${s.excesso_horizontal_px} | ${Math.round(s.botao_editar.parte_visivel_sem_rolar * 100)}% | ${Math.round(s.botao_marcadores.parte_visivel_sem_rolar * 100)}% | ${Math.round(s.cabecalho_acoes.parte_visivel_sem_rolar * 100)}% |`);
})().catch((e) => { console.error("ERRO", e.message); process.exit(1); });
