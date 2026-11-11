/* Páginas do Figma: capa de Marcadores e fluxo de modificações (verde = adicionado, amarelo = alterado, vermelho = excluído). */
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

    /* ---------- capa: o que foi adicionado e quais telas foram criadas ---------- */
    G.siplamMarcadoresCapa = async function (y) {
        await fontes();
        const sec = figma.createSection();
        sec.name = "00 · Marcadores — o que foi adicionado";
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
        cab.appendChild(T("SIPLAM · PPA 2028–2031 · ENTREGA 02", { fs: 10, fw: "SemiBold", c: C.verde, ls: 1.2 }));
        cab.appendChild(T("Marcadores — o que foi adicionado", { fs: 28, fw: "Bold", c: C.titulo, lh: 34, fill: true }));
        cab.appendChild(T("Marcadores são etiquetas coloridas que a pessoa põe nos Programas para achá-los depois. Esta página reúne o fluxo das telas novas, com a documentação de cada uma, e o fluxo das modificações, que mostra em cada tela o que foi adicionado, alterado ou excluído.", { fs: 14, lh: 22, fill: true }));
        cartao.appendChild(cab);
        const div = figma.createFrame(); div.name = "Divisória"; div.resize(988, 1); div.fills = cor(C.linha); div.layoutAlign = "STRETCH"; cartao.appendChild(div);

        bloco("O que foi adicionado", [
            corpo("1. Cadastro de Marcadores, em Gestão: nome, área, descrição e cor. A área diz quem pode usar o marcador: o administrador marca para todo um perfil; os demais perfis só para si."),
            corpo("2. 40 marcadores de exemplo (prioridade, situação, risco, recurso e áreas de governo), gravados uma vez na primeira carga."),
            corpo("3. Marcadores nos Programas: coluna com selo na cor do marcador, dica com nome, descrição e observação, e filtro por marcador."),
            corpo("4. Janela “Adicionar marcadores”: dropdown, prévia da cor, título e descrição, observação opcional e lista enxuta para tirar."),
            corpo("5. Campo Marcadores no formulário do Programa, um dropdown com caixas de marcar."),
            corpo("6. Visão do setorial: coluna e filtro de marcadores, só para consulta."),
        ], 9);

        bloco("Telas criadas", [
            item("novo", "Fluxo M1 · Listagem e busca", "4 telas — a lista de marcadores, a busca, o estado sem resultado e a visão do setorial."),
            item("novo", "Fluxo M2 · Criar", "4 telas — novo marcador, campo obrigatório, formulário preenchido e a área travada para outros perfis."),
            item("novo", "Fluxo M3 · Editar e excluir", "4 telas — edição, só leitura, exclusão com justificativa e exclusão bloqueada por uso."),
            item("novo", "Fluxo M4 · Marcadores nos Programas", "9 telas — cadastro, dica, filtro, a janela de marcadores em três momentos, o formulário, a Home do plano e a visão do setorial."),
        ], 12);

        bloco("Regras que valem em todas as telas", [
            corpo("Quem vê o Programa vê os marcadores postos nele, seja qual for a área do marcador; a área decide só quem pode usar o marcador para marcar. O marcador “só para mim” fica visível, na lista de Marcadores, só para quem o criou. Toda exclusão pede justificativa, e marcador posto em um Programa não se exclui."),
        ], 10);

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

    /* ---------- fluxo de modificações ---------- */
    function marcacao(tela, a, ocupados) {
        const t = TIPO[a.tipo];
        const r = figma.createFrame();
        r.name = `Marcação · ${t.rotulo}`;
        r.x = a.x; r.y = a.y;
        r.resize(Math.max(4, a.w), Math.max(4, a.h));
        r.fills = cor(t.cor, a.fantasma ? 0.1 : 0.16);
        r.strokes = cor(t.cor);
        r.strokeWeight = 2;
        r.strokeAlign = "OUTSIDE";
        r.cornerRadius = 4;
        if (a.fantasma) r.dashPattern = [6, 4];
        r.clipsContent = false;
        tela.appendChild(r);
        r.x = a.x; r.y = a.y;
        // etiqueta: em cima do retângulo; se encostar numa outra, sobe; se não couber, vai embaixo
        const chip = F(`Etiqueta · ${t.rotulo}`, { dir: "HORIZONTAL", gap: 6, fill: t.cor, px: 8, py: 4, r: 4, alinha: "CENTER" });
        chip.appendChild(T(`${t.sinal} ${t.rotulo}`, { fs: 10, fw: "Bold", c: "#ffffff", ls: 0.6 }));
        chip.appendChild(T(a.texto, { fs: 11.5, fw: "Medium", c: "#ffffff" }));
        tela.appendChild(chip);
        const cw = chip.width, ch = chip.height;
        // item do menu lateral: a etiqueta vai para a direita dele, sobre a área de conteúdo, e não cobre o menu
        if (a.x + a.w < 260) {
            chip.x = a.x + a.w + 10;
            chip.y = a.y + (a.h - ch) / 2;
            ocupados.push({ x: chip.x, y: chip.y, w: cw, h: ch });
            return { nome: t.rotulo, texto: a.texto };
        }
        let x = Math.max(4, Math.min(a.x, 1440 - cw - 4)), y = a.y - ch - 3;
        const bate = (bx, by) => ocupados.some((o) => bx < o.x + o.w + 4 && bx + cw + 4 > o.x && by < o.y + o.h + 3 && by + ch + 3 > o.y);
        let tentativas = 0;
        while ((y < 2 || bate(x, y)) && tentativas < 8) {
            if (y < 2) { y = a.y + a.h + 3; if (bate(x, y)) y += ch + 4; }
            else y -= ch + 4;
            tentativas++;
        }
        chip.x = x; chip.y = y;
        ocupados.push({ x, y, w: cw, h: ch });
        return { nome: t.rotulo, texto: a.texto };
    }

    G.__modif = { estado: "parado" };
    /** itens: [{ nome, titulo, resumo }] — nomes de capturas md_*; as marcações vêm de an_<nome>.json. */
    G.siplamModificacoes = function (y, itens) {
        G.__modif = { estado: "rodando", feitos: [], erro: null };
        (async () => {
            try {
                await fontes();
                const sec = figma.createSection();
                sec.name = "Fluxo de modificações · Marcadores";
                sec.fills = [];
                sec.strokes = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.1 }];
                sec.strokeWeight = 1;
                figma.currentPage.appendChild(sec);
                sec.x = 0; sec.y = y;
                const LARG = 1440, XCARD = 72 + LARG + 64, LCARD = 560;
                sec.resizeWithoutConstraints(XCARD + LCARD + 72, 600);

                // faixa de abertura, com a legenda das cores
                const faixa = figma.createFrame();
                faixa.name = "Faixa do fluxo";
                faixa.resize(LARG + 64 + LCARD, 84);
                faixa.fills = cor(C.marinho);
                faixa.cornerRadius = 8;
                faixa.clipsContent = true;
                const barra = figma.createFrame(); barra.name = "Marca"; barra.resize(5, 84); barra.fills = cor(C.verde); faixa.appendChild(barra);
                const t1 = T("Fluxo de modificações · Marcadores", { fs: 20, fw: "Bold", c: "#ffffff" }); faixa.appendChild(t1); t1.x = 28; t1.y = 20;
                const t2 = T("O que foi adicionado, alterado e excluído em cada tela existente.", { fs: 12.5, c: "#9fb3c8" }); faixa.appendChild(t2); t2.x = 28; t2.y = 50;
                let lx = faixa.width - 600;
                for (const k of ["novo", "mod", "exc"]) {
                    const c = F("Legenda", { dir: "HORIZONTAL", gap: 8, alinha: "CENTER" });
                    const q = figma.createFrame(); q.resize(22, 14); q.cornerRadius = 3; q.fills = cor(TIPO[k].cor, 0.4); q.strokes = cor(TIPO[k].cor); q.strokeWeight = 2;
                    if (k === "exc") q.dashPattern = [4, 3];
                    c.appendChild(q); c.appendChild(T(TIPO[k].rotulo.toLowerCase(), { fs: 12, fw: "Medium", c: "#ffffff" }));
                    faixa.appendChild(c); c.x = lx; c.y = 34; lx += 150;
                }
                sec.appendChild(faixa); faixa.x = 72; faixa.y = 72;

                let yy = 72 + 84 + 56;
                const chaves = [];
                for (let i = 0; i < itens.length; i++) {
                    const it = itens[i];
                    const dados = await (await fetch(`${PONTE}/dados/${it.nome}.json`)).json();
                    const marcas = await (await fetch(`${PONTE}/dados/an_${it.nome}.json`)).json();
                    const nomeTela = String(i + 1).padStart(2, "0") + " · " + it.titulo;
                    const chave = sec.id + ":m" + i;
                    chaves.push({ chave, nomeTela, marcas, it, h: dados.h, yy });
                    G.siplamJob(it.nome, sec.id, 72, yy, nomeTela, chave);
                    // passo acima da tela
                    yy += dados.h + 140;
                }
                G.__modif.feitos.push("telas pedidas: " + chaves.length);
                const t0 = Date.now();
                while (Date.now() - t0 < 600000 && chaves.some((c) => !G.__jobs[c.chave] || G.__jobs[c.chave].estado === "rodando")) await new Promise((r) => setTimeout(r, 500));

                for (const c of chaves) {
                    const tela = sec.children.find((n) => n.name === c.nomeTela);
                    if (!tela) { G.__modif.feitos.push("sem tela: " + c.nomeTela); continue; }
                    const ocupados = [];
                    const resumos = c.marcas.filter((m) => !m.falta).map((m) => marcacao(tela, m, ocupados));
                    // título do passo
                    const passo = T(c.nomeTela, { fs: 15, fw: "SemiBold", c: C.titulo });
                    sec.appendChild(passo); passo.x = 72; passo.y = tela.y - 34;
                    // cartão com a explicação, à direita da tela
                    const card = F("Explicação · " + c.nomeTela, { fill: "#ffffff", gap: 14, pl: 24, pr: 24, pt: 22, pb: 26, r: 8 });
                    card.counterAxisSizingMode = "FIXED"; card.resize(LCARD, 100); card.primaryAxisSizingMode = "AUTO";
                    card.strokes = cor("#e3e8ef"); card.strokeWeight = 1; card.strokeAlign = "INSIDE";
                    card.appendChild(T("O QUE MUDOU NESTA TELA", { fs: 10, fw: "SemiBold", c: C.cinza, ls: 1.1 }));
                    card.appendChild(T(c.it.titulo, { fs: 16, fw: "Bold", c: C.titulo, fill: true }));
                    if (c.it.resumo) card.appendChild(T(c.it.resumo, { fs: 12.5, lh: 19, fill: true }));
                    for (const r of resumos) {
                        const tp = Object.values(TIPO).find((t) => t.rotulo === r.nome);
                        const l = F("Linha", { dir: "HORIZONTAL", gap: 10, stretch: true, alinha: "MIN", w: 512 });
                        const ch = F("chip", { fill: tp.cor, px: 7, py: 3, r: 4 }); ch.appendChild(T(tp.rotulo, { fs: 9, fw: "Bold", c: "#ffffff", ls: 0.6 }));
                        const w = F("wrap", { pt: 1 }); w.appendChild(ch); l.appendChild(w);
                        const tx = T(r.texto, { fs: 12.5, lh: 18, fill: true }); tx.layoutGrow = 1; l.appendChild(tx);
                        card.appendChild(l);
                    }
                    sec.appendChild(card); card.x = XCARD; card.y = tela.y;
                    G.__modif.feitos.push(c.nomeTela + ": " + resumos.length + " marcações");
                }
                let maxY = 0;
                for (const n of sec.children) maxY = Math.max(maxY, n.y + n.height);
                sec.resizeWithoutConstraints(sec.width, maxY + 72);
                G.__modif.secao = sec.id;
                G.__modif.estado = "pronto";
            } catch (e) {
                G.__modif.estado = "erro";
                G.__modif.erro = String(e && e.message);
            }
        })();
        return true;
    };
})();
