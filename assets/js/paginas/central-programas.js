/**
 * Cadastro de Programa — Área Central.
 *
 * Lista os Programas e leva às telas de criar e editar, que vivem em
 * `central-programas/criar.html` e `central-programas/editar.html`.
 */
import { obterEstado, ppaCorrente } from "../dados/store.js";
import { APTIDAO_LABEL, DISPONIBILIZACAO_LABEL, eixos, objetivos } from "../dados/regras.js";
import { montarShell, cabecalhoPagina, somenteLeitura, url } from "../shell.js";
import { chip, esc, faixaIndicadores } from "../ui.js";

const { estado } = montarShell();
const leitura = somenteLeitura();

// Um PPA por vez: só os Programas do plano escolhido no cabeçalho. Programa sem
// `ppaId` é anterior ao vínculo e continua visível.
const plano = ppaCorrente(estado);
const doPlano = (p) => !p.ppaId || !plano || p.ppaId === plano.id;
const programasDoPlano = () => estado.programas.filter(doPlano);

let busca = "";
let eixo = "todos";
let objetivo = "todos";

/** O que falta para o Programa poder ser oferecido aos órgãos. */
function faltaParaDisponibilizar(p) {
    const falta = [];
    if (!p.problema?.trim()) falta.push("problema central");
    if (!p.objetivo?.trim()) falta.push("objetivo");
    if ((p.causas ?? []).length === 0) falta.push("causas");
    if ((p.indicadores ?? []).length === 0) falta.push("indicadores de resultado");
    return falta;
}

function contribuicoes(programaId) {
    return estado.iniciativas.filter((i) => i.programaId === programaId).length;
}

function linhas() {
    const q = busca.trim().toLowerCase();
    return programasDoPlano().filter((p) => {
        if (q && !p.nome.toLowerCase().includes(q) && !p.codigo.includes(q)) return false;
        if (eixo !== "todos" && p.eixo !== eixo) return false;
        if (objetivo !== "todos" && p.objetivoEstrategico !== objetivo) return false;
        return true;
    });
}

function render() {
    const ls = linhas();
    const aptos = ls.filter((p) => p.aptidao === "apto").length;
    const disponiveis = ls.filter((p) => p.disponibilizacao === "disponivel").length;
    const incompletos = ls.filter((p) => faltaParaDisponibilizar(p).length > 0).length;

    document.getElementById("conteudo").innerHTML = `
    ${cabecalhoPagina(
        "Cadastro de Programa",
        "Diagnóstico, aptidão e disponibilização dos Programas aos órgãos.",
        `
        <div class="app-search">
            <input type="search" id="busca" class="form-control form-control-sm" placeholder="Buscar Programa" value="${esc(busca)}" />
            <i class="ti ti-search app-search-icon text-muted"></i>
        </div>
        <select class="form-select form-select-sm" id="eixo">
            <option value="todos">Todos os Eixos</option>
            ${eixos(programasDoPlano()).map((e) => `<option value="${esc(e)}"${e === eixo ? " selected" : ""}>${esc(e)}</option>`).join("")}
        </select>
        <select class="form-select form-select-sm" id="objetivo">
            <option value="todos">Todos os Objetivos</option>
            ${objetivos(programasDoPlano(), eixo).map((o) => `<option value="${esc(o)}"${o === objetivo ? " selected" : ""}>${esc(o)}</option>`).join("")}
        </select>
        ${leitura ? "" : `<a href="${url("central-programas/criar.html")}" class="btn btn-sm btn-primary"><i class="ti ti-plus me-1"></i>Novo Programa</a>`}`
    )}
    ${faixaIndicadores(
        [
            { valor: ls.length, rotulo: "Programas" },
            { valor: aptos, rotulo: "Aptos" },
            { valor: disponiveis, rotulo: "Disponíveis aos órgãos" },
            { valor: incompletos, rotulo: "Com diagnóstico incompleto" },
            { valor: estado.iniciativas.filter((i) => programasDoPlano().some((p) => p.id === i.programaId)).length, rotulo: "Iniciativas recebidas" },
        ],
        "Um Programa sem causas cadastradas impede o órgão de concluir qualquer Iniciativa nele."
    )}
    <div class="card">
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th style="width:5rem">Código</th>
                        <th>Programa</th>
                        <th class="num" style="width:6rem">Causas</th>
                        <th class="num" style="width:7rem">Iniciativas</th>
                        <th style="width:11rem">Aptidão</th>
                        <th style="width:14rem">Disponibilização</th>
                        <th style="width:7rem">Ações</th>
                    </tr>
                </thead>
                <tbody>
                ${
                    ls.length === 0
                        ? '<tr><td colspan="7" class="text-center text-muted py-4 fs-12">Nenhum Programa corresponde ao filtro.</td></tr>'
                        : ls
                              .map((p) => {
                                  const falta = faltaParaDisponibilizar(p);
                                  return `
                    <tr>
                        <td class="codigo text-muted">${esc(p.codigo)}</td>
                        <td>
                            <a href="${url(`programa.html?id=${p.id}`)}" class="fw-medium">${esc(p.nome)}</a>
                            <div class="fs-12 text-muted">${esc(p.eixo)}</div>
                            ${falta.length ? `<div class="fs-12 text-warning mt-1">Falta: ${esc(falta.join(", "))}</div>` : ""}
                        </td>
                        <td class="num">${(p.causas ?? []).length || chip("0", "alerta")}</td>
                        <td class="num">${contribuicoes(p.id) || "—"}</td>
                        <td>${chip(APTIDAO_LABEL[p.aptidao ?? "incompleto"], p.aptidao === "apto" ? "ok" : "alerta")}</td>
                        <td>${chip(DISPONIBILIZACAO_LABEL[p.disponibilizacao ?? "em_estruturacao"], p.disponibilizacao === "disponivel" ? "ok" : "neutro")}</td>
                        <td>${
                            leitura
                                ? `<a href="${url(`programa.html?id=${p.id}`)}" class="btn btn-sm btn-light">Ver</a>`
                                : `<a href="${url(`central-programas/editar.html?id=${p.id}`)}" class="btn btn-sm btn-outline-primary">Editar</a>`
                        }</td>
                    </tr>`;
                              })
                              .join("")
                }
                </tbody>
            </table>
        </div>
    </div>`;

    document.getElementById("busca").value = busca;
}

document.addEventListener("input", (e) => {
    if (e.target.id !== "busca") return;
    busca = e.target.value;
    render();
    // O campo é recriado a cada tecla: sem devolver o cursor ao fim, o texto
    // digitado sai embaralhado.
    const campo = document.getElementById("busca");
    campo.focus();
    campo.setSelectionRange(campo.value.length, campo.value.length);
});

document.addEventListener("change", (e) => {
    if (e.target.id === "eixo") {
        eixo = e.target.value;
        objetivo = "todos";
        render();
    } else if (e.target.id === "objetivo") {
        objetivo = e.target.value;
        render();
    }
});

render();

