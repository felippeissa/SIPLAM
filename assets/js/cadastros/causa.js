import { esc } from "../ui.js";

/**
 * Cadastro de Causas.
 *
 * Nome, as Iniciativas que a enfrentam, as Subcausas que a detalham e a
 * descrição.
 *
 * A causa não pertence a ninguém — ela **aponta** para as Iniciativas. É o que
 * permite a uma mesma causa ser enfrentada por várias, de órgãos diferentes, e
 * a uma Iniciativa atacar mais de uma causa.
 *
 * Os dois vínculos são tabela, não campo de seleção: a Iniciativa escolhida
 * precisa ser reconhecida pelo Programa e pelo órgão de onde vem, e a Subcausa
 * tem três campos próprios — nada disso cabe numa etiqueta de dropdown.
 *
 * A Subcausa é guardada dentro da própria Causa. Ela só existe para detalhar
 * uma causa; solta na base, não haveria de onde alcançá-la.
 */

/** O que está em edição na tela. Vive aqui porque o formulário é montado uma vez. */
let iniciativaIds = [];
let subcausas = [];
let dados = null;

const uid = () => Math.random().toString(36).slice(2, 9);

/* ---------- Iniciativas ---------- */

function linhasIniciativas() {
    if (!iniciativaIds.length) {
        return `<tr><td colspan="4" class="text-center text-muted py-3 fs-12">
            Nenhuma Iniciativa vinculada. Escolha acima quem enfrenta esta causa.
        </td></tr>`;
    }

    return iniciativaIds
        .map((id) => {
            const i = dados.iniciativas.find((x) => x.id === id);
            if (!i) return "";
            const programa = dados.programas.find((p) => p.id === i.programaId);
            return `
        <tr>
            <td class="fw-medium">${esc(i.nome)}</td>
            <td class="fs-13 text-muted">${esc(programa?.nome ?? "—")}</td>
            <td class="fs-13 text-muted">${esc(i.orgao ?? "—")}</td>
            <td class="text-end">
                <button type="button" class="btn btn-sm btn-light" data-tirar-ini="${id}" title="Desvincular">
                    <i class="ti ti-x"></i>
                </button>
            </td>
        </tr>`;
        })
        .join("");
}

function opcoesIniciativa() {
    const livres = dados.iniciativas.filter((i) => !iniciativaIds.includes(i.id));
    if (!livres.length) return `<option value="">Todas as Iniciativas já foram vinculadas</option>`;
    return (
        `<option value="">Escolha uma Iniciativa…</option>` +
        livres.map((i) => `<option value="${i.id}">${esc(i.nome)}</option>`).join("")
    );
}

/* ---------- Subcausas ---------- */

function linhasSubcausas() {
    if (!subcausas.length) {
        return `<tr><td colspan="4" class="text-center text-muted py-3 fs-12">
            Nenhuma subcausa. Use “Adicionar subcausa” para detalhar esta causa.
        </td></tr>`;
    }

    return subcausas
        .map(
            (s, n) => `
        <tr>
            <td>
                <input type="text" class="form-control form-control-sm" value="${esc(s.nome)}"
                       data-sub="${n}" data-campo="nome" placeholder="Nome da subcausa" />
            </td>
            <td>
                <textarea class="form-control form-control-sm" rows="2" data-sub="${n}" data-campo="justificativa"
                          placeholder="Por que ela origina a causa">${esc(s.justificativa ?? "")}</textarea>
            </td>
            <td>
                <textarea class="form-control form-control-sm" rows="2" data-sub="${n}" data-campo="evidencia"
                          placeholder="O número, a série ou o estudo que a sustenta">${esc(s.evidencia ?? "")}</textarea>
            </td>
            <td class="text-end align-top">
                <button type="button" class="btn btn-sm btn-light" data-tirar-sub="${n}" title="Remover">
                    <i class="ti ti-x"></i>
                </button>
            </td>
        </tr>`
        )
        .join("");
}

function redesenhar(escopo) {
    const ini = escopo.querySelector("#corpo-iniciativas");
    if (ini) ini.innerHTML = linhasIniciativas();

    const seletor = escopo.querySelector("#f-iniciativa");
    if (seletor) seletor.innerHTML = opcoesIniciativa();

    const sub = escopo.querySelector("#corpo-subcausas");
    if (sub) sub.innerHTML = linhasSubcausas();
}

