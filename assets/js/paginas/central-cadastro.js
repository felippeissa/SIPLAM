/**
 * Cadastro — a montagem do plano em uma tela só.
 *
 * Esta tela propõe outra leitura do mesmo trabalho. Hoje os Cadastros
 * Estratégicos são oito telas, uma por entidade, e quem monta o plano precisa
 * carregar a cadeia na cabeça: abre Eixos, sai, abre Objetivos, escolhe o eixo
 * de novo, sai, abre Programa, escolhe o objetivo de novo. O sistema pede que a
 * pessoa pense por tabela; ela pensa por plano.
 *
 * Aqui a unidade de trabalho é a **cadeia**, não o registro:
 *
 *     Eixo → Objetivo Estratégico → Programa → Diagnóstico e Indicadores
 *
 * Três decisões sustentam a tela:
 *
 * 1. **A árvore à esquerda é o plano inteiro.** Quem trabalha nela vê onde está
 *    e o que falta sem sair do lugar. Criar é sempre criar *dentro* de onde se
 *    está — o vínculo nasce junto com o registro, e não num campo depois.
 *
 * 2. **O que falta vem antes do que está pronto.** A Área Central não precisa
 *    reler 26 Programas completos; precisa achar os quatro que travam o plano.
 *    Daí o filtro "só o que falta" e as marcas de pendência na própria árvore.
 *
 * 3. **Registro sem vínculo não some.** Objetivo sem eixo e Programa sem
 *    objetivo existem no sistema e não aparecem em lugar nenhum hoje. Aqui têm
 *    um galho próprio, porque um plano incompleto é justamente o que se está
 *    tentando enxergar.
 *
 * E há uma correção de fundo: **causa escrita aqui é escrita nos dois lugares**
 * — dentro do Programa, que é de onde o Hub lê, e no Cadastro de Causas, que é
 * de onde as telas de cadastro leem. O protótipo já sofreu de o Hub mostrar
 * causas que o Cadastro jurava não existir; esta tela é a única que não deixa
 * as duas representações divergirem.
 *
 * Nada aqui altera as outras telas: lê e grava pelas mesmas funções do store.
 */
import { ppaCorrente, addItem, updItem, removeItem, updPrograma, addPrograma } from "../dados/store.js";
import { montarShell, barraTitulo, somenteLeitura } from "../shell.js";
import { esc, chip } from "../ui.js";
import { avisar } from "../toast.js";
import { confirmarExclusao } from "../confirmar.js";

const { estado } = montarShell();
const leitura = somenteLeitura();

const plano = ppaCorrente(estado);
const doPlano = (r) => !r.ppaId || !plano || r.ppaId === plano.id;

/* ---------- o que está selecionado ---------- */

let alvo = null; // { tipo: "eixo" | "objetivo" | "programa", id }
let busca = "";
let soPendentes = false;
const abertos = new Set();

/* ---------- leitura do plano ---------- */

const eixos = () => (estado.eixos ?? []).filter(doPlano).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
const objetivos = () => (estado.objetivos ?? []).filter(doPlano);
const programas = () => (estado.programas ?? []).filter(doPlano);

const objetivosDo = (eixoId) =>
    objetivos()
        .filter((o) => o.eixoId === eixoId)
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

const programasDo = (objetivoId) =>
    programas()
        .filter((p) => p.objetivoId === objetivoId)
        .sort((a, b) => (a.codigo ?? "").localeCompare(b.codigo ?? ""));

/** As causas que este Programa cadastrou, no Cadastro de Causas. */
const causasDo = (programa) =>
    (estado.causas ?? []).filter((c) => c.id.startsWith(`ca-${programa.id}-`));

const subcausasDe = (causa) =>
    (causa.subcausaIds ?? []).map((id) => (estado.subcausas ?? []).find((s) => s.id === id)).filter(Boolean);

/**
 * O que falta num Programa para ele poder ser oferecido aos órgãos.
 * Mesma régua da Visão por Programas — a tela não inventa critério próprio.
 */
function faltaNoPrograma(p) {
    const falta = [];
    if (!p.problema?.trim()) falta.push("problema central");
    if (!p.objetivo?.trim()) falta.push("objetivo");
    if (!(p.causas ?? []).length) falta.push("causas");
    if (!(p.indicadores ?? []).length) falta.push("indicadores");
    return falta;
}

const objetivoIncompleto = (o) => programasDo(o.id).length === 0 || programasDo(o.id).some((p) => faltaNoPrograma(p).length);
const eixoIncompleto = (e) => objetivosDo(e.id).length === 0 || objetivosDo(e.id).some(objetivoIncompleto);

/* ---------- registros sem vínculo ---------- */

const objetivosSoltos = () => objetivos().filter((o) => !o.eixoId || !eixos().some((e) => e.id === o.eixoId));
const programasSoltos = () => programas().filter((p) => !p.objetivoId || !objetivos().some((o) => o.id === p.objetivoId));

/* ---------- topo: onde o plano está ---------- */

