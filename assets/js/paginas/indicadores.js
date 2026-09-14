/**
 * Indicadores — de Programa e de Iniciativa.
 * Porta `indicadores.tsx`.
 *
 * Corrige T6.7.4, o maior buraco do protótipo: a tela era uma vitrine dos dados
 * do seed, sem nenhuma forma de cadastrar ou editar indicador em qualquer
 * visão. Aqui o indicador de Iniciativa é editável pelo órgão; o de Programa
 * continua no Cadastro de Programa, que é de quem o define.
 */
import { obterEstado, updIniciativa } from "../dados/store.js";
import { ANOS } from "../dados/seed.js";
import { eixos, objetivos, podeEditar } from "../dados/regras.js";
import { montarShell, cabecalhoPagina , somenteLeitura } from "../shell.js";
import { chip, esc, faixaIndicadores } from "../ui.js";

const { estado } = montarShell();
const orgao = estado.orgaoAtual;

let busca = "";
let nivel = "todos";
let eixo = "todos";
let objetivo = "todos";
let edicao = null;

const uid = () => Math.random().toString(36).slice(2, 9);

function novoIndicador() {
    return {
        id: `ind-${uid()}`,
        nome: "",
        descricao: "",
        unidade: "",
        formula: "",
        fonte: "",
        periodicidade: "Anual",
        valorReferencia: "",
        anoReferencia: "2027",
        polaridade: "maior_melhor",
        metas: Object.fromEntries(ANOS.map((a) => [a, ""])),
    };
}

function linhas() {
    const q = busca.trim().toLowerCase();
    const out = [];

    for (const p of estado.programas) {
        for (const ind of p.indicadores ?? []) {
            out.push({ nivel: "Programa", indicador: ind, origem: p.nome, programa: p, editavel: false });
        }
    }

    for (const i of estado.iniciativas.filter((x) => x.orgao === orgao)) {
        const p = estado.programas.find((x) => x.id === i.programaId);
        for (const ind of i.indicadores ?? []) {
            out.push({
                nivel: "Iniciativa",
                indicador: ind,
                origem: i.nome,
                programa: p,
                iniciativa: i,
                editavel: podeEditar(i.status),
            });
        }
    }

    return out.filter((l) => {
        if (q && !l.indicador.nome.toLowerCase().includes(q)) return false;
        if (nivel !== "todos" && l.nivel !== nivel) return false;
        if (eixo !== "todos" && l.programa?.eixo !== eixo) return false;
        if (objetivo !== "todos" && l.programa?.objetivoEstrategico !== objetivo) return false;
        return true;
    });
}

function modal() {
    const ind = edicao.indicador;
    return `
<div class="modal fade" id="modal-indicador" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <div>
                    <h5 class="modal-title fs-15">${edicao.novo ? "Novo indicador" : "Editar indicador"}</h5>
                    <div class="fs-12 text-muted">Iniciativa: ${esc(edicao.iniciativa.nome)}</div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
                <div class="mb-3">
                    <label class="form-label" for="i-nome">Nome do indicador <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="i-nome" value="${esc(ind.nome)}" />
                </div>
                <div class="mb-3">
                    <label class="form-label" for="i-descricao">Descrição</label>
                    <textarea class="form-control" id="i-descricao" rows="2">${esc(ind.descricao)}</textarea>
                </div>
                <div class="row g-3">
                    <div class="col-md-4">
                        <label class="form-label" for="i-unidade">Unidade</label>
                        <input type="text" class="form-control" id="i-unidade" value="${esc(ind.unidade)}" />
                    </div>
                    <div class="col-md-8">
                        <label class="form-label" for="i-formula">Fórmula de cálculo</label>
                        <input type="text" class="form-control" id="i-formula" value="${esc(ind.formula)}" />
                    </div>
                    <div class="col-md-6">
                        <label class="form-label" for="i-fonte">Fonte</label>
                        <input type="text" class="form-control" id="i-fonte" value="${esc(ind.fonte)}" />
                    </div>
                    <div class="col-md-6">
                        <label class="form-label" for="i-periodicidade">Periodicidade</label>
                        <select class="form-select" id="i-periodicidade">
                            ${["Mensal", "Trimestral", "Semestral", "Anual"]
                                .map((p) => `<option${p === ind.periodicidade ? " selected" : ""}>${p}</option>`)
                                .join("")}
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label" for="i-valor">Valor de referência</label>
                        <input type="text" class="form-control" id="i-valor" value="${esc(ind.valorReferencia)}" />
                    </div>
                    <div class="col-md-4">
                        <label class="form-label" for="i-ano">Ano de referência</label>
                        <input type="text" class="form-control" id="i-ano" value="${esc(ind.anoReferencia)}" />
                    </div>
                    <div class="col-md-4">
                        <label class="form-label" for="i-polaridade">Polaridade</label>
                        <select class="form-select" id="i-polaridade">
                            <option value="maior_melhor"${ind.polaridade === "maior_melhor" ? " selected" : ""}>Maior é melhor</option>
                            <option value="menor_melhor"${ind.polaridade === "menor_melhor" ? " selected" : ""}>Menor é melhor</option>
                        </select>
                    </div>
                </div>
                <div class="border-top border-dashed my-3"></div>
                <div class="rotulo-secao mb-2">Metas por ano</div>
                <div class="row g-2">
                    ${ANOS.map(
                        (a) => `
                    <div class="col-6 col-md-3">
                        <label class="form-label" for="i-meta-${a}">${a}</label>
                        <input type="text" class="form-control" id="i-meta-${a}" data-meta="${a}" value="${esc(ind.metas?.[a] ?? "")}" />
                    </div>`
                    ).join("")}
                </div>
            </div>
            <div class="modal-footer">
                ${
                    edicao.novo
                        ? ""
                        : '<button type="button" class="btn btn-outline-danger me-auto" id="excluir-ind">Excluir indicador</button>'
                }
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary" id="salvar-ind">Salvar indicador</button>
            </div>
        </div>
    </div>
</div>`;
}