export const causa = {
    colecao: "causas",
    pasta: "central-causa",
    listagem: "central-causa.html",
    titulo: "Cadastro de Causas",
    subtitulo: "O que origina os problemas, e quem as enfrenta.",
    novoRotulo: "Nova causa",
    singular: "Causa",
    genero: "f",
    exemplo: "Déficit de vagas em creche",
    ajuda: "A causa explica por que um problema acontece. É a ela que as Iniciativas dos órgãos se vinculam, e é nela que as subcausas detalham a origem.",
    podeExcluir: true,

    extra: {
        colunas: [
            {
                rotulo: "Iniciativas",
                valor: (item) => {
                    const total = (item.iniciativaIds ?? []).length;
                    return total
                        ? `${total} ${total === 1 ? "iniciativa" : "iniciativas"}`
                        : '<span class="text-muted">—</span>';
                },
            },
            {
                rotulo: "Subcausas",
                valor: (item) => {
                    const total = (item.subcausas ?? []).length;
                    return total
                        ? `${total} ${total === 1 ? "subcausa" : "subcausas"}`
                        : '<span class="text-muted">—</span>';
                },
            },
        ],

        html(item, estado) {
            iniciativaIds = [...(item.iniciativaIds ?? [])];
            subcausas = structuredClone(item.subcausas ?? []);
            dados = estado;

            const semIniciativa = !(estado.iniciativas ?? []).length;

            return `
            <div class="mb-4">
                <label class="form-label" for="f-iniciativa">Iniciativas que enfrentam esta causa</label>
                ${
                    semIniciativa
                        ? `<div class="alert alert-warning py-2 px-3 fs-13 mb-0">Nenhuma Iniciativa cadastrada ainda.</div>`
                        : `<div class="input-group mb-2">
                    <select class="form-select" id="f-iniciativa">${opcoesIniciativa()}</select>
                    <button type="button" class="btn btn-outline-primary" id="por-iniciativa">
                        <i class="ti ti-plus me-1"></i>Vincular
                    </button>
                </div>

                <div class="table-responsive border rounded">
                    <table class="table table-sm table-hover mb-0">
                        <thead>
                            <tr>
                                <th style="width:20rem">Iniciativa</th>
                                <th style="width:14rem">Programa</th>
                                <th>Órgão</th>
                                <th style="width:4rem"></th>
                            </tr>
                        </thead>
                        <tbody id="corpo-iniciativas">${linhasIniciativas()}</tbody>
                    </table>
                </div>`
                }
            </div>

            <div class="mb-3">
                <div class="d-flex align-items-center mb-2">
                    <label class="form-label mb-0 flex-grow-1">Subcausas</label>
                    <button type="button" class="btn btn-sm btn-outline-primary" id="por-subcausa">
                        <i class="ti ti-plus me-1"></i>Adicionar subcausa
                    </button>
                </div>
                <div class="table-responsive border rounded">
                    <table class="table table-sm mb-0">
                        <thead>
                            <tr>
                                <th style="width:16rem">Nome</th>
                                <th>Justificativa</th>
                                <th>Evidência</th>
                                <th style="width:4rem"></th>
                            </tr>
                        </thead>
                        <tbody id="corpo-subcausas">${linhasSubcausas()}</tbody>
                    </table>
                </div>
                <div class="invalid-feedback d-block" id="f-subcausas-erro"></div>
            </div>`;
        },

        ligar(escopo) {
            escopo.addEventListener("click", (e) => {
                const vincular = e.target.closest("#por-iniciativa");
                if (vincular) {
                    const id = escopo.querySelector("#f-iniciativa")?.value;
                    if (id && !iniciativaIds.includes(id)) iniciativaIds.push(id);
                    redesenhar(escopo);
                    return;
                }

                const tirarIni = e.target.closest("[data-tirar-ini]");
                if (tirarIni) {
                    iniciativaIds = iniciativaIds.filter((x) => x !== tirarIni.dataset.tirarIni);
                    redesenhar(escopo);
                    return;
                }

                if (e.target.closest("#por-subcausa")) {
                    subcausas.push({ id: `sc-${uid()}`, nome: "", justificativa: "", evidencia: "" });
                    redesenhar(escopo);
                    escopo.querySelector('[data-sub="' + (subcausas.length - 1) + '"]')?.focus();
                    return;
                }

                const tirarSub = e.target.closest("[data-tirar-sub]");
                if (tirarSub) {
                    subcausas.splice(Number(tirarSub.dataset.tirarSub), 1);
                    redesenhar(escopo);
                }
            });

            // As linhas da subcausa são campos de verdade, não rótulos: cada
            // tecla vai direto para o registro em edição, sem redesenhar a
            // tabela — redesenhar tiraria o cursor de onde a pessoa digita.
            escopo.addEventListener("input", (e) => {
                const campo = e.target.closest("[data-sub]");
                if (!campo) return;
                subcausas[Number(campo.dataset.sub)][campo.dataset.campo] = e.target.value;
                document.getElementById("f-subcausas-erro").textContent = "";
            });
        },

        ler: () => ({
            iniciativaIds: [...iniciativaIds],
            // Linha em branco é linha que a pessoa abriu e não usou.
            subcausas: subcausas.filter((s) => s.nome.trim()),
        }),

        regras(lidos) {
            const erro = document.getElementById("f-subcausas-erro");
            if (erro) erro.textContent = "";
            const incompleta = subcausas.some((s) => !s.nome.trim() && (s.justificativa?.trim() || s.evidencia?.trim()));
            if (incompleta) {
                erro.textContent = "Há subcausa com justificativa ou evidência e sem nome. Dê um nome ou remova a linha.";
                return [{ campo: "f-subcausas", valido: false, mensagem: "" }];
            }
            return [];
        },
    },
};
