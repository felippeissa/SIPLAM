/**
 * PPA — Administração.
 *
 * Tabela dos planos cadastrados e um modal para criar ou editar, no mesmo
 * padrão da Administração de Programas.
 *
 * O protótipo não tinha o plano como entidade: eixo e objetivo estratégico eram
 * texto solto, redigitado em cada Programa. Aqui eles pertencem ao plano.
 */
import { obterEstado, addPpa, updPpa, removePpa, ppaVazio } from "../dados/store.js";
import { moedaCurta } from "../dados/regras.js";
import { linhasFinanceiras } from "../dados/financeiro.js";
import { montarShell, cabecalhoPagina, somenteLeitura } from "../shell.js";
import { chip, esc, faixaIndicadores } from "../ui.js";

const { estado } = montarShell();
const leitura = somenteLeitura();

const SITUACAO = {
    em_elaboracao: { rotulo: "Em elaboração", tom: "neutro" },
    contribuicoes: { rotulo: "Aberto a contribuições", tom: "info" },
    analise: { rotulo: "Em análise", tom: "alerta" },
    vigente: { rotulo: "Vigente", tom: "ok" },
    encerrado: { rotulo: "Encerrado", tom: "neutro" },
};

let edicao = null;
let novo = false;

/** Programas e financeiro pertencem ao plano cujo período os contém. */
function resumo(ppa) {
    const anos = [];
    for (let a = Number(ppa.primeiroAno); a <= Number(ppa.ultimoAno); a++) anos.push(String(a));
    const previsto = linhasFinanceiras(estado).reduce(
        (s, l) => s + anos.reduce((t, a) => t + (l.anos[a] ?? 0), 0),
        0
    );
    return { previsto, anos };
}

/* ---------- tabela ---------- */

function render() {
    const ppas = [...estado.ppas].sort((a, b) => Number(b.primeiroAno) - Number(a.primeiroAno));
    const vigente = ppas.find((p) => p.situacao === "vigente" || p.situacao === "contribuicoes");

    document.getElementById("conteudo").innerHTML = `
    ${cabecalhoPagina(
        "PPA",
        "Planos plurianuais cadastrados no sistema.",
        leitura
            ? `<span class="fs-12 text-muted">Perfil de acompanhamento — sem edição.</span>`
            : `<button class="btn btn-sm btn-primary" id="novo"><i class="ti ti-plus me-1"></i>Novo PPA</button>`
    )}

    ${faixaIndicadores(
        [
            { valor: ppas.length, rotulo: "Planos cadastrados" },
            { valor: vigente ? `${esc(vigente.primeiroAno)}–${esc(vigente.ultimoAno)}` : "—", rotulo: "Ciclo em curso" },
            { valor: estado.programas.length, rotulo: "Programas" },
            { valor: estado.iniciativas.length, rotulo: "Iniciativas recebidas" },
            { valor: moedaCurta(resumo(vigente ?? ppas[0] ?? { primeiroAno: 0, ultimoAno: 0 }).previsto), rotulo: "Previsto no ciclo" },
        ],
        "Os eixos e os objetivos estratégicos pertencem ao plano — os Programas escolhem entre eles."
    )}

    <div class="card">
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th>Plano</th>
                        <th style="width:8rem">Período</th>
                        <th style="width:11rem">Lei</th>
                        <th style="width:13rem">Situação</th>
                        <th class="num" style="width:6rem">Eixos</th>
                        <th class="num" style="width:7rem">Objetivos</th>
                        <th class="num" style="width:8rem">Previsto</th>
                        <th style="width:7rem">Ações</th>
                    </tr>
                </thead>
                <tbody>
                ${
                    ppas.length === 0
                        ? '<tr><td colspan="8" class="text-center text-muted py-4 fs-12">Nenhum plano cadastrado. Comece por “Novo PPA”.</td></tr>'
                        : ppas
                              .map((p) => {
                                  const s = SITUACAO[p.situacao] ?? SITUACAO.em_elaboracao;
                                  return `
                    <tr>
                        <td>
                            <div class="fw-medium">${esc(p.nome)}</div>
                            <div class="fs-12 text-muted">${esc(p.orgaoResponsavel || "órgão responsável não informado")}</div>
                        </td>
                        <td class="codigo">${esc(p.primeiroAno)}–${esc(p.ultimoAno)}</td>
                        <td class="fs-12">${esc(p.lei || "—")}</td>
                        <td>${chip(s.rotulo, s.tom)}</td>
                        <td class="num">${(p.eixos ?? []).length || "—"}</td>
                        <td class="num">${(p.objetivos ?? []).length || "—"}</td>
                        <td class="num">${moedaCurta(resumo(p).previsto)}</td>
                        <td>${
                            leitura
                                ? `<button class="btn btn-sm btn-light" data-editar="${p.id}">Ver</button>`
                                : `<button class="btn btn-sm btn-outline-primary" data-editar="${p.id}">Editar</button>`
                        }</td>
                    </tr>`;
                              })
                              .join("")
                }
                </tbody>
            </table>
        </div>
    </div>
    ${edicao ? modal() : ""}`;

    if (edicao) {
        const el = document.getElementById("modal-ppa");
        new bootstrap.Modal(el).show();
        el.addEventListener("hidden.bs.modal", () => {
            edicao = null;
            render();
        }, { once: true });
    }
}

