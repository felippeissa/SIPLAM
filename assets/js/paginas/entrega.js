/**
 * Ficha da Entrega — preenchimento do órgão.
 * Porta `entrega.$id.tsx`.
 *
 * Corrige dois problemas do protótipo:
 *  - T6.6.9: vincular uma Ação já usada por outra Entrega falhava em silêncio;
 *    agora a tela diz qual Entrega a consome e leva até ela.
 *  - T6.6.13: o campo gomap (sim/não/depois) existia no modelo, aparecia na
 *    análise e nunca era perguntado ao órgão.
 */
import { obterEstado, updEntrega, toggleProjeto, toggleAcao } from "../dados/store.js";
import { ANOS, REGIOES, UNIDADES, PROJETOS } from "../dados/seed.js";
import {
    podeEditar,
    pendenciasEntrega,
    resumoPendencias,
    situacaoEntrega,
    projetosDaEntrega,
    comentariosDaIniciativa,
    ipofsDaEntrega,
    descompassoProjeto,
    moeda,
    moedaCurta,
    COMPORTAMENTOS,
    TERRITORIO_LABEL,
} from "../dados/regras.js";
import { acoesDoOrgao, acoesDaEntrega, linhasDaEntrega, totalDaAcao } from "../dados/financeiro.js";
import { montarShell, barraTitulo, somenteLeitura } from "../shell.js";
import { chip, esc, secao, faixaIndicadores } from "../ui.js";
import { quadroFinanceiro, listaPendencias, chipsPendencias } from "../ui-financeiro.js";

const { estado } = montarShell();
const id = new URLSearchParams(location.search).get("id");

let avisoAcao = null;

function avisarSalvo() {
    const el = document.getElementById("aviso-salvo");
    if (!el) return;
    el.classList.remove("d-none");
    clearTimeout(avisarSalvo.t);
    avisarSalvo.t = setTimeout(() => el.classList.add("d-none"), 1500);
}

/** Sugestão do sistema a partir da unidade de medida e do nome (T6.6.14). */
function comportamentoSugerido(e) {
    if (e.comportamentoSugerido) return e.comportamentoSugerido;
    const u = (e.unidadeMedida || "").toLowerCase();
    if (u.includes("percentual")) return "percentual";
    if (u.includes("pessoa") || u.includes("refeição") || u.includes("tonelada")) return "fluxo";
    if (u.includes("município") || u.includes("unidade")) return "acumulativa";
    return null;
}