function medidor() {
    const ps = programas();
    const completos = ps.filter((p) => !faltaNoPrograma(p).length).length;
    const semProblema = ps.filter((p) => !p.problema?.trim()).length;
    const semCausa = ps.filter((p) => !(p.causas ?? []).length).length;
    const semIndicador = ps.filter((p) => !(p.indicadores ?? []).length).length;

    const item = (valor, rotulo, tom = "") => `
    <div class="faixa-item">
        <div class="faixa-valor ${tom}">${valor}</div>
        <div class="faixa-rotulo">${rotulo}</div>
    </div>`;

    return `
    <div class="card mb-3">
        <div class="faixa-indicadores">
            ${item(`${completos}/${ps.length}`, "Programas completos")}
            ${item(eixos().length, "Eixos")}
            ${item(objetivos().length, "Objetivos")}
            ${item(semProblema, "Sem problema central", semProblema ? "text-danger" : "")}
            ${item(semCausa, "Sem causa", semCausa ? "text-danger" : "")}
            ${item(semIndicador, "Sem indicador", semIndicador ? "text-danger" : "")}
        </div>
    </div>`;
}

/* ---------- a árvore ---------- */

const casa = (texto) => !busca || texto.toLocaleLowerCase("pt-BR").includes(busca.trim().toLocaleLowerCase("pt-BR"));

function folhaPrograma(p) {
    const falta = faltaNoPrograma(p);
    if (soPendentes && !falta.length) return "";
    if (!casa(`${p.codigo} ${p.nome}`)) return "";
    const aqui = alvo?.tipo === "programa" && alvo.id === p.id;
    return `
    <button type="button" class="arv-item arv-programa ${aqui ? "ativo" : ""}" data-ir="programa:${p.id}">
        <span class="codigo me-1">${esc(p.codigo ?? "")}</span>${esc(p.nome)}
        ${falta.length ? `<i class="ti ti-alert-circle text-danger ms-1" title="Falta: ${esc(falta.join(", "))}"></i>` : ""}
    </button>`;
}

function ramoObjetivo(o) {
    const filhos = programasDo(o.id).map(folhaPrograma).join("");
    const combina = casa(o.nome) || filhos;
    if (!combina) return "";
    if (soPendentes && !objetivoIncompleto(o) && !filhos) return "";

    const aberto = abertos.has(`o:${o.id}`) || !!busca;
    const aqui = alvo?.tipo === "objetivo" && alvo.id === o.id;
    return `
    <div class="arv-ramo">
        <div class="d-flex align-items-center">
            <button type="button" class="arv-alavanca" data-abrir="o:${o.id}" aria-label="Abrir">
                <i class="ti ti-chevron-${aberto ? "down" : "right"}"></i>
            </button>
            <button type="button" class="arv-item arv-objetivo ${aqui ? "ativo" : ""}" data-ir="objetivo:${o.id}">
                ${esc(o.nome)}
                <span class="arv-conta">${programasDo(o.id).length}</span>
            </button>
        </div>
        ${aberto ? `<div class="arv-filhos">${filhos || '<p class="arv-vazio">Nenhum Programa ainda.</p>'}</div>` : ""}
    </div>`;
}

function ramoEixo(e) {
    const filhos = objetivosDo(e.id).map(ramoObjetivo).join("");
    const combina = casa(e.nome) || filhos;
    if (!combina) return "";
    if (soPendentes && !eixoIncompleto(e) && !filhos) return "";

    const aberto = abertos.has(`e:${e.id}`) || !!busca;
    const aqui = alvo?.tipo === "eixo" && alvo.id === e.id;
    return `
    <div class="arv-ramo">
        <div class="d-flex align-items-center">
            <button type="button" class="arv-alavanca" data-abrir="e:${e.id}" aria-label="Abrir">
                <i class="ti ti-chevron-${aberto ? "down" : "right"}"></i>
            </button>
            <button type="button" class="arv-item arv-eixo ${aqui ? "ativo" : ""}" data-ir="eixo:${e.id}">
                ${esc(e.nome)}
                <span class="arv-conta">${objetivosDo(e.id).length}</span>
            </button>
        </div>
        ${aberto ? `<div class="arv-filhos">${filhos || '<p class="arv-vazio">Nenhum objetivo ainda.</p>'}</div>` : ""}
    </div>`;
}

function galhoSoltos() {
    const os = objetivosSoltos().filter((o) => casa(o.nome));
    const ps = programasSoltos().filter((p) => casa(`${p.codigo} ${p.nome}`));
    if (!os.length && !ps.length) return "";

    const aberto = abertos.has("soltos") || !!busca;
    return `
    <div class="arv-ramo mt-2 pt-2 border-top">
        <div class="d-flex align-items-center">
            <button type="button" class="arv-alavanca" data-abrir="soltos" aria-label="Abrir">
                <i class="ti ti-chevron-${aberto ? "down" : "right"}"></i>
            </button>
            <span class="arv-item text-warning">
                <i class="ti ti-unlink me-1"></i>Sem vínculo
                <span class="arv-conta">${os.length + ps.length}</span>
            </span>
        </div>
        ${
            aberto
                ? `<div class="arv-filhos">
            ${os
                .map(
                    (o) => `<button type="button" class="arv-item arv-objetivo ${alvo?.tipo === "objetivo" && alvo.id === o.id ? "ativo" : ""}" data-ir="objetivo:${o.id}">
                ${esc(o.nome)}<span class="fs-11 text-muted ms-1">objetivo sem eixo</span>
            </button>`
                )
                .join("")}
            ${ps
                .map(
                    (p) => `<button type="button" class="arv-item arv-programa ${alvo?.tipo === "programa" && alvo.id === p.id ? "ativo" : ""}" data-ir="programa:${p.id}">
                <span class="codigo me-1">${esc(p.codigo ?? "")}</span>${esc(p.nome)}<span class="fs-11 text-muted ms-1">sem objetivo</span>
            </button>`
                )
                .join("")}
        </div>`
                : ""
        }
    </div>`;
}

