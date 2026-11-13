/**
 * Iniciativa em análise — Área Central.
 * Porta `central_.iniciativa.$id.tsx`.
 *
 * Corrige T5.9.9: resolver apontamento existia no modelo de dados e não tinha
 * tela em lugar nenhum — ninguém conseguia fechar um apontamento.
 */
import { obterEstado, avaliarIniciativa, salvarRascunhoDaAvaliacao, addComentario, resolverComentario } from "../dados/store.js";
import { camposDaIniciativa } from "../iniciativa-campos.js";
import { ANOS } from "../dados/seed.js";
import {
    STATUS_LABEL,
    entregasDaIniciativa,
    pendenciasIniciativa,
    pendenciasEntrega,
    resumoPendencias,
    situacaoEntrega,
    comentariosDaIniciativa,
    moeda,
    TERRITORIO_LABEL,
    COMPORTAMENTOS,
    projetosDaEntrega,
} from "../dados/regras.js";
import { acoesDaEntrega } from "../dados/financeiro.js";
import { montarShell, barraTitulo, somenteLeitura } from "../shell.js";
import { chip, statusChip, esc, secao } from "../ui.js";
import { avisar } from "../toast.js";
import { listaPendencias, chipsPendencias } from "../ui-financeiro.js";

const { estado } = montarShell();
const id = new URLSearchParams(location.search).get("id");

const CAMPOS_INICIATIVA = ["nome", "descricao", "publicoAlvo", "causas", "resultadoEsperado"];
const CAMPOS_ENTREGA = ["nome", "descricao", "unidade", "metas", "comportamento", "territorio", "comprovacao", "orcamento"];

let novoApontamento = null;

// A avaliação é campo a campo, na tela toda: os campos da Iniciativa e os de cada Entrega.
const CAMPOS_AVALIADOS = {
    nome: "Nome da iniciativa",
    descricao: "Descrição da iniciativa",
    programa: "Programa",
    indicadores: "Indicadores",
    causas: "Causa e subcausa",
};
const CAMPOS_DA_ENTREGA = {
    unidade: "Unidade de medida",
    comportamento: "Comportamento",
    territorio: "Território",
    descricao: "Descrição",
    comprovacao: "Método de comprovação",
    gomap: "Projeto GOMAP",
    metas: "Metas",
    orcamento: "Vinculação orçamentária",
};
const chaveEntrega = (e, campo) => `ent:${e.id}:${campo}`;

/** Todos os campos que a Central precisa avaliar nesta Iniciativa, com o rótulo de cada um. */
function rotulosAvaliados() {
    return { ...CAMPOS_AVALIADOS };
}
let rascunho = {};
let rascunhoCarregado = false;
const todosAvaliados = (ini) => Object.keys(rotulosAvaliados(ini)).every((c) => rascunho[c]);
const avaliavel = (ini) => !somenteLeitura() && ["enviada", "em_analise"].includes(ini.status);
/** Campos que a Central já aprovou numa rodada anterior: seguem aprovados e não voltam a ser avaliados. */
const aprovadosAntes = (ini) =>
    new Set(Object.entries(ini.avaliacao ?? {}).filter(([, a]) => a.decisao === "ok").map(([c]) => c));
const avaliacaoDe = (ini) => (avaliavel(ini) ? rascunho : ini.avaliacao ?? {});

function avaliador(ini) {
    return (campo) => {
        const a = avaliacaoDe(ini)[campo];
        const editavel = avaliavel(ini);
        // Validada: a avaliação acabou, os campos aparecem só bloqueados, sem o verde nem os botões.
        if (!editavel && (!a || ini.status === "validada")) return "";
        const dis = editavel && !aprovadosAntes(ini).has(campo) ? "" : " disabled";
        return `<div class="aval-botoes d-flex align-items-center gap-1">
            <button type="button" class="btn btn-sm btn-icon ${a?.decisao === "ok" ? "btn-success" : "btn-outline-success"}" data-decisao="ok" data-campo="${campo}" title="Aprovar o campo" aria-label="Aprovar ${esc(rotulosAvaliados(ini)[campo] ?? campo)}"${dis}><i class="ti ti-check"></i></button>
            <button type="button" class="btn btn-sm btn-icon ${a?.decisao === "reprovado" ? "btn-danger" : "btn-outline-danger"}" data-decisao="reprovado" data-campo="${campo}" title="Reprovar o campo" aria-label="Reprovar ${esc(rotulosAvaliados(ini)[campo] ?? campo)}"${dis}><i class="ti ti-x"></i></button>
        </div>
        ${
            a?.decisao === "reprovado"
                ? `<textarea class="form-control mt-2 ${a.erro ? "is-invalid" : ""}" rows="2" data-justificativa="${campo}" placeholder="Justificativa da reprovação"${dis}>${esc(a.justificativa ?? "")}</textarea>
        <div class="invalid-feedback">Escreva a justificativa para reprovar este campo.</div>`
                : ""
        }`;
    };
}

