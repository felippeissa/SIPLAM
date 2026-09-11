/**
 * Cadastro do PPA — Administração.
 *
 * O protótipo não tinha o plano como entidade: eixo e objetivo estratégico eram
 * texto solto, digitado de novo em cada Programa. Aqui o plano ganha
 * identificação, prazo do ciclo e as listas de eixos e objetivos que os
 * Programas passam a escolher.
 */
import { obterEstado, updPpa } from "../dados/store.js";
import { ANOS } from "../dados/seed.js";
import { moedaCurta } from "../dados/regras.js";
import { linhasFinanceiras } from "../dados/financeiro.js";
import { montarShell, cabecalhoPagina, somenteLeitura } from "../shell.js";
import { chip, esc, secao, faixaIndicadores } from "../ui.js";

const { estado } = montarShell();
const leitura = somenteLeitura();

const SITUACAO = {
    em_elaboracao: { rotulo: "Em elaboração", tom: "neutro", ajuda: "Os órgãos ainda não contribuem." },
    contribuicoes: {
        rotulo: "Aberto a contribuições",
        tom: "info",
        ajuda: "Os órgãos podem cadastrar Iniciativas nos Programas disponíveis.",
    },
    analise: { rotulo: "Em análise", tom: "alerta", ajuda: "Contribuições encerradas; a Área Central analisa." },
    vigente: { rotulo: "Vigente", tom: "ok", ajuda: "O plano foi aprovado e está em execução." },
    encerrado: { rotulo: "Encerrado", tom: "neutro", ajuda: "Ciclo concluído." },
};

/** Eixo e objetivo em uso pelos Programas — não dá para remover o que está em uso. */
function emUso(campo) {
    return new Set(estado.programas.map((p) => p[campo]).filter(Boolean));
}

function campo(id, rotulo, valor, { tipo = "text", ajuda = "", largura = "" } = {}) {
    return `
    <div class="${largura}">
        <label class="form-label" for="${id}">${rotulo}</label>
        <input type="${tipo}" class="form-control" id="${id}" value="${esc(valor ?? "")}" ${leitura ? "disabled" : ""} />
        ${ajuda ? `<div class="form-text fs-12">${ajuda}</div>` : ""}
    </div>`;
}

function listaEditavel(tipo, titulo, itens, usados, ajuda) {
    return `
    <div class="d-flex justify-content-between align-items-center mb-2">
        <span class="rotulo-secao">${titulo}</span>
        ${leitura ? "" : `<button type="button" class="btn btn-sm btn-light" data-add="${tipo}"><i class="ti ti-plus"></i> Adicionar</button>`}
    </div>
    <div class="form-text fs-12 mb-2">${ajuda}</div>
    ${
        itens.length === 0
            ? '<p class="fs-12 text-muted mb-0">Nenhum item cadastrado.</p>'
            : itens
                  .map((t, i) => {
                      const usos = [...estado.programas].filter((p) => p[tipo === "eixos" ? "eixo" : "objetivoEstrategico"] === t).length;
                      return `
        <div class="input-group input-group-sm mb-2">
            <input type="text" class="form-control" value="${esc(t)}" data-lista="${tipo}" data-idx="${i}" ${leitura ? "disabled" : ""} />
            <span class="input-group-text fs-12">${usos} programa(s)</span>
            ${
                leitura
                    ? ""
                    : `<button class="btn btn-light" type="button" data-remover="${tipo}" data-idx="${i}" ${usos ? "disabled title='Em uso por Programas'" : ""} aria-label="Remover">
                <i class="ti ti-trash"></i>
            </button>`
            }
        </div>`;
                  })
                  .join("")
    }`;
}

