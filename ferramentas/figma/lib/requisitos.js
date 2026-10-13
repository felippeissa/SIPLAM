/* Documento de requisitos no Figma: páginas A4 paginadas a partir de req/req2.json (extraído do .docx). */
(function () {
    const G = globalThis;
    const PONTE = "http://localhost:9230";
    const FAM = "Calibri";
    const VERDE = "#1E9632";
    const CAB = "#A8D08D";   // cabeçalho das tabelas, como no Word
    const ROT = "#E2EFD9";   // rótulos das tabelas
    const A4 = { w: 794, h: 1123, mx: 54, topo: 92, base: 78 };

    const cor = (h, a = 1) => {
        const n = parseInt(h.slice(1), 16);
        return [{ type: "SOLID", color: { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 }, opacity: a }];
    };

    async function fontes() {
        for (const s of ["Regular", "Bold", "Italic", "Bold Italic"]) await figma.loadFontAsync({ family: FAM, style: s });
        await figma.loadFontAsync({ family: "Courier New", style: "Regular" }).catch(() => {});
    }

    function T(s, o = {}) {
        const t = figma.createText();
        const estilo = o.b && o.i ? "Bold Italic" : o.b ? "Bold" : o.i ? "Italic" : "Regular";
        t.fontName = { family: FAM, style: estilo };
        t.fontSize = o.fs || 14.5;
        t.characters = String(s);
        t.fills = cor(o.c || "#1f1f1f");
        t.lineHeight = { unit: "PIXELS", value: o.lh || Math.round((o.fs || 14.5) * 1.32) };
        if (o.u) t.textDecoration = "UNDERLINE";
        if (o.fill) { t.layoutAlign = "STRETCH"; t.textAutoResize = "HEIGHT"; }
        else if (o.w) { t.textAutoResize = "HEIGHT"; t.resize(o.w, t.height); }
        if (o.grow) { t.resize(Math.min(t.width, 300), t.height); t.layoutGrow = 1; t.textAutoResize = "HEIGHT"; }
        t.name = String(s).slice(0, 36);
        return t;
    }
    function F(nome, o = {}) {
        const f = figma.createFrame();
        f.name = nome;
        f.fills = o.fill ? cor(o.fill) : [];
        f.layoutMode = o.dir || "VERTICAL";
        f.primaryAxisSizingMode = "AUTO";
        f.counterAxisSizingMode = "AUTO";
        f.itemSpacing = o.gap ?? 0;
        f.paddingLeft = o.pl ?? o.px ?? 0;
        f.paddingRight = o.pr ?? o.px ?? 0;
        f.paddingTop = o.pt ?? o.py ?? 0;
        f.paddingBottom = o.pb ?? o.py ?? 0;
        if (o.stretch) f.layoutAlign = "STRETCH";
        if (o.stretch && o.dir === "HORIZONTAL") { f.primaryAxisSizingMode = "FIXED"; f.resize(686, 10); f.counterAxisSizingMode = "AUTO"; }
        if (o.grow) f.layoutGrow = 1;
        if (o.alinha) f.counterAxisAlignItems = o.alinha;
        return f;
    }
    const borda = (f, c = "#7f7f7f", w = 0.75) => { f.strokes = cor(c); f.strokeWeight = w; f.strokeAlign = "INSIDE"; };

    async function imagem(arquivo, largura, nome) {
        const buf = await (await fetch(PONTE + "/req/" + arquivo)).arrayBuffer();
        const img = figma.createImage(new Uint8Array(buf));
        const { width, height } = await img.getSizeAsync();
        const r = figma.createRectangle();
        r.name = nome || arquivo;
        r.resize(largura, Math.round((largura * height) / width));
        r.fills = [{ type: "IMAGE", imageHash: img.hash, scaleMode: "FILL" }];
        return r;
    }
    const IMG = { rId11: "image1.png", rId19: "image3.png", rId24: "image4.png" };

    /* ---------- páginas ---------- */
    const paginas = [];
    let corpo = null;

    async function novaPagina(capa = false) {
        const p = figma.createFrame();
        p.name = capa ? "Capa" : "Página " + (paginas.length + 1);
        p.resize(A4.w, A4.h);
        p.fills = cor("#ffffff");
        p.clipsContent = true;
        p.strokes = cor("#d4d9e0"); p.strokeWeight = 1; p.strokeAlign = "INSIDE";
        p.effects = [{ type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.08 }, offset: { x: 0, y: 4 }, radius: 14, spread: 0, visible: true, blendMode: "NORMAL" }];
        paginas.push(p);
        if (capa) { corpo = null; return p; }

        // cabeçalho: faixa verde com o órgão e a marca
        const faixa = figma.createFrame();
        faixa.name = "Cabeçalho"; faixa.resize(A4.w, 58); faixa.fills = cor(VERDE);
        p.appendChild(faixa);
        const linhas = ["ESTADO DE GOIÁS", "SECRETARIA GERAL DE GOVERNO", "SUPERINTENDÊNCIA DE SISTEMAS E INOVAÇÃO", "GERÊNCIA DE SISTEMAS"];
        linhas.forEach((l, i) => { const t = T(l, { fs: 9, b: i === 0, c: "#ffffff", lh: 11 }); faixa.appendChild(t); t.x = A4.mx; t.y = 7 + i * 11; });
        const logo = await imagem("image2.png", 206, "Marca SGG · GOV GO");
        faixa.appendChild(logo); logo.x = A4.w - A4.mx - 206; logo.y = (58 - logo.height) / 2;

        // rodapé
        const linha = figma.createFrame(); linha.name = "Linha do rodapé"; linha.resize(A4.w - 2 * A4.mx, 1); linha.fills = cor("#bfbfbf");
        p.appendChild(linha); linha.x = A4.mx; linha.y = A4.h - 62;
        const r1 = T("DOCUMENTO DE REQUISITOS · MGS 2.0.1", { fs: 9.5, b: true, c: "#595959" }); p.appendChild(r1); r1.x = A4.mx; r1.y = A4.h - 52;
        const r2 = T("PR0XX–CLIENTE–SIPLAM 3.0 – FASE01", { fs: 9.5, c: "#595959" }); p.appendChild(r2); r2.x = A4.mx; r2.y = A4.h - 38;
        const r3 = T("Página " + paginas.length, { fs: 9.5, c: "#595959" }); r3.name = "Número da página"; p.appendChild(r3); r3.x = A4.w - A4.mx - r3.width; r3.y = A4.h - 45;

        corpo = F("Corpo", { gap: 14 });
        corpo.counterAxisSizingMode = "FIXED"; corpo.resize(A4.w - 2 * A4.mx, 20); corpo.primaryAxisSizingMode = "AUTO";
        p.appendChild(corpo); corpo.x = A4.mx; corpo.y = A4.topo;
        return p;
    }

    async function colocar(bloco) {
        if (!corpo) await novaPagina();
        corpo.appendChild(bloco);
        if (corpo.y + corpo.height > A4.h - A4.base && corpo.children.length > 1) {
            // títulos não ficam sozinhos no fim da página: vão junto com o bloco que os segue
            const mover = [bloco];
            let i = corpo.children.indexOf(bloco) - 1;
            while (i >= 0 && /^(h1|h2):/.test(corpo.children[i].name)) { mover.unshift(corpo.children[i]); i--; }
            await novaPagina();
            mover.forEach((m) => corpo.appendChild(m));
        }
    }

    /* ---------- peças ---------- */
    function pontos(texto, nivel, tam = 14.5) {
        const l = F("Item", { dir: "HORIZONTAL", gap: 8, stretch: true, pl: 14 + nivel * 18 });
        l.appendChild(T(nivel ? "–" : "•", { fs: tam, c: "#1f1f1f", w: 10 }));
        l.appendChild(T(texto, { fs: tam, grow: true }));
        return l;
    }

    async function celulaConteudo(paras, tam = 13.5) {
        const c = F("Conteúdo", { gap: 5, stretch: true, px: 10, py: 8 });
        for (const p of paras) {
            if (p.img) { const im = await imagem(IMG[p.img] || "image3.png", p.img === "rId24" ? 440 : 330); c.appendChild(im); continue; }
            if (/^Comentários:/.test(p.t)) { const s = figma.createFrame(); s.resize(10, 6); s.fills = []; s.name = "espaço"; c.appendChild(s); c.appendChild(T(p.t, { fs: tam, b: true, fill: true })); continue; }
            if (p.lista) c.appendChild(pontos(p.t, p.nivel, tam));
            else c.appendChild(T(p.t, { fs: tam, b: p.neg, fill: true }));
        }
        return c;
    }

    async function tabelaGrupo(titulo, tabela, rotuloGrupo) {
        const t = F(titulo, { gap: 0, stretch: true });
        borda(t); t.clipsContent = true;
        // linha de cabeçalho
        const cab = F("Grupo", { fill: CAB, stretch: true, px: 10, py: 7 });
        cab.appendChild(T(tabela[0][0][0] ? tabela[0][0][0].t : rotuloGrupo, { fs: 13.5, b: true, fill: true }));
        t.appendChild(cab);
        for (const linha of tabela.slice(1)) {
            if (linha.length === 1) {
                const corpoLinha = await celulaConteudo(linha[0]);
                corpoLinha.strokes = cor("#7f7f7f"); corpoLinha.strokeWeight = 0.75; corpoLinha.strokeAlign = "INSIDE";
                corpoLinha.strokeLeftWeight = 0; corpoLinha.strokeRightWeight = 0; corpoLinha.strokeBottomWeight = 0;
                t.appendChild(corpoLinha);
            } else {
                const r = F("Linha", { dir: "HORIZONTAL", stretch: true });
                r.strokes = cor("#7f7f7f"); r.strokeWeight = 0.75; r.strokeAlign = "INSIDE";
                r.strokeLeftWeight = 0; r.strokeRightWeight = 0; r.strokeBottomWeight = 0;
                r.counterAxisAlignItems = "MIN";
                const rot = F("Rótulo", { fill: ROT, px: 10, py: 8 });
                rot.primaryAxisSizingMode = "AUTO"; rot.counterAxisSizingMode = "FIXED"; rot.resize(150, 20); rot.layoutAlign = "STRETCH";
                rot.appendChild(T(linha[0].map((p) => p.t).join(" "), { fs: 13.5, b: true, w: 130 }));
                r.appendChild(rot);
                const val = await celulaConteudo(linha[1]);
                val.layoutGrow = 1; r.appendChild(val);
                t.appendChild(r);
            }
        }
        return t;
    }

    /* ---------- construção ---------- */
    G.siplamRequisitos = async function () {
        await fontes();
        const dados = await (await fetch(PONTE + "/req/req2.json")).json();
        let pag = figma.root.children.find((p) => p.name === "📄  Documento de requisitos");
        if (!pag) { pag = figma.createPage(); pag.name = "📄  Documento de requisitos"; }
        await figma.setCurrentPageAsync(pag);
        pag.children.slice().forEach((n) => n.remove());
        paginas.length = 0; corpo = null;

        // ---- capa ----
        const capa = await novaPagina(true);
        const logo = await imagem("image1.png", 300, "Marca GOV GO");
        capa.appendChild(logo); logo.x = (A4.w - 300) / 2; logo.y = 170;
        const textosCapa = dados.filter((b) => b.k === "capa");
        const caixa = F("Título da capa", { gap: 18, stretch: false });
        caixa.counterAxisSizingMode = "FIXED"; caixa.resize(A4.w - 2 * A4.mx, 20); caixa.primaryAxisSizingMode = "AUTO"; caixa.counterAxisAlignItems = "CENTER";
        textosCapa.forEach((c, i) => {
            const t = T(c.t, { fs: i === 1 ? 28 : i === 0 ? 20 : 18, b: true, c: i === 1 ? VERDE : "#262626", lh: i === 1 ? 36 : 26 });
            t.textAlignHorizontal = "CENTER"; t.layoutAlign = "STRETCH"; t.textAutoResize = "HEIGHT";
            caixa.appendChild(t);
        });
        capa.appendChild(caixa); caixa.x = A4.mx; caixa.y = 560;
        const faixaCapa = figma.createFrame(); faixaCapa.name = "Faixa"; faixaCapa.resize(A4.w, 14); faixaCapa.fills = cor(VERDE); capa.appendChild(faixaCapa); faixaCapa.x = 0; faixaCapa.y = A4.h - 14;

        // ---- corpo ----
        let pendenteEmbaixo = false;
        for (let i = 0; i < dados.length; i++) {
            const b = dados[i];
            if (b.k === "capa" || b.k === "logo") continue;

            if (b.k === "p") {
                if (/^Controle de Vers/.test(b.t)) { const f = F("Controle de versão", { gap: 8, stretch: true }); f.appendChild(T(b.t, { fs: 15, b: true, fill: true })); await colocar(f); continue; }
                const modelo = /^</.test(b.t) || b.estilo === "Body Text";
                if (b.lista) { await colocar(pontos(b.t, b.nivel)); continue; }
                const t = T(b.t, { fs: modelo ? 13.5 : 14.5, i: modelo, c: modelo ? "#7f7f7f" : "#1f1f1f", fill: true });
                await colocar(t); continue;
            }
            if (b.k === "h1") { const t = T(b.t, { fs: 24, b: true, fill: true }); t.name = "h1:" + b.t; await colocar(t); continue; }
            if (b.k === "h2") {
                const f = F("h2:" + b.t, { gap: 6, stretch: true });
                f.appendChild(T(b.t, { fs: 19, b: true, c: "#1b5e20", fill: true }));
                const l = figma.createFrame(); l.resize(100, 2); l.fills = cor(VERDE); l.layoutAlign = "STRETCH"; l.name = "Linha"; f.appendChild(l);
                await colocar(f); continue;
            }
            if (b.k === "tabela") {
                // tabela solta: versão (4 colunas) ou fluxos do caso de uso
                const L = b.linhas;
                if (L[0].length === 4) {
                    const t = F("Controle de versão", { gap: 0, stretch: true }); borda(t); t.clipsContent = true;
                    const larg = [92, 70, 330, 194];
                    L.forEach((lin, ri) => {
                        const r = F("Linha", { dir: "HORIZONTAL", stretch: true, fill: ri === 0 ? CAB : null });
                        r.strokes = cor("#7f7f7f"); r.strokeWeight = 0.75; r.strokeAlign = "INSIDE"; r.strokeLeftWeight = 0; r.strokeRightWeight = 0; r.strokeTopWeight = ri ? 0.75 : 0; r.strokeBottomWeight = 0;
                        lin.forEach((c, ci) => {
                            const cel = F("Célula", { px: 10, py: 6 }); cel.primaryAxisSizingMode = "AUTO"; cel.counterAxisSizingMode = "FIXED"; cel.resize(larg[ci], 24);
                            cel.appendChild(T((c[0] && c[0].t) || " ", { fs: 13, b: ri === 0, w: larg[ci] - 20 }));
                            r.appendChild(cel);
                        });
                        t.appendChild(r);
                    });
                    await colocar(t);
                } else {
                    const t = F("Fluxo", { gap: 0, stretch: true }); borda(t); t.clipsContent = true;
                    const rotulos = /^(Fluxo|Pré-condições|Pós-condições|Objetivo|Ator)/;
                    L.forEach((lin, ri) => {
                        const txt = lin[0].map((p) => p.t).join("\n");
                        const rotulo = ri === 0 || rotulos.test(txt);
                        const r = F("Linha", { stretch: true, fill: ri === 0 ? CAB : rotulo ? ROT : null, px: 10, py: 6 });
                        if (ri) { r.strokes = cor("#7f7f7f"); r.strokeWeight = 0.75; r.strokeAlign = "INSIDE"; r.strokeLeftWeight = 0; r.strokeRightWeight = 0; r.strokeBottomWeight = 0; }
                        r.appendChild(T(txt || " ", { fs: 13.5, b: rotulo, fill: true }));
                        t.appendChild(r);
                    });
                    await colocar(t);
                }
                continue;
            }
            if (b.k === "csu") {
                const f = F(b.num, { gap: 8, stretch: true });
                f.appendChild(T(b.num + " – " + b.t, { fs: 16, b: true, fill: true }));
                const L = b.tabela;
                const t = F("Caso de uso", { gap: 0, stretch: true }); borda(t); t.clipsContent = true;
                const rotulos = /^(Objetivo|Ator|Fluxo Principal|Pré-condições|Pós-condições)$/;
                L.forEach((lin, ri) => {
                    const txt = lin[0].map((p) => p.t).join("\n");
                    const rotulo = rotulos.test(txt);
                    const r = F("Linha", { stretch: true, fill: rotulo ? ROT : null, px: 10, py: 6 });
                    if (ri) { r.strokes = cor("#7f7f7f"); r.strokeWeight = 0.75; r.strokeAlign = "INSIDE"; r.strokeLeftWeight = 0; r.strokeRightWeight = 0; r.strokeBottomWeight = 0; }
                    r.appendChild(T(txt || " ", { fs: 13.5, b: rotulo, fill: true }));
                    t.appendChild(r);
                });
                f.appendChild(t);
                await colocar(f);
                continue;
            }
            if (["rf", "rn", "rnf"].includes(b.k)) {
                const f = F(b.num, { gap: 8, stretch: true });
                f.appendChild(T(b.num + " – " + b.t, { fs: 16, b: true, fill: true }));
                f.appendChild(await tabelaGrupo(b.num + " · tabela", b.tabela, ""));
                await colocar(f);
            }
        }

        // ---- distribui as páginas em grade, dentro de uma seção ----
        const COLS = 4, GAP = 90, M = 90;
        const sec = figma.createSection();
        sec.name = "Documento de requisitos — SIPLAM 3.0 · Fase 01";
        sec.fills = []; sec.strokes = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.1 }]; sec.strokeWeight = 1;
        pag.appendChild(sec);
        const linhas = Math.ceil(paginas.length / COLS);
        sec.resizeWithoutConstraints(M * 2 + COLS * A4.w + (COLS - 1) * GAP, M * 2 + linhas * A4.h + (linhas - 1) * GAP);
        paginas.forEach((p, i) => {
            sec.appendChild(p);
            p.x = M + (i % COLS) * (A4.w + GAP);
            p.y = M + Math.floor(i / COLS) * (A4.h + GAP);
        });
        // total de páginas no rodapé
        paginas.forEach((p, i) => { const n = p.findOne((x) => x.name === "Número da página"); if (n) n.characters = "Página " + (i + 1) + " de " + paginas.length; });
        figma.viewport.scrollAndZoomIntoView([sec]);
        return { paginas: paginas.length, secao: sec.id, pagina: pag.id };
    };
})();