function arvore() {
    const ramos = eixos().map(ramoEixo).join("");
    return `
    <div class="card h-100">
        <div class="card-header d-block p-3">
            <div class="app-search mb-2">
                <input type="search" id="arv-busca" class="form-control form-control-sm"
                       placeholder="Buscar no plano" value="${esc(busca)}" />
                <i class="ti ti-search app-search-icon text-muted"></i>
            </div>
            <div class="form-check form-check-sm mb-0">
                <input class="form-check-input" type="checkbox" id="arv-pendentes" ${soPendentes ? "checked" : ""} />
                <label class="form-check-label fs-12" for="arv-pendentes">Só o que falta preencher</label>
            </div>
        </div>
        <div class="card-body p-2 arvore">
            ${ramos || '<p class="arv-vazio p-2">Nada corresponde à busca.</p>'}
            ${galhoSoltos()}
            ${
                leitura
                    ? ""
                    : `<button type="button" class="btn btn-sm btn-outline-primary w-100 mt-3" data-novo="eixo">
                <i class="ti ti-plus me-1"></i>Novo eixo
            </button>`
            }
        </div>
    </div>`;
}

/* ---------- o painel da direita ---------- */

const campo = (id, rotulo, valor, { linhas = 0, ajuda = "", exemplo = "" } = {}) => `
<div class="mb-3">
    <label class="form-label" for="${id}">${esc(rotulo)}</label>
    ${
        linhas
            ? `<textarea class="form-control" id="${id}" rows="${linhas}" placeholder="${esc(exemplo)}" ${leitura ? "disabled" : ""}>${esc(valor ?? "")}</textarea>`
            : `<input type="text" class="form-control" id="${id}" value="${esc(valor ?? "")}" placeholder="${esc(exemplo)}" ${leitura ? "disabled" : ""} />`
    }
    ${ajuda ? `<div class="form-text fs-12">${esc(ajuda)}</div>` : ""}
</div>`;

/** A cadeia até onde se está, sempre visível. */
function cadeia() {
    if (!alvo) return "";
    const elos = [];

    if (alvo.tipo === "eixo") {
        const e = eixos().find((x) => x.id === alvo.id);
        elos.push({ rotulo: e?.nome ?? "Eixo" });
    }
    if (alvo.tipo === "objetivo") {
        const o = objetivos().find((x) => x.id === alvo.id);
        const e = eixos().find((x) => x.id === o?.eixoId);
        if (e) elos.push({ rotulo: e.nome, ir: `eixo:${e.id}` });
        else elos.push({ rotulo: "Sem eixo", solto: true });
        elos.push({ rotulo: o?.nome ?? "Objetivo" });
    }
    if (alvo.tipo === "programa") {
        const p = programas().find((x) => x.id === alvo.id);
        const o = objetivos().find((x) => x.id === p?.objetivoId);
        const e = eixos().find((x) => x.id === o?.eixoId);
        if (e) elos.push({ rotulo: e.nome, ir: `eixo:${e.id}` });
        if (o) elos.push({ rotulo: o.nome, ir: `objetivo:${o.id}` });
        else elos.push({ rotulo: "Sem objetivo", solto: true });
        elos.push({ rotulo: `${p?.codigo ?? ""} ${p?.nome ?? ""}`.trim() });
    }

    return `
    <nav class="cadeia mb-3">
        ${elos
            .map((e, i) => {
                const sep = i ? '<i class="ti ti-chevron-right cadeia-sep"></i>' : "";
                if (e.ir) return `${sep}<button type="button" class="cadeia-elo" data-ir="${e.ir}">${esc(e.rotulo)}</button>`;
                return `${sep}<span class="cadeia-elo ${e.solto ? "text-warning" : "atual"}">${esc(e.rotulo)}</span>`;
            })
            .join("")}
    </nav>`;
}

function painelEixo(e) {
    const os = objetivosDo(e.id);
    return `
    ${cadeia()}
    <div class="card">
        <div class="card-header d-block p-3">
            <h4 class="card-title mb-1">Eixo</h4>
            <p class="text-muted mb-0 fs-13">O nível mais alto do plano. Reúne os objetivos estratégicos.</p>
        </div>
        <div class="card-body" id="painel-campos">
            ${campo("f-nome", "Nome", e.nome, { exemplo: "Goiás Social" })}
            ${campo("f-descricao", "Descrição", e.descricao, { linhas: 3, exemplo: "O que este eixo reúne" })}
        </div>
    </div>

    <div class="card mt-3">
        <div class="card-header d-flex align-items-center p-3">
            <h4 class="card-title mb-0 flex-grow-1">Objetivos estratégicos <span class="text-muted fw-normal">${os.length}</span></h4>
            ${leitura ? "" : `<button type="button" class="btn btn-sm btn-outline-primary" data-novo="objetivo:${e.id}"><i class="ti ti-plus me-1"></i>Novo objetivo</button>`}
        </div>
        <div class="table-responsive">
            <table class="table table-sm table-hover mb-0">
                <tbody>
                ${
                    os.length
                        ? os
                              .map(
                                  (o) => `
                    <tr>
                        <td><button type="button" class="btn-link-tabela" data-ir="objetivo:${o.id}">${esc(o.nome)}</button></td>
                        <td class="fs-12 text-muted" style="width:12rem">${programasDo(o.id).length} Programa(s)</td>
                        <td style="width:3rem">${objetivoIncompleto(o) ? '<i class="ti ti-alert-circle text-danger"></i>' : '<i class="ti ti-circle-check text-success"></i>'}</td>
                    </tr>`
                              )
                              .join("")
                        : `<tr><td class="text-center text-muted py-3 fs-12">Nenhum objetivo neste eixo. Um eixo sem objetivo não chega a Programa nenhum.</td></tr>`
                }
                </tbody>
            </table>
        </div>
    </div>`;
}

