/**
 * Iniciativa em análise — Área Central.
 * Porta `central_.iniciativa.$id.tsx`.
 *
 * Corrige T5.9.9: resolver apontamento existia no modelo de dados e não tinha
 * tela em lugar nenhum — ninguém conseguia fechar um apontamento.
 */
import { obterEstado, iniciarAnalise, devolver, validar, addComentario, resolverComentario } from "../dados/store.js";
import { ANOS } from "../dados/seed.js";
import {
    STATUS_LABEL,
    entregasDaIniciativa,
    pendenciasIniciativa,
    pendenciasEntrega,
    resumoPendencias,
    situacaoEntrega,
    comentariosDaIniciativa,
    recursosDaIniciativa,
    moeda,
    moedaCurta,
    TERRITORIO_LABEL,
    COMPORTAMENTOS,
    projetosDaEntrega,
} from "../dados/regras.js";
import { linhasDaIniciativa, acoesDaEntrega } from "../dados/financeiro.js";
import { montarShell, barraTitulo, somenteLeitura } from "../shell.js";
import { chip, statusChip, esc, secao, faixaIndicadores } from "../ui.js";
import { quadroFinanceiro, listaPendencias, chipsPendencias } from "../ui-financeiro.js";

const { estado } = montarShell();
const id = new URLSearchParams(location.search).get("id");

const CAMPOS_INICIATIVA = ["nome", "descricao", "publicoAlvo", "causas", "resultadoEsperado"];
const CAMPOS_ENTREGA = ["nome", "descricao", "unidade", "metas", "comportamento", "territorio", "comprovacao", "orcamento"];

let novoApontamento = null;

function inexistente() {
    document.getElementById("conteudo").innerHTML = `
    <div class="text-center py-5">
        <h4 class="fw-bold">Iniciativa não encontrada</h4>
        <p class="text-muted">O endereço aponta para uma Iniciativa que não existe neste protótipo.</p>
        <a href="central.html" class="btn btn-primary">Voltar à Visão Geral</a>
    </div>`;
}

function blocoEntrega(e) {
    const s = situacaoEntrega(estado, e);
    const acoes = acoesDaEntrega(estado, e.id);
    const projetos = projetosDaEntrega(estado, e.id);
    const comp = COMPORTAMENTOS.find((c) => c.id === (e.comportamento ?? e.comportamentoSugerido));

    const metas = ANOS.map(
        (a) => `<td class="num">${e.metas[a] ?? '<span class="text-muted">—</span>'}</td>`
    ).join("");

    return secao(
        `Entrega — ${esc(e.nome || "sem nome")}`,
        `
        <div class="d-flex flex-wrap gap-2 mb-3">${chip(s.texto, s.tom)}</div>
        <div class="row g-3 fs-13">
            <div class="col-md-4">
                <div class="rotulo-secao mb-1">Unidade de medida</div>
                <div>${esc(e.unidadeMedida || "—")}</div>
            </div>
            <div class="col-md-4">
                <div class="rotulo-secao mb-1">Comportamento</div>
                <div>${esc(comp?.nome ?? "—")} ${e.comportamentoValidado ? chip("validado", "ok") : chip("não validado", "alerta")}</div>
            </div>
            <div class="col-md-4">
                <div class="rotulo-secao mb-1">Território</div>
                <div>${esc(TERRITORIO_LABEL[e.territorio.tipo] ?? "—")}${
                    e.territorio.regioes.length ? `<div class="fs-12 text-muted">${esc(e.territorio.regioes.join(", "))}</div>` : ""
                }</div>
            </div>
            <div class="col-12">
                <div class="rotulo-secao mb-1">Descrição</div>
                <div>${esc(e.descricao || "—")}</div>
            </div>
            <div class="col-md-6">
                <div class="rotulo-secao mb-1">Método de comprovação</div>
                <div>${esc(e.metodoComprovacao || "—")}</div>
            </div>
            <div class="col-md-6">
                <div class="rotulo-secao mb-1">Viabilizada por Projeto GOMAP</div>
                <div>${
                    e.gomap === "sim"
                        ? "Sim"
                        : e.gomap === "nao"
                          ? "Entrega não viabilizada por Projeto GOMAP"
                          : e.gomap === "depois"
                            ? "O órgão preferiu responder depois"
                            : '<span class="text-muted">Não respondido</span>'
                }${
                    projetos.length
                        ? `<div class="fs-12 text-muted">${projetos.map((p) => esc(p.codigo + " — " + p.nome)).join(" · ")}</div>`
                        : ""
                }</div>
            </div>
            <div class="col-12">
                <div class="rotulo-secao mb-1">Metas</div>
                <table class="table table-sm mb-0" style="max-width:26rem">
                    <thead><tr>${ANOS.map((a) => `<th class="num">${a}</th>`).join("")}</tr></thead>
                    <tbody><tr>${metas}</tr></tbody>
                </table>
            </div>
            <div class="col-12">
                <div class="rotulo-secao mb-1">Vinculação orçamentária</div>
                ${
                    acoes.length === 0
                        ? `<p class="mb-0">${chip("Sem Ação vinculada", "alerta")} A Entrega não tem valor financeiro no PPA.</p>`
                        : `<div class="fs-12">${acoes.map((a) => `<span class="codigo">${esc(a.codigo)}</span> ${esc(a.nome)}`).join("<br />")}</div>`
                }
            </div>
        </div>`,
        somenteLeitura()
            ? ""
            : `<button class="btn btn-sm btn-outline-primary" data-apontar-entrega="${e.id}">
            <i class="ti ti-message-plus me-1"></i>Apontar
        </button>`
    );
}

