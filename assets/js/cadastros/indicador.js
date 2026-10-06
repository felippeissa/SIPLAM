import { esc } from "../ui.js";
import { ORGAOS } from "../dados/seed.js";
import { campoErro } from "../validacao.js";
import { ppaCorrente } from "../dados/store.js";

/**
 * Cadastro de Indicadores — e das Metas dele.
 *
 * Os campos, os vocabulários e a obrigatoriedade são os da aba "Indicadores"
 * da matriz de mapeamento. Obrigatórios são só três: o **nome**, a **situação**
 * e a **data de criação**, que o sistema preenche. O resto é opcional — um
 * indicador nasce "em construção" justamente para poder ser completado depois.
 *
 * A **vinculação hierárquica** depende do tipo: um indicador de *impacto*
 * mede o problema central, então se vincula a um Programa; de *resultado* ou
 * *esforço*, mede o que uma Iniciativa produz, então se vincula a ela.
 *
 * As **metas** são cadastradas aqui mesmo, junto do indicador e sempre
 * vinculadas a ele: o indicador vinculado aparece, e não se escolhe. Uma meta
 * sem indicador não quer dizer nada.
 */

const TIPOS = ["Impacto", "Resultado", "Esforço"];
const UNIDADES = ["Taxa por 1.000 nascidos vivos", "Percentual", "Número absoluto", "R$"];
const POLARIDADES = ["Maior-Melhor", "Menor-Melhor"];
const PERIODICIDADES = ["Mensal", "Trimestral", "Semestral", "Anual", "Bianual"];
const ABRANGENCIAS = ["Estadual", "Regional (região de planejamento)", "Municipal"];

// A matriz deixa em aberto se a fonte é lista ou texto livre ("Apresentaremos
// uma lista de opções ou campo de texto livre?"). Lista, com as três da matriz —
// e a fonte que um indicador já tem continua escolhível, para a tela não apagá-la.
const FONTES = ["DATASUS", "Instituto Mauro Borges (IMB)", "Secretaria da Educação (SEDUC)"];

const SITUACOES = ["Ativo", "Inativo", "Em construção"];
const SITUACOES_META = ["Não iniciada", "Em andamento", "Atingida", "Não atingida", "Superada"];

const LIMITE = { nome: 255, descricao: 4000, formula: 4000, site: 255 };

const valor = (id) => document.getElementById(id)?.value.trim() ?? "";
const hoje = () => new Date().toLocaleDateString("pt-BR");
const uid = () => Math.random().toString(36).slice(2, 9);

/* ---------- peças de formulário ---------- */

const contador = (id, limite) => `<div class="form-text fs-12" data-contador="${id}" data-limite="${limite}"></div>`;

function areaTexto(id, rotulo, atual, limite, obrigatorio) {
    return `
    <div class="mb-3">
        <label class="form-label" for="${id}">${esc(rotulo)}${obrigatorio ? ' <span class="text-danger">*</span>' : ""}</label>
        <textarea class="form-control" id="${id}" rows="3" maxlength="${limite}">${esc(atual ?? "")}</textarea>
        ${contador(id, limite)}
        ${campoErro(id)}
    </div>`;
}

/** A lista leva o valor que o registro já tem, mesmo fora da lista: apagá-lo em silêncio seria perder dado. */
function lista(id, rotulo, atual, opcoes, obrigatorio) {
    const todas = atual && !opcoes.includes(atual) ? [...opcoes, atual] : opcoes;
    return `
    <div class="mb-3">
        <label class="form-label" for="${id}">${esc(rotulo)}${obrigatorio ? ' <span class="text-danger">*</span>' : ""}</label>
        <select class="form-select" id="${id}">
            <option value="">Selecione</option>
            ${todas.map((o) => `<option value="${esc(o)}"${o === atual ? " selected" : ""}>${esc(o)}</option>`).join("")}
        </select>
        ${campoErro(id)}
    </div>`;
}

function texto(id, rotulo, atual, opcoes = {}) {
    const { tipo = "text", limite = null, exemplo = "", classe = "", modo = "" } = opcoes;
    return `
    <div class="mb-3">
        <label class="form-label" for="${id}">${esc(rotulo)}</label>
        <input type="${tipo}" class="form-control ${classe}" id="${id}" value="${esc(atual ?? "")}"
               ${limite ? `maxlength="${limite}"` : ""} ${modo ? `inputmode="${modo}"` : ""} placeholder="${esc(exemplo)}" />
        ${limite ? contador(id, limite) : ""}
        ${campoErro(id)}
    </div>`;
}