/* ---------- modal ---------- */

function campo(id, rotulo, valor, { tipo = "text", ajuda = "", largura = "col-12", obrigatorio = false } = {}) {
    return `
    <div class="${largura}">
        <label class="form-label" for="${id}">${rotulo}${obrigatorio ? ' <span class="text-danger">*</span>' : ""}</label>
        <input type="${tipo}" class="form-control" id="${id}" value="${esc(valor ?? "")}" ${leitura ? "disabled" : ""} />
        ${ajuda ? `<div class="form-text fs-12">${ajuda}</div>` : ""}
    </div>`;
}

function lista(tipo, titulo, itens, campoPrograma, ajuda) {
    return `
    <div class="d-flex justify-content-between align-items-center mb-2">
        <span class="rotulo-secao">${titulo}</span>
        ${leitura ? "" : `<button type="button" class="btn btn-sm btn-light" data-add="${tipo}"><i class="ti ti-plus"></i> Adicionar</button>`}
    </div>
    <div class="form-text fs-12 mb-2">${ajuda}</div>
    ${
        itens.length === 0
            ? '<p class="fs-12 text-muted">Nenhum item.</p>'
            : itens
                  .map((t, i) => {
                      const usos = estado.programas.filter((p) => p[campoPrograma] === t).length;
                      return `
        <div class="input-group input-group-sm mb-2">
            <input type="text" class="form-control" value="${esc(t)}" data-lista="${tipo}" data-idx="${i}" ${leitura ? "disabled" : ""} />
            <span class="input-group-text fs-12">${usos} programa(s)</span>
            ${
                leitura
                    ? ""
                    : `<button class="btn btn-light" type="button" data-remover="${tipo}" data-idx="${i}" ${usos ? "disabled" : ""} title="${usos ? "Em uso por Programas" : "Remover"}" aria-label="Remover">
                <i class="ti ti-trash"></i>
            </button>`
            }
        </div>`;
                  })
                  .join("")
    }`;
}

function modal() {
    const p = edicao;
    const usado = estado.programas.length > 0 && !novo;

    return `
<div class="modal fade" id="modal-ppa" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title fs-15">${novo ? "Novo PPA" : leitura ? esc(p.nome) : `Editar ${esc(p.nome)}`}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
                <div class="row g-3">
                    ${campo("f-nome", "Nome do plano", p.nome, { largura: "col-md-8", obrigatorio: true })}
                    ${campo("f-orgaoResponsavel", "Órgão responsável", p.orgaoResponsavel, { largura: "col-md-4" })}
                    ${campo("f-primeiroAno", "Primeiro ano", p.primeiroAno, { largura: "col-md-3", obrigatorio: true })}
                    ${campo("f-ultimoAno", "Último ano", p.ultimoAno, { largura: "col-md-3", obrigatorio: true })}
                    ${campo("f-lei", "Lei", p.lei, { largura: "col-md-3", ajuda: "Nº da lei que institui o plano" })}
                    ${campo("f-dataLei", "Data da lei", p.dataLei, { tipo: "date", largura: "col-md-3" })}
                </div>

                <div class="border-top border-dashed my-3"></div>
                <h6 class="rotulo-secao mb-3">Ciclo de contribuições</h6>

                <div class="row g-3">
                    <div class="col-md-4">
                        <label class="form-label" for="f-situacao">Situação</label>
                        <select class="form-select" id="f-situacao" ${leitura ? "disabled" : ""}>
                            ${Object.entries(SITUACAO)
                                .map(([k, v]) => `<option value="${k}"${p.situacao === k ? " selected" : ""}>${esc(v.rotulo)}</option>`)
                                .join("")}
                        </select>
                    </div>
                    ${campo("f-abertura", "Abertura das contribuições", p.aberturaContribuicoes, { tipo: "date", largura: "col-md-4" })}
                    ${campo("f-encerramento", "Encerramento", p.encerramentoContribuicoes, { tipo: "date", largura: "col-md-4" })}
                    <div class="col-12">
                        <label class="form-label" for="f-mensagem">Recado aos órgãos</label>
                        <textarea class="form-control" id="f-mensagem" rows="2" ${leitura ? "disabled" : ""}>${esc(p.mensagem ?? "")}</textarea>
                    </div>
                </div>

                <div class="border-top border-dashed my-3"></div>

                <div class="row g-4">
                    <div class="col-md-6">
                        ${lista("eixos", "Eixos", p.eixos ?? [], "eixo", "Os Programas escolhem um destes.")}
                    </div>
                    <div class="col-md-6">
                        ${lista("objetivos", "Objetivos estratégicos", p.objetivos ?? [], "objetivoEstrategico", "Cada Programa se vincula a um objetivo.")}
                    </div>
                </div>

                ${
                    usado
                        ? `<div class="alert alert-light py-2 px-3 fs-12 mt-3 mb-0">
                    O período define os anos das metas das Entregas. Alterá-lo com contribuições já
                    cadastradas afeta as séries preenchidas.
                </div>`
                        : ""
                }
            </div>
            <div class="modal-footer">
                ${
                    leitura || novo || estado.ppas.length <= 1
                        ? ""
                        : '<button type="button" class="btn btn-outline-danger me-auto" id="excluir">Excluir plano</button>'
                }
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">${leitura ? "Fechar" : "Cancelar"}</button>
                ${leitura ? "" : '<button type="button" class="btn btn-primary" id="salvar">Salvar</button>'}
            </div>
        </div>
    </div>
</div>`;
}

