import { esc } from "../ui.js";
import { perfilAtual, somenteLeitura, url } from "../shell.js";
import { nomeDoPerfil } from "../usuarios-decisao.js";
import { campoErro } from "../validacao.js";
import { catalogo } from "../catalogo.js";
import { DIMENSOES } from "../dados/dimensoes-marcador.js";
import { obterEstado, updItem } from "../dados/store.js";
import { avisar } from "../toast.js";
import { MARCA_NOME } from "../form-pagina.js";

export { DIMENSOES };

/**
 * Cadastro de Marcadores (Gestão).
 *
 * Um marcador é uma etiqueta que a pessoa põe nas coisas do plano para achá-las depois. Cinco campos:
 * **nome**, **dimensão**, **tipo**, **descrição** e **cor**. A dimensão (ambiental, social ou de governança)
 * escolhe os tipos que o segundo campo oferece. Pedido de 19/11/2026.
 *
 * Sem **área** (removida em 19/11/2026): todo marcador é visível para todos os perfis. Edita quem o criou e o administrador.
 * Não há identidade de usuário no protótipo, então "quem criou" é o perfil com que se entrou.
 */

/** As cores que a pessoa escolhe: as do tema, escuras o bastante para o texto branco do selo. */
export const CORES = ["#1AB394", "#1C84C6", "#E08E1B", "#ED5565", "#7266BA", "#23A6A8", "#6C757D", "#E0559A", "#8B5E3C", "#343A40"];

/**
 * Dimensão e tipo do marcador: busca no que já existe e, se o que se digitou não existe, cadastra ali mesmo (o padrão
 * de vínculo do sistema). O tipo pertence a uma dimensão e só oferece os da dimensão escolhida.
 */
const dimensaoEscolhida = () => catalogoDimensao.ler()[0] ?? "";

const catalogoDimensao = catalogo({
    colecao: "dimensoesMarcador",
    singular: "Grupo",
    plural: "Grupo",
    artigo: "o",
    prefixo: "mdim",
    unico: true,
    comoCampo: true,
    obrigatorio: true,
    campos: [],
    colunasExtra: [],
    aoCriar: () => ({ ppaId: "" }),
    aoMudar: () => {
        // Trocar a dimensão invalida o tipo: ele pertence à dimensão antiga.
        catalogoTipo.definir([]);
        ajustarBuscaDoTipo();
    },
});

const catalogoTipo = catalogo({
    colecao: "tiposMarcador",
    singular: "Dimensão",
    plural: "Dimensão",
    artigo: "a",
    prefixo: "mtip",
    unico: true,
    comoCampo: true,
    obrigatorio: true,
    campos: [],
    colunasExtra: [],
    filtro: (t) => !!dimensaoEscolhida() && t.dimensaoId === dimensaoEscolhida(),
    aoCriar: () => ({ ppaId: "", dimensaoId: dimensaoEscolhida() }),
});

/** Sem dimensão escolhida, o tipo não tem o que oferecer: a busca avisa em vez de listar nada. */
function ajustarBuscaDoTipo() {
    const busca = document.getElementById("mtip-busca");
    if (!busca) return;
    const sem = !dimensaoEscolhida();
    busca.readOnly = sem;
    busca.placeholder = sem ? "Escolha o grupo primeiro" : "Digite e selecione";
}

const nomeDaDimensao = (estado, id) => (estado?.dimensoesMarcador ?? []).find((d) => d.id === id)?.nome ?? DIMENSOES[id]?.rotulo ?? "";

/** Administrador: o Administrador central e a Alta gestão central, que faz tudo que ele faz. */
export const ehAdmin = () => ["admin-central", "gestao-central"].includes(perfilAtual());

/** Os perfis para os quais um marcador pode ser aberto. "todos" é o valor de quem não restringe. */
export const PERFIS_DE_MARCADOR = ["setorial", "gestao-setorial", "admin-central", "gestao-central", "controle"];

/** "eu" é o marcador só para quem o criou. */
const rotuloDoPerfil = (perfil) => (perfil === "eu" ? "Só para mim" : nomeDoPerfil(perfil));

/**
 * Os perfis de um marcador, numa lista: `perfis` (quem vê) e `gestores` (quem gere). Marcadores antigos guardavam um
 * perfil só em `perfil` ("todos", "eu" ou um perfil); lido aqui para não depender da migração.
 */