function render() {
    const e = estado.entregas.find((x) => x.id === id);
    if (!e) {
        document.getElementById("conteudo").innerHTML = `
        <div class="text-center py-5">
            <h4 class="fw-bold">Entrega não encontrada</h4>
            <a href="entregas.html" class="btn btn-primary">Voltar às Entregas</a>
        </div>`;
        return;
    }

    const ini = estado.iniciativas.find((i) => i.id === e.iniciativaId);
    const programa = estado.programas.find((p) => p.id === ini?.programaId);
    const editavel = podeEditar(ini?.status ?? "em_preenchimento") && !somenteLeitura();
    const dis = editavel ? "" : " disabled";
    const pendencias = pendenciasEntrega(estado, e);
    const resumo = resumoPendencias(pendencias);
    const sit = situacaoEntrega(estado, e);
    const sugerido = comportamentoSugerido(e);
    const comp = e.comportamento ?? sugerido;
    const acoesVinculadas = acoesDaEntrega(estado, e.id);
    const catalogo = acoesDoOrgao(estado, ini?.orgao ?? "");
    const projetos = projetosDaEntrega(estado, e.id);
    const disponiveis = PROJETOS.filter((p) => p.orgao === ini?.orgao || projetos.some((v) => v.id === p.id));
    const ipofs = ipofsDaEntrega(estado, e.id);
    const apontados = new Set(
        comentariosDaIniciativa(estado, ini?.id ?? "")
            .filter((c) => !c.resolvido && c.alvoTipo === "entrega" && c.alvoId === e.id)
            .map((c) => c.campo)
    );
    const marca = (campo) => (apontados.has(campo) ? `<span class="ms-1">${chip("apontado", "alerta")}</span>` : "");

    document.getElementById("conteudo").innerHTML = `
    ${barraTitulo(esc(e.nome || "Nova Entrega"), [
        { rotulo: programa?.nome ?? "Programa", href: `programa.html?id=${programa?.id}` },
        { rotulo: ini?.nome ?? "Iniciativa", href: `iniciativa.html?id=${ini?.id}` },
        { rotulo: e.nome || "Nova Entrega" },
    ])}
    <div class="my-3">
        <div class="d-flex flex-wrap align-items-start justify-content-between gap-3">
            <div>
                <h4 class="fw-bold mb-1">${esc(e.nome || "Nova Entrega")}</h4>
                <div class="d-flex flex-wrap align-items-center gap-2 fs-13 text-muted">
                    ${chip(sit.texto, sit.tom)}
                    ${editavel ? "" : `<span>edição bloqueada — Iniciativa ${esc(ini?.status.replace("_", " "))}</span>`}
                    <span id="aviso-salvo" class="d-none">${chip("alterações salvas", "ok")}</span>
                </div>
            </div>
            <a href="iniciativa.html?id=${ini?.id}" class="btn btn-sm btn-light"><i class="ti ti-arrow-left me-1"></i>Voltar à Iniciativa</a>
        </div>
    </div>

    ${faixaIndicadores([
        { valor: ANOS.filter((a) => e.metas[a] != null).length + "/4", rotulo: "Metas informadas" },
        { valor: acoesVinculadas.length, rotulo: "Ações vinculadas" },
        { valor: projetos.length, rotulo: "Projetos GOMAP" },
        { valor: moedaCurta(linhasDaEntrega(estado, e.id).reduce((s, l) => s + l.total, 0)), rotulo: "Previsto" },
    ])}

    <div class="row g-3">
        <div class="col-12">
            ${secao(
                "Informações da Entrega",
                `
                <div class="mb-3">
                    <label class="form-label" for="f-nome">Nome ${marca("nome")}</label>
                    <input type="text" class="form-control" id="f-nome" value="${esc(e.nome)}"${dis} />
                    <div class="form-text fs-12">Entrega é o resultado entregue à sociedade, não a obra que o produz.</div>
                </div>
                <div class="mb-3">
                    <label class="form-label" for="f-descricao">Descrição ${marca("descricao")}</label>
                    <textarea class="form-control" id="f-descricao" rows="2"${dis}>${esc(e.descricao)}</textarea>
                </div>
                <div class="row g-3">
                    <div class="col-md-5">
                        <label class="form-label" for="f-unidade">Unidade de medida ${marca("unidade")}</label>
                        <select class="form-select" id="f-unidade"${dis}>
                            <option value="">Selecione</option>
                            ${UNIDADES.map((u) => `<option value="${esc(u)}"${u === e.unidadeMedida ? " selected" : ""}>${esc(u)}</option>`).join("")}
                        </select>
                    </div>
                    <div class="col-md-7">
                        <label class="form-label" for="f-comprovacao">Método de comprovação ${marca("comprovacao")}</label>
                        <input type="text" class="form-control" id="f-comprovacao" value="${esc(e.metodoComprovacao)}"${dis} />
                    </div>
                </div>`
            )}

            ${secao(
                `Metas ${marca("metas")}`,
                `
                <div class="row g-2 mb-3">
                    ${ANOS.map(
                        (a) => `
                    <div class="col-6 col-md-3">
                        <label class="form-label" for="meta-${a}">${a}</label>
                        <input type="number" class="form-control" id="meta-${a}" data-meta="${a}" value="${e.metas[a] ?? ""}" placeholder="—"${dis} />
                    </div>`
                    ).join("")}
                </div>
                <div class="rotulo-secao mb-2">Comportamento da meta ${marca("comportamento")}</div>
                ${
                    sugerido && !e.comportamento
                        ? `<div class="alert alert-info py-2 px-3 fs-12">
                    O sistema sugere <strong>${esc(COMPORTAMENTOS.find((c) => c.id === sugerido)?.nome)}</strong>,
                    a partir da unidade de medida informada. Confirme ou escolha outro.
                </div>`
                        : ""
                }
                ${COMPORTAMENTOS.map(
                    (c) => `
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="comportamento" id="cp-${c.id}" value="${c.id}" ${comp === c.id ? "checked" : ""}${dis} />
                    <label class="form-check-label" for="cp-${c.id}">
                        ${esc(c.nome)} <span class="fs-12 text-muted">— ${esc(c.ajuda)}</span>
                    </label>
                </div>`
                ).join("")}
                <div class="form-check mt-3">
                    <input class="form-check-input" type="checkbox" id="validado" ${e.comportamentoValidado ? "checked" : ""}${dis} />
                    <label class="form-check-label" for="validado">
                        Confirmo que o comportamento acima descreve a série de metas
                    </label>
                </div>`
            )}

            ${secao(
                `Territorialização ${marca("territorio")}`,
                `
                ${Object.entries(TERRITORIO_LABEL)
                    .map(
                        ([k, v]) => `
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="territorio" id="t-${k}" value="${k}" ${e.territorio.tipo === k ? "checked" : ""}${dis} />
                    <label class="form-check-label" for="t-${k}">${esc(v)}</label>
                </div>`
                    )
                    .join("")}
                ${
                    e.territorio.tipo === "territorializavel"
                        ? `<div class="mt-3">
                    <div class="rotulo-secao mb-2">Regiões de planejamento</div>
                    <div class="row g-2">
                        ${REGIOES.map(
                            (r) => `
                        <div class="col-md-6">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" value="${esc(r)}" id="r-${esc(r)}" data-regiao ${e.territorio.regioes.includes(r) ? "checked" : ""}${dis} />
                                <label class="form-check-label" for="r-${esc(r)}">${esc(r)}</label>
                            </div>
                        </div>`
                        ).join("")}
                    </div>
                    ${e.territorio.regioes.length === 0 ? `<p class="mt-2 mb-0">${chip("Nenhuma região informada", "impeditivo")}</p>` : ""}
                </div>`
                        : ""
                }`
            )}

            ${secao(
                "Projetos GOMAP associados",
                `
                <div class="alert alert-light py-2 px-3 fs-12">
                    O Projeto GOMAP descreve <strong>como</strong> a Entrega é produzida. Ele não define o valor
                    financeiro — isso vem das Ações Orçamentárias.
                </div>
                <div class="mb-3">
                    <div class="rotulo-secao mb-2">Esta Entrega é viabilizada por Projeto do GOMAP?</div>
                    <div class="d-flex flex-wrap gap-3">
                        ${[
                            ["sim", "Sim"],
                            ["nao", "Não"],
                            ["depois", "Respondo depois"],
                        ]
                            .map(
                                ([v, r]) => `
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="gomap" id="g-${v}" value="${v}" ${e.gomap === v ? "checked" : ""}${dis} />
                            <label class="form-check-label" for="g-${v}">${r}</label>
                        </div>`
                            )
                            .join("")}
                    </div>
                </div>
                ${
                    disponiveis.length === 0
                        ? '<p class="fs-12 text-muted mb-0">Nenhum Projeto do seu órgão no GOMAP.</p>'
                        : disponiveis
                              .map((p) => {
                                  const vinculado = projetos.some((v) => v.id === p.id);
                                  const d = vinculado ? descompassoProjeto(estado, p.id) : null;
                                  return `
                <div class="form-check border-bottom py-2">
                    <input class="form-check-input" type="checkbox" id="p-${p.id}" data-projeto="${p.id}" ${vinculado ? "checked" : ""}${dis} />
                    <label class="form-check-label w-100" for="p-${p.id}">
                        <span class="codigo">${esc(p.codigo)}</span> ${esc(p.nome)}
                        <div class="fs-12 text-muted">
                            ${esc(p.fase)} · execução ${p.execucao}% · valor global ${moedaCurta(p.valorGlobal)}
                            ${d && d.noPpa > 0 ? ` · ${moedaCurta(d.noPpa)} refletidos no PPA` : ""}
                        </div>
                    </label>
                </div>`;
                              })
                              .join("")
                }`
            )}

            ${secao(
                `Vinculação orçamentária (Ações da LOA) ${marca("orcamento")}`,
                `
                <div class="alert alert-light py-2 px-3 fs-12">
                    Uma Ação Orçamentária financia <strong>no máximo uma</strong> Entrega. O valor do PPA vem
                    daqui — nenhum número é digitado.
                </div>
                ${avisoAcao ? `<div class="alert alert-warning py-2 px-3 fs-13">${avisoAcao}</div>` : ""}
                ${
                    catalogo.length === 0
                        ? '<p class="fs-12 text-muted mb-0">Nenhuma Ação Orçamentária cadastrada para o órgão.</p>'
                        : `<div class="table-responsive"><table class="table table-sm mb-0">
                    <thead><tr><th style="width:2.5rem"></th><th>Ação</th><th class="num" style="width:9rem">Valor no SIAFIC</th><th style="width:16rem">Situação</th></tr></thead>
                    <tbody>
                        ${catalogo
                            .map(({ acao, total, entregaId }) => {
                                const nesta = entregaId === e.id;
                                const outra = entregaId && entregaId !== e.id;
                                const entregaOutra = outra ? estado.entregas.find((x) => x.id === entregaId) : null;
                                return `<tr>
                            <td>
                                <input class="form-check-input" type="checkbox" data-acao="${acao.id}" ${nesta ? "checked" : ""} ${outra || !editavel ? "disabled" : ""} aria-label="Vincular ${esc(acao.codigo)}" />
                            </td>
                            <td>
                                <span class="codigo">${esc(acao.codigo)}</span> ${esc(acao.nome)}
                                <div class="fs-12 text-muted">${esc(acao.situacao)}</div>
                            </td>
                            <td class="num">${moedaCurta(total)}</td>
                            <td class="fs-12">
                                ${
                                    nesta
                                        ? chip("financia esta Entrega", "ok")
                                        : outra
                                          ? `${chip("já vinculada", "neutro")} <a href="entrega.html?id=${entregaId}">${esc(entregaOutra?.nome ?? "outra Entrega")}</a>`
                                          : '<span class="text-muted">disponível</span>'
                                }
                            </td>
                        </tr>`;
                            })
                            .join("")}
                    </tbody>
                </table></div>`
                }`
            )}
            ${secao(
                "Previsão financeira da Entrega",
                quadroFinanceiro(linhasDaEntrega(estado, e.id), {
                    dimensao: "fonte",
                    detalhe: "acao",
                    curto: false,
                    vazio: "Sem Ação vinculada, a Entrega não tem valor financeiro no PPA.",
                })
            )}
        </div>

        <div class="col-12">
            ${secao(
                `Pendências desta Entrega <span class="ms-1">${chipsPendencias(resumo)}</span>`,
                listaPendencias(pendencias, { linkEntrega: false })
            )}

            ${secao(
                "IPOFs alcançados",
                ipofs.length === 0
                    ? '<p class="fs-12 text-muted mb-0">Nenhum IPOF alcançado — derivado das Ações vinculadas.</p>'
                    : `<ul class="list-group list-group-flush">${ipofs
                          .map(
                              (i) => `
                    <li class="list-group-item px-0 py-2">
                        <div class="d-flex justify-content-between gap-2">
                            <span class="fs-13"><span class="codigo">${esc(i.ipof.codigo)}</span> ${esc(i.ipof.nome)}</span>
                            <span class="num fs-13">${moedaCurta(i.total)}</span>
                        </div>
                        ${i.projeto ? `<div class="fs-12 text-muted">Projeto ${esc(i.projeto.codigo)} — ${esc(i.projeto.nome)}</div>` : ""}
                    </li>`
                          )
                          .join("")}</ul>`
            )}
        </div>
    </div>`;
}

