/**
 * Ficha da Iniciativa — tela de trabalho do órgão.
 * Porta `iniciativa.$id.tsx`.
 *
 * Corrige T6.4.16: o protótipo salvava a cada tecla sem dar retorno; aqui o
 * salvamento continua automático, mas a tela diz quando gravou.
 */
import {
    obterEstado,
    updIniciativa,
    addEntrega,
    removeEntrega,
    enviar,
} from "../dados/store.js";
import {
    podeEditar,
    entregasDaIniciativa,
    pendenciasIniciativa,
    resumoPendencias,
    situacaoEntrega,
    comentariosDaIniciativa,
    recursosDaIniciativa,
    moedaCurta,
    STATUS_LABEL,
} from "../dados/regras.js";
import { linhasDaIniciativa } from "../dados/financeiro.js";
import { ANOS } from "../dados/seed.js";
import { montarShell , somenteLeitura } from "../shell.js";
import { chip, statusChip, esc, secao, contexto, faixaIndicadores } from "../ui.js";
import { quadroFinanceiro, listaPendencias, chipsPendencias } from "../ui-financeiro.js";

const { estado } = montarShell();
const id = new URLSearchParams(location.search).get("id");

let envioAberto = false;

function avisarSalvo() {
    const el = document.getElementById("aviso-salvo");
    if (!el) return;
    el.classList.remove("d-none");
    clearTimeout(avisarSalvo.t);
    avisarSalvo.t = setTimeout(() => el.classList.add("d-none"), 1500);
}

