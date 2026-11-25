/**
 * Barra de filtros das listagens.
 *
 * É o componente do Inspinia, e não um parecido: o cabeçalho do card guarda os
 * campos, cada um dentro de um `.app-search` com o ícone à esquerda, como em
 * `apps-ecommerce-orders`. O campo de escolha múltipla é o `select` com
 * `data-choices` do template (`form-select.html`), montado pelo Choices que já
 * vem no `vendors.min.js`.
 *
 * Os campos ocupam a largura toda porque o rótulo de um vínculo é uma frase —
 * "Ampliar a rede de cuidado à pessoa idosa" não cabe num campo de 12rem.
 *
 * O filtro espelha a tabela: um campo livre para o nome do registro e um campo
 * de escolha múltipla para cada coluna de vínculo ou de classificação. Filtrar
 * por coluna que a tabela não mostra é pedir à pessoa que confie no resultado
 * sem poder conferi-lo.
 *
 * **Filtra quando se manda filtrar.** Marcar três eixos e ver a lista se refazer
 * a cada marca é trabalhar contra quem está escolhendo: o que está escolhido só
 * vale depois de "Buscar" — ou de Enter no campo livre.
 *
 * Combinação: **E** entre campos, **OU** dentro de um campo. Escolher dois
 * eixos amplia; escolher um eixo e um programa restringe.
 */
import { esc } from "./ui.js";

/** Comparação que ignora acento e caixa — quem busca "orcamento" quer achar "orçamento". */
const normal = (t) =>
    (t ?? "")
        .toLocaleLowerCase("pt-BR")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "");

/**
 * @param {object} cfg
 * @param {{rotulo: string, texto: (item: object) => string}|null} cfg.livre  `null` tira o campo de busca livre
 * @param {Array<object>} [cfg.campos] Um por coluna filtrável. O `tipo` é o componente
 *   da aba Filtros da matriz de mapeamento:
 *     "multi"    (padrão) escolha múltipla — `opcoes()` e `valorDe(item)` devolvem listas;
 *     "texto"    campo de texto livre — `valorDe(item)` devolve o texto a procurar;
 *     "booleano" Sim/Não — `valorDe(item)` devolve ["sim"] ou ["nao"], e `sim`/`nao`
 *                dão os rótulos das duas escolhas.
 * @param {boolean} [cfg.comRotulos=true] GESIS Padrões UX 4.1: rótulo acima de cada campo, e o placeholder deixa de repetir o
 *   rótulo e passa a ser o padrão do tipo — "Digite" no texto, "Selecione" na escolha.
 * @param {string} [cfg.exportar] Nome do arquivo gerado; sem ele, não há botão de exportar.
 * @param {() => string} [cfg.acao] A ação da tela — "Novo…" —, que no Inspinia mora
 *   no cabeçalho do card, junto dos filtros, e não numa faixa acima dele.
 * @param {object} [cfg.paginacao] A de `criarPaginacao`, quando a tabela é paginada:
 *   a exportação a desliga enquanto lê, para levar todas as páginas.
 */
/**
 * As `<option>` de um filtro. Opção com `grupo` entra num `<optgroup>` com esse nome (a ordem de chegada se mantém), e
 * `expande` (lista de valores) faz a opção selecionar todos esses de uma vez, em vez de ser escolhida ela mesma;
 * `busca` é texto extra em que a busca do campo também procura, sem aparecer na lista.
 */
function opcoesHtml(lista) {
    const opcao = (o) =>
        `<option value="${esc(o.valor)}"${o.busca || o.expande ? ` data-custom-properties='${esc(JSON.stringify({ busca: o.busca, expande: o.expande }))}'` : ""}>${esc(o.rotulo)}</option>`;
    if (!lista?.some((o) => o.grupo)) return (lista ?? []).map(opcao).join("");
    const grupos = new Map();
    for (const o of lista) grupos.set(o.grupo ?? "", [...(grupos.get(o.grupo ?? "") ?? []), o]);
    return [...grupos].map(([g, os]) => (g ? `<optgroup label="${esc(g)}">${os.map(opcao).join("")}</optgroup>` : os.map(opcao).join(""))).join("");
}