function render() {
    const ls = linhas();
    const minhasIniciativas = estado.iniciativas.filter((i) => i.orgao === orgao);
    const semIndicador = minhasIniciativas.filter((i) => (i.indicadores ?? []).length === 0).length;

    document.getElementById("conteudo").innerHTML = `
    ${cabecalhoPagina(
        "Indicadores",
        "Indicadores de resultado dos Programas e os que o órgão definiu para suas Iniciativas.",
        `
        <div class="app-search">
            <input type="search" id="busca" class="form-control form-control-sm" placeholder="Buscar indicador" value="${esc(busca)}" />
            <i class="ti ti-search app-search-icon text-muted"></i>
        </div>
        <select class="form-select form-select-sm" id="nivel">
            <option value="todos">Todos os níveis</option>
            <option value="Programa"${nivel === "Programa" ? " selected" : ""}>Indicador de Programa</option>
            <option value="Iniciativa"${nivel === "Iniciativa" ? " selected" : ""}>Indicador de Iniciativa</option>
        </select>
        <select class="form-select form-select-sm" id="eixo">
            <option value="todos">Todos os Eixos</option>
            ${eixos(estado.programas).map((e) => `<option value="${esc(e)}"${e === eixo ? " selected" : ""}>${esc(e)}</option>`).join("")}
        </select>
        <select class="form-select form-select-sm" id="objetivo">
            <option value="todos">Todos os Objetivos</option>
            ${objetivos(estado.programas, eixo).map((o) => `<option value="${esc(o)}"${o === objetivo ? " selected" : ""}>${esc(o)}</option>`).join("")}
        </select>
        <div class="dropdown ${somenteLeitura() ? "d-none" : ""}">
            <button class="btn btn-sm btn-primary dropdown-toggle" data-bs-toggle="dropdown"><i class="ti ti-plus me-1"></i>Novo indicador</button>
            <ul class="dropdown-menu dropdown-menu-end fs-13">
                ${
                    minhasIniciativas.filter((i) => podeEditar(i.status)).length === 0
                        ? '<li><span class="dropdown-item-text fs-12 text-muted">Nenhuma Iniciativa editável.</span></li>'
                        : minhasIniciativas
                              .filter((i) => podeEditar(i.status))
                              .map((i) => `<li><button class="dropdown-item" data-nova-ini="${i.id}">${esc(i.nome)}</button></li>`)
                              .join("")
                }
            </ul>
        </div>`
    )}
    ${faixaIndicadores(
        [
            { valor: ls.length, rotulo: "Indicadores no recorte" },
            { valor: ls.filter((l) => l.nivel === "Programa").length, rotulo: "De Programa" },
            { valor: ls.filter((l) => l.nivel === "Iniciativa").length, rotulo: "De Iniciativa" },
            { valor: semIndicador, rotulo: "Iniciativas sem indicador" },
        ],
        "O indicador de Programa é definido pela Área Central; o de Iniciativa, pelo órgão que a propõe."
    )}
    <div class="card">
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th>Indicador</th>
                        <th style="width:8rem">Nível</th>
                        <th style="width:16rem">Origem</th>
                        <th style="width:8rem">Unidade</th>
                        <th class="num" style="width:7rem">Referência</th>
                        ${ANOS.map((a) => `<th class="num" style="width:5rem">${a}</th>`).join("")}
                        <th style="width:6rem">Ações</th>
                    </tr>
                </thead>
                <tbody>
                ${
                    ls.length === 0
                        ? `<tr><td colspan="${ANOS.length + 6}" class="text-center text-muted py-4 fs-12">Nenhum indicador corresponde ao filtro.</td></tr>`
                        : ls
                              .map((l) => {
                                  const ind = l.indicador;
                                  const metas = ind.metas ?? {};
                                  return `
                    <tr>
                        <td>
                            <div class="fw-medium">${esc(ind.nome)}</div>
                            ${ind.fonte ? `<div class="fs-12 text-muted">Fonte: ${esc(ind.fonte)}${ind.periodicidade ? ` · ${esc(ind.periodicidade)}` : ""}</div>` : ""}
                        </td>
                        <td>${chip(l.nivel, l.nivel === "Programa" ? "info" : "neutro")}</td>
                        <td class="fs-12 text-muted">${esc(l.origem)}</td>
                        <td class="fs-12">${esc(ind.unidade || "—")}</td>
                        <td class="num">${esc(ind.valorReferencia ?? ind.linhaBase ?? "—")}</td>
                        ${ANOS.map((a) => `<td class="num">${esc(metas[a] || (a === ANOS[ANOS.length - 1] ? ind.meta ?? "—" : "—"))}</td>`).join("")}
                        <td>
                            ${
                                l.editavel && !somenteLeitura()
                                    ? `<button class="btn btn-sm btn-outline-primary" data-editar="${l.iniciativa.id}:${ind.id}">Editar</button>`
                                    : `<a href="${l.nivel === "Programa" ? `programa.html?id=${l.programa.id}` : `iniciativa.html?id=${l.iniciativa.id}`}" class="btn btn-sm btn-light">Ver</a>`
                            }
                        </td>
                    </tr>`;
                              })
                              .join("")
                }
                </tbody>
            </table>
        </div>
    </div>
    ${edicao ? modal() : ""}`;

    document.getElementById("busca").value = busca;

    if (edicao) {
        const el = document.getElementById("modal-indicador");
        new bootstrap.Modal(el).show();
        el.addEventListener("hidden.bs.modal", () => {
            edicao = null;
            render();
        }, { once: true });
    }
}