function render() {
    const ini = estado.iniciativas.find((i) => i.id === id);
    if (!ini) return inexistente();

    const programa = estado.programas.find((p) => p.id === ini.programaId);
    const entregas = entregasDaIniciativa(estado, ini.id);
    const pendencias = pendenciasIniciativa(estado, ini);
    const resumo = resumoPendencias(pendencias);
    const comentarios = comentariosDaIniciativa(estado, ini.id);
    const abertos = comentarios.filter((c) => !c.resolvido);
    const eventos = estado.eventos.filter((ev) => ev.iniciativaId === ini.id);
    const previsto = recursosDaIniciativa(estado, ini.id);

    const acoesCabecalho = somenteLeitura()
        ? `<span class="fs-12 text-muted align-self-center">Perfil de acompanhamento — sem ações de análise.</span>`
        : ini.status === "enviada"
            ? `<button class="btn btn-sm btn-primary" id="iniciar"><i class="ti ti-player-play me-1"></i>Iniciar análise</button>`
            : ini.status === "em_analise"
              ? `<button class="btn btn-sm btn-outline-warning" id="devolver"><i class="ti ti-arrow-back-up me-1"></i>Devolver para ajuste</button>
                 <button class="btn btn-sm btn-primary" id="validar"><i class="ti ti-check me-1"></i>Validar</button>`
              : `<span class="fs-12 text-muted">Sem ação disponível neste status.</span>`;

    document.getElementById("conteudo").innerHTML = `
    <div class="my-3">
        ${barraTitulo(esc(ini.nome), [
            { rotulo: programa ? `${programa.codigo} — ${programa.nome}` : "Programa", href: `programa.html?id=${ini.programaId}` },
            { rotulo: ini.nome },
        ])}
        <div class="d-flex flex-wrap align-items-start justify-content-between gap-3">
            <div>
                <h4 class="fw-bold mb-1">${esc(ini.nome)}</h4>
                <div class="d-flex flex-wrap align-items-center gap-2 fs-13 text-muted">
                    ${statusChip(ini.status)}
                    <span>${esc(ini.orgao)}</span>
                    <span>·</span>
                    <span>versão ${ini.versao}</span>
                    <span>·</span>
                    <span>analista: ${esc(ini.analista ?? "não atribuído")}</span>
                    <span>·</span>
                    <span>atualizada em ${esc(ini.atualizadoEm)}</span>
                </div>
            </div>
            <div class="d-flex flex-wrap gap-2">${acoesCabecalho}</div>
        </div>
    </div>

    ${faixaIndicadores([
        { valor: entregas.length, rotulo: "Entregas" },
        { valor: resumo.impeditivos, rotulo: "Pendências impeditivas" },
        { valor: resumo.alertas, rotulo: "Alertas" },
        { valor: abertos.length, rotulo: "Apontamentos abertos" },
        { valor: moedaCurta(previsto), rotulo: "Previsto" },
    ])}

    <div class="row g-3">
        <div class="col-12">
            ${secao(
                "Iniciativa",
                `
                <div class="row g-3 fs-13">
                    <div class="col-12">
                        <div class="rotulo-secao mb-1">Detalhamento</div>
                        <div>${esc(ini.descricao || "—")}</div>
                    </div>
                    <div class="col-md-6">
                        <div class="rotulo-secao mb-1">Público-alvo</div>
                        <div>${esc(ini.publicoAlvo || "—")}</div>
                    </div>
                    <div class="col-md-6">
                        <div class="rotulo-secao mb-1">Unidade responsável</div>
                        <div>${esc(ini.unidadeResponsavel || "—")}</div>
                    </div>
                    <div class="col-12">
                        <div class="rotulo-secao mb-1">Causas do Programa enfrentadas</div>
                        ${
                            ini.causas.length === 0
                                ? `<p class="mb-0">${chip("Nenhuma causa relacionada", "impeditivo")}</p>`
                                : `<ul class="mb-0">${ini.causas
                                      .map((cid) => {
                                          const causa = programa?.causas.find((c) => c.id === cid);
                                          return `<li>${esc(causa?.texto ?? cid)}</li>`;
                                      })
                                      .join("")}</ul>`
                        }
                    </div>
                </div>`,
                somenteLeitura()
                    ? ""
                    : `<button class="btn btn-sm btn-outline-primary" data-apontar-iniciativa="1">
                    <i class="ti ti-message-plus me-1"></i>Apontar
                </button>`
            )}

            ${entregas.length === 0 ? secao("Entregas", '<p class="fs-12 text-muted mb-0">A Iniciativa não possui Entregas.</p>') : entregas.map(blocoEntrega).join("")}

            ${secao("Previsão financeira da Iniciativa", quadroFinanceiro(linhasDaIniciativa(estado, ini.id), { dimensao: "fonte", detalhe: "ipof", curto: false }))}
        </div>

        <div class="col-12">
            ${secao(
                `Apontamentos <span class="fs-12 text-muted">(${abertos.length} aberto(s))</span>`,
                comentarios.length === 0
                    ? '<p class="fs-12 text-muted mb-0">Nenhum apontamento registrado.</p>'
                    : `<ul class="list-group list-group-flush">${comentarios
                          .map((c) => {
                              const alvo =
                                  c.alvoTipo === "entrega"
                                      ? estado.entregas.find((e) => e.id === c.alvoId)?.nome ?? "Entrega"
                                      : "Iniciativa";
                              return `
                    <li class="list-group-item px-0 py-2 ${c.resolvido ? "opacity-50" : ""}">
                        <div class="d-flex justify-content-between align-items-start gap-2">
                            <div class="fs-13">${esc(c.texto)}</div>
                            ${
                                c.resolvido
                                    ? chip("resolvido", "ok")
                                    : somenteLeitura()
                                      ? ""
                                      : `<button class="btn btn-sm btn-light" data-resolver="${c.id}" title="Marcar como resolvido"><i class="ti ti-check"></i></button>`
                            }
                        </div>
                        <div class="fs-12 text-muted mt-1">
                            ${esc(alvo)} · campo ${esc(c.campo ?? "—")} · ${esc(c.autor)} em ${esc(c.criadoEm)}
                        </div>
                    </li>`;
                          })
                          .join("")}</ul>`
            )}

            ${secao(
                `Pendências <span class="ms-1">${chipsPendencias(resumo)}</span>`,
                listaPendencias(pendencias)
            )}

            ${secao(
                "Histórico",
                eventos.length === 0
                    ? '<p class="fs-12 text-muted mb-0">Sem eventos.</p>'
                    : `<ul class="list-group list-group-flush">${eventos
                          .map(
                              (ev) => `
                    <li class="list-group-item px-0 py-2">
                        <div class="fs-13">${esc(ev.texto)}</div>
                        <div class="fs-12 text-muted">${esc(ev.autor)} · ${esc(ev.quando)}</div>
                    </li>`
                          )
                          .join("")}</ul>`
            )}
        </div>
    </div>

    ${novoApontamento ? modalApontamento(ini) : ""}`;

    if (novoApontamento) {
        const el = document.getElementById("modal-apontamento");
        new bootstrap.Modal(el).show();
        el.addEventListener("hidden.bs.modal", () => {
            novoApontamento = null;
            render();
        }, { once: true });
    }
}

