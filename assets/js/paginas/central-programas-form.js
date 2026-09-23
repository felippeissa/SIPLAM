/**
 * Criar e editar o Programa, em tela própria.
 *
 * É o formulário mais longo do sistema: identidade, diagnóstico, objetivo e
 * governança. Num modal ele rolava dentro de uma caixa, sem endereço próprio e
 * perdendo tudo se fechasse por engano — motivo de mais para ter tela.
 *
 * O conteúdo fica no cartão principal; aptidão e disponibilização, no lateral,
 * porque dizem respeito ao estado do Programa, não ao que ele é.
 */
import { obterEstado, addPrograma, updPrograma } from "../dados/store.js";
import { DISPONIBILIZACAO_LABEL } from "../dados/regras.js";
import { montarShell, barraTitulo, somenteLeitura, url } from "../shell.js";
import { catalogo } from "../catalogo.js";
import { esc } from "../ui.js";
import { confirmarExclusao } from "../confirmar.js";
import { avisar } from "../toast.js";
import { campoErro, validar, limparAoDigitar } from "../validacao.js";

const uid = () => Math.random().toString(36).slice(2, 9);

/**
 * Eixo e objetivo estratégico por catálogo, e não por lista suspensa.
 *
 * Quem cadastra um Programa costuma estar montando o plano, e o eixo ou o
 * objetivo de que ele precisa às vezes ainda não existe. Com a lista suspensa,
 * era preciso abandonar o formulário, ir ao outro cadastro e voltar — perdendo
 * o que já estava digitado aqui.
 *
 * Os dois são vínculo de um só: um Programa pertence a um eixo e a um objetivo.
 */
const catalogoEixo = catalogo({
    colecao: "eixos",
    singular: "Eixo",
    plural: "Eixo",
    artigo: "o",
    prefixo: "peix",
    unico: true,
    campos: [{ id: "descricao", rotulo: "Descrição", ajuda: "O que este eixo reúne" }],
    usos: (id, estado) => (estado.objetivos ?? []).filter((o) => o.eixoId === id).length,
});

const catalogoObjetivo = catalogo({
    colecao: "objetivos",
    singular: "Objetivo estratégico",
    plural: "Objetivo estratégico",
    artigo: "o",
    prefixo: "pobj",
    unico: true,
    ajuda: "O objetivo carrega o eixo dele: escolher aqui define os dois.",
    campos: [{ id: "descricao", rotulo: "Descrição", ajuda: "O que este objetivo persegue" }],
    detalhe: (o, estado) => {
        const eixo = (estado.eixos ?? []).find((e) => e.id === o.eixoId);
        return eixo ? `Eixo: ${eixo.nome}` : "Sem eixo";
    },
    usos: (id, estado) => (estado.programas ?? []).filter((pr) => pr.objetivoId === id).length,
});

