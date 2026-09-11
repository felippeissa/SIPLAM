/**
 * Entregas do órgão — listagem.
 * Porta `entregas.tsx`.
 */
import { obterEstado } from "../dados/store.js";
import { ANOS } from "../dados/seed.js";
import {
    eixos,
    objetivos,
    situacaoEntrega,
    recursosDaEntrega,
    moedaCurta,
    TERRITORIO_LABEL,
} from "../dados/regras.js";
import { acoesDaEntrega } from "../dados/financeiro.js";
import { montarShell, cabecalhoPagina } from "../shell.js";
import { chip, esc, faixaIndicadores } from "../ui.js";

const { estado } = montarShell();
const orgao = estado.orgaoAtual;

let busca = "";
let eixo = "todos";
let objetivo = "todos";
let programa = "todos";
let situacao = "todas";

function linhas() {
    const q = busca.trim().toLowerCase();

    return estado.entregas
        .map((e) => {
            const ini = estado.iniciativas.find((i) => i.id === e.iniciativaId);
            const p = ini ? estado.programas.find((x) => x.id === ini.programaId) : null;
            return { entrega: e, ini, programa: p, sit: situacaoEntrega(estado, e) };
        })
        .filter((l) => l.ini && l.ini.orgao === orgao)
        .filter((l) => {
            if (q && !l.entrega.nome.toLowerCase().includes(q)) return false;
            if (eixo !== "todos" && l.programa?.eixo !== eixo) return false;
            if (objetivo !== "todos" && l.programa?.objetivoEstrategico !== objetivo) return false;
            if (programa !== "todos" && l.ini.programaId !== programa) return false;
            if (situacao !== "todas" && l.sit.tom !== situacao) return false;
            return true;
        });
}

function render() {
    const ls = linhas();
    const semMeta = ls.filter((l) => ANOS.some((a) => l.entrega.metas[a] == null)).length;
    const semAcao = ls.filter((l) => acoesDaEntrega(estado, l.entrega.id).length === 0).length;

    document.getElementById("conteudo").innerHTML = `
    ${cabecalhoPagina(
        "Entregas",
        `Produtos que ${esc(orgao)} se compromete a entregar até 2031.`,
        `
        <div class="app-search">
            <input type="search" id="busca" class="form-control form-control-sm" placeholder="Buscar Entrega" value="${esc(busca)}" />
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
        <select class="form-select form-select-sm" id="programa">
            <option value="todos">Todos os Programas</option>
            ${estado.programas.map((p) => `<option value="${p.id}"${p.id === programa ? " selected" : ""}>${esc(p.codigo)} — ${esc(p.nome)}</option>`).join("")}
        </select>
        <select class="form-select form-select-sm" id="situacao">
            <option value="todas">Todas as situações</option>
            <option value="impeditivo"${situacao === "impeditivo" ? " selected" : ""}>Com pendência impeditiva</option>
            <option value="alerta"${situacao === "alerta" ? " selected" : ""}>Com alerta</option>
            <option value="ok"${situacao === "ok" ? " selected" : ""}>Completas</option>
        </select>`
    )}
    ${faixaIndicadores([
        { valor: ls.length, rotulo: "Entregas" },
        { valor: semMeta, rotulo: "Com meta faltando" },
        { valor: semAcao, rotulo: "Sem Ação vinculada" },
        { valor: ls.filter((l) => l.sit.tom === "ok").length, rotulo: "Completas" },
        { valor: moedaCurta(ls.reduce((s, l) => s + recursosDaEntrega(estado, l.entrega.id), 0)), rotulo: "Previsto" },
    ])}
    <div class="card">
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th>Entrega</th>
                        <th style="width:15rem">Iniciativa</th>
                        <th style="width:9rem">Unidade</th>
                        ${ANOS.map((a) => `<th class="num" style="width:4.5rem">${a}</th>`).join("")}
                        <th style="width:12rem">Território</th>
                        <th style="width:12rem">Situação</th>
                        <th class="num" style="width:8rem">Previsto</th>
                        <th style="width:6rem">Ações</th>
                    </tr>
                </thead>
                <tbody>
                ${
                    ls.length === 0
                        ? `<tr><td colspan="${ANOS.length + 7}" class="text-center text-muted py-4 fs-12">Nenhuma Entrega corresponde ao filtro. Crie a primeira dentro de uma Iniciativa.</td></tr>`
                        : ls
                              .map(
                                  (l) => `
                    <tr>
                        <td><a href="entrega.html?id=${l.entrega.id}" class="fw-medium">${esc(l.entrega.nome || "Sem nome")}</a></td>
                        <td class="fs-12 text-muted">${esc(l.ini.nome)}</td>
                        <td class="fs-12">${esc(l.entrega.unidadeMedida || "—")}</td>
                        ${ANOS.map((a) => `<td class="num">${l.entrega.metas[a] ?? '<span class="text-muted">—</span>'}</td>`).join("")}
                        <td class="fs-12">${esc(TERRITORIO_LABEL[l.entrega.territorio.tipo] ?? "—")}</td>
                        <td>${chip(l.sit.texto, l.sit.tom)}</td>
                        <td class="num">${moedaCurta(recursosDaEntrega(estado, l.entrega.id))}</td>
                        <td><a href="entrega.html?id=${l.entrega.id}" class="btn btn-sm btn-outline-primary">Abrir</a></td>
                    </tr>`
                              )
                              .join("")
                }
                </tbody>
            </table>
        </div>
    </div>`;

    document.getElementById("busca").value = busca;
}

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
    if (id === "eixo") {
        eixo = e.target.value;
        objetivo = "todos";
    } else if (id === "objetivo") objetivo = e.target.value;
    else if (id === "programa") programa = e.target.value;
    else if (id === "situacao") situacao = e.target.value;
    else return;
    render();
});

render();