export function perfisQueVeem(m) {
    if (Array.isArray(m.perfis)) return m.perfis;
    if (!m.perfil || m.perfil === "todos") return [...PERFIS_DE_MARCADOR];
    return [m.perfil];
}
export const perfisQueGerem = (m) => (Array.isArray(m.gestores) ? m.gestores : []);

/** Rótulo de uma lista de perfis na tabela: todos, só para mim ou os nomes. */
function rotuloDosPerfis(lista) {
    if (lista.includes("eu")) return "Só para mim";
    if (PERFIS_DE_MARCADOR.every((p) => lista.includes(p))) return "Todos os perfis";
    return lista.length ? lista.map(rotuloDoPerfil).join(", ") : "—";
}

/**
 * Quem vê o marcador: os perfis marcados em "Perfis que veem", o dono, quem gere e o administrador, que administra
 * todos. "Só para mim" é de quem criou: nem o administrador o vê. Sem identidade de usuário no protótipo, "dono" é o
 * perfil com que se entrou.
 */
export function visivel(marcador) {
    const eu = perfilAtual();
    const perfis = perfisQueVeem(marcador);
    if (perfis.includes("eu")) return marcador.dono === eu;
    return ehAdmin() || marcador.dono === eu || perfis.includes(eu) || perfisQueGerem(marcador).includes(eu);
}

/** Gere (edita e exclui) quem criou, o administrador e os perfis marcados em "Perfis que gerem". Os demais só veem. */
export function soLeitura(marcador) {
    return !(ehAdmin() || marcador.dono === perfilAtual() || perfisQueGerem(marcador).includes(perfilAtual()));
}

/**
 * Dropdown com caixas de marcar (o mesmo do campo Marcadores). `exclusivo` é a opção que, marcada, desmarca as outras
 * (e vice-versa), como "Só para mim".
 */
function campoDePerfis({ id, rotulo, opcoes, marcados, leitura, obrigatorio, exclusivo }) {
    const resumo = (lista) => (lista.length ? rotuloDosPerfis(lista) : "Selecione");
    if (leitura) {
        return `<div class="mb-3"><label class="form-label">${esc(rotulo)}</label>
            <div class="form-control-plaintext campo-estatico">${esc(marcados.length ? rotuloDosPerfis(marcados) : "—")}</div></div>`;
    }
    return `
    <div class="mb-3">
        <label class="form-label" for="${id}-botao">${esc(rotulo)}${obrigatorio ? ' <span class="text-danger">*</span>' : ""}</label>
        <div class="dropdown" id="${id}" data-exclusivo="${esc(exclusivo ?? "")}">
            <button type="button" class="form-select text-start text-truncate" id="${id}-botao"
                    data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">${esc(resumo(marcados))}</button>
            <div class="dropdown-menu w-100 p-2">
                ${opcoes
                    .map(
                        (p) => `
                <div class="form-check py-1 ms-1">
                    <input class="form-check-input" type="checkbox" id="${id}-${p}" name="${id}" value="${p}" ${marcados.includes(p) ? "checked" : ""} />
                    <label class="form-check-label w-100" for="${id}-${p}">${esc(rotuloDoPerfil(p))}</label>
                </div>`
                    )
                    .join("")}
            </div>
        </div>
        ${campoErro(`${id}-botao`)}
    </div>`;
}

const lerPerfis = (id) => [...document.querySelectorAll(`input[name="${id}"]:checked`)].map((c) => c.value);

function ligarCampoDePerfis(escopo, id) {
    const raiz = escopo.querySelector(`#${id}`);
    if (!raiz) return;
    const exclusivo = raiz.dataset.exclusivo;
    raiz.querySelectorAll(`input[name="${id}"]`).forEach((c) =>
        c.addEventListener("change", () => {
            if (exclusivo && c.checked) {
                raiz.querySelectorAll(`input[name="${id}"]`).forEach((o) => {
                    if (o !== c && (c.value === exclusivo || o.value === exclusivo)) o.checked = false;
                });
            }
            const lista = lerPerfis(id);
            raiz.querySelector(`#${id}-botao`).textContent = lista.length ? rotuloDosPerfis(lista) : "Selecione";
        })
    );
}

const selo = (nome, cor, previa = false) =>
    `<span class="badge fs-12 fw-medium" style="background:${esc(cor)};color:#fff"${previa ? " data-previa" : ""}>${esc(nome || "Etiqueta")}</span>`;