function inexistente() {
    document.getElementById("conteudo").innerHTML = `
    <div class="text-center py-5">
        <h4 class="fw-bold">Iniciativa não encontrada</h4>
        <p class="text-muted">O endereço aponta para uma Iniciativa que não existe neste protótipo.</p>
        <a href="central.html" class="btn btn-primary">Voltar à Visão Geral</a>
    </div>`;
}

function blocoEntrega(e, ini) {
    const av = (campo) => avaliador(ini)(chaveEntrega(e, campo));
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
                ${av("unidade")}
            </div>
            <div class="col-md-4">
                <div class="rotulo-secao mb-1">Comportamento</div>
                <div>${esc(comp?.nome ?? "—")} ${e.comportamentoValidado ? chip("validado", "ok") : chip("não validado", "alerta")}</div>
                ${av("comportamento")}
            </div>
            <div class="col-md-4">
                <div class="rotulo-secao mb-1">Território</div>
                <div>${esc(TERRITORIO_LABEL[e.territorio.tipo] ?? "—")}${
                    e.territorio.regioes.length ? `<div class="fs-12 text-muted">${esc(e.territorio.regioes.join(", "))}</div>` : ""
                }</div>
                ${av("territorio")}
            </div>
            <div class="col-12">
                <div class="rotulo-secao mb-1">Descrição</div>
                <div>${esc(e.descricao || "—")}</div>
                ${av("descricao")}
            </div>
            <div class="col-md-6">
                <div class="rotulo-secao mb-1">Método de comprovação</div>
                <div>${esc(e.metodoComprovacao || "—")}</div>
                ${av("comprovacao")}
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
                ${av("gomap")}
            </div>
            <div class="col-12">
                <div class="rotulo-secao mb-1">Metas</div>
                <table class="table table-sm mb-0" style="max-width:26rem">
                    <thead><tr>${ANOS.map((a) => `<th class="num">${a}</th>`).join("")}</tr></thead>
                    <tbody><tr>${metas}</tr></tbody>
                </table>
                ${av("metas")}
            </div>
            <div class="col-12">
                <div class="rotulo-secao mb-1">Vinculação orçamentária</div>
                ${
                    acoes.length === 0
                        ? `<p class="mb-0">${chip("Sem Ação vinculada", "alerta")} A Entrega não tem valor financeiro no PPA.</p>`
                        : `<div class="fs-12">${acoes.map((a) => `<span class="codigo">${esc(a.codigo)}</span> ${esc(a.nome)}`).join("<br />")}</div>`
                }
                ${av("orcamento")}
            </div>
        </div>`
    );
}

function render() {
    const ini = estado.iniciativas.find((i) => i.id === id);
    if (!ini) return inexistente();

    if (!rascunhoCarregado) {
        rascunhoCarregado = true;
        rascunho = JSON.parse(JSON.stringify(ini.avaliacaoRascunho ?? {}));
        // O que já estava aprovado volta aprovado.
        for (const c of aprovadosAntes(ini)) rascunho[c] = { decisao: "ok", justificativa: "" };
    }
    const programa = estado.programas.find((p) => p.id === ini.programaId);
    const entregas = entregasDaIniciativa(estado, ini.id);
    const pendencias = pendenciasIniciativa(estado, ini);
    const resumo = resumoPendencias(pendencias);
    const comentarios = comentariosDaIniciativa(estado, ini.id);
    const abertos = comentarios.filter((c) => !c.resolvido);
    const eventos = estado.eventos.filter((ev) => ev.iniciativaId === ini.id);

    // A Central só avalia: aprova ou reprova cada campo e salva. O status é resultado disso.
    const acoesCabecalho = somenteLeitura()
        ? `<span class="fs-12 text-muted align-self-center">Perfil de acompanhamento — sem ações de análise.</span>`
        : "";

    document.getElementById("conteudo").innerHTML = `
    ${barraTitulo(esc(ini.nome), [
        { rotulo: programa ? `${programa.codigo} — ${programa.nome}` : "Programa", href: `programa.html?id=${ini.programaId}` },
        { rotulo: ini.nome },
    ])}
    <div class="ilha p-3 mb-2">
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
            <div class="d-flex flex-wrap gap-2">${acoesCabecalho}${
                avaliavel(ini)
                    ? `<button type="button" class="btn btn-outline-success" id="aprovar-todos"><i class="ti ti-checks me-1"></i>Aprovar todos os campos</button>
                <button type="button" class="btn btn-outline-danger" id="reprovar-todos"><i class="ti ti-x me-1"></i>Reprovar todos os campos</button>
                <button type="button" class="btn btn-light" id="salvar-rascunho"><i class="ti ti-device-floppy me-1"></i>Salvar</button>
                <button type="button" class="btn btn-primary" id="devolver-iniciativa"${todosAvaliados(ini) ? "" : " disabled"} title="${todosAvaliados(ini) ? "Encerrar a avaliação" : "Avalie todos os campos para devolver"}"><i class="ti ti-arrow-back-up me-1"></i>Devolver iniciativa</button>`
                    : ""
            }</div>
        </div>
    </div>

    <div class="row g-3">
        <div class="col-12">
            ${secao(
                "Iniciativa",
                camposDaIniciativa({ ini, estado, visao: "central", travado: true, statusTravado: true, avaliador: avaliador(ini) })

            )}

        </div>
    </div>

    ${novoApontamento ? modalApontamento(ini) : ""}`;

    // A Central só avalia: o campo de Indicadores mostra o vínculo, sem busca nem botão de tirar.
    document.getElementById("iind-bloco")?.querySelectorAll("input, button").forEach((c) => (c.disabled = true));

    // O campo avaliado ganha a cor do resultado: verde se aprovado, vermelho se reprovado.
    document.querySelectorAll("[data-decisao]").forEach((b) => b.closest(".mb-3, .mb-0, [class*='col-']")?.classList.add("aval-bloco"));
    document.querySelectorAll("[data-decisao].btn-success, [data-decisao].btn-danger").forEach((b) => {
        const bloco = b.closest(".mb-3, .mb-0, [class*='col-']");
        bloco?.classList.add(b.dataset.decisao === "ok" ? "aval-ok" : "aval-reprovado");
    });

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

document.addEventListener("input", (e) => {
    const j = e.target.closest("[data-justificativa]");
    if (!j) return;
    const a = rascunho[j.dataset.justificativa];
    if (a) {
        a.justificativa = j.value;
        a.erro = false;
        j.classList.remove("is-invalid");
    }
});

document.addEventListener("click", (e) => {
    const ini = estado.iniciativas.find((i) => i.id === id);
    if (!ini) return;

    const dec = e.target.closest("[data-decisao]");
    if (dec && avaliavel(ini)) {
        const campo = dec.dataset.campo;
        if (aprovadosAntes(ini).has(campo)) return;
        rascunho[campo] = { decisao: dec.dataset.decisao, justificativa: rascunho[campo]?.justificativa ?? "" };
        return render();
    }

    if (e.target.closest("#aprovar-todos, #reprovar-todos") && avaliavel(ini)) {
        const decisao = e.target.closest("#aprovar-todos") ? "ok" : "reprovado";
        const travados = aprovadosAntes(ini);
        for (const c of Object.keys(rotulosAvaliados(ini))) {
            if (travados.has(c)) continue;
            rascunho[c] = { decisao, justificativa: rascunho[c]?.justificativa ?? "" };
        }
        return render();
    }

    // "Salvar" guarda o que já foi avaliado, sem encerrar: dá para voltar outro dia.
    if (e.target.closest("#salvar-rascunho") && avaliavel(ini)) {
        salvarRascunhoDaAvaliacao(ini.id, rascunho, Object.keys(rotulosAvaliados(ini)).length);
        render();
        return avisar("Avaliação salva.");
    }

    // "Devolver iniciativa" encerra a avaliação.
    if (e.target.closest("#devolver-iniciativa")) {
        const rotulos = rotulosAvaliados(ini);
        const faltam = Object.keys(rotulos).filter((c) => !rascunho[c]);
        if (faltam.length) {
            return alert(`Avalie todos os campos antes de salvar. Faltam ${faltam.length} de ${Object.keys(rotulos).length}: ${faltam.slice(0, 5).map((c) => rotulos[c]).join("; ")}${faltam.length > 5 ? "…" : ""}.`);
        }
        let ok = true;
        for (const [c, a] of Object.entries(rascunho)) {
            a.erro = a.decisao === "reprovado" && !a.justificativa.trim();
            if (a.erro) ok = false;
        }
        if (!ok) return render();
        avaliarIniciativa(ini.id, rascunho, rotulosAvaliados(ini));
        rascunho = {};
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