function lerModal() {
    const v = (id) => document.getElementById(id)?.value ?? "";
    return {
        ...edicao,
        nome: v("f-nome").trim(),
        orgaoResponsavel: v("f-orgaoResponsavel").trim(),
        primeiroAno: v("f-primeiroAno").trim(),
        ultimoAno: v("f-ultimoAno").trim(),
        lei: v("f-lei").trim(),
        dataLei: v("f-dataLei"),
        situacao: v("f-situacao"),
        aberturaContribuicoes: v("f-abertura"),
        encerramentoContribuicoes: v("f-encerramento"),
        mensagem: v("f-mensagem").trim(),
        eixos: [...document.querySelectorAll('[data-lista="eixos"]')].map((el) => el.value.trim()).filter(Boolean),
        objetivos: [...document.querySelectorAll('[data-lista="objetivos"]')].map((el) => el.value.trim()).filter(Boolean),
    };
}

/* ---------- eventos ---------- */

document.addEventListener("click", (e) => {
    if (e.target.closest("#novo")) {
        edicao = ppaVazio();
        novo = true;
        return render();
    }

    const editar = e.target.closest("[data-editar]");
    if (editar) {
        edicao = structuredClone(estado.ppas.find((p) => p.id === editar.dataset.editar));
        novo = false;
        return render();
    }

    if (!edicao || leitura) return;

    const add = e.target.closest("[data-add]");
    if (add) {
        const tipo = add.dataset.add;
        edicao = lerModal();
        edicao[tipo].push("");
        bootstrap.Modal.getInstance(document.getElementById("modal-ppa"))?.dispose();
        return render();
    }

    const remover = e.target.closest("[data-remover]");
    if (remover) {
        edicao = lerModal();
        edicao[remover.dataset.remover].splice(Number(remover.dataset.idx), 1);
        bootstrap.Modal.getInstance(document.getElementById("modal-ppa"))?.dispose();
        return render();
    }

    if (e.target.closest("#excluir")) {
        if (!confirm(`Excluir o plano “${edicao.nome}”? Os Programas continuam cadastrados.`)) return;
        removePpa(edicao.id);
        bootstrap.Modal.getInstance(document.getElementById("modal-ppa")).hide();
        edicao = null;
        return render();
    }

    if (e.target.closest("#salvar")) {
        const dados = lerModal();
        if (!dados.nome || !dados.primeiroAno || !dados.ultimoAno) {
            alert("Nome e período são obrigatórios.");
            return;
        }
        if (Number(dados.ultimoAno) < Number(dados.primeiroAno)) {
            alert("O último ano não pode ser anterior ao primeiro.");
            return;
        }
        if (estado.ppas.some((p) => p.id === dados.id)) updPpa(dados.id, dados);
        else addPpa(dados);

        bootstrap.Modal.getInstance(document.getElementById("modal-ppa")).hide();
        edicao = null;
        render();
    }
});

render();
