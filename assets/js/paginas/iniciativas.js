/**
 * Iniciativas do órgão — listagem.
 * Porta `iniciativas.tsx`.
 */
import { obterEstado } from "../dados/store.js";
import {
    eixos,
    objetivos,
    entregasDaIniciativa,
    pendenciasIniciativa,
    resumoPendencias,
    recursosDaIniciativa,
    moedaCurta,
    STATUS_CURTO,
} from "../dados/regras.js";
import { montarShell, cabecalhoPagina } from "../shell.js";
import { statusChip, esc, faixaIndicadores } from "../ui.js";
import { chipsPendencias } from "../ui-financeiro.js";

const { estado } = montarShell();
const orgao = estado.orgaoAtual;

let busca = "";
let eixo = "todos";
let objetivo = "todos";
let status = "todos";

function linhas() {
    const q = busca.trim().toLowerCase();

    return estado.iniciativas
        .filter((i) => i.orgao === orgao)
        .map((i) => {
            const p = estado.programas.find((x) => x.id === i.programaId);
            return {
                ini: i,
                programa: p,
                entregas: entregasDaIniciativa(estado, i.id).length,
                resumo: resumoPendencias(pendenciasIniciativa(estado, i)),
                previsto: recursosDaIniciativa(estado, i.id),
            };
        })
        .filter((l) => {
            if (q && !l.ini.nome.toLowerCase().includes(q)) return false;
            if (eixo !== "todos" && l.programa?.eixo !== eixo) return false;
            if (objetivo !== "todos" && l.programa?.objetivoEstrategico !== objetivo) return false;
            if (status !== "todos" && l.ini.status !== status) return false;
            return true;
        });
}

function render() {
    const ls = linhas();
    const conta = (s) => ls.filter((l) => l.ini.status === s).length;

    document.getElementById("conteudo").innerHTML = `
    ${cabecalhoPagina(
        "Iniciativas",
        `Contribuições de ${esc(orgao)} ao PPA 2028–2031.`,
        `
        <div class="app-search">
            <input type="search" id="busca" class="form-control form-control-sm" placeholder="Buscar Iniciativa" value="${esc(busca)}" />
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
        <select class="form-select form-select-sm" id="status">
            <option value="todos">Todos os status</option>
            ${Object.entries(STATUS_CURTO)
                .map(([k, v]) => `<option value="${k}"${k === status ? " selected" : ""}>${esc(v)}</option>`)
                .join("")}
        </select>`
    )}
    ${faixaIndicadores([
        { valor: ls.length, rotulo: "Iniciativas" },
        { valor: conta("em_preenchimento"), rotulo: "Em preenchimento" },
        { valor: conta("devolvida"), rotulo: "Devolvidas" },
        { valor: conta("enviada") + conta("em_analise"), rotulo: "Em análise" },
        { valor: conta("validada"), rotulo: "Validadas" },
        { valor: moedaCurta(ls.reduce((s, l) => s + l.previsto, 0)), rotulo: "Previsto" },
    ])}
    <div class="card">
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th>Iniciativa</th>
                        <th style="width:16rem">Programa</th>
                        <th style="width:11rem">Status</th>
                        <th class="num" style="width:6rem">Entregas</th>
                        <th style="width:14rem">Pendências</th>
                        <th class="num" style="width:8rem">Previsto</th>
                        <th style="width:8rem">Atualização</th>
                        <th style="width:6rem">Ações</th>
                    </tr>
                </thead>
                <tbody>
                ${
                    ls.length === 0
                        ? '<tr><td colspan="8" class="text-center text-muted py-4 fs-12">Nenhuma Iniciativa corresponde ao filtro. Crie a primeira a partir de um Programa.</td></tr>'
                        : ls
                              .map(
                                  (l) => `
                    <tr>
                        <td><a href="iniciativa.html?id=${l.ini.id}" class="fw-medium">${esc(l.ini.nome)}</a></td>
                        <td class="fs-12 text-muted">${esc(l.programa?.nome ?? "—")}</td>
                        <td>${statusChip(l.ini.status)}</td>
                        <td class="num">${l.entregas || "—"}</td>
                        <td>${chipsPendencias(l.resumo)}</td>
                        <td class="num">${l.previsto ? moedaCurta(l.previsto) : "—"}</td>
                        <td class="fs-12 text-muted">${esc(l.ini.atualizadoEm)}</td>
                        <td><a href="iniciativa.html?id=${l.ini.id}" class="btn btn-sm btn-outline-primary">Abrir</a></td>
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
    else if (id === "status") status = e.target.value;
    else return;
    render();
});

render();