function painelObjetivo(o) {
    const ps = programasDo(o.id);
    return `
    ${cadeia()}
    <div class="card">
        <div class="card-header d-block p-3">
            <h4 class="card-title mb-1">Objetivo estratégico</h4>
            <p class="text-muted mb-0 fs-13">O que o eixo se propõe a alcançar. É a ele que os Programas se vinculam.</p>
        </div>
        <div class="card-body" id="painel-campos">
            ${campo("f-nome", "Nome", o.nome, { exemplo: "Proteção social" })}
            ${campo("f-descricao", "Descrição", o.descricao, { linhas: 3, exemplo: "O que este objetivo persegue" })}
            <div class="mb-0">
                <label class="form-label" for="f-eixoId">Eixo</label>
                <select class="form-select" id="f-eixoId" ${leitura ? "disabled" : ""}>
                    <option value="">Sem eixo</option>
                    ${eixos().map((e) => `<option value="${e.id}"${e.id === o.eixoId ? " selected" : ""}>${esc(e.nome)}</option>`).join("")}
                </select>
            </div>
        </div>
    </div>

    <div class="card mt-3">
        <div class="card-header d-flex align-items-center p-3">
            <h4 class="card-title mb-0 flex-grow-1">Programas <span class="text-muted fw-normal">${ps.length}</span></h4>
            ${leitura ? "" : `<button type="button" class="btn btn-sm btn-outline-primary" data-novo="programa:${o.id}"><i class="ti ti-plus me-1"></i>Novo Programa</button>`}
        </div>
        <div class="table-responsive">
            <table class="table table-sm table-hover mb-0">
                <tbody>
                ${
                    ps.length
                        ? ps
                              .map((p) => {
                                  const falta = faltaNoPrograma(p);
                                  return `
                    <tr>
                        <td style="width:4rem" class="codigo text-muted">${esc(p.codigo ?? "")}</td>
                        <td><button type="button" class="btn-link-tabela" data-ir="programa:${p.id}">${esc(p.nome)}</button></td>
                        <td class="fs-12" style="width:18rem">
                            ${falta.length ? `<span class="text-danger">Falta ${esc(falta.join(", "))}</span>` : '<span class="text-success">Completo</span>'}
                        </td>
                    </tr>`;
                              })
                              .join("")
                        : `<tr><td class="text-center text-muted py-3 fs-12">Nenhum Programa neste objetivo.</td></tr>`
                }
                </tbody>
            </table>
        </div>
    </div>`;
}