export function montarFormularioPrograma({ novo }) {
    const { estado } = montarShell();
    const leitura = somenteLeitura();
    const voltar = url("central-programas.html");

    const id = new URLSearchParams(location.search).get("id");
    const original = novo ? null : estado.programas.find((p) => p.id === id);

    if (!novo && !original) {
        document.getElementById("conteudo").innerHTML = `
        <div class="my-4">
            <div class="alert alert-warning py-3 px-3">
                Este Programa não existe mais.
                <a href="${voltar}" class="fw-semibold">Voltar para o Cadastro de Programa</a>.
            </div>
        </div>`;
        return;
    }

    let edicao = novo ? vazio() : structuredClone(original);

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
            disponibilizacao: "nao_disponivel",
        };
    }

    /** O que falta para o Programa poder ser oferecido aos órgãos. */
    function faltaParaDisponibilizar(p) {
        const falta = [];
        if (!p.problema?.trim()) falta.push("problema central");
        if (!(p.causas ?? []).filter((c) => c.texto?.trim()).length) falta.push("ao menos uma causa");
        if (!p.objetivo?.trim()) falta.push("objetivo");
        return falta;
    }

    /**
     * O vínculo estratégico, gravado de duas formas. Os ids são o vínculo de
     * verdade; o texto continua porque as telas de análise filtram por nome.
     */
    function vinculoEstrategico(eixoId, objetivoId) {
        const eixo = (estado.eixos ?? []).find((e) => e.id === eixoId);
        const objetivo = (estado.objetivos ?? []).find((o) => o.id === objetivoId);
        return {
            eixoId,
            objetivoId,
            eixo: eixo?.nome ?? "",
            objetivoEstrategico: objetivo?.nome ?? "",
        };
    }

    /* ---------- campos ---------- */

    function campoTexto(campo, rotulo, valor, { linhas = 1, obrigatorio = false, ajuda = "" } = {}) {
        const entrada =
            linhas > 1
                ? `<textarea class="form-control" id="${campo}" rows="${linhas}" ${leitura ? "disabled" : ""}>${esc(valor ?? "")}</textarea>`
                : `<input type="text" class="form-control" id="${campo}" value="${esc(valor ?? "")}" ${leitura ? "disabled" : ""} />`;
        return `
        <div class="mb-3">
            <label class="form-label" for="${campo}">${rotulo}${obrigatorio ? ' <span class="text-danger">*</span>' : ""}</label>
            ${entrada}
            ${campoErro(campo)}
            ${ajuda ? `<div class="form-text fs-12">${ajuda}</div>` : ""}
        </div>`;
    }

    /** Lista de textos com acrescentar e remover — evidências, consequências. */
    function listaEditavel(tipo, titulo, itens, ajuda = "") {
        return `
        <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="form-label mb-0">${titulo}</label>
                ${leitura ? "" : `<button type="button" class="btn btn-sm btn-light" data-add="${tipo}"><i class="ti ti-plus"></i> Adicionar</button>`}
            </div>
            ${ajuda ? `<div class="form-text fs-12 mb-2">${ajuda}</div>` : ""}
            ${
                itens.length === 0
                    ? '<p class="fs-12 text-muted mb-0">Nenhum item.</p>'
                    : itens
                          .map(
                              (texto, i) => `
            <div class="input-group input-group-sm mb-1">
                <input type="text" class="form-control" value="${esc(texto)}" data-lista="${tipo}" data-idx="${i}" ${leitura ? "disabled" : ""} />
                ${leitura ? "" : `<button class="btn btn-light" type="button" data-remover="${tipo}" data-idx="${i}" aria-label="Remover"><i class="ti ti-trash"></i></button>`}
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
                <label class="form-label mb-0">Causas <span class="text-danger">*</span></label>
                ${leitura ? "" : `<button type="button" class="btn btn-sm btn-light" data-add="causa"><i class="ti ti-plus"></i> Adicionar causa</button>`}
            </div>
            <div class="form-text fs-12 mb-2">
                São as causas que o órgão relaciona à Iniciativa. Sem nenhuma, a Iniciativa fica presa
                numa pendência que a interface não permite resolver.
            </div>
            ${
                causas.length === 0
                    ? '<div class="alert alert-warning py-2 px-3 fs-12 mb-0">Este Programa não tem causas. Nenhum órgão conseguirá concluir uma Iniciativa nele.</div>'
                    : causas
                          .map(
                              (c, i) => `
            <div class="input-group input-group-sm mb-1">
                <span class="input-group-text">${i + 1}</span>
                <input type="text" class="form-control" value="${esc(c.texto)}" data-causa-texto="${i}" ${leitura ? "disabled" : ""} />
                ${leitura ? "" : `<button class="btn btn-light" type="button" data-remover-causa="${i}" aria-label="Remover causa"><i class="ti ti-trash"></i></button>`}
            </div>`
                          )
                          .join("")
            }
        </div>`;
    }

    function editorIndicadores() {
        const indicadores = edicao.indicadores ?? [];
        return `
        <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="form-label mb-0">Indicadores do Programa</label>
                ${leitura ? "" : `<button type="button" class="btn btn-sm btn-light" data-add="indicador"><i class="ti ti-plus"></i> Adicionar indicador</button>`}
            </div>
            ${
                indicadores.length === 0
                    ? '<p class="fs-12 text-muted mb-0">Nenhum indicador.</p>'
                    : indicadores
                          .map(
                              (ind, i) => `
            <div class="border rounded p-2 mb-2">
                <div class="row g-2">
                    <div class="col-md-6">
                        <input type="text" class="form-control form-control-sm" placeholder="Nome" value="${esc(ind.nome ?? "")}" data-ind="${i}:nome" ${leitura ? "disabled" : ""} />
                    </div>
                    <div class="col-md-2">
                        <input type="text" class="form-control form-control-sm" placeholder="Unidade" value="${esc(ind.unidade ?? "")}" data-ind="${i}:unidade" ${leitura ? "disabled" : ""} />
                    </div>
                    <div class="col-md-2">
                        <input type="text" class="form-control form-control-sm" placeholder="Linha base" value="${esc(ind.linhaBase ?? "")}" data-ind="${i}:linhaBase" ${leitura ? "disabled" : ""} />
                    </div>
                    <div class="col-md-2 d-flex gap-1">
                        <input type="text" class="form-control form-control-sm" placeholder="Meta" value="${esc(ind.meta ?? "")}" data-ind="${i}:meta" ${leitura ? "disabled" : ""} />
                        ${leitura ? "" : `<button class="btn btn-sm btn-light" type="button" data-remover-ind="${i}" aria-label="Remover indicador"><i class="ti ti-trash"></i></button>`}
                    </div>
                </div>
            </div>`
                          )
                          .join("")
            }
        </div>`;
    }

    /* ---------- leitura ---------- */

    function lerFormulario() {
        const v = (campo) => document.getElementById(campo)?.value ?? "";
        Object.assign(edicao, {
            codigo: v("f-codigo").trim(),
            nome: v("f-nome").trim(),
            ...vinculoEstrategico(catalogoEixo.ler()[0] ?? "", catalogoObjetivo.ler()[0] ?? ""),
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
            edicao[el.dataset.lista][Number(el.dataset.idx)] = el.value;
        });
        document.querySelectorAll("[data-causa-texto]").forEach((el) => {
            edicao.causas[Number(el.dataset.causaTexto)].texto = el.value;
        });
        document.querySelectorAll("[data-ind]").forEach((el) => {
            const [i, campo] = el.dataset.ind.split(":");
            edicao.indicadores[Number(i)][campo] = el.value;
        });
    }

    /* ---------- desenho ---------- */

    function corpo() {
        return `
        <div class="row g-3">
            <div class="col-md-2">${campoTexto("f-codigo", "Código", edicao.codigo, { obrigatorio: true })}</div>
            <div class="col-md-10">${campoTexto("f-nome", "Nome do Programa", edicao.nome, { obrigatorio: true })}</div>
        </div>
        <div class="row g-3">
            <div class="col-md-6">${catalogoEixo.html(edicao.eixoId ? [edicao.eixoId] : [])}</div>
            <div class="col-md-6">${catalogoObjetivo.html(edicao.objetivoId ? [edicao.objetivoId] : [])}</div>
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
        <h6 class="rotulo-secao mb-3">Governança</h6>
        <div class="row g-3">
            <div class="col-md-6">${campoTexto("f-orgaoCoordenador", "Órgão coordenador", edicao.orgaoCoordenador)}</div>
            <div class="col-md-6">${campoTexto("f-governanca", "Governança do Programa", edicao.governanca)}</div>
        </div>`;
    }

    function lateral() {
        const falta = faltaParaDisponibilizar(edicao);
        return `
        <div class="card">
            <div class="card-header d-block p-3">
                <h4 class="card-title mb-1">Situação do Programa</h4>
                <p class="text-muted mb-0 fs-13">Se o diagnóstico está pronto e se os órgãos já podem contribuir.</p>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <label class="form-label" for="f-aptidao">Aptidão</label>
                    <select class="form-select" id="f-aptidao" ${leitura ? "disabled" : ""}>
                        <option value="incompleto"${edicao.aptidao === "incompleto" ? " selected" : ""}>Diagnóstico incompleto</option>
                        <option value="apto"${edicao.aptidao === "apto" ? " selected" : ""}>Apto</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label" for="f-disponibilizacao">Disponibilização</label>
                    <select class="form-select" id="f-disponibilizacao" ${leitura ? "disabled" : ""}>
                        ${Object.entries(DISPONIBILIZACAO_LABEL)
                            .map(([k, v]) => `<option value="${k}"${edicao.disponibilizacao === k ? " selected" : ""}>${esc(v)}</option>`)
                            .join("")}
                    </select>
                </div>
                ${
                    falta.length
                        ? `<div class="alert alert-warning py-2 px-3 fs-12 mb-0">
                    Diagnóstico incompleto — falta: <strong>${esc(falta.join(", "))}</strong>.
                    Disponibilizar assim deixa os órgãos sem base para contribuir.
                </div>`
                        : `<p class="fs-12 text-muted mb-0">Diagnóstico completo.</p>`
                }
            </div>
        </div>`;
    }

    function render() {
        document.getElementById("conteudo").innerHTML = `
        ${barraTitulo(novo ? "Novo Programa" : `Editar Programa ${esc(edicao.codigo)}`, [novo ? "Novo" : "Editar"])}

        <div class="row">
            <div class="col-xxl-8">
                <div class="card">
                    <div class="card-header d-block p-3">
                        <h4 class="card-title mb-1">Programa</h4>
                        <p class="text-muted mb-0 fs-13">Identidade, diagnóstico, objetivo e governança.</p>
                    </div>
                    <div class="card-body" id="formulario">${corpo()}</div>
                </div>
            </div>
            <div class="col-xxl-4" id="lateral">${lateral()}</div>
        </div>

        <div class="mt-1 mb-4 d-flex gap-2 align-items-center">
            ${
                leitura
                    ? `<a href="${voltar}" class="btn btn-light">Voltar</a>`
                    : `<a href="${voltar}" class="btn btn-light">Cancelar</a>
                       <button type="button" class="btn btn-primary" id="salvar">${novo ? "Cadastrar Programa" : "Salvar Programa"}</button>`
            }
        </div>`;

        const escopo = document.getElementById("formulario");
        limparAoDigitar(escopo);
        // Religados a cada desenho: o campo de busca é recriado junto com o
        // corpo do formulário, e os ouvintes dele vão embora com o antigo.
        catalogoEixo.ligar(escopo);
        catalogoObjetivo.ligar(escopo);
    }

    /** Redesenha só o formulário: acrescentar uma causa não é recarregar a tela. */
    function redesenhar() {
        document.getElementById("formulario").innerHTML = corpo();
        document.getElementById("lateral").innerHTML = lateral();
        const escopo = document.getElementById("formulario");
        limparAoDigitar(escopo);
        // Religados a cada desenho: o campo de busca é recriado junto com o
        // corpo do formulário, e os ouvintes dele vão embora com o antigo.
        catalogoEixo.ligar(escopo);
        catalogoObjetivo.ligar(escopo);
    }

    /* ---------- eventos ---------- */

    document.addEventListener("click", async (e) => {
        if (leitura) return;

        const add = e.target.closest("[data-add]");
        if (add) {
            lerFormulario();
            const tipo = add.dataset.add;
            if (tipo === "causa") edicao.causas.push({ id: `c-${uid()}`, texto: "" });
            else if (tipo === "indicador") edicao.indicadores.push({ nome: "", unidade: "", linhaBase: "", meta: "" });
            else edicao[tipo].push("");
            return redesenhar();
        }

        const remover = e.target.closest("[data-remover]");
        if (remover) {
            lerFormulario();
            edicao[remover.dataset.remover].splice(Number(remover.dataset.idx), 1);
            return redesenhar();
        }

        const removerCausa = e.target.closest("[data-remover-causa]");
        if (removerCausa) {
            lerFormulario();
            const i = Number(removerCausa.dataset.removerCausa);
            const causa = edicao.causas[i];
            const usada = estado.iniciativas.filter((ini) => ini.causas.includes(causa.id));
            if (usada.length) {
                const confirmou = await confirmarExclusao({
                    titulo: "Remover causa",
                    texto: `${usada.length} Iniciativa${usada.length > 1 ? "s" : ""} ${usada.length > 1 ? "referenciam" : "referencia"} esta causa. Removê-la deixa ${usada.length > 1 ? "essas contribuições" : "essa contribuição"} sem o vínculo.`,
                    confirmar: "Remover",
                });
                if (!confirmou) return;
            }
            edicao.causas.splice(i, 1);
            return redesenhar();
        }

        const removerInd = e.target.closest("[data-remover-ind]");
        if (removerInd) {
            lerFormulario();
            edicao.indicadores.splice(Number(removerInd.dataset.removerInd), 1);
            return redesenhar();
        }

        if (!e.target.closest("#salvar")) return;

        lerFormulario();
        const escopo = document.getElementById("formulario");
        const ok = validar(escopo, [
            { campo: "f-codigo", valido: !!edicao.codigo, mensagem: "Informe o código do Programa." },
            { campo: "f-nome", valido: !!edicao.nome, mensagem: "Informe o nome do Programa." },
        ]);
        if (!ok) return;

        const falta = faltaParaDisponibilizar(edicao);
        if (edicao.disponibilizacao === "disponivel" && falta.length) {
            const confirmou = await confirmarExclusao({
                titulo: "Disponibilizar com diagnóstico incompleto",
                texto: `Falta ${falta.join(", ")}. Os órgãos verão o Programa sem base para contribuir.`,
                confirmar: "Disponibilizar assim mesmo",
            });
            if (!confirmou) return;
        }

        if (estado.programas.some((p) => p.id === edicao.id)) updPrograma(edicao.id, edicao);
        else addPrograma(edicao);
        avisar(`Programa ${novo ? "criado" : "editado"} com sucesso.`);
        window.location.href = voltar;
    });

    render();
}