export const marcador = {
    colecao: "marcadores",
    pasta: "central-marcador",
    listagem: "central-marcador.html",
    titulo: "Cadastro de Etiquetas",
    subtitulo: "Etiquetas para achar o que importa, classificadas por grupo e dimensão.",
    novoRotulo: "Nova etiqueta",
    singular: "Etiqueta",
    genero: "f",
    rotuloNome: "Nome da etiqueta",
    exemplo: "Revisar com o órgão",
    podeExcluir: true,
    // A bolinha na cor do marcador vem antes do nome; a cor não precisa de coluna.
    nomeHtml: (item) =>
        `<span class="d-inline-flex align-items-center"><span class="rounded-circle flex-shrink-0 me-2" style="width:10px;height:10px;background:${esc(item.cor ?? CORES[0])}"></span>${esc(item.nome)}</span>`,

    filtros: [
        { tipo: "texto", id: "perfil", rotulo: "Perfil que vê", campo: "perfis", opcoes: () => [{ valor: "eu", rotulo: "Só para mim" }, ...PERFIS_DE_MARCADOR.map((p) => ({ valor: p, rotulo: nomeDoPerfil(p) }))] },
        { tipo: "texto", id: "dimensao", rotulo: "Grupo", campo: "dimensao", opcoes: () => (obterEstado().dimensoesMarcador ?? []).map((d) => ({ valor: d.id, rotulo: d.nome })) },
        { tipo: "texto", id: "tipo", rotulo: "Dimensão", campo: "tipo", opcoes: () => [...new Set((obterEstado().tiposMarcador ?? []).map((t) => t.nome))].sort((a, b) => a.localeCompare(b, "pt-BR")).map((t) => ({ valor: t, rotulo: t })) },
    ],

    visivel,
    leituraDoItem: soLeitura,

    // Alteração em lote: marca-se as linhas e troca-se de uma vez quem vê ou quem gere.
    emLote: {
        acoes: [
            { rotulo: "Alterar quem vê", abrir: (ids, fim) => abrirAlteracaoEmLote("perfis", ids, fim) },
            { rotulo: "Alterar quem gere", abrir: (ids, fim) => abrirAlteracaoEmLote("gestores", ids, fim) },
        ],
    },

    extra: {
        colunas: [
            { rotulo: "Perfis que veem", valor: (item) => esc(rotuloDosPerfis(perfisQueVeem(item))) },
            { rotulo: "Grupo", valor: (item, estado) => esc(nomeDaDimensao(estado, item.dimensao) || "—") },
            { rotulo: "Dimensão", valor: (item) => esc(item.tipo || "—") },
        ],

        html: (edicao, estado) => {
            const leitura = somenteLeitura() || (edicao.id && soLeitura(edicao));
            const cor = edicao.cor || CORES[0];
            const dono = edicao.dono || perfilAtual();

            // O administrador abre o marcador para qualquer perfil. Quem não é administrador escolhe entre guardá-lo só
            // para si e abri-lo para o próprio perfil.
            const novo = !edicao.id;
            const veem = novo ? (ehAdmin() ? [...PERFIS_DE_MARCADOR] : ["eu"]) : perfisQueVeem(edicao);
            const gerem = novo ? [] : perfisQueGerem(edicao);
            const perfisQuePodeEscolher = ehAdmin() ? PERFIS_DE_MARCADOR : [perfilAtual()];
            const perfilCampo =
                campoDePerfis({ id: "f-perfis", rotulo: "Perfis que veem a etiqueta", opcoes: ["eu", ...perfisQuePodeEscolher], marcados: veem, leitura, obrigatorio: true, exclusivo: "eu" }) +
                campoDePerfis({ id: "f-gestores", rotulo: "Perfis que gerem a etiqueta", opcoes: perfisQuePodeEscolher, marcados: gerem, leitura });

            const tipoAtual = (estado?.tiposMarcador ?? []).find((t) => t.dimensaoId === edicao.dimensao && t.nome === edicao.tipo);
            // Visualização: rótulo e texto, como nos demais campos.
            const dimensaoCampo = leitura
                ? `<div class="mb-3"><label class="form-label">Grupo</label><div class="form-control-plaintext campo-estatico">${esc(nomeDaDimensao(estado, edicao.dimensao) || "—")}</div></div>`
                : catalogoDimensao.html(edicao.dimensao ? [edicao.dimensao] : []);
            const tipoCampo = leitura
                ? `<div class="mb-3"><label class="form-label">Dimensão</label><div class="form-control-plaintext campo-estatico">${esc(edicao.tipo || "—")}</div></div>`
                : catalogoTipo.html(tipoAtual ? [tipoAtual.id] : []);

            return `
            <input type="hidden" id="f-dono" value="${esc(dono)}" />
            ${dimensaoCampo}
            ${tipoCampo}
            ${MARCA_NOME}
            ${perfilCampo}
            <div class="mb-3">
                <label class="form-label d-block">Cor da etiqueta <span class="text-danger">*</span></label>
                <div class="d-flex flex-wrap align-items-center gap-2" id="f-cores" role="radiogroup" aria-label="Cor da etiqueta">
                    ${CORES.map(
                        (c) => `
                    <label class="mb-0" title="${c}">
                        <input type="radio" class="d-none" name="f-cor" value="${c}" ${c.toLowerCase() === cor.toLowerCase() ? "checked" : ""} ${leitura ? "disabled" : ""} />
                        <span class="d-inline-block rounded-circle border border-2" data-cor="${c}"
                              style="width:28px;height:28px;background:${c};${leitura ? "" : "cursor:pointer;"}"></span>
                    </label>`
                    ).join("")}
                    <span class="ms-2">${selo("", cor, true)}</span>
                </div>
            </div>`;
        },

        ligar: (escopo) => {
            const previa = escopo.querySelector("[data-previa]");
            const nome = escopo.querySelector("#f-nome");
            const corAtual = () => escopo.querySelector('input[name="f-cor"]:checked')?.value ?? CORES[0];
            const pintar = () => {
                previa.textContent = nome.value.trim() || "Etiqueta";
                previa.style.background = corAtual();
                // o círculo escolhido ganha o contorno escuro
                escopo.querySelectorAll("[data-cor]").forEach((c) => {
                    c.style.borderColor = c.dataset.cor.toLowerCase() === corAtual().toLowerCase() ? "#343a40" : "transparent";
                });
            };
            ligarCampoDePerfis(escopo, "f-perfis");
            ligarCampoDePerfis(escopo, "f-gestores");
            catalogoDimensao.ligar(escopo);
            catalogoTipo.ligar(escopo);
            ajustarBuscaDoTipo();
            nome.addEventListener("input", pintar);
            escopo.querySelectorAll('input[name="f-cor"]').forEach((r) => r.addEventListener("change", pintar));
            pintar();
        },

        ler: () => ({
            perfis: lerPerfis("f-perfis"),
            gestores: lerPerfis("f-gestores"),
            dimensao: dimensaoEscolhida(),
            tipo: obterEstado().tiposMarcador?.find((t) => t.id === catalogoTipo.ler()[0])?.nome ?? "",
            cor: document.querySelector('input[name="f-cor"]:checked')?.value ?? CORES[0],
            dono: document.getElementById("f-dono")?.value || perfilAtual(),
        }),

        regras: (dados) => [
            { campo: "f-perfis-botao", valido: dados.perfis.length > 0, mensagem: "Escolha ao menos um perfil que vê a etiqueta." },
            { campo: "mdim-busca", valido: !!dados.dimensao, mensagem: "Escolha o grupo da etiqueta." },
            { campo: "mtip-busca", valido: !!dados.tipo, mensagem: "Escolha a dimensão da etiqueta." },
        ],
    },

    apoio: (edicao) => (edicao.id && edicao.dono ? [{ rotulo: "Criado por", valor: nomeDoPerfil(edicao.dono) }] : []),
};