function render() {
    const ini = estado.iniciativas.find((i) => i.id === id);
    if (!ini) {
        document.getElementById("conteudo").innerHTML = `
        <div class="text-center py-5">
            <h4 class="fw-bold">Iniciativa não encontrada</h4>
            <a href="iniciativas.html" class="btn btn-primary">Voltar às Iniciativas</a>
        </div>`;
        return;
    }

    const programa = estado.programas.find((p) => p.id === ini.programaId);
    const entregas = entregasDaIniciativa(estado, ini.id);
    const pendencias = pendenciasIniciativa(estado, ini);
    const resumo = resumoPendencias(pendencias);
    const comentarios = comentariosDaIniciativa(estado, ini.id).filter((c) => !c.resolvido);
    const eventos = estado.eventos.filter((ev) => ev.iniciativaId === ini.id);
    // Alta gestão e controle acompanham sem operar.
    const editavel = podeEditar(ini.status) && !somenteLeitura();
    const dis = editavel ? "" : " disabled";

    const camposApontados = new Set(comentarios.filter((c) => c.alvoTipo === "iniciativa").map((c) => c.campo));
    const marca = (campo) =>
        camposApontados.has(campo) ? `<span class="ms-1">${chip("apontado", "alerta")}</span>` : "";

    document.getElementById("conteudo").innerHTML = `
    <div class="my-3">
        ${contexto([
            { rotulo: "Programas", href: "programas.html" },
            { rotulo: programa ? `${programa.codigo} — ${programa.nome}` : "Programa", href: `programa.html?id=${ini.programaId}` },
            { rotulo: ini.nome },
        ])}
        <div class="d-flex flex-wrap align-items-start justify-content-between gap-3">
            <div>
                <h4 class="fw-bold mb-1">${esc(ini.nome)}</h4>
                <div class="d-flex flex-wrap align-items-center gap-2 fs-13 text-muted">
                    ${statusChip(ini.status)}
                    <span>versão ${ini.versao}</span>
                    <span>·</span>
                    <span>atualizada em ${esc(ini.atualizadoEm)}</span>
                    ${ini.analista ? `<span>·</span><span>analista: ${esc(ini.analista)}</span>` : ""}
                    <span id="aviso-salvo" class="d-none">${chip("alterações salvas", "ok")}</span>
                </div>
            </div>
            <div class="d-flex flex-wrap gap-2">
                ${
                    editavel
                        ? `<button class="btn btn-sm btn-primary" id="abrir-envio"><i class="ti ti-send me-1"></i>Enviar para análise</button>`
                        : `<span class="fs-12 text-muted align-self-center">${esc(STATUS_LABEL[ini.status])} — edição bloqueada</span>`
                }
            </div>
        </div>
    </div>

    ${faixaIndicadores([
        { valor: entregas.length, rotulo: "Entregas" },
        { valor: resumo.impeditivos, rotulo: "Impeditivas" },
        { valor: resumo.alertas, rotulo: "Alertas" },
        { valor: comentarios.length, rotulo: "Apontamentos abertos" },
        { valor: moedaCurta(recursosDaIniciativa(estado, ini.id)), rotulo: "Previsto" },
    ])}

    <div class="row g-3">
        <div class="col-xl-8">
            ${secao(
                "Dados da Iniciativa",
                `
                <div class="mb-3">
                    <label class="form-label" for="f-nome">Nome ${marca("nome")}</label>
                    <input type="text" class="form-control" id="f-nome" value="${esc(ini.nome)}"${dis} />
                </div>
                <div class="mb-3">
                    <label class="form-label" for="f-descricao">Detalhamento ${marca("descricao")}</label>
                    <textarea class="form-control" id="f-descricao" rows="3"${dis}>${esc(ini.descricao)}</textarea>
                </div>
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label" for="f-publicoAlvo">Público-alvo ${marca("publicoAlvo")}</label>
                        <input type="text" class="form-control" id="f-publicoAlvo" value="${esc(ini.publicoAlvo)}"${dis} />
                    </div>
                    <div class="col-md-6">
                        <label class="form-label" for="f-unidadeResponsavel">Unidade responsável</label>
                        <input type="text" class="form-control" id="f-unidadeResponsavel" value="${esc(ini.unidadeResponsavel ?? "")}"${dis} />
                    </div>
                </div>
                <div class="mt-3">
                    <label class="form-label" for="f-resultadoEsperado">Resultado esperado ${marca("resultadoEsperado")}</label>
                    <textarea class="form-control" id="f-resultadoEsperado" rows="2"${dis}>${esc(ini.resultadoEsperado ?? "")}</textarea>
                </div>
                <p class="form-text fs-12 mb-0">As alterações são gravadas automaticamente neste protótipo.</p>`
            )}

            ${secao(
                `Causas do Programa enfrentadas ${marca("causas")}`,
                (programa?.causas ?? []).length === 0
                    ? '<div class="alert alert-warning py-2 px-3 fs-12 mb-0">O Programa não tem causas cadastradas. Sem ao menos uma, esta Iniciativa não pode ser enviada — fale com a Área Central.</div>'
                    : programa.causas
                          .map(
                              (c) => `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="${c.id}" id="ca-${c.id}" data-causa ${ini.causas.includes(c.id) ? "checked" : ""}${dis} />
                    <label class="form-check-label" for="ca-${c.id}">${esc(c.texto)}</label>
                </div>`
                          )
                          .join("")
            )}

            ${secao(
                "Entregas",
                `
                ${
                    entregas.length === 0
                        ? `<p class="mb-3">${chip("Nenhuma Entrega", "impeditivo")} A Iniciativa precisa de ao menos uma Entrega.</p>`
                        : `<div class="table-responsive mb-3"><table class="table table-sm mb-0">
                    <thead><tr>
                        <th>Entrega</th><th style="width:9rem">Unidade</th>
                        ${ANOS.map((a) => `<th class="num" style="width:4.5rem">${a}</th>`).join("")}
                        <th style="width:12rem">Situação</th><th style="width:7rem">Ações</th>
                    </tr></thead>
                    <tbody>
                        ${entregas
                            .map((e) => {
                                const s = situacaoEntrega(estado, e);
                                return `<tr>
                            <td><a href="entrega.html?id=${e.id}">${esc(e.nome || "Sem nome")}</a></td>
                            <td class="fs-12 text-muted">${esc(e.unidadeMedida || "—")}</td>
                            ${ANOS.map((a) => `<td class="num">${e.metas[a] ?? '<span class="text-muted">—</span>'}</td>`).join("")}
                            <td>${chip(s.texto, s.tom)}</td>
                            <td>
                                <a href="entrega.html?id=${e.id}" class="btn btn-sm btn-outline-primary">Abrir</a>
                                ${editavel ? `<button class="btn btn-sm btn-light" data-excluir-entrega="${e.id}" title="Excluir"><i class="ti ti-trash"></i></button>` : ""}
                            </td>
                        </tr>`;
                            })
                            .join("")}
                    </tbody>
                </table></div>`
                }
                ${
                    editavel
                        ? `<div class="input-group input-group-sm" style="max-width:34rem">
                    <input type="text" class="form-control" id="nova-entrega" placeholder="Nome da nova Entrega" />
                    <button class="btn btn-primary" id="add-entrega"><i class="ti ti-plus me-1"></i>Adicionar Entrega</button>
                </div>
                <div class="form-text fs-12">Entrega é o resultado para a sociedade — “Construção de X” é nome de Projeto, não de Entrega.</div>`
                        : ""
                }`
            )}

            ${secao("Previsão financeira da Iniciativa", quadroFinanceiro(linhasDaIniciativa(estado, ini.id), { dimensao: "fonte", detalhe: "ipof", curto: false }))}
        </div>

        <div class="col-xl-4">
            ${secao(
                `Pendências <span class="ms-1">${chipsPendencias(resumo)}</span>`,
                listaPendencias(pendencias)
            )}

            ${secao(
                `Apontamentos da Área Central <span class="fs-12 text-muted">(${comentarios.length})</span>`,
                comentarios.length === 0
                    ? '<p class="fs-12 text-muted mb-0">Nenhum apontamento aberto.</p>'
                    : `<ul class="list-group list-group-flush">${comentarios
                          .map((c) => {
                              const alvo =
                                  c.alvoTipo === "entrega"
                                      ? estado.entregas.find((e) => e.id === c.alvoId)?.nome ?? "Entrega"
                                      : "Iniciativa";
                              return `
                    <li class="list-group-item px-0 py-2">
                        <div class="fs-13">${esc(c.texto)}</div>
                        <div class="fs-12 text-muted mt-1">${esc(alvo)} · campo ${esc(c.campo ?? "—")} · ${esc(c.autor)} em ${esc(c.criadoEm)}</div>
                    </li>`;
                          })
                          .join("")}</ul>`
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

    ${envioAberto ? modalEnvio(ini, pendencias, resumo) : ""}`;

    if (envioAberto) {
        const el = document.getElementById("modal-envio");
        new bootstrap.Modal(el).show();
        el.addEventListener("hidden.bs.modal", () => {
            envioAberto = false;
            render();
        }, { once: true });
    }
}

