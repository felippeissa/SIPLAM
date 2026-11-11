import { esc } from "../ui.js";
import { perfilAtual, somenteLeitura, url } from "../shell.js";
import { nomeDoPerfil } from "../usuarios-decisao.js";
import { campoErro } from "../validacao.js";

/**
 * Cadastro de Marcadores (Gestão).
 *
 * Um marcador é uma etiqueta que a pessoa põe nas coisas do plano para achá-las depois. Quatro campos:
 * **nome**, **área**, **descrição** e **cor**. O marcador não tem tipo: quem o põe num Programa (ou em outro cadastro) escolhe dentre os que enxerga.
 *
 * A **área** diz quem enxerga o marcador:
 *
 *   - "Só para mim": só quem o criou. É a única opção de quem não é administrador.
 *   - "Todos do perfil X": o administrador marca para todo um perfil, e ele fica visível para quem tem o perfil.
 *
 * Não há identidade de usuário no protótipo, então "eu" é o perfil com que se entrou: duas pessoas com o mesmo
 * perfil enxergam os marcadores "só para mim" uma da outra. Com o login real isto passa a ser o usuário.
 */

export const PERFIS_DE_MARCADOR = ["setorial", "gestao-setorial", "admin-central", "gestao-central", "controle"];

/** As cores que a pessoa escolhe: as do tema, escuras o bastante para o texto branco do selo. */
export const CORES = ["#1AB394", "#1C84C6", "#E08E1B", "#ED5565", "#7266BA", "#23A6A8", "#6C757D", "#E0559A", "#8B5E3C", "#343A40"];

const AREA_EU = "eu";
const areaDoPerfil = (perfil) => `perfil:${perfil}`;

/** Administrador: o Administrador central e a Alta gestão central, que faz tudo que ele faz. */
export const ehAdmin = () => ["admin-central", "gestao-central"].includes(perfilAtual());

/** Quem vê o marcador: o dono, no "só para mim"; o perfil inteiro, no "todos do perfil" — e o administrador, que o administra. */
export function visivel(marcador) {
    const eu = perfilAtual();
    if (!marcador.area || marcador.area === AREA_EU) return marcador.dono === eu;
    return marcador.area === areaDoPerfil(eu) || ehAdmin();
}

/** Edita quem criou, e o administrador edita o que foi posto para um perfil. Os demais só veem. */
export function soLeitura(marcador) {
    if (marcador.dono === perfilAtual()) return false;
    return !(ehAdmin() && marcador.area && marcador.area !== AREA_EU);
}

const rotuloDaArea = (area) => (!area || area === AREA_EU ? "Só para mim" : `Todos: ${nomeDoPerfil(area.replace("perfil:", ""))}`);

const selo = (nome, cor, previa = false) =>
    `<span class="badge fs-12 fw-medium" style="background:${esc(cor)};color:#fff"${previa ? " data-previa" : ""}>${esc(nome || "Marcador")}</span>`;