function render() {
    const ppa = estado.ppa;
    const s = SITUACAO[ppa.situacao] ?? SITUACAO.em_elaboracao;
    const previsto = linhasFinanceiras(estado).reduce((acc, l) => acc + l.total, 0);
    const disponiveis = estado.programas.filter((p) => p.disponibilizacao === "disponivel").length;

    document.getElementById("conteudo").innerHTML = `
    ${cabecalhoPagina(
        "Cadastro do PPA",
        "Identificação do plano, prazo do ciclo e as listas que os Programas usam.",
        leitura
            ? `<span class="fs-12 text-muted">Perfil de acompanhamento — sem edição.</span>`
            : `<button class="btn btn-sm btn-primary" id="salvar"><i class="ti ti-device-floppy me-1"></i>Salvar</button>`
    )}

    ${faixaIndicadores(
        [
            { valor: `${esc(ppa.primeiroAno)}–${esc(ppa.ultimoAno)}`, rotulo: "Período" },
            { valor: chip(s.rotulo, s.tom), rotulo: "Situação do ciclo" },
            { valor: estado.programas.length, rotulo: "Programas" },
            { valor: disponiveis, rotulo: "Disponíveis aos órgãos" },
            { valor: estado.iniciativas.length, rotulo: "Iniciativas recebidas" },
            { valor: moedaCurta(previsto), rotulo: "Previsto no plano" },
        ],
        esc(s.ajuda)
    )}

    <div class="row g-3">
        <div class="col-xl-7">
            ${secao(
                "Identificação",
                `
                <div class="row g-3">
                    ${campo("f-nome", "Nome do plano", ppa.nome, { largura: "col-12" })}
                    ${campo("f-primeiroAno", "Primeiro ano", ppa.primeiroAno, { largura: "col-md-3" })}
                    ${campo("f-ultimoAno", "Último ano", ppa.ultimoAno, { largura: "col-md-3" })}
                    ${campo("f-lei", "Lei", ppa.lei, { largura: "col-md-3", ajuda: "Nº da lei que institui o plano" })}
                    ${campo("f-dataLei", "Data da lei", ppa.dataLei, { tipo: "date", largura: "col-md-3" })}
                    ${campo("f-orgaoResponsavel", "Órgão responsável pelo plano", ppa.orgaoResponsavel, { largura: "col-12" })}
                </div>
                <div class="alert alert-light py-2 px-3 fs-12 mt-3 mb-0">
                    O período define os anos das metas das Entregas. Alterá-lo depois de haver
                    contribuições afeta as séries já preenchidas — hoje são ${ANOS.join(", ")}.
                </div>`
            )}

            ${secao(
                "Ciclo de contribuições",
                `
                <div class="row g-3">
                    <div class="col-md-4">
                        <label class="form-label" for="f-situacao">Situação</label>
                        <select class="form-select" id="f-situacao" ${leitura ? "disabled" : ""}>
                            ${Object.entries(SITUACAO)
                                .map(([k, v]) => `<option value="${k}"${ppa.situacao === k ? " selected" : ""}>${esc(v.rotulo)}</option>`)
                                .join("")}
                        </select>
                    </div>
                    ${campo("f-abertura", "Abertura das contribuições", ppa.aberturaContribuicoes, { tipo: "date", largura: "col-md-4" })}
                    ${campo("f-encerramento", "Encerramento", ppa.encerramentoContribuicoes, { tipo: "date", largura: "col-md-4" })}
                    <div class="col-12">
                        <label class="form-label" for="f-mensagem">Recado aos órgãos</label>
                        <textarea class="form-control" id="f-mensagem" rows="2" ${leitura ? "disabled" : ""}>${esc(ppa.mensagem ?? "")}</textarea>
                        <div class="form-text fs-12">Aparece para os órgãos enquanto o ciclo estiver aberto.</div>
                    </div>
                </div>`
            )}
        </div>

        <div class="col-xl-5">
            ${secao(
                "Eixos",
                listaEditavel(
                    "eixos",
                    "Eixos do plano",
                    ppa.eixos ?? [],
                    emUso("eixo"),
                    "Os Programas escolhem um destes. Um eixo em uso não pode ser removido."
                )
            )}

            ${secao(
                "Objetivos estratégicos",
                listaEditavel(
                    "objetivos",
                    "Objetivos do plano",
                    ppa.objetivos ?? [],
                    emUso("objetivoEstrategico"),
                    "Cada Programa se vincula a um objetivo estratégico."
                )
            )}
        </div>
    </div>`;
}

/* ---------- edição ---------- */

function lerFormulario() {
    const v = (id) => document.getElementById(id)?.value ?? "";
    const patch = {
        nome: v("f-nome").trim(),
        primeiroAno: v("f-primeiroAno").trim(),
        ultimoAno: v("f-ultimoAno").trim(),
        lei: v("f-lei").trim(),
        dataLei: v("f-dataLei"),
        orgaoResponsavel: v("f-orgaoResponsavel").trim(),
        situacao: v("f-situacao"),
        aberturaContribuicoes: v("f-abertura"),
        encerramentoContribuicoes: v("f-encerramento"),
        mensagem: v("f-mensagem").trim(),
        eixos: [...document.querySelectorAll('[data-lista="eixos"]')].map((el) => el.value.trim()).filter(Boolean),
        objetivos: [...document.querySelectorAll('[data-lista="objetivos"]')].map((el) => el.value.trim()).filter(Boolean),
    };
    return patch;
}

function avisar(texto, tom = "success") {
    const alvo = document.getElementById("conteudo");
    alvo.insertAdjacentHTML(
        "afterbegin",
        `<div class="alert alert-${tom} py-2 px-3 fs-13" role="status">${esc(texto)}</div>`
    );
    setTimeout(() => alvo.querySelector(".alert")?.remove(), 2600);
}

document.addEventListener("click", (e) => {
    if (leitura) return;

    const add = e.target.closest("[data-add]");
    if (add) {
        const tipo = add.dataset.add;
        const atual = lerFormulario();
        updPpa({ ...atual, [tipo]: [...atual[tipo], ""] });
        return render();
    }

    const remover = e.target.closest("[data-remover]");
    if (remover) {
        const tipo = remover.dataset.remover;
        const atual = lerFormulario();
        atual[tipo].splice(Number(remover.dataset.idx), 1);
        updPpa(atual);
        return render();
    }

    if (e.target.closest("#salvar")) {
        const patch = lerFormulario();
        if (!patch.nome) {
            avisar("Informe o nome do plano.", "warning");
            return;
        }
        updPpa(patch);
        render();
        avisar("Cadastro do PPA salvo.");
    }
});

render();