/* ---------- vinculação hierárquica ---------- */

/** O que o tipo escolhido deixa vincular. Sem tipo, nada. */
const alvoDoTipo = (tipo) => (tipo === "Impacto" ? "Programa" : tipo === "Resultado" || tipo === "Esforço" ? "Iniciativa" : "");

function opcoesDeVinculo(tipo, estado) {
    // Um PPA por vez: só o que pertence ao plano escolhido no cabeçalho. A
    // Iniciativa não carrega o plano — quem o carrega é o Programa dela.
    const plano = ppaCorrente(estado);
    const doPlano = (r) => !r.ppaId || !plano || r.ppaId === plano.id;
    const programas = (estado.programas ?? []).filter(doPlano);

    if (tipo === "Impacto") {
        return programas.map((p) => ({ valor: p.id, rotulo: `${p.codigo} · ${p.nome}` }));
    }
    if (tipo === "Resultado" || tipo === "Esforço") {
        const dosProgramas = new Set(programas.map((p) => p.id));
        return (estado.iniciativas ?? [])
            .filter((i) => dosProgramas.has(i.programaId))
            .map((i) => ({ valor: i.id, rotulo: `${i.nome} — ${i.orgao}` }));
    }
    return [];
}

function seletorDeVinculo(tipo, atual, estado) {
    const alvo = alvoDoTipo(tipo);
    const opcoes = opcoesDeVinculo(tipo, estado);
    return `
    <label class="form-label" for="f-vinculo">Vinculação hierárquica${alvo ? ` (${alvo})` : ""}</label>
    <select class="form-select" id="f-vinculo">
        <option value="">${alvo ? `Selecione ${alvo === "Programa" ? "o Programa" : "a Iniciativa"}` : "Escolha antes o tipo do indicador"}</option>
        ${opcoes.map((o) => `<option value="${esc(o.valor)}"${o.valor === atual ? " selected" : ""}>${esc(o.rotulo)}</option>`).join("")}
    </select>`;
}

/* ---------- metas ---------- */

/** As metas em edição. Moram aqui porque a tabela se redesenha a cada linha acrescentada. */
let metas = [];

const metaVazia = () => ({ id: `mt-${uid()}`, referencia: "", valor: "", valorReferencia: "", responsavel: "", orgao: "", situacao: "Não iniciada" });

function linhaDeMeta(m) {
    const campo = (nome, valor, extra = "") =>
        `<input type="text" class="form-control form-control-sm" data-meta="${m.id}:${nome}" value="${esc(valor ?? "")}" ${extra} />`;
    return `
    <tr>
        <td style="width:7rem">${campo("referencia", m.referencia, 'placeholder="2028"')}</td>
        <td style="width:8rem">${campo("valor", m.valor, 'inputmode="decimal" placeholder="9,8"')}</td>
        <td style="width:9rem">${campo("valorReferencia", m.valorReferencia, 'placeholder="Apurado depois"')}</td>
        <td>${campo("responsavel", m.responsavel, 'placeholder="Secretário(a) de Estado"')}</td>
        <td style="width:15rem">${campo("orgao", m.orgao, 'list="lista-orgaos" placeholder="Órgão"')}</td>
        <td style="width:11rem">
            <select class="form-select form-select-sm" data-meta="${m.id}:situacao">
                ${SITUACOES_META.map((s) => `<option value="${esc(s)}"${s === m.situacao ? " selected" : ""}>${esc(s)}</option>`).join("")}
            </select>
        </td>
        <td class="text-end" style="width:3rem">
            <button type="button" class="btn btn-sm btn-light" data-meta-tirar="${m.id}" aria-label="Remover meta"><i class="ti ti-trash"></i></button>
        </td>
    </tr>`;
}

