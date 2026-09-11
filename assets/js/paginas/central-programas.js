/**
 * Administração de Programas — Área Central.
 * Porta `central_.programas.tsx`.
 *
 * Corrige dois problemas graves do protótipo:
 *  - T5.8.6: o formulário não editava causas, então Programa novo nascia sem
 *    nenhuma e a Iniciativa do órgão travava numa pendência impeditiva sem
 *    saída. Aqui causas e subcausas são editáveis.
 *  - T5.8.9: dava para disponibilizar aos órgãos um Programa com diagnóstico
 *    incompleto. Agora a tela avisa e pede confirmação.
 */
import { obterEstado, addPrograma, updPrograma } from "../dados/store.js";
import { APTIDAO_LABEL, DISPONIBILIZACAO_LABEL, eixos, objetivos, iniciativasDoOrgao } from "../dados/regras.js";
import { montarShell, cabecalhoPagina , somenteLeitura } from "../shell.js";
import { chip, esc, faixaIndicadores } from "../ui.js";

const { estado } = montarShell();

let busca = "";
let eixo = "todos";
let objetivo = "todos";
let edicao = null;
let novo = false;

const uid = () => Math.random().toString(36).slice(2, 9);

function vazio() {
    return {
        id: `pg-${uid()}`,
        codigo: "",
        nome: "",
        eixo: "",
        objetivoEstrategico: "",
        descricao: "",
        problema: "",
        evidencias: [],
        causas: [],
        consequencias: [],
        populacaoAfetada: "",
        objetivo: "",
        resultadoEsperado: "",
        indicadores: [],
        orgaoCoordenador: "",
        governanca: "",
        aptidao: "incompleto",
        disponibilizacao: "em_estruturacao",
    };
}

/** Um Programa só está pronto para os órgãos quando o diagnóstico se sustenta. */
function faltaParaDisponibilizar(p) {
    const falta = [];
    if (!p.problema?.trim()) falta.push("problema central");
    if (!p.objetivo?.trim()) falta.push("objetivo");
    if ((p.causas ?? []).length === 0) falta.push("causas");
    if ((p.indicadores ?? []).length === 0) falta.push("indicadores de resultado");
    return falta;
}

function contribuicoes(programaId) {
    return estado.iniciativas.filter((i) => i.programaId === programaId).length;
}

/* ---------- lista ---------- */

function linhas() {
    const q = busca.trim().toLowerCase();
    return estado.programas.filter((p) => {
        if (q && !p.nome.toLowerCase().includes(q) && !p.codigo.includes(q)) return false;
        if (eixo !== "todos" && p.eixo !== eixo) return false;
        if (objetivo !== "todos" && p.objetivoEstrategico !== objetivo) return false;
        return true;
    });
}