function modalApontamento(ini) {
    const campos = novoApontamento.alvoTipo === "entrega" ? CAMPOS_ENTREGA : CAMPOS_INICIATIVA;
    const alvo =
        novoApontamento.alvoTipo === "entrega"
            ? estado.entregas.find((e) => e.id === novoApontamento.alvoId)?.nome
            : ini.nome;

    return `
<div class="modal fade" id="modal-apontamento" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title fs-15">Registrar apontamento</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
                <p class="fs-12 text-muted">
                    O apontamento fica ancorado em um campo e volta ao órgão quando a Iniciativa for devolvida.
                </p>
                <div class="mb-3">
                    <label class="form-label">Alvo</label>
                    <input type="text" class="form-control" value="${esc(alvo ?? "")}" disabled />
                </div>
                <div class="mb-3">
                    <label class="form-label" for="campo">Campo</label>
                    <select class="form-select" id="campo">
                        ${campos.map((c) => `<option value="${c}"${c === novoApontamento.campo ? " selected" : ""}>${c}</option>`).join("")}
                    </select>
                </div>
                <div class="mb-0">
                    <label class="form-label" for="texto">Apontamento <span class="text-danger">*</span></label>
                    <textarea class="form-control" id="texto" rows="4" placeholder="O que precisa ser ajustado e por quê"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary" id="registrar">Registrar</button>
            </div>
        </div>
    </div>
</div>`;
}