function painelPrograma(p) {
    const falta = faltaNoPrograma(p);
    const causas = causasDo(p);

    return `
    ${cadeia()}
    ${
        falta.length
            ? `<div class="alert alert-warning py-2 px-3 fs-13">
        <i class="ti ti-alert-circle me-1"></i>
        Para ser oferecido aos órgãos, falta: <strong>${esc(falta.join(", "))}</strong>.
    </div>`
            : `<div class="alert alert-success py-2 px-3 fs-13">
        <i class="ti ti-circle-check me-1"></i>Programa completo, pronto para receber contribuições.
    </div>`
    }

    <div class="card">
        <div class="card-header d-block p-3">
            <h4 class="card-title mb-1">Identificação</h4>
        </div>
        <div class="card-body" id="painel-campos">
            <div class="row g-3">
                <div class="col-md-2">${campo("f-codigo", "Código", p.codigo, { exemplo: "1040" })}</div>
                <div class="col-md-10">${campo("f-nome", "Nome do Programa", p.nome)}</div>
            </div>
            ${campo("f-orgaoCoordenador", "Órgão coordenador", p.orgaoCoordenador)}
            <div class="mb-3">
                <label class="form-label" for="f-objetivoId">Objetivo estratégico</label>
                <select class="form-select" id="f-objetivoId" ${leitura ? "disabled" : ""}>
                    <option value="">Sem objetivo</option>
                    ${objetivos()
                        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
                        .map((o) => `<option value="${o.id}"${o.id === p.objetivoId ? " selected" : ""}>${esc(o.nome)}</option>`)
                        .join("")}
                </select>
            </div>
            ${campo("f-objetivo", "Objetivo do Programa", p.objetivo, { linhas: 2, ajuda: "O que este Programa se propõe a mudar." })}
            ${campo("f-resultadoEsperado", "Resultado esperado", p.resultadoEsperado, { linhas: 2 })}
        </div>
    </div>

    <div class="card mt-3">
        <div class="card-header d-block p-3">
            <h4 class="card-title mb-1">Diagnóstico</h4>
            <p class="text-muted mb-0 fs-13">O problema que o Programa enfrenta e o que o sustenta.</p>
        </div>
        <div class="card-body">
            ${campo("f-problema", "Problema central", p.problema, { linhas: 2 })}
            ${campo("f-populacaoAfetada", "População afetada", p.populacaoAfetada)}
            ${lista("evidencias", "Evidências", p.evidencias ?? [], "O número, a série ou o estudo que sustenta o problema")}
            ${lista("consequencias", "Consequências", p.consequencias ?? [], "O que acontece se o problema não for enfrentado")}
        </div>
    </div>

    <div class="card mt-3">
        <div class="card-header d-flex align-items-center p-3">
            <h4 class="card-title mb-0 flex-grow-1">Causas <span class="text-muted fw-normal">${(p.causas ?? []).length}</span></h4>
            ${leitura ? "" : `<button type="button" class="btn btn-sm btn-outline-primary" data-nova-causa="${p.id}"><i class="ti ti-plus me-1"></i>Nova causa</button>`}
        </div>
        <div class="card-body pt-0">
            <p class="fs-12 text-muted mb-3">
                A causa escrita aqui entra no Programa e no Cadastro de Causas ao mesmo tempo — as duas telas
                leem de lugares diferentes, e é aqui que elas param de divergir.
            </p>
            ${
                (p.causas ?? []).length
                    ? (p.causas ?? [])
                          .map((c) => {
                              const registro = causas.find((x) => x.id === `ca-${p.id}-${c.id}`);
                              const subs = registro ? subcausasDe(registro) : [];
                              return `
            <div class="bloco-causa">
                <div class="d-flex align-items-start gap-2">
                    <div class="flex-grow-1">
                        <input type="text" class="form-control form-control-sm fw-medium mb-1" value="${esc(c.texto)}"
                               data-causa="${c.id}" placeholder="Nome da causa" ${leitura ? "disabled" : ""} />
                        <textarea class="form-control form-control-sm mb-1" rows="2" data-causa-justificativa="${c.id}"
                                  placeholder="Por que ela origina o problema" ${leitura ? "disabled" : ""}>${esc(registro?.justificativa ?? "")}</textarea>
                        <textarea class="form-control form-control-sm" rows="2" data-causa-evidencia="${c.id}"
                                  placeholder="O número, a série ou o estudo que a sustenta" ${leitura ? "disabled" : ""}>${esc(registro?.evidencia ?? "")}</textarea>
                        ${
                            subs.length
                                ? `<div class="mt-1">${subs.map((s) => chip(s.nome, "neutro")).join(" ")}</div>`
                                : '<div class="fs-12 text-muted mt-1">Sem subcausa. As subcausas se cadastram na tela de Causas.</div>'
                        }
                    </div>
                    ${leitura ? "" : `<button type="button" class="btn btn-sm btn-light" data-tirar-causa="${p.id}:${c.id}" title="Remover"><i class="ti ti-x"></i></button>`}
                </div>
            </div>`;
                          })
                          .join("")
                    : '<p class="fs-13 text-muted mb-0">Nenhuma causa. Um Programa sem causa não explica o problema que enfrenta.</p>'
            }
        </div>
    </div>

    <div class="card mt-3">
        <div class="card-header d-flex align-items-center p-3">
            <h4 class="card-title mb-0 flex-grow-1">Indicadores de resultado <span class="text-muted fw-normal">${(p.indicadores ?? []).length}</span></h4>
            ${leitura ? "" : `<button type="button" class="btn btn-sm btn-outline-primary" data-novo-indicador="${p.id}"><i class="ti ti-plus me-1"></i>Novo indicador</button>`}
        </div>
        <div class="table-responsive">
            <table class="table table-sm mb-0">
                <thead>
                    <tr><th>Indicador</th><th style="width:10rem">Unidade</th><th style="width:8rem">Linha de base</th><th style="width:8rem">Meta</th><th style="width:3rem"></th></tr>
                </thead>
                <tbody>
                ${
                    (p.indicadores ?? []).length
                        ? (p.indicadores ?? [])
                              .map(
                                  (i, n) => `
                    <tr>
                        <td><input type="text" class="form-control form-control-sm" value="${esc(i.nome)}" data-ind="${n}:nome" placeholder="Nome do indicador" ${leitura ? "disabled" : ""} /></td>
                        <td><input type="text" class="form-control form-control-sm" value="${esc(i.unidade ?? "")}" data-ind="${n}:unidade" ${leitura ? "disabled" : ""} /></td>
                        <td><input type="text" class="form-control form-control-sm" value="${esc(i.linhaBase ?? "")}" data-ind="${n}:linhaBase" ${leitura ? "disabled" : ""} /></td>
                        <td><input type="text" class="form-control form-control-sm" value="${esc(i.meta ?? "")}" data-ind="${n}:meta" ${leitura ? "disabled" : ""} /></td>
                        <td>${leitura ? "" : `<button type="button" class="btn btn-sm btn-light" data-tirar-indicador="${p.id}:${n}" title="Remover"><i class="ti ti-x"></i></button>`}</td>
                    </tr>`
                              )
                              .join("")
                        : '<tr><td colspan="5" class="text-center text-muted py-3 fs-12">Nenhum indicador. Sem ele não há como dizer se o Programa deu certo.</td></tr>'
                }
                </tbody>
            </table>
        </div>
    </div>`;
}