function lerModal() {
    const v = (id) => document.getElementById(id).value;
    return {
        ...edicao.indicador,
        nome: v("i-nome").trim(),
        descricao: v("i-descricao").trim(),
        unidade: v("i-unidade").trim(),
        formula: v("i-formula").trim(),
        fonte: v("i-fonte").trim(),
        periodicidade: v("i-periodicidade"),
        valorReferencia: v("i-valor").trim(),
        anoReferencia: v("i-ano").trim(),
        polaridade: v("i-polaridade"),
        metas: Object.fromEntries(ANOS.map((a) => [a, document.getElementById(`i-meta-${a}`).value.trim()])),
    };
}

document.addEventListener("click", (e) => {
    const nova = e.target.closest("[data-nova-ini]");
    if (nova) {
        const ini = estado.iniciativas.find((i) => i.id === nova.dataset.novaIni);
        edicao = { iniciativa: ini, indicador: novoIndicador(), novo: true };
        return render();
    }

    const editar = e.target.closest("[data-editar]");
    if (editar) {
        const [iniId, indId] = editar.dataset.editar.split(":");
        const ini = estado.iniciativas.find((i) => i.id === iniId);
        edicao = { iniciativa: ini, indicador: (ini.indicadores ?? []).find((x) => x.id === indId), novo: false };
        return render();
    }

    if (e.target.closest("#salvar-ind")) {
        const dados = lerModal();
        if (!dados.nome) {
            alert("Informe o nome do indicador.");
            return;
        }
        const ini = edicao.iniciativa;
        const atuais = [...(ini.indicadores ?? [])];
        const idx = atuais.findIndex((x) => x.id === dados.id);
        if (idx >= 0) atuais[idx] = dados;
        else atuais.push(dados);
        updIniciativa(ini.id, { indicadores: atuais });
        bootstrap.Modal.getInstance(document.getElementById("modal-indicador")).hide();
        edicao = null;
        return render();
    }

    if (e.target.closest("#excluir-ind")) {
        const ini = edicao.iniciativa;
        if (!confirm(`Excluir o indicador “${edicao.indicador.nome}”?`)) return;
        updIniciativa(ini.id, { indicadores: (ini.indicadores ?? []).filter((x) => x.id !== edicao.indicador.id) });
        bootstrap.Modal.getInstance(document.getElementById("modal-indicador")).hide();
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
    const id = e.target.id;
    if (id === "nivel") nivel = e.target.value;
    else if (id === "eixo") {
        eixo = e.target.value;
        objetivo = "todos";
    } else if (id === "objetivo") objetivo = e.target.value;
    else return;
    render();
});

render();