function modalEnvio(ini, pendencias, resumo) {
    const bloqueia = resumo.impeditivos > 0;

    return `
<div class="modal fade" id="modal-envio" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title fs-15">Enviar Iniciativa para análise</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
                ${
                    bloqueia
                        ? `<div class="alert alert-danger py-2 px-3 fs-13">
                    Há <strong>${resumo.impeditivos} pendência(s) impeditiva(s)</strong>. Corrija antes de enviar.
                </div>`
                        : `<div class="alert alert-success py-2 px-3 fs-13">
                    Nenhuma pendência impeditiva. A Iniciativa pode ser enviada${
                        resumo.alertas ? `, ainda que existam ${resumo.alertas} alerta(s)` : ""
                    }.
                </div>`
                }
                ${
                    ini.status === "devolvida"
                        ? `<p class="fs-12 text-muted">A Iniciativa foi devolvida: o reenvio cria a versão ${ini.versao + 1}.</p>`
                        : ""
                }
                ${listaPendencias(pendencias)}
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Voltar</button>
                <button type="button" class="btn btn-primary" id="confirmar-envio"${bloqueia ? " disabled" : ""}>
                    Enviar para análise
                </button>
            </div>
        </div>
    </div>
</div>`;
}

/* ---------- eventos ---------- */

document.addEventListener("input", (e) => {
    const campos = {
        "f-nome": "nome",
        "f-descricao": "descricao",
        "f-publicoAlvo": "publicoAlvo",
        "f-unidadeResponsavel": "unidadeResponsavel",
        "f-resultadoEsperado": "resultadoEsperado",
    };
    const campo = campos[e.target.id];
    if (!campo) return;
    updIniciativa(id, { [campo]: e.target.value });
    avisarSalvo();
});

document.addEventListener("change", (e) => {
    if (e.target.matches("[data-causa]")) {
        const causas = [...document.querySelectorAll("[data-causa]:checked")].map((c) => c.value);
        updIniciativa(id, { causas });
        avisarSalvo();
        render();
    }
});

document.addEventListener("click", (e) => {
    if (e.target.closest("#add-entrega")) {
        const campo = document.getElementById("nova-entrega");
        const nome = campo.value.trim();
        if (!nome) {
            alert("Informe o nome da Entrega.");
            return;
        }
        const novoId = addEntrega(id, nome);
        location.href = `entrega.html?id=${novoId}`;
        return;
    }

    const excluir = e.target.closest("[data-excluir-entrega]");
    if (excluir) {
        const entrega = estado.entregas.find((x) => x.id === excluir.dataset.excluirEntrega);
        if (confirm(`Excluir a Entrega “${entrega.nome || "sem nome"}”? Os vínculos de Projeto e Ação vão junto.`)) {
            removeEntrega(entrega.id);
            render();
        }
        return;
    }

    if (e.target.closest("#abrir-envio")) {
        envioAberto = true;
        return render();
    }

    if (e.target.closest("#confirmar-envio")) {
        enviar(id);
        bootstrap.Modal.getInstance(document.getElementById("modal-envio")).hide();
        envioAberto = false;
        render();
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.id === "nova-entrega") {
        e.preventDefault();
        document.getElementById("add-entrega").click();
    }
});

render();