/** Lista de textos simples — evidências, consequências. */
function lista(chave, titulo, itens, exemplo) {
    return `
    <div class="mb-3">
        <div class="d-flex align-items-center mb-2">
            <label class="form-label mb-0 flex-grow-1">${esc(titulo)}</label>
            ${leitura ? "" : `<button type="button" class="btn btn-sm btn-light" data-por-texto="${chave}"><i class="ti ti-plus"></i></button>`}
        </div>
        ${
            itens.length
                ? itens
                      .map(
                          (texto, n) => `
        <div class="input-group input-group-sm mb-1">
            <input type="text" class="form-control" value="${esc(texto)}" data-texto="${chave}:${n}"
                   placeholder="${esc(exemplo)}" ${leitura ? "disabled" : ""} />
            ${leitura ? "" : `<button type="button" class="btn btn-light" data-tirar-texto="${chave}:${n}"><i class="ti ti-x"></i></button>`}
        </div>`
                      )
                      .join("")
                : `<p class="fs-12 text-muted mb-0">Nenhum item.</p>`
        }
    </div>`;
}

function boasVindas() {
    const ps = programas();
    const pendentes = ps.filter((p) => faltaNoPrograma(p).length);
    return `
    <div class="card">
        <div class="card-body text-center py-5">
            <i class="ti ti-sitemap fs-32 text-muted d-block mb-2"></i>
            <h4 class="fs-16 fw-bold mb-2">Escolha por onde começar</h4>
            <p class="text-muted fs-13 mb-4" style="max-width:42rem; margin:0 auto">
                À esquerda está o plano inteiro, do eixo ao Programa. Clique em qualquer nível para abrir,
                ou use o sinal de mais para criar já dentro de onde você está — o vínculo nasce junto,
                em vez de virar um campo para preencher depois.
            </p>
            ${
                pendentes.length
                    ? `<div class="d-inline-block text-start">
                <div class="rotulo-secao mb-2">O que trava o plano agora</div>
                ${pendentes
                    .slice(0, 6)
                    .map(
                        (p) => `
                <button type="button" class="btn-link-tabela d-block mb-1" data-ir="programa:${p.id}">
                    <span class="codigo me-1">${esc(p.codigo ?? "")}</span>${esc(p.nome)}
                    <span class="fs-12 text-danger ms-1">falta ${esc(faltaNoPrograma(p).join(", "))}</span>
                </button>`
                    )
                    .join("")}
                ${pendentes.length > 6 ? `<p class="fs-12 text-muted mt-2 mb-0">e mais ${pendentes.length - 6}.</p>` : ""}
            </div>`
                    : `<p class="text-success fs-13 mb-0"><i class="ti ti-circle-check me-1"></i>Nenhum Programa pendente.</p>`
            }
        </div>
    </div>`;
}

function painel() {
    if (!alvo) return boasVindas();

    const registro =
        alvo.tipo === "eixo"
            ? eixos().find((x) => x.id === alvo.id)
            : alvo.tipo === "objetivo"
              ? objetivos().find((x) => x.id === alvo.id)
              : programas().find((x) => x.id === alvo.id);

    if (!registro) {
        alvo = null;
        return boasVindas();
    }

    const corpo =
        alvo.tipo === "eixo" ? painelEixo(registro) : alvo.tipo === "objetivo" ? painelObjetivo(registro) : painelPrograma(registro);

    return `
    ${corpo}
    ${
        leitura
            ? ""
            : `<div class="d-flex gap-2 my-3">
        <button type="button" class="btn btn-outline-danger me-auto" id="excluir">Excluir</button>
        <button type="button" class="btn btn-primary" id="salvar">Salvar</button>
    </div>`
    }`;
}

/* ---------- gravação ---------- */

const v = (id) => document.getElementById(id)?.value.trim() ?? "";

function salvar() {
    if (!alvo) return;

    if (alvo.tipo === "eixo") {
        if (!v("f-nome")) return avisar("Informe o nome do eixo.");
        updItem("eixos", alvo.id, { nome: v("f-nome"), descricao: v("f-descricao") });
    }

    if (alvo.tipo === "objetivo") {
        if (!v("f-nome")) return avisar("Informe o nome do objetivo.");
        updItem("objetivos", alvo.id, { nome: v("f-nome"), descricao: v("f-descricao"), eixoId: v("f-eixoId") });
    }

    if (alvo.tipo === "programa") {
        if (!v("f-nome")) return avisar("Informe o nome do Programa.");
        const p = programas().find((x) => x.id === alvo.id);
        const objetivoId = v("f-objetivoId");
        const o = objetivos().find((x) => x.id === objetivoId);
        const e = eixos().find((x) => x.id === o?.eixoId);

        updPrograma(alvo.id, {
            codigo: v("f-codigo"),
            nome: v("f-nome"),
            orgaoCoordenador: v("f-orgaoCoordenador"),
            objetivoId,
            // Os campos de texto acompanham o vínculo: as telas antigas filtram
            // por eles, e deixá-los para trás quebraria os filtros.
            objetivoEstrategico: o?.nome ?? "",
            eixoId: e?.id ?? "",
            eixo: e?.nome ?? "",
            objetivo: v("f-objetivo"),
            resultadoEsperado: v("f-resultadoEsperado"),
            problema: v("f-problema"),
            populacaoAfetada: v("f-populacaoAfetada"),
            evidencias: textos("evidencias", p.evidencias ?? []),
            consequencias: textos("consequencias", p.consequencias ?? []),
            causas: causasDaTela(p),
            indicadores: indicadoresDaTela(p),
        });
        gravarCausasNoCadastro(p);
    }

    avisar("Alterações salvas.");
    render();
}