export function criarFiltros(cfg) {
    const campos = (cfg.campos ?? []).filter(Boolean);

    // O que está escolhido na tela e o que está valendo na tabela são duas
    // coisas: é "Buscar" que leva um ao outro. A escolha da tela mora no
    // próprio campo; aqui fica só o que já está valendo.
    const valendo = new Map(campos.map((c) => [c.id, new Set()]));
    let termo = "";
    let termoValendo = "";

    const tipoDe = (c) => c.tipo ?? "multi";
    /** Rótulo acima do campo, só nas telas que adotaram o padrão. */
    const rotulo = (id, texto) => (cfg.comRotulos !== false ? `<label class="form-label" for="${esc(id)}">${esc(texto)}</label>` : "");
    /** O placeholder: o rótulo (como antes) ou o padrão do guia, conforme `comRotulos`. */
    const dica = (texto, padrao) => esc(cfg.comRotulos !== false ? padrao : texto);

    // As opções saem dos próprios registros: opção que não filtra nada não
    // aparece. Calculadas uma vez, porque a barra não se redesenha.
    const opcoes = new Map(campos.filter((c) => tipoDe(c) === "multi").map((c) => [c.id, c.opcoes()]));

    const ativo = () => !!termoValendo.trim() || campos.some((c) => valendo.get(c.id).size > 0);

    function passa(item) {
        if (cfg.livre && termoValendo.trim() && !normal(cfg.livre.texto(item)).includes(normal(termoValendo.trim()))) return false;
        for (const c of campos) {
            const escolhidos = valendo.get(c.id);
            if (escolhidos.size === 0) continue;

            if (tipoDe(c) === "texto") {
                const [procurado] = [...escolhidos];
                if (!normal([c.valorDe(item)].flat().join(" ")).includes(normal(procurado))) return false;
                continue;
            }

            const valores = [c.valorDe(item) ?? []].flat();
            if (!valores.some((v) => escolhidos.has(v))) return false;
        }
        return true;
    }

    /** Ícone do campo, escolhido pelo que ele filtra. */
    const icone = (c) => c.icone ?? "ti-filter";

    const livreHtml = () => `<div class="filtro-campo">
                    ${rotulo("filtro-livre", cfg.livre.rotulo)}
                    <div class="app-search">
                        <input type="search" id="filtro-livre" class="form-control"
                               placeholder="${dica(cfg.livre.rotulo, "Digite")}" aria-label="Filtrar por ${esc(cfg.livre.rotulo)}" />
                        <i class="ti ti-search app-search-icon text-muted"></i>
                    </div>
                </div>`;
    const campoHtml = (c) => {
                        if (tipoDe(c) === "texto") {
                            return `
                <div class="filtro-campo">
                    ${rotulo(`filtro-${c.id}`, c.rotulo)}
                    <div class="app-search">
                        <input type="search" class="form-control" id="filtro-${esc(c.id)}" data-filtro="${esc(c.id)}"
                               placeholder="${dica(c.rotulo, "Digite")}" aria-label="Filtrar por ${esc(c.rotulo)}" />
                        <i class="ti ${esc(icone(c))} app-search-icon text-muted"></i>
                    </div>
                </div>`;
                        }

                        if (tipoDe(c) === "booleano") {
                            return `
                <div class="filtro-campo">
                    ${rotulo(`filtro-${c.id}`, c.rotulo)}
                    <div class="app-search">
                        <select class="form-select form-control" id="filtro-${esc(c.id)}" data-filtro="${esc(c.id)}"
                                aria-label="Filtrar por ${esc(c.rotulo)}">
                            <option value="">${dica(c.rotulo, "Selecione")}</option>
                            <option value="sim">${esc(c.sim ?? "Sim")}</option>
                            <option value="nao">${esc(c.nao ?? "Não")}</option>
                        </select>
                        <i class="ti ${esc(icone(c))} app-search-icon text-muted"></i>
                    </div>
                </div>`;
                        }

                        // O filtro declarado aparece sempre, mesmo sem opções ainda: a tela não muda de forma conforme os dados.
                        const lista = opcoes.get(c.id);
                        return `
                <div class="filtro-campo">
                    ${rotulo(`filtro-${c.id}`, c.rotulo)}
                    <div class="app-search">
                        <select class="form-control" id="filtro-${esc(c.id)}" data-filtro="${esc(c.id)}"
                                data-choices data-choices-removeItem multiple
                                aria-label="Filtrar por ${esc(c.rotulo)}" data-placeholder="${dica(c.rotulo, "Selecione")}">
                            ${opcoesHtml(lista)}
                        </select>
                        <i class="ti ${esc(icone(c))} app-search-icon text-muted"></i>
                    </div>
                </div>`;
                    };

    function html() {
        // GESIS 6.1: passou de uma linha (6 filtros), o resto fica recolhido em "Mais filtros".
        const todos = [...(cfg.livre ? [livreHtml()] : []), ...campos.map(campoHtml)];
        const primeiros = todos.slice(0, 6);
        const resto = todos.slice(6);
        const colunas = (n) => `style="--filtros-colunas:${Math.min(6, n) || 1}"`;
        return `
        <div class="card-header border-light filtros" id="barra-filtros">
            <div class="grade-filtros" ${colunas(primeiros.length)}>${primeiros.join("")}</div>
            ${resto.length ? `<div class="collapse" id="filtros-mais"><div class="grade-filtros mt-3" ${colunas(resto.length)}>${resto.join("")}</div></div>` : ""}

            <!-- GESIS 6.4: os botões ficam abaixo dos filtros, nunca na mesma linha; só o terciário leva ícone. -->
            <div class="filtro-botoes d-flex flex-wrap align-items-center gap-16 mt-3">
                <div class="d-flex align-items-center gap-16 me-auto">
                ${
                    cfg.exportar
                        ? `
                <div class="dropdown">
                    <button class="btn btn-terciario dropdown-toggle drop-arrow-none" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="ti ti-download me-1"></i> Exportar <i class="ti ti-chevron-down align-middle ms-1"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-start">
                        <li><button class="dropdown-item" type="button" data-exportar="csv">Exportar como CSV</button></li>
                        <li><button class="dropdown-item" type="button" data-exportar="xls">Exportar como Excel</button></li>
                    </ul>
                </div>`
                        : ""
                }
                </div>
                ${
                    resto.length
                        ? `<button type="button" class="btn btn-terciario" id="filtro-mais-botao" data-bs-toggle="collapse" data-bs-target="#filtros-mais" aria-expanded="false" aria-controls="filtros-mais"><i class="ti ti-adjustments-horizontal me-1"></i><span>Mais filtros</span></button>`
                        : ""
                }
                <button type="button" class="btn btn-outline-primary" id="filtro-limpar">Limpar</button>
                <button type="button" class="btn btn-primary" id="filtro-buscar">Filtrar</button>
                ${cfg.acao?.() ?? ""}
            </div>
        </div>`;
    }

    /**
     * Liga a barra já desenhada. `aoMudar` redesenha só o corpo da tabela — a
     * barra fica de pé, com os campos como estavam.
     */
    function ligar(aoMudar) {
        const barra = document.getElementById("barra-filtros");
        if (!barra) return;

        const maisBotao = barra.querySelector("#filtro-mais-botao");
        const maisArea = barra.querySelector("#filtros-mais");
        if (maisBotao && maisArea) {
            const texto = (aberto) => (maisBotao.querySelector("span").textContent = aberto ? "Menos filtros" : "Mais filtros");
            maisArea.addEventListener("show.bs.collapse", () => texto(true));
            maisArea.addEventListener("hide.bs.collapse", () => texto(false));
        }

        // O Choices vem no vendors.min.js do template; sem ele o campo continua
        // sendo um `select multiple` que funciona, só mais feio.
        const escolhas = new Map();
        if (typeof Choices !== "undefined") {
            for (const c of campos.filter((c) => tipoDe(c) === "multi")) {
                const campo = barra.querySelector(`#filtro-${c.id}`);
                if (!campo) continue;
                escolhas.set(
                    c.id,
                    new Choices(campo, {
                        removeItemButton: true,
                        shouldSort: false,
                        searchEnabled: true,
                        searchFields: ["label", "value", "customProperties.busca"],
                        placeholderValue: cfg.comRotulos !== false ? "Selecione" : c.rotulo,
                        searchPlaceholderValue: cfg.comRotulos !== false ? "Digite e selecione" : c.rotulo,
                        noResultsText: "Nada encontrado",
                        noChoicesText: "Nada a escolher",
                        itemSelectText: "",
                    })
                );
            }
        }

        // Opção com `expande` (uma dimensão, um tipo) não fica escolhida: troca-se pelos valores que ela reúne.
        for (const [id, escolha] of escolhas) {
            barra.querySelector(`#filtro-${id}`).addEventListener("addItem", (e) => {
                const props = e.detail.customProperties;
                const valores = typeof props === "string" ? JSON.parse(props || "{}").expande : props?.expande;
                if (!valores?.length) return;
                escolha.removeActiveItemsByValue(e.detail.value);
                escolha.setChoiceByValue(valores);
            });
        }

        const lerCampo = (c) => {
            const campo = barra.querySelector(`#filtro-${c.id}`);
            if (tipoDe(c) === "multi") return new Set([...(campo?.selectedOptions ?? [])].map((o) => o.value));
            // Texto e booleano guardam um valor só; vazio quer dizer "sem filtro".
            const v = (campo?.value ?? "").trim();
            return v ? new Set([v]) : new Set();
        };

        const aplicar = () => {
            termo = barra.querySelector("#filtro-livre")?.value ?? "";
            termoValendo = termo;
            for (const c of campos) valendo.set(c.id, lerCampo(c));
            aoMudar();
        };

        // Enter no campo livre é "Buscar": quem digita e aperta Enter não espera
        // ter de procurar um botão.
        barra.addEventListener("keydown", (e) => {
            if ((e.target.id === "filtro-livre" || e.target.matches?.('input[data-filtro]')) && e.key === "Enter") {
                e.preventDefault();
                aplicar();
            }
        });

        barra.addEventListener("click", (e) => {
            if (e.target.closest("#filtro-buscar")) {
                aplicar();
                return;
            }

            if (e.target.closest("#filtro-limpar")) {
                const livre = barra.querySelector("#filtro-livre");
                if (livre) livre.value = "";
                for (const c of campos) {
                    const campo = barra.querySelector(`#filtro-${c.id}`);
                    if (!campo) continue;
                    const escolha = escolhas.get(c.id);
                    if (escolha) escolha.removeActiveItems();
                    else if (tipoDe(c) === "multi") for (const o of campo.options ?? []) o.selected = false;
                    else campo.value = "";
                }
                aplicar();
                return;
            }

            const formato = e.target.closest("[data-exportar]")?.dataset.exportar;
            if (formato) exportar(formato);
        });
    }

    /**
     * Exporta o que está na tela.
     *
     * Lê a própria tabela, e não os registros: assim o arquivo tem as mesmas
     * linhas, as mesmas colunas e a mesma ordem que a pessoa está vendo — um
     * relatório que diverge da tela é pior que nenhum. A coluna de ações fica
     * de fora, porque num arquivo ela não é nada. A paginação é a exceção: o
     * arquivo leva todas as páginas do filtro, não só a que está à vista.
     */
    function exportar(formato) {
        if (cfg.paginacao) cfg.paginacao.todas(() => gerar(formato));
        else gerar(formato);
    }

    function gerar(formato) {
        const tabela = document.querySelector("#conteudo table");
        if (!tabela) return;

        const util = (celulas) =>
            [...celulas].filter((c) => !c.classList.contains("coluna-acoes")).map((c) => c.textContent.replace(/\s+/g, " ").trim());

        const cabecalho = util(tabela.querySelectorAll("thead th"));
        const linhas = [...tabela.querySelectorAll("tbody tr")]
            .filter((tr) => tr.querySelectorAll("td").length > 1)
            .map((tr) => util(tr.querySelectorAll("td")));

        const nome = `${cfg.exportar}-${new Date().toISOString().slice(0, 10)}`;

        if (formato === "csv") {
            // Ponto e vírgula e BOM: é assim que o Excel em português abre o
            // arquivo já separado em colunas, sem passar pelo assistente.
            const linha = (cs) => cs.map((c) => `"${c.replace(/"/g, '""')}"`).join(";");
            baixar(`${nome}.csv`, "﻿" + [cabecalho, ...linhas].map(linha).join("\r\n"), "text/csv;charset=utf-8");
            return;
        }

        const cela = (t, tag) => `<${tag}>${esc(t)}</${tag}>`;
        const corpo = linhas.map((cs) => `<tr>${cs.map((c) => cela(c, "td")).join("")}</tr>`).join("");
        baixar(
            `${nome}.xls`,
            `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8" /></head><body>
            <table><thead><tr>${cabecalho.map((c) => cela(c, "th")).join("")}</tr></thead><tbody>${corpo}</tbody></table>
            </body></html>`,
            "application/vnd.ms-excel;charset=utf-8"
        );
    }

    function baixar(nome, conteudo, tipo) {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
        link.download = nome;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    return { html, ligar, passa, ativo };
}

/** Lista de opções sem repetição, em ordem alfabética, a partir dos registros. */
export function opcoesDe(itens, valor) {
    const vistos = new Map();
    for (const i of itens) {
        for (const v of [valor(i)].flat()) {
            if (v === undefined || v === null || v === "") continue;
            if (!vistos.has(v)) vistos.set(v, { valor: String(v), rotulo: String(v) });
        }
    }
    return [...vistos.values()].sort((a, b) => a.rotulo.localeCompare(b.rotulo, "pt-BR"));
}