/* ---------- uso do marcador nos cadastros ---------- */

/** Os marcadores que esta pessoa enxerga, no plano escolhido: o que ela pode pôr nas coisas e ver nelas. */
export function marcadoresVisiveis(estado) {
    return (estado.marcadores ?? []).filter(visivel);
}

/**
 * Os marcadores que um filtro oferece: os que a pessoa pode usar mais os que já estão postos nos `registros` da tabela.
 * Sem os segundos, ela veria o selo de um marcador e não conseguiria filtrar por ele.
 */
export function marcadoresParaFiltro(registros, estado) {
    const usados = new Set((registros ?? []).flatMap((r) => r.marcadorIds ?? []));
    const lista = (estado.marcadores ?? []).filter((m) => visivel(m) || usados.has(m.id));
    return lista.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

/**
 * As opções do filtro de Marcador, agrupadas por dimensão e tipo ("Dimensão social › Saúde e bem-estar"). A busca do campo
 * também acha pelo nome da dimensão e do tipo, não só pelo do marcador.
 */
export function opcoesDeMarcadorParaFiltro(registros, estado) {
    const marcadores = marcadoresParaFiltro(registros, estado);
    const cmp = (a, b) => a.localeCompare(b, "pt-BR");
    const unicos = (pares) => [...new Map(pares).entries()].sort((a, b) => cmp(a[1], b[1]));

    // Escolher uma dimensão ou um tipo seleciona de uma vez todos os marcadores dela (`expande`; o filtro faz a troca).
    const dosGrupo = (campo, valor) => marcadores.filter((m) => m[campo] === valor).map((m) => m.id);
    const dimensoes = unicos(marcadores.filter((m) => m.dimensao).map((m) => [m.dimensao, nomeDaDimensao(estado, m.dimensao)]));
    const tipos = unicos(marcadores.filter((m) => m.tipo).map((m) => [m.tipo, m.tipo]));
    const todos = [
        ...dimensoes.map(([id, rotulo]) => ({ valor: `dimensao:${id}`, rotulo, grupo: "Por grupo", busca: "dimensão", expande: dosGrupo("dimensao", id) })),
        ...tipos.map(([nome, rotulo]) => ({ valor: `tipo:${nome}`, rotulo, grupo: "Por dimensão", busca: "tipo", expande: dosGrupo("tipo", nome) })),
    ];

    const individuais = marcadores
        .map((m) => {
            const dimensao = nomeDaDimensao(estado, m.dimensao);
            return { valor: m.id, rotulo: m.nome, grupo: [dimensao, m.tipo].filter(Boolean).join(" › ") || "Sem classificação", busca: `${dimensao} ${m.tipo ?? ""}` };
        })
        .sort((a, b) => cmp(a.grupo, b.grupo) || cmp(a.rotulo, b.rotulo));
    return [...todos, ...individuais];
}

/**
 * O selo do marcador numa tabela: um ícone de tag na cor escolhida. O nome, a descrição e a observação aparecem ao
 * passar o mouse (`iniciarDicasDeMarcador` liga a dica).
 *
 * Quem vê o registro vê os marcadores postos nele, seja qual for a área do marcador: a área diz quem pode *usar* o
 * marcador para marcar, não quem o enxerga num Programa (decidido em 12/11/2026).
 */
export function selosDeMarcadores(ids, estado, observacoes = {}) {
    const todos = new Map((estado.marcadores ?? []).map((m) => [m.id, m]));
    const lista = (ids ?? []).map((id) => todos.get(id)).filter(Boolean);
    if (!lista.length) return '<span class="text-muted">—</span>';
    return `<span class="d-inline-flex flex-wrap gap-1" style="min-width:9.25rem">${lista
        .map(
            (m) => `<span class="badge rounded-pill d-inline-flex align-items-center justify-content-center p-0"
                  style="background:${esc(m.cor ?? CORES[0])};width:24px;height:24px" tabindex="0"
                  data-marcador-nome="${esc(m.nome)}" data-marcador-desc="${esc(m.descricao ?? "")}" data-marcador-dimensao="${esc(nomeDaDimensao(estado, m.dimensao))}" data-marcador-tipo="${esc(m.tipo ?? "")}" data-marcador-obs="${esc(observacoes?.[m.id] ?? "")}" aria-label="Etiqueta ${esc(m.nome)}">
                <i class="ti ti-tag fs-14 text-white"></i></span>`
        )
        .join("")}</span>`;
}

/** Liga a dica (nome em destaque e descrição) dos selos que estão dentro de `raiz`. */
export function iniciarDicasDeMarcador(raiz = document) {
    raiz.querySelectorAll("[data-marcador-nome]").forEach((el) => {
        const nome = esc(el.dataset.marcadorNome);
        const desc = el.dataset.marcadorDesc ? `<div class="mt-1">${esc(el.dataset.marcadorDesc)}</div>` : "";
        // Dimensão e tipo, pedido do GP do projeto: entre o nome e a descrição.
        const classe = [["Grupo", el.dataset.marcadorDimensao], ["Dimensão", el.dataset.marcadorTipo]]
            .filter(([, v]) => v)
            .map(([r, v]) => `<div class="mt-1"><strong>${r}:</strong> ${esc(v)}</div>`)
            .join("");
        const obs = el.dataset.marcadorObs ? `<div class="mt-1 fst-italic">Observação: ${esc(el.dataset.marcadorObs)}</div>` : "";
        window.bootstrap?.Tooltip.getOrCreateInstance(el, { html: true, title: `<strong>${nome}</strong>${classe}${desc}${obs}`, placement: "right" });
    });
}

const resumoDeMarcadores = (marcadores) =>
    !marcadores.length ? "Selecione" : marcadores.length <= 2 ? marcadores.map((m) => m.nome).join(", ") : `${marcadores.length} etiquetas selecionadas`;

/**
 * O campo "Marcadores" de um formulário: um dropdown com caixas de marcar. Só lista o que a pessoa enxerga.
 * `lerCampoDeMarcadores` devolve os ids marcados.
 */
export function campoDeMarcadores(selecionados, estado, leitura) {
    const todos = marcadoresVisiveis(estado);
    const marcados = todos.filter((m) => (selecionados ?? []).includes(m.id));
    // Visualização (GESIS 8): rótulo e texto, não um dropdown travado. Cada marcador com a sua cor.
    if (leitura) {
        return `
    <div class="mb-3">
        <label class="form-label">Etiquetas</label>
        <div class="form-control-plaintext campo-estatico${marcados.length ? "" : " text-muted"}">${
            marcados.length
                ? marcados
                      .map((m) => `<span class="d-inline-flex align-items-center me-3"><span class="badge rounded-pill me-1" style="background:${esc(m.cor ?? CORES[0])}">&nbsp;</span>${esc(m.nome)}</span>`)
                      .join("")
                : "—"
        }</div>
    </div>`;
    }
    return `
    <div class="mb-3">
        <label class="form-label" for="f-marcadores-botao">Etiquetas</label>
        <div class="dropdown" id="f-marcadores">
            <button type="button" class="form-select text-start text-truncate" id="f-marcadores-botao"
                    data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false" ${leitura || !todos.length ? "disabled" : ""}>
                ${esc(todos.length ? resumoDeMarcadores(marcados) : "Nenhuma etiqueta cadastrada")}
            </button>
            <div class="dropdown-menu w-100 p-2">
                ${todos
                    .map(
                        (m) => `
                <div class="form-check py-1 ms-1">
                    <input class="form-check-input" type="checkbox" id="f-marcador-${esc(m.id)}" name="f-marcador" value="${esc(m.id)}" ${(selecionados ?? []).includes(m.id) ? "checked" : ""} />
                    <label class="form-check-label w-100" for="f-marcador-${esc(m.id)}">
                        <span class="badge rounded-pill me-1" style="background:${esc(m.cor ?? CORES[0])}">&nbsp;</span>${esc(m.nome)}
                    </label>
                </div>`
                    )
                    .join("")}
            </div>
        </div>
    </div>`;
}

export function ligarCampoDeMarcadores(escopo, estado) {
    const meus = marcadoresVisiveis(estado);
    escopo.querySelectorAll('input[name="f-marcador"]').forEach((c) =>
        c.addEventListener("change", () => {
            const ids = lerCampoDeMarcadores();
            escopo.querySelector("#f-marcadores-botao").textContent = resumoDeMarcadores(meus.filter((m) => ids.includes(m.id)));
        })
    );
}

export const lerCampoDeMarcadores = () => [...document.querySelectorAll('input[name="f-marcador"]:checked')].map((c) => c.value);

/**
 * A janela "Adicionar marcadores": escolhe-se um marcador num dropdown, vê-se a cor, o título e a descrição dele,
 * escreve-se uma observação (opcional) e adiciona-se à lista do registro. A lista é enxuta — uma linha por
 * marcador — e serve só para conferir e tirar; a observação se escreve na hora de adicionar.
 *
 * `aoSalvar(ids, observacoes)` recebe a lista nova inteira — já com os marcadores que a pessoa não enxerga (o privado
 * de outra) preservados, porque salvar não deve tirá-los. `observacoes` é `{ idDoMarcador: texto }`.
 */
export function abrirJanelaDeMarcadores({ titulo, selecionados, observacoes, estado, aoSalvar }) {
    const ID = "modal-marcadores";
    document.getElementById(ID)?.remove();
    const meus = marcadoresVisiveis(estado);
    const porId = new Map(meus.map((m) => [m.id, m]));
    // Os marcadores do registro aparecem todos; só tira o que a pessoa pode usar. O de outra pessoa fica, com um cadeado.
    const todosPorId = new Map((estado.marcadores ?? []).map((m) => [m.id, m]));
    const escondidos = (selecionados ?? []).filter((id) => !todosPorId.has(id));
    const obsEscondidas = Object.fromEntries(escondidos.filter((id) => observacoes?.[id]).map((id) => [id, observacoes[id]]));

    // o que está no registro, agora: [{ id, obs }], na ordem em que foi posto
    const itens = (selecionados ?? []).filter((id) => todosPorId.has(id)).map((id) => ({ id, obs: observacoes?.[id] ?? "" }));

    const icone = (m) =>
        `<span class="badge rounded-pill d-inline-flex align-items-center justify-content-center p-0 flex-shrink-0"
              style="background:${esc(m.cor ?? CORES[0])};width:28px;height:28px"><i class="ti ti-tag fs-15 text-white"></i></span>`;
    const cartao = (m) => `
        ${icone(m)}
        <span class="flex-grow-1" style="min-width:0">
            <span class="d-block fs-13 fw-medium">${esc(m.nome)}</span>
            ${m.descricao ? `<span class="d-block fs-12 text-muted">${esc(m.descricao)}</span>` : ""}
        </span>`;

    document.body.insertAdjacentHTML(
        "beforeend",
        `
    <div class="modal fade" id="${ID}" tabindex="-1" aria-labelledby="${ID}-titulo" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title fs-15" id="${ID}-titulo">${esc(titulo)}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>
                <div class="modal-body">
                    ${
                        meus.length
                            ? `
                    <label class="form-label" for="mm-escolha">Adicionar etiqueta</label>
                    <select class="form-select" id="mm-escolha"></select>

                    <div id="mm-previa" class="border rounded p-2 mt-2 d-none">
                        <div class="d-flex align-items-start gap-2" id="mm-previa-cartao"></div>
                        <label class="form-label mt-2 mb-1 fs-12" for="mm-obs">Observação <span class="text-muted">(opcional)</span></label>
                        <textarea class="form-control" id="mm-obs" rows="2" placeholder="Por que esta etiqueta vale para este registro?"></textarea>
                        <div class="text-end mt-2"><button type="button" class="btn btn-sm btn-primary" id="mm-adicionar">
                            <i class="ti ti-plus me-1"></i>Adicionar à lista</button></div>
                    </div>

                    <div class="rotulo-secao mt-4 mb-2">Etiquetas deste registro</div>
                    <div id="mm-lista"></div>`
                            : `<p class="fs-13 mb-0">Você ainda não tem etiquetas. Crie uma em
                    <a href="${url("central-marcador/criar.html")}" class="fw-semibold">Gestão › Etiquetas</a>.</p>`
                    }
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-primary" data-bs-dismiss="modal">Cancelar</button>
                    ${meus.length ? '<button type="button" class="btn btn-primary" id="mm-salvar">Salvar etiquetas</button>' : ""}
                </div>
            </div>
        </div>
    </div>`
    );

    const el = document.getElementById(ID);
    const modal = new window.bootstrap.Modal(el);
    el.addEventListener("hidden.bs.modal", () => el.remove(), { once: true });

    if (meus.length) {
        const escolha = el.querySelector("#mm-escolha");
        const previa = el.querySelector("#mm-previa");
        const obs = el.querySelector("#mm-obs");

        /** O dropdown só oferece o que ainda não está no registro. */
        const pintarEscolha = () => {
            const livres = meus.filter((m) => !itens.some((i) => i.id === m.id));
            escolha.innerHTML =
                `<option value="">${livres.length ? "Selecione" : "Todas as suas etiquetas já estão na lista"}</option>` +
                livres.map((m) => `<option value="${esc(m.id)}">${esc(m.nome)}</option>`).join("");
            escolha.disabled = !livres.length;
            previa.classList.add("d-none");
            obs.value = "";
        };

        const pintarLista = () => {
            el.querySelector("#mm-lista").innerHTML = itens.length
                ? itens
                      .map((i) => {
                          const m = todosPorId.get(i.id);
                          const meu = porId.has(i.id);
                          // uma linha só: ícone, nome (a observação, quando há, vem miúda ao lado) e o X para tirar
                          return `
                <div class="d-flex align-items-center gap-2 py-1 border-bottom" data-item="${esc(i.id)}">
                    <span class="badge rounded-pill d-inline-flex align-items-center justify-content-center p-0 flex-shrink-0"
                          style="background:${esc(m.cor ?? CORES[0])};width:20px;height:20px"><i class="ti ti-tag fs-12 text-white"></i></span>
                    <span class="flex-grow-1 text-truncate fs-13" title="${esc(m.descricao ?? "")}${i.obs ? ` — Observação: ${esc(i.obs)}` : ""}">
                        ${esc(m.nome)}${i.obs ? ` <span class="fs-12 text-muted">· ${esc(i.obs)}</span>` : ""}
                    </span>
                    ${
                        meu
                            ? `<button type="button" class="btn btn-sm btn-icon btn-terciario flex-shrink-0" data-tirar="${esc(i.id)}"
                            title="Tirar esta etiqueta" aria-label="Tirar a etiqueta ${esc(m.nome)}"><i class="ti ti-x"></i></button>`
                            : `<span class="text-muted flex-shrink-0 px-2" title="Etiqueta de outra pessoa: só quem pode usá-la a tira"><i class="ti ti-lock"></i></span>`
                    }
                </div>`;
                      })
                      .join("")
                : '<p class="fs-13 text-muted mb-0">Nenhuma etiqueta neste registro ainda.</p>';
        };

        escolha.addEventListener("change", () => {
            const m = porId.get(escolha.value);
            previa.classList.toggle("d-none", !m);
            if (m) el.querySelector("#mm-previa-cartao").innerHTML = cartao(m);
        });
        el.querySelector("#mm-adicionar").addEventListener("click", () => {
            if (!porId.has(escolha.value)) return;
            itens.push({ id: escolha.value, obs: obs.value.trim() });
            pintarEscolha();
            pintarLista();
        });
        el.querySelector("#mm-lista").addEventListener("click", (e) => {
            const id = e.target.closest("[data-tirar]")?.dataset.tirar;
            if (!id) return;
            itens.splice(itens.findIndex((i) => i.id === id), 1);
            pintarEscolha();
            pintarLista();
        });
        pintarEscolha();
        pintarLista();

        el.querySelector("#mm-salvar").addEventListener("click", () => {
            modal.hide();
            const mapa = { ...obsEscondidas };
            for (const i of itens) if (i.obs.trim()) mapa[i.id] = i.obs.trim();
            aoSalvar([...escondidos, ...itens.map((i) => i.id)], mapa);
        });
    }
    modal.show();
}

/**
 * A janela de alteração em lote: o mesmo campo de perfis do formulário, e o que se escolhe aqui substitui o que cada
 * marcador selecionado tinha. `campo` é "perfis" (quem vê) ou "gestores" (quem gere).
 */
function abrirAlteracaoEmLote(campo, ids, fim) {
    const ID = "modal-lote-marcadores";
    document.getElementById(ID)?.remove();
    const veem = campo === "perfis";
    const opcoes = ehAdmin() ? PERFIS_DE_MARCADOR : [perfilAtual()];
    const titulo = veem ? "Alterar quem vê" : "Alterar quem gere";
    const n = ids.length;
    document.body.insertAdjacentHTML(
        "beforeend",
        `
    <div class="modal fade" id="${ID}" tabindex="-1" aria-labelledby="${ID}-titulo" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title fs-15" id="${ID}-titulo">${titulo}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>
                <div class="modal-body">
                    <p class="fs-13 text-muted">A escolha substitui a atual em ${n} etiqueta${n > 1 ? "s selecionadas" : " selecionada"}.</p>
                    ${campoDePerfis({
                        id: "lote-perfis",
                        rotulo: veem ? "Perfis que veem a etiqueta" : "Perfis que gerem a etiqueta",
                        opcoes: veem ? ["eu", ...opcoes] : opcoes,
                        marcados: [],
                        leitura: false,
                        obrigatorio: veem,
                        exclusivo: veem ? "eu" : "",
                    })}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-primary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="lote-salvar">Salvar</button>
                </div>
            </div>
        </div>
    </div>`
    );
    const el = document.getElementById(ID);
    const modal = new window.bootstrap.Modal(el);
    el.addEventListener("hidden.bs.modal", () => el.remove(), { once: true });
    ligarCampoDePerfis(el, "lote-perfis");
    el.querySelector("#lote-salvar").addEventListener("click", () => {
        const lista = lerPerfis("lote-perfis");
        const erro = el.querySelector("#lote-perfis-botao-erro");
        if (veem && !lista.length) {
            if (erro) {
                erro.textContent = "Escolha ao menos um perfil que vê a etiqueta.";
                erro.classList.add("d-block");
            }
            return;
        }
        for (const id of ids) updItem("marcadores", id, { [campo]: lista });
        modal.hide();
        avisar(`${n} etiqueta${n > 1 ? "s atualizadas" : " atualizada"} com sucesso.`);
        fim();
    });
    modal.show();
}
