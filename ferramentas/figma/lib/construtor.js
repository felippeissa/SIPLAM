/* Construtor: recebe a árvore extraída do protótipo e desenha no Figma. */
(function () {
    const PONTE = "http://localhost:9230";
    const G = globalThis;
    G.__icones = G.__icones || {};
    G.__fontesOk = G.__fontesOk || {};
    G.__jobs = G.__jobs || {};

    const FAM = { 400: "Regular", 500: "Medium", 600: "SemiBold", 700: "Bold" };
    const peso = (w) => FAM[w] || (w >= 700 ? "Bold" : w >= 600 ? "SemiBold" : w >= 500 ? "Medium" : "Regular");

    async function fonte(ff, fw, it) {
        const mono = /mono|courier|consolas|menlo|monaco/i.test(ff);
        const familia = mono ? "IBM Plex Mono" : "IBM Plex Sans";
        let estilo = peso(fw);
        if (mono && estilo === "SemiBold") estilo = "SemiBold";
        if (it && !mono) estilo = estilo === "Regular" ? "Italic" : estilo + " Italic";
        const chave = familia + "|" + estilo;
        if (G.__fontesOk[chave] === undefined) {
            try { await figma.loadFontAsync({ family: familia, style: estilo }); G.__fontesOk[chave] = true; }
            catch (e) {
                try { await figma.loadFontAsync({ family: familia, style: "Regular" }); G.__fontesOk[chave] = "Regular"; }
                catch (e2) { await figma.loadFontAsync({ family: "Inter", style: "Regular" }); G.__fontesOk[chave] = "Inter"; }
            }
        }
        const ok = G.__fontesOk[chave];
        if (ok === true) return { family: familia, style: estilo };
        if (ok === "Regular") return { family: familia, style: "Regular" };
        return { family: "Inter", style: "Regular" };
    }

    const rgb = (c) => ({ r: c[0] / 255, g: c[1] / 255, b: c[2] / 255 });
    const solido = (c) => [{ type: "SOLID", color: rgb(c), opacity: c[3] }];
    const hex = (c) => "#" + [c[0], c[1], c[2]].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

    async function icone(cp) {
        if (!G.__icones[cp]) {
            const r = await fetch(PONTE + "/icone?cp=" + cp);
            G.__icones[cp] = r.ok ? await r.json() : { vazio: true };
        }
        return G.__icones[cp];
    }

    async function noIcone(n) {
        const g = await icone(n.cp);
        if (g.vazio) return null;
        const cor = n.c || [76, 76, 92, 1];
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.w} ${g.h}" width="${g.w}" height="${g.h}"><path d="${g.d}" fill="${hex(cor)}" fill-opacity="${cor[3]}"/></svg>`;
        const f = figma.createNodeFromSvg(svg);
        f.name = "Ícone · " + (n.nome || "ti");
        const s = n.size || 16;
        const wDesenhado = (s * g.w) / g.h;
        f.resize(Math.max(1, wDesenhado), s);
        f.x = n.x + Math.max(0, ((n.w || wDesenhado) - wDesenhado) / 2);
        f.y = n.y;
        return f;
    }

    async function noTexto(n) {
        const t = figma.createText();
        t.name = n.s.slice(0, 40);
        t.fontName = await fonte(n.ff, n.fw, n.it);
        t.fontSize = Math.max(1, n.fs);
        t.characters = n.s;
        if (n.c) t.fills = solido(n.c);
        if (n.ls) t.letterSpacing = { unit: "PIXELS", value: n.ls };
        if (n.u) t.textDecoration = "UNDERLINE";
        t.textAlignHorizontal = n.ta === "center" ? "CENTER" : n.ta === "right" || n.ta === "end" ? "RIGHT" : "LEFT";
        let y = n.y;
        if (n.trunc) {
            t.textAutoResize = "NONE";
            t.resize(Math.max(4, n.w), Math.max(8, n.h));
            t.textTruncation = "ENDING";
            t.maxLines = n.area ? null : 1;
        } else if (n.lin > 1) {
            if (n.lh) {
                t.lineHeight = { unit: "PIXELS", value: n.lh };
                const ch = n.h - (n.lin - 1) * n.lh;
                y = n.y - (n.lh - ch) / 2;
            }
            t.textAutoResize = "HEIGHT";
            t.resize(Math.max(4, n.w + 1), Math.max(8, n.h));
        } else {
            t.textAutoResize = "WIDTH_AND_HEIGHT";
            // fonte diferente da do navegador (ex.: monoespaçada): encolhe para caber na largura medida
            if (n.w > 6 && t.width > n.w + 2) t.fontSize = Math.max(7, t.fontSize * ((n.w + 1) / t.width));
        }
        // texto de uma linha com alinhamento à direita/centro precisa da largura medida
        if (!n.trunc && n.lin <= 1 && (n.ta === "center" || n.ta === "right" || n.ta === "end")) {
            t.textAutoResize = "NONE";
            t.resize(Math.max(4, n.w + 1), t.height);
        }
        t.x = n.x;
        t.y = y;
        return t;
    }

    async function noSvg(n) {
        try {
            const f = figma.createNodeFromSvg(n.m);
            f.name = n.nome;
            f.resize(Math.max(1, n.w), Math.max(1, n.h));
            f.x = n.x; f.y = n.y;
            return f;
        } catch (e) {
            const r = figma.createRectangle();
            r.name = "svg (não importado)";
            r.fills = [{ type: "SOLID", color: { r: 0.9, g: 0.92, b: 0.95 } }];
            r.resize(n.w, n.h); r.x = n.x; r.y = n.y;
            return r;
        }
    }

    async function noImg(n) {
        const r = await fetch(PONTE + "/svg?arquivo=" + encodeURIComponent(n.src));
        if (!r.ok) return null;
        const f = figma.createNodeFromSvg(await r.text());
        f.name = n.nome;
        f.resize(Math.max(1, n.w), Math.max(1, n.h));
        f.x = n.x; f.y = n.y;
        return f;
    }

    function estiloQuadro(f, n) {
        f.name = n.nome;
        f.fills = n.bg ? solido(n.bg) : [];
        f.clipsContent = !!n.clip;
        if (n.op < 1) f.opacity = n.op;
        const [a, b, c, d] = n.r;
        if (a === b && b === c && c === d) f.cornerRadius = a;
        else { f.topLeftRadius = a; f.topRightRadius = b; f.bottomRightRadius = c; f.bottomLeftRadius = d; }
        if (n.bd) {
            const lados = n.bd; // top, right, bottom, left
            const cor = (lados.find((l) => l.w && l.c) || {}).c;
            if (cor) {
                f.strokes = solido(cor);
                f.strokeAlign = "INSIDE";
                f.strokeTopWeight = lados[0].w; f.strokeRightWeight = lados[1].w; f.strokeBottomWeight = lados[2].w; f.strokeLeftWeight = lados[3].w;
                const st = (lados.find((l) => l.w) || {}).st;
                if (st === "dashed") f.dashPattern = [6, 4];
                else if (st === "dotted") f.dashPattern = [1, 3];
            }
        }
        if (n.sh) {
            f.effects = [{ type: "DROP_SHADOW", color: { r: n.sh.c[0] / 255, g: n.sh.c[1] / 255, b: n.sh.c[2] / 255, a: n.sh.c[3] }, offset: { x: n.sh.x, y: n.sh.y }, radius: n.sh.b, spread: n.sh.s, visible: true, blendMode: "NORMAL" }];
        }
    }

    async function filhos(lista, pai, estat) {
        for (const n of lista) {
            let no = null;
            try {
                if (n.k === "f") {
                    no = figma.createFrame();
                    estiloQuadro(no, n);
                    no.resize(Math.max(0.01, n.w), Math.max(0.01, n.h));
                    pai.appendChild(no);
                    no.x = n.x; no.y = n.y;
                    estat.n++;
                    await filhos(n.f, no, estat);
                    continue;
                }
                if (n.k === "t") no = await noTexto(n);
                else if (n.k === "i") no = await noIcone(n);
                else if (n.k === "svg") no = await noSvg(n);
                else if (n.k === "img") no = await noImg(n);
            } catch (e) {
                estat.erros.push((n.k || "?") + ": " + String(e && e.message).slice(0, 80));
            }
            if (no) { pai.appendChild(no); estat.n++; }
        }
    }

    /** Desenha a tela extraída dentro de `pai`, na posição x,y, com o nome dado. */
    G.siplamConstruir = async function (dados, pai, x, y, nome) {
        const estat = { n: 0, erros: [] };
        const raiz = figma.createFrame();
        raiz.name = nome;
        raiz.resize(dados.w, dados.h);
        raiz.fills = dados.bg ? solido(dados.bg) : [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
        raiz.clipsContent = true;
        pai.appendChild(raiz);
        raiz.x = x; raiz.y = y;
        await filhos(dados.f, raiz, estat);
        return { id: raiz.id, nos: estat.n, erros: estat.erros.slice(0, 8) };
    };

    /** Busca os dados na ponte e constrói em segundo plano. */
    G.siplamJob = function (arquivo, paiId, x, y, nome, chave) {
        chave = chave || nome;
        G.__jobs[chave] = { estado: "rodando" };
        (async () => {
            try {
                const r = await fetch(PONTE + "/dados/" + arquivo + ".json");
                const dados = await r.json();
                const pai = await figma.getNodeByIdAsync(paiId);
                G.__jobs[chave] = { estado: "pronto", ...(await G.siplamConstruir(dados, pai, x, y, nome)) };
            } catch (e) {
                G.__jobs[chave] = { estado: "erro", msg: String(e && e.message) };
            }
        })();
        return true;
    };
})();
