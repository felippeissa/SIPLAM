/* Extrator: lê uma página renderizada (num iframe) e devolve a árvore de caixas, textos,
   ícones e vetores, com as posições e estilos reais. Usado para recriar a tela no Figma. */
window.extrairTela = function (win, doc) {
    const cor = (s) => {
        if (!s) return null;
        const m = s.match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);
        const a = p.length > 3 ? p[3] : 1;
        if (a === 0) return null;
        return [p[0], p[1], p[2], a];
    };
    const px = (v) => parseFloat(v) || 0;
    const IGNORA = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "OPTION", "OPTGROUP", "HEAD", "META", "LINK", "TITLE", "DATALIST"]);
    let contagem = 0;
    const raizCtx = { elev: [], ox: 0, oy: 0 };

    const nomeDe = (el) => {
        const c = [...el.classList].find((x) => !/^(d-|me-|ms-|mb-|mt-|px-|py-|p-|m-|gap-|col-|fs-|fw-|text-|align-|justify-|w-|h-)/.test(x));
        return el.tagName.toLowerCase() + (c ? "." + c : "") + (el.id ? "#" + el.id : "");
    };

    function quadrados(cs) {
        return [px(cs.borderTopLeftRadius), px(cs.borderTopRightRadius), px(cs.borderBottomRightRadius), px(cs.borderBottomLeftRadius)];
    }

    function bordas(cs) {
        const lados = ["Top", "Right", "Bottom", "Left"].map((l) => ({
            w: cs["border" + l + "Style"] === "none" || cs["border" + l + "Style"] === "hidden" ? 0 : px(cs["border" + l + "Width"]),
            c: cor(cs["border" + l + "Color"]),
            st: cs["border" + l + "Style"],
        }));
        if (lados.every((l) => !l.w || !l.c)) return null;
        return lados;
    }

    function sombra(cs) {
        const s = cs.boxShadow;
        if (!s || s === "none") return null;
        const m = s.match(/(rgba?\([^)]+\))\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+([\d.]+)px(?:\s+(-?[\d.]+)px)?/);
        if (!m) return null;
        const c = cor(m[1]);
        return c ? { c, x: +m[2], y: +m[3], b: +m[4], s: +(m[5] || 0) } : null;
    }

    function textoDe(no, el, cs, ox, oy, saida) {
        const bruto = no.nodeValue;
        const pre = /^pre/.test(cs.whiteSpace);
        const texto = pre ? bruto : bruto.replace(/\s+/g, " ");
        const ini = pre ? 0 : texto.search(/\S/);
        if (ini < 0 || !texto.trim()) return;
        // posição do texto aparado dentro do nó original
        const aparado = bruto.replace(/^\s+/, "");
        const desloc = bruto.length - aparado.length;
        const fim = bruto.replace(/\s+$/, "").length;
        const r = doc.createRange();
        r.setStart(no, desloc);
        r.setEnd(no, fim);
        const rs = [...r.getClientRects()].filter((q) => q.width > 0 && q.height > 0);
        if (!rs.length) return;
        const x0 = Math.min(...rs.map((q) => q.left)), x1 = Math.max(...rs.map((q) => q.right));
        const y0 = Math.min(...rs.map((q) => q.top)), y1 = Math.max(...rs.map((q) => q.bottom));
        const linhas = new Set(rs.map((q) => Math.round(q.top))).size;
        let t = pre ? bruto.slice(desloc, fim) : texto.trim();
        if (cs.textTransform === "uppercase") t = t.toLocaleUpperCase("pt-BR");
        else if (cs.textTransform === "lowercase") t = t.toLocaleLowerCase("pt-BR");
        else if (cs.textTransform === "capitalize") t = t.replace(/(^|\s)(\S)/g, (m, a, b) => a + b.toLocaleUpperCase("pt-BR"));
        const lh = cs.lineHeight === "normal" ? null : px(cs.lineHeight);
        const pai0 = no.parentElement;
        const misto = linhas > 1 && pai0 && ([...pai0.childNodes].some((c) => c !== no && ((c.nodeType === 1 && !/^(BR)$/.test(c.tagName)) || (c.nodeType === 3 && c.nodeValue.trim()))));
        if (misto) {
            // quebra por linha: o navegador alinha a linha inteira (texto + link) e a caixa única não acompanharia
            const tokens = [];
            const cr = doc.createRange();
            let atual = null;
            const base = pre ? bruto : bruto;
            for (let i = desloc; i < fim; i++) {
                cr.setStart(no, i);
                cr.setEnd(no, i + 1);
                const q = [...cr.getClientRects()].find((z) => z.width > 0 && z.height > 0);
                if (!q) { if (atual) atual.s += base[i]; continue; }
                const topo = Math.round(q.top);
                if (!atual || Math.abs(topo - atual.topo) > 3) {
                    atual = { topo, x0: q.left, x1: q.right, y0: q.top, y1: q.bottom, s: base[i] };
                    tokens.push(atual);
                } else { atual.s += base[i]; atual.x1 = Math.max(atual.x1, q.right); }
            }
            for (const l of tokens) {
                const txt = l.s.replace(/\s+/g, " ").trim();
                if (!txt) continue;
                let tt = txt;
                if (cs.textTransform === "uppercase") tt = tt.toLocaleUpperCase("pt-BR");
                saida.push({
                    k: "t", x: l.x0 - ox, y: l.y0 - oy, w: l.x1 - l.x0, h: l.y1 - l.y0, s: tt, lin: 1,
                    fs: px(cs.fontSize), fw: parseInt(cs.fontWeight) || 400, c: cor(cs.color), ff: cs.fontFamily.split(",")[0].replace(/["']/g, "").trim(),
                    ls: cs.letterSpacing === "normal" ? 0 : px(cs.letterSpacing), lh: null, ta: "left", u: /underline/.test(cs.textDecorationLine), it: cs.fontStyle === "italic",
                });
            }
            return;
        }
        const n = {
            k: "t", x: x0 - ox, y: y0 - oy, w: x1 - x0, h: y1 - y0, s: t, lin: linhas,
            fs: px(cs.fontSize), fw: parseInt(cs.fontWeight) || 400, c: cor(cs.color), ff: cs.fontFamily.split(",")[0].replace(/["']/g, "").trim(),
            ls: cs.letterSpacing === "normal" ? 0 : px(cs.letterSpacing), lh, ta: cs.textAlign, u: /underline/.test(cs.textDecorationLine), it: cs.fontStyle === "italic",
        };
        // reticências: a caixa é a do contêiner, não a do texto inteiro
        const pai = no.parentElement;
        const ps = pai ? win.getComputedStyle(pai) : null;
        if (ps && ps.textOverflow === "ellipsis" && pai.scrollWidth > pai.clientWidth + 1) {
            n.trunc = true;
            n.w = Math.max(10, pai.clientWidth - px(ps.paddingLeft) - px(ps.paddingRight));
        }
        saida.push(n);
    }

    function visitar(el, ox, oy, saida, ctx) {
        if (IGNORA.has(el.tagName)) return;
        const cs = win.getComputedStyle(el);
        if (cs.display === "none") return;
        if (cs.display === "contents") {
            visitarFilhos(el, ox, oy, saida, cs, ctx);
            return;
        }
        const invisivel = cs.visibility === "hidden" || cs.visibility === "collapse";
        const r = el.getBoundingClientRect();
        const op = parseFloat(cs.opacity);
        if (op === 0) return;

        // ---- vetores ----
        if (el.tagName.toLowerCase() === "svg" && el.ownerSVGElement == null) {
            if (invisivel || r.width < 1 || r.height < 1) return;
            let m = el.outerHTML;
            if (!/xmlns=/.test(m)) m = m.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
            saida.push({ k: "svg", x: r.left - ox, y: r.top - oy, w: r.width, h: r.height, m, nome: "svg" });
            return;
        }
        if (el.tagName === "IMG") {
            if (invisivel || r.width < 1) return;
            const src = new URL(el.getAttribute("src"), doc.baseURI).pathname.replace(/^\//, "");
            saida.push({ k: "img", x: r.left - ox, y: r.top - oy, w: r.width, h: r.height, src, nome: "img · " + src.split("/").pop() });
            return;
        }

        // ---- ícones Tabler (elemento sem filhos cuja fonte é a de ícones) ----
        const fonte = cs.fontFamily;
        const pseudo = (p) => {
            const c = win.getComputedStyle(el, p).content;
            return c && c !== "none" && c !== "normal" && c.length >= 3 ? c : null;
        };
        if (/tabler-icons/i.test(fonte) && !el.children.length && !el.textContent.trim()) {
            const c = pseudo("::before") || pseudo("::after");
            if (c && !invisivel && r.width > 0) {
                const cp = c.replace(/^["']|["']$/g, "").codePointAt(0);
                const fs = px(cs.fontSize);
                const nome = [...el.classList].find((x) => /^ti-/.test(x)) || "ti";
                saida.push({ k: "i", cp: cp.toString(16), nome, x: r.left - ox, y: r.top - oy + (r.height - fs) / 2, size: fs, c: cor(cs.color), w: r.width });
            }
            return;
        }

        const bg = cor(cs.backgroundColor);
        const bd = bordas(cs);
        const sh = sombra(cs);
        const ov = cs.overflowX !== "visible" || cs.overflowY !== "visible";
        const pinta = !invisivel && (bg || bd || sh);
        const ehCampo = /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
        const marcador = el.tagName === "INPUT" && /^(checkbox|radio)$/.test(el.type);

        let alvo = saida, ox2 = ox, oy2 = oy, quadro = null;
        const zEl = cs.position !== "static" && cs.zIndex !== "auto" ? parseInt(cs.zIndex) || 0 : 0;
        const elevado = zEl > 0 && r.width > 0 && r.height > 0 && !invisivel;
        if ((pinta || (ov && r.width > 0 && r.height > 0) || op < 1 || ehCampo || elevado) && r.width > 0 && r.height > 0) {
            quadro = {
                k: "f", nome: nomeDe(el), x: elevado ? r.left - ctx.ox : r.left - ox, y: elevado ? r.top - ctx.oy : r.top - oy, w: r.width, h: r.height,
                bg: invisivel ? null : bg, bd: invisivel ? null : bd, r: quadrados(cs), sh: invisivel ? null : sh, clip: ov, op: op < 1 ? op : 1, f: [],
                z: cs.position !== "static" && cs.zIndex !== "auto" ? parseInt(cs.zIndex) || 0 : 0,
            };
            // quem tem z-index positivo sobe ao topo da pilha, em coordenadas da tela
            (elevado ? ctx.elev : saida).push(quadro);
            alvo = quadro.f; ox2 = r.left; oy2 = r.top;
        }
        // um elemento com z-index forma o seu próprio contexto de empilhamento: os filhos elevados sobem só até ele
        const ctxF = elevado ? { elev: [], ox: r.left, oy: r.top } : ctx;

        if (ehCampo && !invisivel) {
            const pl = px(cs.paddingLeft) + px(cs.borderLeftWidth), pr = px(cs.paddingRight) + px(cs.borderRightWidth);
            const fs = px(cs.fontSize);
            const lh = cs.lineHeight === "normal" ? fs * 1.3 : px(cs.lineHeight);
            if (marcador) {
                if (el.checked) {
                    alvo.push({ k: "i", cp: "ea5e", nome: "ti-check", x: 0, y: (r.height - Math.min(fs, r.height - 4)) / 2, size: Math.min(fs, r.height - 4), c: [255, 255, 255, 1], w: r.width });
                }
            } else {
                let t = "", ph = false;
                if (el.tagName === "SELECT") t = el.selectedOptions[0] ? el.selectedOptions[0].text : "";
                else if (el.type === "date" || el.type === "month") t = el.value || (el.placeholder || "");
                else { t = el.value; if (!t) { t = el.placeholder || ""; ph = true; } }
                const cinza = ph ? cor(win.getComputedStyle(el, "::placeholder").color) || [108, 117, 125, 1] : cor(cs.color);
                if (t && el.type !== "hidden") {
                    const area = el.tagName === "TEXTAREA";
                    const aj = el.type === "search" || /icon|search/.test(el.className) ? 0 : 0;
                    alvo.push({
                        k: "t", x: pl, y: area ? px(cs.paddingTop) + px(cs.borderTopWidth) : (r.height - lh) / 2, w: r.width - pl - pr - (el.tagName === "SELECT" ? 24 : 0), h: lh, s: t, lin: area ? 2 : 1, area,
                        fs, fw: parseInt(cs.fontWeight) || 400, c: cinza, ff: cs.fontFamily.split(",")[0].replace(/["']/g, "").trim(), ls: 0, lh: px(cs.lineHeight) || null, ta: "left", trunc: !area,
                    });
                }
                if (el.tagName === "SELECT" && !el.multiple) {
                    alvo.push({ k: "i", cp: "ea5f", nome: "ti-chevron-down", x: r.width - 12 - 14, y: (r.height - 14) / 2, size: 14, c: cor(cs.color) || [76, 76, 92, 1], w: 14 });
                }
                if (el.type === "date") {
                    alvo.push({ k: "i", cp: "ea53", nome: "ti-calendar", x: r.width - 12 - 16, y: (r.height - 16) / 2, size: 16, c: [108, 117, 125, 1], w: 16 });
                }
            }
            return;
        }

        if (!invisivel || true) visitarFilhos(el, ox2, oy2, alvo, cs, ctxF);
        if (elevado) quadro.f.push(...ctxF.elev);

        // ícone por pseudo-elemento em elemento com texto próprio vazio (ex.: setas do menu)
        if (!el.children.length && !el.textContent.trim() && r.width > 0 && !/tabler-icons/i.test(fonte)) {
            for (const p of ["::before", "::after"]) {
                const ps = win.getComputedStyle(el, p);
                if (ps.content && ps.content !== "none" && ps.content !== "normal" && /tabler-icons/i.test(ps.fontFamily)) {
                    const cp = ps.content.replace(/^["']|["']$/g, "").codePointAt(0);
                    const fs = px(ps.fontSize) || 16;
                    alvo.push({ k: "i", cp: cp.toString(16), nome: "ti", x: quadro ? 0 : r.left - ox, y: (quadro ? 0 : r.top - oy) + (r.height - fs) / 2, size: fs, c: cor(ps.color), w: r.width });
                    break;
                }
            }
        }
    }

    function visitarFilhos(el, ox, oy, saida, cs, ctx) {
        for (const no of el.childNodes) {
            if (no.nodeType === 3) textoDe(no, el, cs, ox, oy, saida);
            else if (no.nodeType === 1) visitar(no, ox, oy, saida, ctx);
        }
    }

    // quem empilha por z-index passa à frente dos irmãos (o fundo escuro de uma janela fica atrás dela)
    const ordenar = (lista) => {
        const idx = lista.map((n, i) => [n, i]);
        idx.sort((a, b) => (a[0].z || 0) - (b[0].z || 0) || a[1] - b[1]);
        lista.splice(0, lista.length, ...idx.map((p) => p[0]));
        lista.forEach((n) => n.f && ordenar(n.f));
    };
    const raiz = [];
    const corpo = doc.body;
    const csB = win.getComputedStyle(corpo);
    const alturaTotal = Math.max(doc.documentElement.scrollHeight, win.innerHeight);
    visitarFilhos(corpo, 0, 0, raiz, csB, raizCtx);
    raiz.push(...raizCtx.elev);
    ordenar(raiz);
    return { w: win.innerWidth, h: alturaTotal, bg: cor(csB.backgroundColor) || cor(win.getComputedStyle(doc.documentElement).backgroundColor), f: raiz };
};
