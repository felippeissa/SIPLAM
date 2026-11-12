/* Capa genérica das páginas de entrega do Figma: o que foi adicionado, telas criadas, regras e como ler o fluxo de modificações. */
(function () {
    const G = globalThis;
    const PONTE = "http://localhost:9230";
    const C = { verde: "#1ab394", amarelo: "#f5b800", vermelho: "#ed5565", texto: "#4c4c5c", titulo: "#343a40", cinza: "#9ba6b7", marinho: "#0f2b46", linha: "#eef2f7", cab: "#f2f6fa" };
    const TIPO = {
        novo: { cor: C.verde, rotulo: "ADICIONADO", sinal: "+" },
        mod: { cor: C.amarelo, rotulo: "ALTERADO", sinal: "~" },
        exc: { cor: C.vermelho, rotulo: "EXCLUÍDO", sinal: "–" },
    };
    const FAM = "IBM Plex Sans";
    const cor = (h, a = 1) => {
        const n = parseInt(h.slice(1), 16);
        return [{ type: "SOLID", color: { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 }, opacity: a }];
    };
    async function fontes() {
        for (const s of ["Regular", "Medium", "SemiBold", "Bold"]) await figma.loadFontAsync({ family: FAM, style: s });
    }
    function T(s, o = {}) {
        const t = figma.createText();
        t.fontName = { family: FAM, style: o.fw || "Regular" };
        t.fontSize = o.fs || 13;
        t.characters = String(s);
        t.fills = cor(o.c || C.texto);
        if (o.ls) t.letterSpacing = { unit: "PIXELS", value: o.ls };
        if (o.lh) t.lineHeight = { unit: "PIXELS", value: o.lh };
        if (o.w) { t.textAutoResize = "HEIGHT"; t.resize(o.w, t.height); }
        if (o.fill) { t.layoutAlign = "STRETCH"; t.textAutoResize = "HEIGHT"; }
        if (o.strike) t.textDecoration = "STRIKETHROUGH";
        t.name = o.nome || String(s).slice(0, 30);
        return t;
    }
    function F(nome, o = {}) {
        const f = figma.createFrame();
        f.name = nome;
        f.fills = o.fill ? cor(o.fill, o.fillA ?? 1) : [];
        f.layoutMode = o.dir || "VERTICAL";
        f.primaryAxisSizingMode = "AUTO";
        f.counterAxisSizingMode = "AUTO";
        f.itemSpacing = o.gap ?? 0;
        f.paddingLeft = o.pl ?? o.px ?? 0;
        f.paddingRight = o.pr ?? o.px ?? 0;
        f.paddingTop = o.pt ?? o.py ?? 0;
        f.paddingBottom = o.pb ?? o.py ?? 0;
        if (o.stretch) f.layoutAlign = "STRETCH";
        if (o.stretch && o.dir === "HORIZONTAL") {
            f.primaryAxisSizingMode = "FIXED";
            f.resize(o.w || 576, 10);
            f.counterAxisSizingMode = "AUTO";
        }
        if (o.r) f.cornerRadius = o.r;
        if (o.alinha) f.counterAxisAlignItems = o.alinha;
        return f;
    }
    const rotulo = (s) => T(s.toUpperCase(), { fs: 10, fw: "SemiBold", c: C.cinza, ls: 1.1 });


    /** cfg: { kicker, titulo, intro, adicionado:[texto], telas:[[tipo,titulo,texto]], regrasTitulo, regras:[texto], nome } */
    G.siplamCapa = async function (y, cfg) {
        await fontes();
        const sec = figma.createSection();
        sec.name = cfg.nome;
        sec.fills = cor("#f7f9fc");
        figma.currentPage.appendChild(sec);
        sec.x = 0; sec.y = y;
        sec.resizeWithoutConstraints(1244, 900);
        const cartao = F("Cartão", { fill: "#ffffff", gap: 22, pl: 40, pr: 40, pt: 44, pb: 48 });
        cartao.counterAxisSizingMode = "FIXED";
        cartao.resize(1068, 100);
        cartao.primaryAxisSizingMode = "AUTO";
        cartao.cornerRadius = 8;
        cartao.strokes = cor("#e3e8ef"); cartao.strokeWeight = 1; cartao.strokeAlign = "INSIDE";
        cartao.clipsContent = true;
        const faixa = figma.createFrame(); faixa.name = "Faixa"; faixa.resize(1068, 5); faixa.fills = cor(C.verde);
        const bloco = (titulo, filhos, gap = 8) => {
            const b = F(titulo, { gap, stretch: true });
            b.appendChild(rotulo(titulo));
            filhos.forEach((c) => b.appendChild(c));
            cartao.appendChild(b);
        };
        const corpo = (s) => T(s, { fs: 13.5, lh: 21, fill: true });
        const item = (tipo, titulo, texto) => {
            const l = F("Item", { dir: "HORIZONTAL", gap: 12, stretch: true, alinha: "MIN", w: 988 });
            const chip = F("chip", { fill: TIPO[tipo].cor, px: 8, py: 3, r: 4 });
            chip.appendChild(T(TIPO[tipo].rotulo, { fs: 9.5, fw: "Bold", c: "#ffffff", ls: 0.8 }));
            const w = F("wrap", { pt: 1 }); w.appendChild(chip);
            l.appendChild(w);
            const col = F("col", { gap: 2 }); col.layoutGrow = 1;
            col.appendChild(T(titulo, { fs: 13.5, fw: "SemiBold", c: C.titulo, fill: true }));
            col.appendChild(T(texto, { fs: 12.5, lh: 19, fill: true }));
            l.appendChild(col);
            return l;
        };
        const cab = F("Cabeçalho", { gap: 12, stretch: true });
        cab.appendChild(T(cfg.kicker, { fs: 10, fw: "SemiBold", c: C.verde, ls: 1.2 }));
        cab.appendChild(T(cfg.titulo, { fs: 28, fw: "Bold", c: C.titulo, lh: 34, fill: true }));
        cab.appendChild(T(cfg.intro, { fs: 14, lh: 22, fill: true }));
        cartao.appendChild(cab);
        const div = figma.createFrame(); div.name = "Divisória"; div.resize(988, 1); div.fills = cor(C.linha); div.layoutAlign = "STRETCH"; cartao.appendChild(div);
        bloco("O que foi adicionado", cfg.adicionado.map(corpo), 9);
        bloco("Telas criadas", cfg.telas.map(([t, a, b]) => item(t, a, b)), 12);
        bloco(cfg.regrasTitulo || "Regras que valem em todas as telas", cfg.regras.map(corpo), 10);
        bloco("Fluxo de modificações — como ler", [
            item("novo", "Verde", "Foi adicionado à tela. O retângulo verde translúcido marca onde e a etiqueta diz o quê."),
            item("mod", "Amarelo", "Já existia e foi alterado. O texto explica a mudança."),
            item("exc", "Vermelho", "Foi excluído. O retângulo tracejado marca onde ficava."),
        ], 12);
        sec.appendChild(cartao);
        cartao.x = 88; cartao.y = 88;
        sec.appendChild(faixa); faixa.x = 88; faixa.y = 88;
        sec.resizeWithoutConstraints(1244, Math.round(cartao.height) + 176);
        sec.y = y - (sec.height + 200);
        return { sec: sec.id, h: Math.round(sec.height) };
    };
})();
