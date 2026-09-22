/**
 * PPA — Administração.
 *
 * Lista os planos e leva às telas de criar e editar, que vivem em
 * `central-ppa/criar.html` e `central-ppa/editar.html`.
 */
import { obterEstado, situacaoPpa } from "../dados/store.js";
import { montarShell, cabecalhoPagina, somenteLeitura, perfilAtual, url } from "../shell.js";
import { esc, chip } from "../ui.js";

const { estado } = montarShell();

/**
 * O cadastro do PPA é exclusivo do Administrador central. Os demais perfis
 * enxergam o plano — precisam dele para se situar — mas não o criam nem o
 * alteram: abrir o ciclo é ato da administração do plano.
 */
const leitura = somenteLeitura() || perfilAtual() !== "admin-central";

let busca = "";

function render() {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    const ppas = [...estado.ppas]
        .filter(
            (p) =>
                !termo ||
                p.nome.toLocaleLowerCase("pt-BR").includes(termo) ||
                (p.descricao ?? "").toLocaleLowerCase("pt-BR").includes(termo) ||
                `${p.primeiroAno}-${p.ultimoAno}`.includes(termo)
        )
        .sort((a, b) => Number(b.primeiroAno) - Number(a.primeiroAno));

    document.getElementById("conteudo").innerHTML = `
    ${cabecalhoPagina(
        "Cadastro de Planos Plurianuais",
        "Planos plurianuais cadastrados no sistema.",
        `
        <div class="app-search">
            <input type="search" id="busca" class="form-control form-control-sm" placeholder="Buscar" value="${esc(busca)}" />
            <i class="ti ti-search app-search-icon text-muted"></i>
        </div>
        ${
            leitura
                ? `<span class="fs-12 text-muted">O cadastro do PPA é exclusivo do Administrador central.</span>`
                : `<a href="${url("central-ppa/criar.html")}" class="btn btn-sm btn-primary">
                <i class="ti ti-plus me-1"></i>Novo PPA
            </a>`
        }`
    )}

    <div class="card">
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th style="width:20rem">Plano</th>
                        <th style="width:9rem">Vigência</th>
                        <th style="width:12rem">Processo SEI</th>
                        <th style="width:11rem">Situação</th>
                        <th>Descrição</th>
                        <th style="width:7rem">Ações</th>
                    </tr>
                </thead>
                <tbody>
                ${
                    ppas.length === 0
                        ? `<tr><td colspan="6" class="text-center text-muted py-4 fs-12">${
                              estado.ppas.length === 0
                                  ? "Nenhum plano cadastrado. Comece por “Novo PPA”."
                                  : "Nenhum plano corresponde à busca."
                          }</td></tr>`
                        : ppas
                              .map(
                                  (p) => `
                    <tr>
                        <td class="fw-medium">${esc(p.nome)}</td>
                        <td class="codigo">${esc(p.primeiroAno)}–${esc(p.ultimoAno)}</td>
                        <td class="codigo fs-13">${p.processoSei ? esc(p.processoSei) : '<span class="text-muted">—</span>'}</td>
                        <td>${chip(situacaoPpa(p.situacao).rotulo, situacaoPpa(p.situacao).tom)}</td>
                        <td class="fs-13 text-muted">${esc(p.descricao || "—")}</td>
                        <td>
                            <a href="${url(`central-ppa/editar.html?id=${encodeURIComponent(p.id)}`)}"
                               class="btn btn-sm ${leitura ? "btn-light" : "btn-outline-primary"}">
                                ${leitura ? "Ver" : "Editar"}
                            </a>
                        </td>
                    </tr>`
                              )
                              .join("")
                }
                </tbody>
            </table>
        </div>
    </div>`;
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

render();