export const marcador = {
    colecao: "marcadores",
    pasta: "central-marcador",
    listagem: "central-marcador.html",
    titulo: "Cadastro de Marcadores",
    subtitulo: "Etiquetas para achar o que importa. Cada pessoa marca para si; o administrador também marca para todo um perfil.",
    novoRotulo: "Novo marcador",
    singular: "Marcador",
    rotuloNome: "Nome do marcador",
    exemplo: "Revisar com o órgão",
    podeExcluir: true,
    filtros: [],

    visivel,
    leituraDoItem: soLeitura,

    extra: {
        colunas: [
            { rotulo: "Cor", valor: (item) => selo(item.nome, item.cor ?? CORES[0]) },
            { rotulo: "Área", valor: (item) => esc(rotuloDaArea(item.area)) },
        ],

        html: (edicao) => {
            const leitura = somenteLeitura() || (edicao.id && soLeitura(edicao));
            const admin = ehAdmin();
            const area = edicao.area || AREA_EU;
            const cor = edicao.cor || CORES[0];
            const dono = edicao.dono || perfilAtual();

            const opcoes = [`<option value="${AREA_EU}"${area === AREA_EU ? " selected" : ""}>Só para mim</option>`];
            if (admin) {
                opcoes.push(
                    `<optgroup label="Todos que têm o perfil">${PERFIS_DE_MARCADOR.map(
                        (p) =>
                            `<option value="${areaDoPerfil(p)}"${area === areaDoPerfil(p) ? " selected" : ""}>${esc(nomeDoPerfil(p))}</option>`
                    ).join("")}</optgroup>`
                );
            }

            return `
            <input type="hidden" id="f-dono" value="${esc(dono)}" />
            <div class="mb-3">
                <label class="form-label" for="f-area">Área do marcador <span class="text-danger">*</span></label>
                <select class="form-select" id="f-area" ${leitura || !admin ? "disabled" : ""}>${opcoes.join("")}</select>
                ${campoErro("f-area")}
                <div class="form-text fs-12">${
                    admin
                        ? "“Só para mim” é visível só para você. Escolhendo um perfil, o marcador fica visível para todos que têm esse perfil."
                        : "Você só pode marcar para você: o marcador fica visível só para você."
                }</div>
            </div>
            <div class="mb-3">
                <label class="form-label d-block">Cor do marcador <span class="text-danger">*</span></label>
                <div class="d-flex flex-wrap align-items-center gap-2" id="f-cores" role="radiogroup" aria-label="Cor do marcador">
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
                previa.textContent = nome.value.trim() || "Marcador";
                previa.style.background = corAtual();
                // o círculo escolhido ganha o contorno escuro
                escopo.querySelectorAll("[data-cor]").forEach((c) => {
                    c.style.borderColor = c.dataset.cor.toLowerCase() === corAtual().toLowerCase() ? "#343a40" : "transparent";
                });
            };
            nome.addEventListener("input", pintar);
            escopo.querySelectorAll('input[name="f-cor"]').forEach((r) => r.addEventListener("change", pintar));
            pintar();
        },

        ler: () => ({
            area: document.getElementById("f-area")?.value || AREA_EU,
            cor: document.querySelector('input[name="f-cor"]:checked')?.value ?? CORES[0],
            dono: document.getElementById("f-dono")?.value || perfilAtual(),
        }),

        regras: (dados) => [
            {
                campo: "f-area",
                valido: dados.area === AREA_EU || (ehAdmin() && PERFIS_DE_MARCADOR.includes(String(dados.area).replace("perfil:", ""))),
                mensagem: "Escolha a área do marcador.",
            },
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
    return `<span class="d-inline-flex flex-wrap gap-1">${lista
        .map(
            (m) => `<span class="badge rounded-pill d-inline-flex align-items-center justify-content-center p-0"
                  style="background:${esc(m.cor ?? CORES[0])};width:24px;height:24px" tabindex="0"
                  data-marcador-nome="${esc(m.nome)}" data-marcador-desc="${esc(m.descricao ?? "")}" data-marcador-obs="${esc(observacoes?.[m.id] ?? "")}" aria-label="Marcador ${esc(m.nome)}">
                <i class="ti ti-tag fs-14 text-white"></i></span>`
        )
        .join("")}</span>`;
}

/** Liga a dica (nome em destaque e descrição) dos selos que estão dentro de `raiz`. */
export function iniciarDicasDeMarcador(raiz = document) {
    raiz.querySelectorAll("[data-marcador-nome]").forEach((el) => {
        const nome = esc(el.dataset.marcadorNome);
        const desc = el.dataset.marcadorDesc ? `<div class="mt-1">${esc(el.dataset.marcadorDesc)}</div>` : "";
        const obs = el.dataset.marcadorObs ? `<div class="mt-1 fst-italic">Observação: ${esc(el.dataset.marcadorObs)}</div>` : "";
        window.bootstrap?.Tooltip.getOrCreateInstance(el, { html: true, title: `<strong>${nome}</strong>${desc}${obs}`, placement: "right" });
    });
}

const resumoDeMarcadores = (marcadores) =>
    !marcadores.length ? "Selecione…" : marcadores.length <= 2 ? marcadores.map((m) => m.nome).join(", ") : `${marcadores.length} marcadores selecionados`;

/**
 * O campo "Marcadores" de um formulário: um dropdown com caixas de marcar. Só lista o que a pessoa enxerga.
 * `lerCampoDeMarcadores` devolve os ids marcados.
 */
export function campoDeMarcadores(selecionados, estado, leitura) {
    const todos = marcadoresVisiveis(estado);
    const marcados = todos.filter((m) => (selecionados ?? []).includes(m.id));
    return `
    <div class="mb-3">
        <label class="form-label" for="f-marcadores-botao">Marcadores</label>
        <div class="dropdown" id="f-marcadores">
            <button type="button" class="form-select text-start text-truncate" id="f-marcadores-botao"
                    data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false" ${leitura || !todos.length ? "disabled" : ""}>
                ${esc(todos.length ? resumoDeMarcadores(marcados) : "Nenhum marcador cadastrado")}
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
                    <label class="form-label" for="mm-escolha">Adicionar marcador</label>
                    <select class="form-select" id="mm-escolha"></select>

                    <div id="mm-previa" class="border rounded p-2 mt-2 d-none">
                        <div class="d-flex align-items-start gap-2" id="mm-previa-cartao"></div>
                        <label class="form-label mt-2 mb-1 fs-12" for="mm-obs">Observação <span class="text-muted">(opcional)</span></label>
                        <textarea class="form-control" id="mm-obs" rows="2" placeholder="Por que este marcador vale para este registro?"></textarea>
                        <div class="text-end mt-2"><button type="button" class="btn btn-sm btn-primary" id="mm-adicionar">
                            <i class="ti ti-plus me-1"></i>Adicionar à lista</button></div>
                    </div>

                    <div class="rotulo-secao mt-4 mb-2">Marcadores deste registro</div>
                    <div id="mm-lista"></div>`
                            : `<p class="fs-13 mb-0">Você ainda não tem marcadores. Crie um em
                    <a href="${url("central-marcador/criar.html")}" class="fw-semibold">Gestão › Marcadores</a>.</p>`
                    }
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                    ${meus.length ? '<button type="button" class="btn btn-primary" id="mm-salvar">Salvar marcadores</button>' : ""}
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
                `<option value="">${livres.length ? "Escolha um marcador…" : "Todos os seus marcadores já estão na lista"}</option>` +
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
                            ? `<button type="button" class="btn btn-sm btn-light btn-icon flex-shrink-0" data-tirar="${esc(i.id)}"
                            title="Tirar este marcador" aria-label="Tirar o marcador ${esc(m.nome)}"><i class="ti ti-x"></i></button>`
                            : `<span class="text-muted flex-shrink-0 px-2" title="Marcador de outra pessoa: só quem pode usá-lo o tira"><i class="ti ti-lock"></i></span>`
                    }
                </div>`;
                      })
                      .join("")
                : '<p class="fs-13 text-muted mb-0">Nenhum marcador neste registro ainda.</p>';
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