function render() {
    const ls = linhas();
    const aptos = ls.filter((p) => p.aptidao === "apto").length;
    const disponiveis = ls.filter((p) => p.disponibilizacao === "disponivel").length;
    const incompletos = ls.filter((p) => faltaParaDisponibilizar(p).length > 0).length;

    document.getElementById("conteudo").innerHTML = `
    ${cabecalhoPagina(
        "Administração de Programas",
        "Diagnóstico, aptidão e disponibilização dos Programas aos órgãos.",
        `
        <div class="app-search">
            <input type="search" id="busca" class="form-control form-control-sm" placeholder="Buscar Programa" value="${esc(busca)}" />
            <i class="ti ti-search app-search-icon text-muted"></i>
        </div>
        <select class="form-select form-select-sm" id="eixo">
            <option value="todos">Todos os Eixos</option>
            ${eixos(estado.programas).map((e) => `<option value="${esc(e)}"${e === eixo ? " selected" : ""}>${esc(e)}</option>`).join("")}
        </select>
        <select class="form-select form-select-sm" id="objetivo">
            <option value="todos">Todos os Objetivos</option>
            ${objetivos(estado.programas, eixo).map((o) => `<option value="${esc(o)}"${o === objetivo ? " selected" : ""}>${esc(o)}</option>`).join("")}
        </select>
        ${somenteLeitura() ? "" : `<button class="btn btn-sm btn-primary" id="novo"><i class="ti ti-plus me-1"></i>Novo Programa</button>`}`
    )}
    ${faixaIndicadores(
        [
            { valor: ls.length, rotulo: "Programas" },
            { valor: aptos, rotulo: "Aptos" },
            { valor: disponiveis, rotulo: "Disponíveis aos órgãos" },
            { valor: incompletos, rotulo: "Com diagnóstico incompleto" },
            { valor: estado.iniciativas.length, rotulo: "Iniciativas recebidas" },
        ],
        "Um Programa sem causas cadastradas impede o órgão de concluir qualquer Iniciativa nele."
    )}
    <div class="card">
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th style="width:5rem">Código</th>
                        <th>Programa</th>
                        <th class="num" style="width:6rem">Causas</th>
                        <th class="num" style="width:7rem">Iniciativas</th>
                        <th style="width:11rem">Aptidão</th>
                        <th style="width:14rem">Disponibilização</th>
                        <th style="width:7rem">Ações</th>
                    </tr>
                </thead>
                <tbody>
                ${
                    ls.length === 0
                        ? '<tr><td colspan="7" class="text-center text-muted py-4 fs-12">Nenhum Programa corresponde ao filtro.</td></tr>'
                        : ls
                              .map((p) => {
                                  const falta = faltaParaDisponibilizar(p);
                                  return `
                    <tr>
                        <td class="codigo text-muted">${esc(p.codigo)}</td>
                        <td>
                            <a href="programa.html?id=${p.id}" class="fw-medium">${esc(p.nome)}</a>
                            <div class="fs-12 text-muted">${esc(p.eixo)}</div>
                            ${falta.length ? `<div class="fs-12 text-warning mt-1">Falta: ${esc(falta.join(", "))}</div>` : ""}
                        </td>
                        <td class="num">${(p.causas ?? []).length || chip("0", "alerta")}</td>
                        <td class="num">${contribuicoes(p.id) || "—"}</td>
                        <td>${chip(APTIDAO_LABEL[p.aptidao ?? "incompleto"], p.aptidao === "apto" ? "ok" : "alerta")}</td>
                        <td>${chip(DISPONIBILIZACAO_LABEL[p.disponibilizacao ?? "em_estruturacao"], p.disponibilizacao === "disponivel" ? "ok" : "neutro")}</td>
                        <td>${
                            somenteLeitura()
                                ? `<a href="programa.html?id=${p.id}" class="btn btn-sm btn-light">Ver</a>`
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
    ${edicao ? formulario() : ""}`;

    document.getElementById("busca").value = busca;

    if (edicao) {
        const modal = new bootstrap.Modal(document.getElementById("modal-programa"));
        modal.show();
        document
            .getElementById("modal-programa")
            .addEventListener("hidden.bs.modal", () => {
                edicao = null;
                render();
            }, { once: true });
    }
}

/* ---------- formulário ---------- */

function campoTexto(id, rotulo, valor, { linhas = 1, obrigatorio = false, ajuda = "" } = {}) {
    const campo =
        linhas > 1
            ? `<textarea class="form-control" id="${id}" rows="${linhas}">${esc(valor ?? "")}</textarea>`
            : `<input type="text" class="form-control" id="${id}" value="${esc(valor ?? "")}" />`;
    return `
    <div class="mb-3">
        <label class="form-label" for="${id}">${rotulo}${obrigatorio ? ' <span class="text-danger">*</span>' : ""}</label>
        ${campo}
        ${ajuda ? `<div class="form-text fs-12">${ajuda}</div>` : ""}
    </div>`;
}

function listaEditavel(tipo, titulo, itens, ajuda) {
    return `
    <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
            <label class="form-label mb-0">${titulo}</label>
            <button type="button" class="btn btn-sm btn-light" data-add="${tipo}"><i class="ti ti-plus"></i> Adicionar</button>
        </div>
        ${ajuda ? `<div class="form-text fs-12 mb-2">${ajuda}</div>` : ""}
        ${
            itens.length === 0
                ? `<p class="fs-12 text-muted mb-0">Nenhum item.</p>`
                : itens
                      .map(
                          (t, i) => `
        <div class="input-group input-group-sm mb-2">
            <input type="text" class="form-control" value="${esc(t)}" data-lista="${tipo}" data-idx="${i}" />
            <button class="btn btn-light" type="button" data-remover="${tipo}" data-idx="${i}" aria-label="Remover"><i class="ti ti-trash"></i></button>
        </div>`
                      )
                      .join("")
        }
    </div>`;
}

function editorCausas() {
    const causas = edicao.causas ?? [];
    return `
    <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
            <label class="form-label mb-0">Causas e subcausas <span class="text-danger">*</span></label>
            <button type="button" class="btn btn-sm btn-light" data-add="causa"><i class="ti ti-plus"></i> Adicionar causa</button>
        </div>
        <div class="form-text fs-12 mb-2">
            São as causas que o órgão relaciona à Iniciativa. Sem nenhuma cadastrada, a Iniciativa fica
            presa numa pendência impeditiva que a interface não permite resolver.
        </div>
        ${
            causas.length === 0
                ? '<div class="alert alert-warning py-2 px-3 fs-12 mb-0">Este Programa não tem causas. Nenhum órgão conseguirá concluir uma Iniciativa nele.</div>'
                : causas
                      .map(
                          (c, i) => `
        <div class="border rounded p-2 mb-2">
            <div class="input-group input-group-sm mb-2">
                <span class="input-group-text">Causa ${i + 1}</span>
                <input type="text" class="form-control" value="${esc(c.texto)}" data-causa-texto="${i}" />
                <button class="btn btn-light" type="button" data-remover-causa="${i}" aria-label="Remover causa"><i class="ti ti-trash"></i></button>
            </div>
            <div class="ps-3">
                ${c.subcausas
                    .map(
                        (s, j) => `
                <div class="input-group input-group-sm mb-1">
                    <span class="input-group-text fs-12">↳</span>
                    <input type="text" class="form-control" value="${esc(s.texto)}" data-sub-texto="${i}:${j}" />
                    <button class="btn btn-light" type="button" data-remover-sub="${i}:${j}" aria-label="Remover subcausa"><i class="ti ti-x"></i></button>
                </div>`
                    )
                    .join("")}
                <button type="button" class="btn btn-sm btn-link px-0 fs-12" data-add-sub="${i}">+ subcausa</button>
            </div>
        </div>`
                      )
                      .join("")
        }
    </div>`;
}

function editorIndicadores() {
    const inds = edicao.indicadores ?? [];
    return `
    <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
            <label class="form-label mb-0">Indicadores de resultado</label>
            <button type="button" class="btn btn-sm btn-light" data-add="indicador"><i class="ti ti-plus"></i> Adicionar</button>
        </div>
        ${
            inds.length === 0
                ? '<p class="fs-12 text-muted mb-0">Nenhum indicador cadastrado.</p>'
                : inds
                      .map(
                          (ind, i) => `
        <div class="border rounded p-2 mb-2">
            <div class="row g-2">
                <div class="col-md-6"><input type="text" class="form-control form-control-sm" placeholder="Nome" value="${esc(ind.nome)}" data-ind="${i}:nome" /></div>
                <div class="col-md-2"><input type="text" class="form-control form-control-sm" placeholder="Unidade" value="${esc(ind.unidade)}" data-ind="${i}:unidade" /></div>
                <div class="col-md-2"><input type="text" class="form-control form-control-sm" placeholder="Linha de base" value="${esc(ind.linhaBase)}" data-ind="${i}:linhaBase" /></div>
                <div class="col-md-2 d-flex gap-1">
                    <input type="text" class="form-control form-control-sm" placeholder="Meta" value="${esc(ind.meta)}" data-ind="${i}:meta" />
                    <button class="btn btn-sm btn-light" type="button" data-remover-ind="${i}" aria-label="Remover"><i class="ti ti-trash"></i></button>
                </div>
            </div>
        </div>`
                      )
                      .join("")
        }
    </div>`;
}

function formulario() {
    const falta = faltaParaDisponibilizar(edicao);

    return `
<div class="modal fade" id="modal-programa" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title fs-15">${novo ? "Novo Programa" : `Editar Programa ${esc(edicao.codigo)}`}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
                <div class="row g-3">
                    <div class="col-md-2">${campoTexto("f-codigo", "Código", edicao.codigo, { obrigatorio: true })}</div>
                    <div class="col-md-10">${campoTexto("f-nome", "Nome do Programa", edicao.nome, { obrigatorio: true })}</div>
                </div>
                <div class="row g-3">
                    <div class="col-md-6">${campoTexto("f-eixo", "Eixo", edicao.eixo)}</div>
                    <div class="col-md-6">${campoTexto("f-objetivoEstrategico", "Objetivo Estratégico", edicao.objetivoEstrategico)}</div>
                </div>
                ${campoTexto("f-descricao", "Descrição do Programa", edicao.descricao, { linhas: 2 })}

                <div class="border-top border-dashed my-3"></div>
                <h6 class="rotulo-secao mb-3">Diagnóstico</h6>

                ${campoTexto("f-problema", "Problema central", edicao.problema, { linhas: 2, obrigatorio: true })}
                ${listaEditavel("evidencias", "Evidências", edicao.evidencias ?? [], "Dados que sustentam o problema.")}
                ${editorCausas()}
                ${listaEditavel("consequencias", "Consequências", edicao.consequencias ?? [])}
                ${campoTexto("f-populacaoAfetada", "População afetada", edicao.populacaoAfetada)}

                <div class="border-top border-dashed my-3"></div>
                <h6 class="rotulo-secao mb-3">Objetivo e resultado</h6>

                ${campoTexto("f-objetivo", "Objetivo", edicao.objetivo, { linhas: 2, obrigatorio: true })}
                ${campoTexto("f-resultadoEsperado", "Resultado esperado", edicao.resultadoEsperado, { linhas: 2 })}
                ${editorIndicadores()}

                <div class="border-top border-dashed my-3"></div>
                <h6 class="rotulo-secao mb-3">Governança e situação</h6>

                <div class="row g-3">
                    <div class="col-md-6">${campoTexto("f-orgaoCoordenador", "Órgão coordenador", edicao.orgaoCoordenador)}</div>
                    <div class="col-md-6">${campoTexto("f-governanca", "Governança do Programa", edicao.governanca)}</div>
                </div>
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label" for="f-aptidao">Aptidão</label>
                        <select class="form-select" id="f-aptidao">
                            <option value="incompleto"${edicao.aptidao === "incompleto" ? " selected" : ""}>Diagnóstico incompleto</option>
                            <option value="apto"${edicao.aptidao === "apto" ? " selected" : ""}>Apto</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label" for="f-disponibilizacao">Disponibilização</label>
                        <select class="form-select" id="f-disponibilizacao">
                            ${Object.entries(DISPONIBILIZACAO_LABEL)
                                .map(
                                    ([k, v]) =>
                                        `<option value="${k}"${edicao.disponibilizacao === k ? " selected" : ""}>${esc(v)}</option>`
                                )
                                .join("")}
                        </select>
                    </div>
                </div>
                ${
                    falta.length
                        ? `<div class="alert alert-warning py-2 px-3 fs-12 mt-3 mb-0">
                    Diagnóstico incompleto — falta: <strong>${esc(falta.join(", "))}</strong>.
                    Disponibilizar assim deixa os órgãos sem base para contribuir.
                </div>`
                        : ""
                }
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary" id="salvar">Salvar Programa</button>
            </div>
        </div>
    </div>
</div>`;
}

/* ---------- edição em memória ---------- */

function lerFormulario() {
    const v = (id) => document.getElementById(id)?.value ?? "";
    Object.assign(edicao, {
        codigo: v("f-codigo").trim(),
        nome: v("f-nome").trim(),
        eixo: v("f-eixo").trim(),
        objetivoEstrategico: v("f-objetivoEstrategico").trim(),
        descricao: v("f-descricao").trim(),
        problema: v("f-problema").trim(),
        populacaoAfetada: v("f-populacaoAfetada").trim(),
        objetivo: v("f-objetivo").trim(),
        resultadoEsperado: v("f-resultadoEsperado").trim(),
        orgaoCoordenador: v("f-orgaoCoordenador").trim(),
        governanca: v("f-governanca").trim(),
        aptidao: v("f-aptidao"),
        disponibilizacao: v("f-disponibilizacao"),
    });

    document.querySelectorAll("[data-lista]").forEach((el) => {
        const tipo = el.dataset.lista;
        edicao[tipo][Number(el.dataset.idx)] = el.value;
    });
    document.querySelectorAll("[data-causa-texto]").forEach((el) => {
        edicao.causas[Number(el.dataset.causaTexto)].texto = el.value;
    });
    document.querySelectorAll("[data-sub-texto]").forEach((el) => {
        const [i, j] = el.dataset.subTexto.split(":").map(Number);
        edicao.causas[i].subcausas[j].texto = el.value;
    });
    document.querySelectorAll("[data-ind]").forEach((el) => {
        const [i, campo] = el.dataset.ind.split(":");
        edicao.indicadores[Number(i)][campo] = el.value;
    });
}

function reabrir() {
    const aberto = bootstrap.Modal.getInstance(document.getElementById("modal-programa"));
    if (aberto) aberto.dispose();
    render();
}

/* ---------- eventos ---------- */

document.addEventListener("click", (e) => {
    const novoBtn = e.target.closest("#novo");
    if (novoBtn) {
        edicao = vazio();
        novo = true;
        return render();
    }

    const editar = e.target.closest("[data-editar]");
    if (editar) {
        edicao = structuredClone(estado.programas.find((p) => p.id === editar.dataset.editar));
        novo = false;
        return render();
    }

    if (!edicao) return;

    const add = e.target.closest("[data-add]");
    if (add) {
        lerFormulario();
        const tipo = add.dataset.add;
        if (tipo === "causa") edicao.causas.push({ id: `c-${uid()}`, texto: "", subcausas: [] });
        else if (tipo === "indicador")
            edicao.indicadores.push({ nome: "", unidade: "", linhaBase: "", meta: "" });
        else edicao[tipo].push("");
        return reabrir();
    }

    const addSub = e.target.closest("[data-add-sub]");
    if (addSub) {
        lerFormulario();
        edicao.causas[Number(addSub.dataset.addSub)].subcausas.push({ id: `sc-${uid()}`, texto: "" });
        return reabrir();
    }

    const remover = e.target.closest("[data-remover]");
    if (remover) {
        lerFormulario();
        edicao[remover.dataset.remover].splice(Number(remover.dataset.idx), 1);
        return reabrir();
    }

    const removerCausa = e.target.closest("[data-remover-causa]");
    if (removerCausa) {
        lerFormulario();
        const i = Number(removerCausa.dataset.removerCausa);
        const causa = edicao.causas[i];
        const usada = estado.iniciativas.filter((ini) => ini.causas.includes(causa.id));
        if (usada.length && !confirm(`${usada.length} Iniciativa(s) referenciam esta causa. Remover assim mesmo?`))
            return;
        edicao.causas.splice(i, 1);
        return reabrir();
    }

    const removerSub = e.target.closest("[data-remover-sub]");
    if (removerSub) {
        lerFormulario();
        const [i, j] = removerSub.dataset.removerSub.split(":").map(Number);
        edicao.causas[i].subcausas.splice(j, 1);
        return reabrir();
    }

    const removerInd = e.target.closest("[data-remover-ind]");
    if (removerInd) {
        lerFormulario();
        edicao.indicadores.splice(Number(removerInd.dataset.removerInd), 1);
        return reabrir();
    }

    if (e.target.closest("#salvar")) {
        lerFormulario();
        if (!edicao.codigo || !edicao.nome) {
            alert("Código e nome são obrigatórios.");
            return;
        }
        const falta = faltaParaDisponibilizar(edicao);
        if (edicao.disponibilizacao === "disponivel" && falta.length) {
            if (!confirm(`Diagnóstico incompleto (falta: ${falta.join(", ")}). Disponibilizar aos órgãos assim mesmo?`))
                return;
        }
        if (estado.programas.some((p) => p.id === edicao.id)) updPrograma(edicao.id, edicao);
        else addPrograma(edicao);

        bootstrap.Modal.getInstance(document.getElementById("modal-programa")).hide();
        edicao = null;
        render();
    }
});

document.addEventListener("input", (e) => {
    if (e.target.id === "busca") {
        busca = e.target.value;
        render();
        // O campo é recriado a cada tecla: sem devolver o cursor ao fim, o
        // texto digitado sai embaralhado.
        const campo = document.getElementById("busca");
        campo.focus();
        campo.setSelectionRange(campo.value.length, campo.value.length);
    }
});

document.addEventListener("change", (e) => {
    if (e.target.id === "eixo") {
        eixo = e.target.value;
        objetivo = "todos";
        render();
    } else if (e.target.id === "objetivo") {
        objetivo = e.target.value;
        render();
    }
});

render();