/** As causas como estão na tela, sem as que ficaram em branco. */
function causasDaTela(p) {
    const campos = [...document.querySelectorAll("[data-causa]")];
    if (!campos.length) return p.causas ?? [];
    return campos
        .map((c) => ({ id: c.dataset.causa, texto: c.value.trim() }))
        .filter((c) => c.texto);
}

/**
 * A causa vive em dois lugares, e os dois são escritos juntos.
 *
 * No Programa ela é texto, e é de lá que a Visão por Programas lê. No Cadastro
 * de Causas ela é registro, com justificativa, evidência e subcausas. Gravar só
 * num dos dois é o que faz uma tela mostrar o que a outra nega.
 */
function gravarCausasNoCadastro(p) {
    for (const c of causasDaTela(p)) {
        const id = `ca-${p.id}-${c.id}`;
        const dados = {
            nome: c.texto,
            justificativa: document.querySelector(`[data-causa-justificativa="${c.id}"]`)?.value.trim() ?? "",
            evidencia: document.querySelector(`[data-causa-evidencia="${c.id}"]`)?.value.trim() ?? "",
        };
        if ((estado.causas ?? []).some((x) => x.id === id)) updItem("causas", id, dados);
        else addItem("causas", { id, ...dados, subcausaIds: [] });
    }
}

/** Os indicadores como estão na tela, sem os que ficaram sem nome. */
function indicadoresDaTela(p) {
    const linhas = new Map();
    for (const campo of document.querySelectorAll("[data-ind]")) {
        const [n, chave] = campo.dataset.ind.split(":");
        const atual = linhas.get(n) ?? {};
        atual[chave] = campo.value.trim();
        linhas.set(n, atual);
    }
    if (!linhas.size) return p.indicadores ?? [];
    return [...linhas.values()].filter((i) => i.nome);
}

/** Lê de volta a lista de textos editada na tela. */
function textos(chave, atuais) {
    const campos = [...document.querySelectorAll(`[data-texto^="${chave}:"]`)];
    if (!campos.length) return atuais;
    return campos.map((c) => c.value.trim()).filter(Boolean);
}

/* ---------- criação ---------- */

function criarEixo() {
    const novo = addItem("eixos", { nome: "Novo eixo", descricao: "" });
    alvo = { tipo: "eixo", id: novo.id };
    abertos.add(`e:${novo.id}`);
    avisar("Eixo criado. Dê um nome a ele.");
    render();
}

function criarObjetivo(eixoId) {
    const novo = addItem("objetivos", { nome: "Novo objetivo estratégico", descricao: "", eixoId });
    alvo = { tipo: "objetivo", id: novo.id };
    abertos.add(`e:${eixoId}`);
    abertos.add(`o:${novo.id}`);
    avisar("Objetivo criado dentro do eixo.");
    render();
}

function criarPrograma(objetivoId) {
    const o = objetivos().find((x) => x.id === objetivoId);
    const e = eixos().find((x) => x.id === o?.eixoId);
    const numero = String(programas().length + 1).padStart(3, "0");

    const novo = addPrograma({
        id: `pg-${Math.random().toString(36).slice(2, 9)}`,
        codigo: numero,
        nome: "Novo Programa",
        eixo: e?.nome ?? "",
        eixoId: e?.id ?? "",
        objetivoEstrategico: o?.nome ?? "",
        objetivoId,
        orgaoCoordenador: "",
        problema: "",
        evidencias: [],
        causas: [],
        consequencias: [],
        populacaoAfetada: "",
        objetivo: "",
        resultadoEsperado: "",
        indicadores: [],
        aptidao: "incompleto",
        disponibilizacao: "em_estruturacao",
        ppaId: plano?.id ?? "",
    });

    alvo = { tipo: "programa", id: novo?.id ?? null };
    if (o) abertos.add(`o:${o.id}`);
    if (e) abertos.add(`e:${e.id}`);
    avisar("Programa criado dentro do objetivo.");
    render();
}

/** Acrescenta uma linha de causa em branco, para ser preenchida ali mesmo. */
function novaCausa(programaId) {
    const p = programas().find((x) => x.id === programaId);
    const usados = (p.causas ?? []).map((c) => Number(c.id.replace(/\D/g, "")) || 0);
    const proximo = `c${Math.max(0, ...usados) + 1}`;
    updPrograma(programaId, { causas: [...causasDaTela(p), { id: proximo, texto: "" }] });
    render();
}

function tirarCausa(programaId, local) {
    const p = programas().find((x) => x.id === programaId);
    updPrograma(programaId, { causas: causasDaTela(p).filter((c) => c.id !== local) });
    // O registro segue no Cadastro de Causas: desvincular do Programa não é
    // motivo para apagar o que já foi escrito sobre a causa.
    render();
}

function novoIndicador(programaId) {
    const p = programas().find((x) => x.id === programaId);
    updPrograma(programaId, {
        indicadores: [...indicadoresDaTela(p), { nome: "", unidade: "", linhaBase: "", meta: "" }],
    });
    render();
}

function tirarIndicador(programaId, n) {
    const p = programas().find((x) => x.id === programaId);
    updPrograma(programaId, { indicadores: indicadoresDaTela(p).filter((_, i) => i !== Number(n)) });
    render();
}