/* ---------- eventos ---------- */

document.addEventListener("input", (e) => {
    const campos = { "f-nome": "nome", "f-descricao": "descricao", "f-comprovacao": "metodoComprovacao" };
    const campo = campos[e.target.id];
    if (campo) {
        updEntrega(id, { [campo]: e.target.value });
        return avisarSalvo();
    }

    if (e.target.dataset.meta) {
        const entrega = estado.entregas.find((x) => x.id === id);
        const metas = { ...entrega.metas, [e.target.dataset.meta]: e.target.value === "" ? null : Number(e.target.value) };
        updEntrega(id, { metas });
        avisarSalvo();
    }
});

document.addEventListener("change", (e) => {
    const entrega = estado.entregas.find((x) => x.id === id);

    if (e.target.id === "f-unidade") {
        updEntrega(id, { unidadeMedida: e.target.value });
        avisarSalvo();
        return render();
    }

    if (e.target.name === "comportamento") {
        updEntrega(id, { comportamento: e.target.value, comportamentoValidado: false });
        avisarSalvo();
        return render();
    }

    if (e.target.id === "validado") {
        updEntrega(id, {
            comportamentoValidado: e.target.checked,
            comportamento: entrega.comportamento ?? comportamentoSugerido(entrega),
        });
        avisarSalvo();
        return render();
    }

    if (e.target.name === "territorio") {
        updEntrega(id, {
            territorio: {
                tipo: e.target.value,
                regioes: e.target.value === "territorializavel" ? entrega.territorio.regioes : [],
            },
        });
        avisarSalvo();
        return render();
    }

    if (e.target.dataset.regiao !== undefined) {
        const regioes = [...document.querySelectorAll("[data-regiao]:checked")].map((r) => r.value);
        updEntrega(id, { territorio: { ...entrega.territorio, regioes } });
        avisarSalvo();
        return render();
    }

    if (e.target.name === "gomap") {
        updEntrega(id, { gomap: e.target.value });
        avisarSalvo();
        return render();
    }

    if (e.target.dataset.projeto) {
        toggleProjeto(id, e.target.dataset.projeto);
        return render();
    }

    if (e.target.dataset.acao) {
        const r = toggleAcao(id, e.target.dataset.acao);
        if (!r.ok) {
            const outra = estado.entregas.find((x) => x.id === r.entregaId);
            avisoAcao = `Esta Ação já financia a Entrega “${outra?.nome ?? "outra"}”. Uma Ação financia no máximo uma Entrega — desvincule lá antes de vincular aqui.`;
        } else {
            avisoAcao = null;
        }
        render();
    }
});

render();