function tabelaDeMetas() {
    return `
    <div class="table-responsive border rounded">
        <table class="table table-sm align-middle mb-0">
            <thead>
                <tr>
                    <th>Referência temporal</th>
                    <th>Valor da meta</th>
                    <th>Valor de referência</th>
                    <th>Responsável pela meta</th>
                    <th>Órgão do responsável</th>
                    <th>Situação da meta <span class="text-danger">*</span></th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                ${
                    metas.length
                        ? metas.map(linhaDeMeta).join("")
                        : '<tr><td colspan="7" class="text-center text-muted py-3 fs-12">Nenhuma meta. Use “Adicionar meta”.</td></tr>'
                }
            </tbody>
        </table>
    </div>
    <datalist id="lista-orgaos">${ORGAOS.map((o) => `<option value="${esc(o)}"></option>`).join("")}</datalist>`;
}

/** Guarda no módulo o que está digitado, antes de redesenhar a tabela. */
function lerMetasDaTela() {
    for (const el of document.querySelectorAll("[data-meta]")) {
        const [id, nome] = el.dataset.meta.split(":");
        const meta = metas.find((m) => m.id === id);
        if (meta) meta[nome] = el.value;
    }
}

/* ---------- o cadastro ---------- */

export const indicador = {
    colecao: "indicadores",
    pasta: "central-indicador",
    listagem: "central-indicador.html",
    titulo: "Cadastro de Indicadores",
    subtitulo: "O que o plano mede, e as metas de cada medida.",
    novoRotulo: "Novo indicador",
    singular: "Indicador",
    rotuloNome: "Nome do indicador",
    exemplo: "Taxa de Mortalidade Infantil",
    podeExcluir: true,

    // O número é da listagem, não do formulário: a matriz não o lista entre os campos.
    codigo: (item, estado) => {
        if (!item.id) return "Novo";
        const indice = (estado.indicadores ?? []).findIndex((i) => i.id === item.id);
        return String(indice + 1).padStart(3, "0");
    },

    // A descrição vem logo abaixo do nome, e é "descrição detalhada".
    semDescricao: true,

    filtros: [
        { tipo: "texto", id: "tipo", rotulo: "Tipo", campo: "tipo" },
        { tipo: "texto", id: "unidade", rotulo: "Unidade", campo: "unidade" },
        { tipo: "texto", id: "periodicidade", rotulo: "Periodicidade", campo: "periodicidade" },
        { tipo: "texto", id: "situacao", rotulo: "Situação", campo: "situacao" },
    ],

    extra: {
        colunas: [
            { rotulo: "Tipo", valor: (i) => (i.tipo ? esc(i.tipo) : '<span class="text-muted">—</span>') },
            { rotulo: "Unidade", valor: (i) => (i.unidade ? esc(i.unidade) : '<span class="text-muted">—</span>') },
            { rotulo: "Periodicidade", valor: (i) => (i.periodicidade ? esc(i.periodicidade) : '<span class="text-muted">—</span>') },
            { rotulo: "Situação", valor: (i) => (i.situacao ? esc(i.situacao) : '<span class="text-muted">—</span>') },
        ],

        html(item, estado) {
            metas = structuredClone(item.metas ?? []);

            return `
            ${areaTexto("f-descricao", "Descrição detalhada", item.descricao, LIMITE.descricao, false)}

            <div class="row">
                <div class="col-md-6">${lista("f-tipo", "Tipo de indicador", item.tipo, TIPOS, false)}</div>
                <div class="col-md-6"><div class="mb-3" id="bloco-vinculo">${seletorDeVinculo(item.tipo, item.vinculoId, estado)}</div></div>
            </div>

            ${areaTexto("f-formula", "Fórmula de cálculo", item.formula, LIMITE.formula, false)}

            <div class="row">
                <div class="col-md-6">${lista("f-unidade", "Unidade de medida", item.unidade, UNIDADES, false)}</div>
                <div class="col-md-6">${lista("f-polaridade", "Polaridade", item.polaridade, POLARIDADES, false)}</div>
                <div class="col-md-6">${lista("f-periodicidade", "Periodicidade", item.periodicidade, PERIODICIDADES, false)}</div>
                <div class="col-md-6">${lista("f-abrangencia", "Abrangência geográfica", item.abrangencia, ABRANGENCIAS, false)}</div>
                <div class="col-md-6">${lista("f-fonte", "Fonte dos dados", item.fonte, FONTES, false)}</div>
                <div class="col-md-6">${texto("f-site", "Site / link da fonte", item.site, { tipo: "url", limite: LIMITE.site, exemplo: "http://tabnet.datasus.gov.br/" })}</div>
                <div class="col-md-4">${texto("f-linhaBase", "Linha de base (valor)", item.linhaBase, { exemplo: "10,5", classe: "codigo", modo: "decimal" })}</div>
                <div class="col-md-4">${texto("f-dataLinhaBase", "Data da linha de base", item.dataLinhaBase, { tipo: "date" })}</div>
                <div class="col-md-4">${texto("f-responsavelTecnico", "Responsável técnico", item.responsavelTecnico, { exemplo: "Gerência de Vigilância Epidemiológica / SES" })}</div>
            </div>

            <div class="row">
                <div class="col-md-6">${lista("f-situacao", "Situação do indicador", item.situacao || "Em construção", SITUACOES, true)}</div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label" for="f-dataCriacao">Data de criação <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="f-dataCriacao" value="${esc(item.criadoEm || hoje())}" disabled />
                    </div>
                </div>
            </div>

            <div class="border-top border-dashed my-3"></div>

            <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="rotulo-secao mb-0">Metas</h6>
                <button type="button" class="btn btn-sm btn-light" id="meta-nova"><i class="ti ti-plus me-1"></i>Adicionar meta</button>
            </div>
            <div class="mb-2">
                <label class="form-label" for="f-indicadorVinculado">Indicador vinculado <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="f-indicadorVinculado" value="${esc(item.nome ?? "")}" disabled />
            </div>
            <div id="metas-tabela">${tabelaDeMetas()}</div>`;
        },

        ligar(escopo, estado) {
            // “255 caracteres restantes”: o limite só ajuda se aparecer antes de
            // a pessoa esbarrar nele.
            const atualizar = (campo) => {
                const aviso = escopo.querySelector(`[data-contador="${campo.id}"]`);
                if (!aviso) return;
                const restam = Number(aviso.dataset.limite) - campo.value.length;
                aviso.textContent = `${restam} ${restam === 1 ? "caractere restante" : "caracteres restantes"}`;
            };
            escopo.querySelectorAll("[data-contador]").forEach((aviso) => {
                const campo = document.getElementById(aviso.dataset.contador);
                if (!campo) return;
                atualizar(campo);
                campo.addEventListener("input", () => atualizar(campo));
            });

            // A vinculação acompanha o tipo: Impacto mostra Programas; Resultado e
            // Esforço, Iniciativas. Trocar o tipo troca a lista e solta o vínculo
            // anterior, que deixaria de fazer sentido.
            document.getElementById("f-tipo")?.addEventListener("change", (e) => {
                document.getElementById("bloco-vinculo").innerHTML = seletorDeVinculo(e.target.value, "", estado);
            });

            // O indicador vinculado à meta acompanha o nome enquanto se digita.
            document.getElementById("f-nome")?.addEventListener("input", (e) => {
                document.getElementById("f-indicadorVinculado").value = e.target.value;
            });

            const tabela = document.getElementById("metas-tabela");
            const redesenhar = () => (tabela.innerHTML = tabelaDeMetas());

            document.getElementById("meta-nova")?.addEventListener("click", () => {
                lerMetasDaTela();
                metas.push(metaVazia());
                redesenhar();
            });

            tabela?.addEventListener("click", (e) => {
                const tirar = e.target.closest("[data-meta-tirar]");
                if (!tirar) return;
                lerMetasDaTela();
                metas = metas.filter((m) => m.id !== tirar.dataset.metaTirar);
                redesenhar();
            });
        },

        ler: () => {
            lerMetasDaTela();
            return {
                tipo: valor("f-tipo"),
                vinculoId: valor("f-vinculo"),
                formula: valor("f-formula"),
                unidade: valor("f-unidade"),
                polaridade: valor("f-polaridade"),
                periodicidade: valor("f-periodicidade"),
                abrangencia: valor("f-abrangencia"),
                fonte: valor("f-fonte"),
                site: valor("f-site"),
                linhaBase: valor("f-linhaBase"),
                dataLinhaBase: valor("f-dataLinhaBase"),
                responsavelTecnico: valor("f-responsavelTecnico"),
                situacao: valor("f-situacao"),
                metas: metas.map((m) => ({ ...m })),
            };
        },

        regras: (dados) => [
            { campo: "f-situacao", valido: !!dados.situacao, mensagem: "Escolha a situação do indicador." },
        ],
    },
};