async function excluir() {
    if (!alvo) return;
    const mapa = { eixo: "eixos", objetivo: "objetivos", programa: "programas" };
    const registro =
        alvo.tipo === "eixo"
            ? eixos().find((x) => x.id === alvo.id)
            : alvo.tipo === "objetivo"
              ? objetivos().find((x) => x.id === alvo.id)
              : programas().find((x) => x.id === alvo.id);

    const confirmou = await confirmarExclusao({
        titulo: `Excluir ${alvo.tipo}`,
        texto:
            alvo.tipo === "programa"
                ? "O Programa sai do plano. As Iniciativas dos órgãos perdem a que se vincular."
                : "O que estava dentro dele fica sem vínculo, e não é apagado junto.",
        confirmar: "Excluir",
        digitar: registro?.nome,
    });
    if (!confirmou) return;

    removeItem(mapa[alvo.tipo], alvo.id);
    // Desvincula quem apontava para ele, em vez de deixar referência morta.
    if (alvo.tipo === "eixo") for (const o of objetivos().filter((o) => o.eixoId === alvo.id)) updItem("objetivos", o.id, { eixoId: "" });
    if (alvo.tipo === "objetivo") for (const p of programasDo(alvo.id)) updPrograma(p.id, { objetivoId: "", objetivoEstrategico: "" });

    alvo = null;
    avisar("Registro excluído.");
    render();
}

/* ---------- desenho e eventos ---------- */

function render() {
    document.getElementById("conteudo").innerHTML = `
    ${barraTitulo("Cadastro")}
    <p class="text-muted fs-13 mb-3">
        O plano inteiro em uma tela: escolha onde está, veja o que falta e crie dentro do lugar certo.
    </p>
    ${medidor()}
    <div class="row g-3 align-items-start">
        <div class="col-xxl-4 col-lg-5">${arvore()}</div>
        <div class="col-xxl-8 col-lg-7" id="painel">${painel()}</div>
    </div>`;
}

document.addEventListener("click", (e) => {
    const ir = e.target.closest("[data-ir]");
    if (ir) {
        const [tipo, id] = ir.dataset.ir.split(":");
        alvo = { tipo, id };
        if (tipo === "objetivo") {
            const o = objetivos().find((x) => x.id === id);
            if (o?.eixoId) abertos.add(`e:${o.eixoId}`);
        }
        if (tipo === "programa") {
            const p = programas().find((x) => x.id === id);
            const o = objetivos().find((x) => x.id === p?.objetivoId);
            if (o) abertos.add(`o:${o.id}`);
            if (o?.eixoId) abertos.add(`e:${o.eixoId}`);
        }
        render();
        return;
    }

    const abrir = e.target.closest("[data-abrir]");
    if (abrir) {
        const chave = abrir.dataset.abrir;
        abertos.has(chave) ? abertos.delete(chave) : abertos.add(chave);
        render();
        return;
    }

    const novo = e.target.closest("[data-novo]");
    if (novo) {
        const [tipo, pai] = novo.dataset.novo.split(":");
        if (tipo === "eixo") criarEixo();
        if (tipo === "objetivo") criarObjetivo(pai);
        if (tipo === "programa") criarPrograma(pai);
        return;
    }

    const causa = e.target.closest("[data-nova-causa]");
    if (causa) return novaCausa(causa.dataset.novaCausa);

    const tirarC = e.target.closest("[data-tirar-causa]");
    if (tirarC) {
        const [pid, local] = tirarC.dataset.tirarCausa.split(":");
        return tirarCausa(pid, local);
    }

    const ind = e.target.closest("[data-novo-indicador]");
    if (ind) return novoIndicador(ind.dataset.novoIndicador);

    const tirarI = e.target.closest("[data-tirar-indicador]");
    if (tirarI) {
        const [pid, n] = tirarI.dataset.tirarIndicador.split(":");
        return tirarIndicador(pid, n);
    }

    // As listas de texto são editadas na tela e só gravam no Salvar; por isso
    // acrescentar e remover mexem no registro e redesenham.
    const porTexto = e.target.closest("[data-por-texto]");
    if (porTexto && alvo?.tipo === "programa") {
        const chave = porTexto.dataset.porTexto;
        const p = programas().find((x) => x.id === alvo.id);
        updPrograma(alvo.id, { [chave]: [...textos(chave, p[chave] ?? []), ""] });
        render();
        return;
    }

    const tirarTexto = e.target.closest("[data-tirar-texto]");
    if (tirarTexto && alvo?.tipo === "programa") {
        const [chave, n] = tirarTexto.dataset.tirarTexto.split(":");
        const p = programas().find((x) => x.id === alvo.id);
        updPrograma(alvo.id, { [chave]: textos(chave, p[chave] ?? []).filter((_, i) => i !== Number(n)) });
        render();
        return;
    }

    if (e.target.closest("#salvar")) return salvar();
    if (e.target.closest("#excluir")) return excluir();
});

document.addEventListener("input", (e) => {
    if (e.target.id === "arv-busca") {
        busca = e.target.value;
        const foco = document.activeElement === e.target;
        render();
        if (foco) {
            const campo = document.getElementById("arv-busca");
            campo.focus();
            campo.setSelectionRange(campo.value.length, campo.value.length);
        }
    }
});

document.addEventListener("change", (e) => {
    if (e.target.id !== "arv-pendentes") return;
    soPendentes = e.target.checked;
    render();
});

render();
