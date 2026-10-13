/* Monta uma seção de fluxo: handoff à esquerda, faixa escura, passos e telas à direita. */
(function () {
    const G = globalThis;
    const C = { verde: "#1ab394", cinza: "#9ba6b7", texto: "#4c4c5c", titulo: "#343a40", codigo: "#7a6a9b", linha: "#eef2f7", cab: "#f2f6fa", marinho: "#0f2b46" };
    const cor = (h, a = 1) => {
        const n = parseInt(h.slice(1), 16);
        return [{ type: "SOLID", color: { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 }, opacity: a }];
    };
    const FAM = "IBM Plex Sans";
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
        if (o.grow) { t.resize(Math.min(t.width, 300), t.height); t.layoutGrow = 1; t.textAutoResize = "HEIGHT"; }
        t.name = o.nome || String(s).slice(0, 30);
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
        if (o.stretch && o.dir === "HORIZONTAL") {
            f.primaryAxisSizingMode = "FIXED";
            f.resize(576, 10);
            f.counterAxisSizingMode = "AUTO";
        }
        if (o.grow) f.layoutGrow = 1;
        if (o.r) f.cornerRadius = o.r;
        if (o.alinha) f.counterAxisAlignItems = o.alinha;
        return f;
    }
    const rotulo = (s) => T(s.toUpperCase(), { fs: 10, fw: "SemiBold", c: C.cinza, ls: 1.1 });
    const corpo = (s) => T(s, { fs: 13, lh: 20, fill: true });

    async function handoff(h) {
        const f = F("📄 Handoff · " + h.titulo, { fill: "#ffffff", gap: 22, pl: 32, pr: 32, pt: 30, pb: 40 });
        f.counterAxisSizingMode = "FIXED";
        f.resize(640, 100);
        f.primaryAxisSizingMode = "AUTO";
        f.strokes = cor("#e3e8ef");
        f.strokeWeight = 1;
        f.strokeAlign = "INSIDE";
        f.cornerRadius = 8;
        f.clipsContent = true;

        const cab = F("Cabeçalho", { gap: 6, stretch: true });
        cab.appendChild(T("HANDOFF DE TELA", { fs: 10, fw: "SemiBold", c: C.verde, ls: 1.2 }));
        cab.appendChild(T(h.titulo, { fs: 21, fw: "Bold", c: C.titulo, lh: 27, fill: true }));
        cab.appendChild(T(h.arquivo, { fs: 12, c: C.cinza, lh: 18, fill: true }));
        f.appendChild(cab);
        const div = figma.createFrame();
        div.name = "Divisória";
        div.resize(576, 1);
        div.fills = cor(C.linha);
        div.layoutAlign = "STRETCH";
        f.appendChild(div);

        const bloco = (titulo, filhos, gap = 8) => {
            const b = F(titulo, { gap, stretch: true });
            b.appendChild(rotulo(titulo));
            filhos.forEach((c) => b.appendChild(c));
            f.appendChild(b);
        };
        const par = (k, v) => {
            const l = F("Linha", { dir: "HORIZONTAL", gap: 8, stretch: true });
            l.appendChild(T(k, { fs: 12, fw: "Medium", c: C.cinza, w: 150 }));
            l.appendChild(T(v, { fs: 12.5, lh: 18, grow: true }));
            return l;
        };

        if (h.entrega) bloco(h.tituloEntrega || "O que este fluxo entrega", [corpo(h.entrega)], 10);
        if (h.acesso) bloco("Quem acessa", h.acesso.map(([k, v]) => par(k, v)), 10);
        if (h.componentes) {
            bloco(
                "Componentes utilizados",
                h.componentes.map(([n, c]) => {
                    const l = F("Linha", { dir: "HORIZONTAL", gap: 8, stretch: true });
                    l.appendChild(T(n, { fs: 12.5, fw: "Medium", lh: 18, w: 210 }));
                    l.appendChild(T(c, { fs: 11.5, c: C.codigo, lh: 17, grow: true }));
                    return l;
                }),
                9
            );
        }
        for (const tb of h.tabelas || []) {
            const larg = tb.larguras || [190, 120, 58, 188];
            const wrap = F(tb.titulo, { gap: 0, stretch: true });
            wrap.appendChild(rotulo(tb.titulo));
            const sp = figma.createFrame();
            sp.resize(10, 10);
            sp.fills = [];
            sp.name = "espaço";
            wrap.appendChild(sp);
            const th = F("thead", { dir: "HORIZONTAL", fill: C.cab, gap: 0, pl: 10, pr: 10, pt: 9, pb: 9, stretch: true });
            tb.cab.forEach((c, i) => th.appendChild(T(c.toUpperCase(), { fs: 9.6, fw: "SemiBold", ls: 0.8, w: larg[i] })));
            wrap.appendChild(th);
            for (const lin of tb.linhas) {
                const r = F("linha", { dir: "HORIZONTAL", gap: 0, pl: 10, pr: 10, pt: 9, pb: 9, stretch: true, alinha: "MIN" });
                r.strokes = cor(C.linha);
                r.strokeAlign = "INSIDE";
                r.strokeTopWeight = 0;
                r.strokeLeftWeight = 0;
                r.strokeRightWeight = 0;
                r.strokeBottomWeight = 1;
                lin.forEach((v, i) => r.appendChild(T(v, { fs: 11.8, fw: i === 0 ? "Medium" : "Regular", c: i === 0 ? C.texto : C.cinza, lh: 16, w: larg[i] })));
                wrap.appendChild(r);
            }
            f.appendChild(wrap);
        }
        for (const s of h.secoes || []) bloco(s.titulo, [corpo(s.texto)], 10);
        if (h.estados) {
            bloco(
                "Estados previstos",
                h.estados.map((e) => {
                    const l = F("Estado", { dir: "HORIZONTAL", gap: 8, stretch: true, alinha: "MIN" });
                    const d = figma.createFrame();
                    d.resize(4, 4);
                    d.cornerRadius = 2;
                    d.fills = cor(C.verde);
                    d.name = "ponto";
                    const dw = F("pt", { pt: 8 });
                    dw.appendChild(d);
                    l.appendChild(dw);
                    l.appendChild(T(e, { fs: 13, lh: 19, grow: true }));
                    return l;
                }),
                8
            );
        }
        return f;
    }

    G.siplamFluxo = async function (spec, secaoY) {
        await fontes();
        const n = spec.telas.length;
        const LARG = 1440, GAP = 80;
        const xTelas = 72 + 640 + 80;
        const larguraSecao = xTelas + n * LARG + (n - 1) * GAP + 72;
        const sec = figma.createSection();
        sec.name = spec.nome;
        sec.fills = [];
        sec.strokes = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.1 }];
        sec.strokeWeight = 1;
        figma.currentPage.appendChild(sec);
        sec.x = 0;
        sec.y = secaoY;
        sec.resizeWithoutConstraints(larguraSecao, 600);

        const faixa = figma.createFrame();
        faixa.name = "Faixa do fluxo";
        faixa.resize(n * LARG + (n - 1) * GAP, 84);
        faixa.fills = cor(C.marinho);
        faixa.cornerRadius = 8;
        faixa.clipsContent = true;
        const barra = figma.createFrame();
        barra.name = "Marca";
        barra.resize(5, 84);
        barra.fills = cor(C.verde);
        faixa.appendChild(barra);
        const t1 = T(spec.faixa, { fs: 20, fw: "Bold", c: "#ffffff" });
        faixa.appendChild(t1); t1.x = 28; t1.y = 20;
        const t2 = T(spec.faixaSub, { fs: 12.5, c: "#9fb3c8" });
        faixa.appendChild(t2); t2.x = 28; t2.y = 50;
        const t3 = T(n + (n === 1 ? " tela" : " telas"), { fs: 11, fw: "Medium", c: "#9fb3c8" });
        t3.textAlignHorizontal = "RIGHT";
        t3.textAutoResize = "NONE";
        t3.resize(faixa.width - 28, 14);
        faixa.appendChild(t3); t3.x = 0; t3.y = 34;
        sec.appendChild(faixa);
        faixa.x = xTelas; faixa.y = 72;

        spec.telas.forEach((t, i) => {
            const p = figma.createFrame();
            p.name = "Passo " + (i + 1);
            p.fills = [];
            p.resize(LARG, 28);
            p.clipsContent = false;
            const c = figma.createFrame();
            c.name = "Número";
            c.resize(26, 26);
            c.cornerRadius = 13;
            c.fills = cor(C.marinho);
            p.appendChild(c);
            const nn = T(String(i + 1), { fs: 12, fw: "Bold", c: "#ffffff" });
            nn.textAlignHorizontal = "CENTER";
            nn.textAutoResize = "NONE";
            nn.resize(26, 16);
            c.appendChild(nn); nn.x = 0; nn.y = 5;
            const a = T(t.titulo, { fs: 14, fw: "SemiBold", c: C.titulo });
            p.appendChild(a); a.x = 36; a.y = 4;
            const b = T("→  " + t.passo, { fs: 12.5, c: C.cinza });
            p.appendChild(b); b.x = 36 + a.width + 18; b.y = 6;
            sec.appendChild(p);
            p.x = xTelas + i * (LARG + GAP); p.y = 158;
        });

        const hd = await handoff(spec.handoff);
        sec.appendChild(hd);
        hd.x = 72; hd.y = 72;
        return { sec: sec.id, handoffH: Math.round(hd.height), xTelas, GAP, LARG };
    };

    G.__pend = G.__pend || {};
    /** Refaz uma tela de um fluxo: apaga a antiga e desenha de novo no mesmo lugar. */
    G.siplamRefazer = async function (secId, i, arquivo) {
        const sec = await figma.getNodeByIdAsync(secId);
        const pref = String(i + 1).padStart(2, "0") + " · ";
        const velha = sec.children.find((c) => c.name.startsWith(pref));
        const { x, y, name } = velha;
        velha.remove();
        const chave = secId + ":r" + i;
        G.siplamJob(arquivo, secId, x, y, name, chave);
        return chave;
    };
    G.siplamRefazerEsperar = async function (chaves, ms = 20000) {
        const t0 = Date.now();
        while (Date.now() - t0 < ms && chaves.some((k) => !G.__jobs[k] || G.__jobs[k].estado === "rodando")) await new Promise((r) => setTimeout(r, 400));
        return chaves.map((k) => G.__jobs[k]);
    };
    /** Cria a seção e dispara a construção das telas (cada `tela.dados` é um arquivo da ponte). */
    G.siplamMontar = async function (spec, y) {
        const r = await G.siplamFluxo(spec, y);
        const chaves = [];
        spec.telas.forEach((t, i) => {
            const chave = r.sec + ":" + i;
            chaves.push(chave);
            G.siplamJob(t.dados, r.sec, r.xTelas + i * (r.LARG + r.GAP), 196, String(i + 1).padStart(2, "0") + " · " + t.titulo, chave);
        });
        G.__pend[r.sec] = chaves;
        return { sec: r.sec, telas: chaves.length };
    };
    G.siplamMontarArquivo = async function (arquivo, y) {
        const spec = await (await fetch("http://localhost:9230/dados/" + arquivo + ".json")).json();
        return G.siplamMontar(spec, y == null ? G.__proxY : y);
    };
    /** Espera as telas da seção ficarem prontas (até `ms`) e ajusta a altura quando acabar. */
    G.siplamEsperar = async function (secId, ms = 24000) {
        const t0 = Date.now();
        const chaves = G.__pend[secId] || [];
        while (Date.now() - t0 < ms && chaves.some((k) => !G.__jobs[k] || G.__jobs[k].estado === "rodando")) await new Promise((r) => setTimeout(r, 400));
        const estados = chaves.map((k) => G.__jobs[k]);
        const pronto = estados.every((e) => e && e.estado !== "rodando");
        const res = { pronto, nos: estados.reduce((s, e) => s + ((e && e.nos) || 0), 0), erros: estados.filter((e) => e && (e.estado === "erro" || (e.erros && e.erros.length))).map((e) => e.msg || e.erros) };
        if (pronto) res.secao = await G.siplamAjustarSecao(secId);
        return res;
    };
    /** Monta vários fluxos em sequência, em segundo plano. Consulte com siplamFilaEstado(). */
    G.siplamFila = function (arquivos, aposSecId) {
        G.__fila = { estado: "rodando", feitos: [], atual: null, erro: null };
        (async () => {
            try {
                if (aposSecId) {
                    const s = await figma.getNodeByIdAsync(aposSecId);
                    G.__proxY = s.y + s.height + 200;
                }
                for (const a of arquivos) {
                    G.__fila.atual = a;
                    const r = await G.siplamMontarArquivo(a);
                    const e = await G.siplamEsperar(r.sec, 170000);
                    G.__fila.feitos.push({ a, sec: r.sec, nos: e.nos, erros: e.erros, h: e.secao && e.secao.h });
                }
                G.__fila.estado = "pronto";
            } catch (e) {
                G.__fila.estado = "erro";
                G.__fila.erro = String(e && e.message);
            }
        })();
        return true;
    };
    G.siplamFilaEstado = () => G.__fila;

    /** Índice "00": cartão com o como ler e a lista dos fluxos (lida dos documentos na ponte). */
    G.siplamIndice = async function (arquivos, y) {
        await fontes();
        const specs = [];
        for (const a of arquivos) specs.push(await (await fetch("http://localhost:9230/dados/" + a + ".json")).json());
        specs.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR", { numeric: true }));
        const sec = figma.createSection();
        sec.name = "00 · Como ler este material";
        sec.fills = cor("#f7f9fc");
        figma.currentPage.appendChild(sec);
        sec.x = 0; sec.y = y;
        sec.resizeWithoutConstraints(1044, 900);
        const cartao = F("Cartão", { fill: "#ffffff", gap: 22, pl: 32, pr: 32, pt: 38, pb: 40 });
        cartao.counterAxisSizingMode = "FIXED";
        cartao.resize(868, 100);
        cartao.primaryAxisSizingMode = "AUTO";
        cartao.cornerRadius = 8;
        cartao.strokes = cor("#e3e8ef"); cartao.strokeWeight = 1; cartao.strokeAlign = "INSIDE";
        cartao.clipsContent = true;
        const faixa = figma.createFrame(); faixa.name = "Faixa"; faixa.resize(868, 5); faixa.fills = cor(C.verde);
        const cab = F("Cabeçalho", { gap: 12, stretch: true });
        cab.appendChild(T("SIPLAM · PPA 2028–2031", { fs: 10, fw: "SemiBold", c: C.verde, ls: 1.2 }));
        cab.appendChild(T("Entrega 1 — fluxos de tela e handoff", { fs: 26, fw: "Bold", c: C.titulo, lh: 32, fill: true }));
        cab.appendChild(T("Cada seção desta página é um fluxo: um caminho que a pessoa percorre, do primeiro clique ao resultado. As telas ficam lado a lado, da esquerda para a direita, na ordem em que acontecem.", { fs: 13.5, lh: 21, fill: true }));
        cartao.appendChild(cab);
        const div = figma.createFrame(); div.name = "Divisória"; div.resize(804, 1); div.fills = cor(C.linha); div.layoutAlign = "STRETCH"; cartao.appendChild(div);
        const bloco = (titulo, filhos, gap = 8) => { const b = F(titulo, { gap, stretch: true }); b.appendChild(rotulo(titulo)); filhos.forEach((c) => b.appendChild(c)); cartao.appendChild(b); };
        bloco("Como cada seção é montada", [corpo("À esquerda, o documento de handoff: o que o fluxo entrega, quem acessa, os componentes usados, a tabela de campos com tipo e regra, as regras e os estados previstos. No alto, a faixa escura nomeia o fluxo. À direita dela, as telas numeradas — o passo acima de cada uma diz o que a pessoa fez para chegar ali.")]);
        bloco("O que as telas são", [corpo("Reprodução fiel do sistema publicado em felippeissa.github.io/SIPLAM, e não uma proposta nova. Cada tela foi lida do próprio protótipo, em 1440px de largura: posições, cores, tipografia, larguras de coluna e textos são os do navegador. Verde #1AB394, texto #4C4C5C, IBM Plex Sans, base de 13px.")]);
        bloco("Ícones e logo", [corpo("Os ícones são os próprios ícones Tabler usados no sistema, importados como vetor e nomeados na camada (por exemplo, Ícone · ti-pencil). A logo é a marca real do SIPLAM: o brasão de Goiás e o letreiro em vetor.")]);
        bloco("Regras que valem em todas as telas", [corpo("Um PPA por vez: tudo o que se cadastra nasce com o plano escolhido. A visão é consequência do perfil. Nos formulários, Cancelar, Salvar e Excluir ficam no cabeçalho do cartão, no canto superior direito. Registro com vínculo não pode ser excluído: o botão fica visível e desabilitado, com o motivo; só o PPA exige digitar o nome para confirmar. O diagnóstico não é uma árvore: Problema → Causas → Iniciativas, de muitos para muitos, e a subcausa mora dentro da causa. Vínculos com cadastros seguem “buscar o que existe, criar o que falta”.")], 10);
        const linhas = specs.map((s) => {
            const l = F("Linha", { dir: "HORIZONTAL", gap: 14, stretch: true });
            const partes = s.nome.split(" · ");
            l.appendChild(T(partes[0], { fs: 12, c: C.verde, fw: "Bold", w: 92, nome: partes[0] }));
            l.appendChild(T(partes.slice(1).join(" · "), { fs: 12.5, lh: 18, grow: true }));
            const n = s.telas.length;
            const c = T(n + (n === 1 ? " tela" : " telas"), { fs: 11, c: C.cinza });
            l.appendChild(c);
            return l;
        });
        bloco("Índice dos fluxos", linhas, 9);
        sec.appendChild(cartao);
        cartao.x = 88; cartao.y = 88;
        sec.appendChild(faixa); faixa.x = 88; faixa.y = 88;
        sec.resizeWithoutConstraints(1044, Math.round(cartao.height) + 176);
        return { sec: sec.id, h: Math.round(sec.height) };
    };

    /** Apaga o que veio antes (ids "4:") e empilha as seções novas, em ordem, a partir de y=0. */
    G.siplamOrganizar = async function () {
        const pag = figma.currentPage;
        const velhas = pag.children.filter((n) => /^4:/.test(n.id));
        const apagadas = velhas.map((n) => n.name);
        velhas.forEach((n) => n.remove());
        const fluxos = pag.children.filter((n) => n.type === "SECTION" && /^Fluxo /.test(n.name)).sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { numeric: true }));
        let y = 0;
        for (const s of fluxos) { s.y = y; y += s.height + 200; }
        const ind = pag.children.find((n) => n.name.startsWith("00 · "));
        if (ind) ind.y = -(ind.height + 200);
        return { apagadas: apagadas.length, fluxos: fluxos.length, altura: y };
    };
    /** Ajusta a altura da seção ao que ficou dentro dela. */
    G.siplamAjustarSecao = async function (secId) {
        const sec = await figma.getNodeByIdAsync(secId);
        let maxY = 0;
        for (const c of sec.children) maxY = Math.max(maxY, c.y + c.height);
        sec.resizeWithoutConstraints(sec.width, maxY + 72);
        G.__proxY = sec.y + sec.height + 200;
        // camadas na ordem dos passos (as telas terminam em ordem qualquer)
        const telas = sec.children.filter((c) => /^\d\d · /.test(c.name)).sort((a, b) => a.x - b.x);
        telas.forEach((t) => sec.appendChild(t));
        return { w: Math.round(sec.width), h: Math.round(sec.height) };
    };
})();