document.addEventListener("click", (e) => {
    const ini = estado.iniciativas.find((i) => i.id === id);
    if (!ini) return;

    if (e.target.closest("#iniciar")) {
        iniciarAnalise(ini.id);
        return render();
    }

    if (e.target.closest("#devolver")) {
        const abertos = comentariosDaIniciativa(estado, ini.id).filter((c) => !c.resolvido).length;
        const aviso =
            abertos === 0
                ? "Nenhum apontamento registrado. Devolver assim mesmo?"
                : `Devolver com ${abertos} apontamento(s) aberto(s)? A Iniciativa volta ao órgão para ajuste.`;
        if (confirm(aviso)) {
            devolver(ini.id);
            render();
        }
        return;
    }

    if (e.target.closest("#validar")) {
        const r = resumoPendencias(pendenciasIniciativa(estado, ini));
        // O órgão não consegue enviar com impeditiva; aqui o analista é avisado (T5.9.11).
        const aviso =
            r.impeditivos > 0
                ? `A Iniciativa ainda tem ${r.impeditivos} pendência(s) impeditiva(s). Validar assim mesmo?`
                : "Validar a Iniciativa? Ela passa a compor o plano.";
        if (confirm(aviso)) {
            validar(ini.id);
            render();
        }
        return;
    }

    const apIni = e.target.closest("[data-apontar-iniciativa]");
    if (apIni) {
        novoApontamento = { alvoTipo: "iniciativa", alvoId: ini.id, campo: "descricao" };
        return render();
    }

    const apEnt = e.target.closest("[data-apontar-entrega]");
    if (apEnt) {
        novoApontamento = { alvoTipo: "entrega", alvoId: apEnt.dataset.apontarEntrega, campo: "metas" };
        return render();
    }

    const resolver = e.target.closest("[data-resolver]");
    if (resolver) {
        resolverComentario(resolver.dataset.resolver);
        return render();
    }

    if (e.target.closest("#registrar")) {
        const texto = document.getElementById("texto").value.trim();
        if (!texto) {
            alert("Escreva o apontamento.");
            return;
        }
        addComentario({
            ...novoApontamento,
            campo: document.getElementById("campo").value,
            texto,
            autor: estado.analista,
        });
        bootstrap.Modal.getInstance(document.getElementById("modal-apontamento")).hide();
        novoApontamento = null;
        render();
    }
});

render();
