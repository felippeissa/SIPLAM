/**
 * Visão de um PPA — no desenho da página de detalhe de projeto do Inspinia.
 *
 * A coluna principal descreve o plano e traz as abas com o que o compõe:
 * Programas, Eixos e Objetivos estratégicos. A lateral traz a situação, a
 * equipe e os documentos. Só leitura: editar o plano é no cadastro.
 */
import { situacaoPpa, ppaCorrente, updPpa } from "../dados/store.js";
import { recursosDaIniciativa, moeda } from "../dados/regras.js";
import { montarShell, barraTitulo, somenteLeitura, url } from "../shell.js";
import { esc, chip } from "../ui.js";
import { tamanhoLegivel, nomeDoPerfil } from "../usuarios-decisao.js";

const { estado } = montarShell();
// Sem `?id=` — a Home aberta pelo menu — vale o plano escolhido.
const leitura = somenteLeitura();
const id = new URLSearchParams(location.search).get("id") ?? ppaCorrente(estado)?.id;
const ppa = (estado.ppas ?? []).find((p) => p.id === id);
const voltar = url("perfil.html");

if (!ppa) {
    document.getElementById("conteudo").innerHTML = `
    <div class="my-4"><div class="alert alert-warning py-3 px-3">Este PPA não existe.
        <a href="${voltar}" class="fw-semibold">Escolher outro plano</a>.</div></div>`;
} else {
    render();
}

function render() {
    const s = situacaoPpa(ppa.situacao);
    const doPlano = (r) => r.ppaId === ppa.id;
    const programas = estado.programas.filter(doPlano);
    const eixos = estado.eixos.filter(doPlano);
    const objetivos = estado.objetivos.filter(doPlano);
    const iniciativasDo = (pid) => estado.iniciativas.filter((i) => i.programaId === pid);
    const previstoDo = (pid) => iniciativasDo(pid).reduce((t, i) => t + recursosDaIniciativa(estado, i.id), 0);
    const total = programas.reduce((t, p) => t + previstoDo(p.id), 0);

    // A equipe do plano: a que foi montada na edição ou, enquanto ninguém a montou,
    // quem tem acesso aprovado na Área Central.
    const aprovados = (estado.usuarios ?? []).filter((u) => u.situacao === "aprovado");
    const doPerfil = (u) => (u.perfis ?? []).map(nomeDoPerfil).join(", ") || "Sem perfil";
    const equipe = ppa.equipe
        ? ppa.equipe.map((m) => ({ u: aprovados.find((u) => u.id === m.id), funcao: m.funcao })).filter((m) => m.u)
        : aprovados
              .filter((u) => (u.perfis ?? []).some((f) => f === "admin-central" || f === "gestao-central"))
              .map((u) => ({ u, funcao: doPerfil(u) }));

    const vazio = (t) => `<p class="text-muted fs-13 mb-0 py-3">${t}</p>`;
    // A última coluna é o lápis: leva à tela de edição do registro. Quem só consulta não a vê.
    const editar = (pasta, rid) =>
        leitura
            ? ""
            : `<td class="text-end coluna-acoes"><a href="${url(`${pasta}/editar.html?id=${encodeURIComponent(rid)}`)}" class="btn btn-sm btn-icon btn-default" title="Editar" aria-label="Editar"><i class="ti ti-pencil text-muted fs-lg"></i></a></td>`;
    const tabela = (cab, linhas, semDados) =>
        linhas.length
            ? `<div class="table-responsive"><table class="table table-sm align-middle mb-0">
                <thead><tr>${cab.map((c, i) => `<th${i ? ' class="text-end"' : ""}>${c}</th>`).join("")}${leitura ? "" : '<th class="text-end coluna-acoes" style="width:4rem">Ações</th>'}</tr></thead>
                <tbody>${linhas.join("")}</tbody></table></div>`
            : vazio(semDados);

    const abaProgramas = tabela(
        ["Programa", "Eixo", "Iniciativas", "Previsto"],
        programas.map(
            (p) => `<tr><td><span class="fw-medium">${esc(p.nome)}</span><span class="d-block fs-12 text-muted">${esc(p.codigo ?? "")}</span></td>
            <td class="text-end">${esc(p.eixo || "—")}</td><td class="text-end">${iniciativasDo(p.id).length}</td><td class="text-end">${moeda(previstoDo(p.id))}</td>${editar("central-programas", p.id)}</tr>`
        ),
        "Este plano ainda não tem Programas."
    );
    const abaEixos = tabela(
        ["Eixo", "Programas"],
        eixos.map(
            (e) => `<tr><td><span class="fw-medium">${esc(e.nome)}</span><span class="d-block fs-12 text-muted">${esc(e.descricao ?? "")}</span></td>
            <td class="text-end">${programas.filter((p) => p.eixo === e.nome).length}</td>${editar("central-eixo", e.id)}</tr>`
        ),
        "Este plano ainda não tem Eixos."
    );
    const abaObjetivos = tabela(
        ["Objetivo estratégico", "Programas"],
        objetivos.map(
            (o) => `<tr><td class="fw-medium">${esc(o.nome)}</td>
            <td class="text-end">${programas.filter((p) => p.objetivoEstrategico === o.nome).length}</td>${editar("central-objetivo", o.id)}</tr>`
        ),
        "Este plano ainda não tem Objetivos estratégicos."
    );

    // Os demais cadastros do plano: só o nome e, quando há, a descrição.
    const simples = (lista, rotulo, semDados, pasta) =>
        tabela(
            [rotulo],
            lista.map(
                (r) => `<tr><td><span class="fw-medium">${esc(r.nome ?? r.titulo ?? "—")}</span><span class="d-block fs-12 text-muted">${esc(r.descricao ?? r.justificativa ?? "")}</span></td>${editar(pasta, r.id)}</tr>`
            ),
            semDados
        );
    const causas = (estado.causas ?? []).filter(doPlano);
    const problemas = (estado.problemas ?? []).filter(doPlano);
    // Indicador não nasce com o plano: chega a ele pelos Programas que o usam.
    const usados = new Set(programas.flatMap((p) => p.indicadorIds ?? []));
    const indicadores = (estado.indicadores ?? []).filter((i) => doPlano(i) || usados.has(i.id));

    // Cada aba tem o seu filtro: busca por texto e, nos Programas, também por eixo.
    const eixosDosProgramas = [...new Set(programas.map((p) => p.eixo).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
    const filtroDaAba = (idAba) => `
        <div class="filtros mb-3" data-filtros="${idAba}">
            <div class="d-flex flex-wrap align-items-center gap-2">
                <div class="filtro-campo">
                    <div class="app-search">
                        <input type="search" class="form-control" data-busca placeholder="Buscar" aria-label="Buscar nesta aba" />
                        <i class="ti ti-search app-search-icon text-muted"></i>
                    </div>
                </div>
                ${
                    idAba === "t-programas"
                        ? `<div class="filtro-campo">
                    <div class="app-search">
                        <select class="form-select form-control" data-eixo aria-label="Filtrar por eixo">
                            <option value="">Eixo</option>
                            ${eixosDosProgramas.map((e) => `<option value="${esc(e)}">${esc(e)}</option>`).join("")}
                        </select>
                        <i class="ti ti-layout-grid app-search-icon text-muted"></i>
                    </div>
                </div>`
                        : ""
                }
                <div class="filtro-botoes d-flex align-items-center gap-2">
                    <div class="dropdown">
                        <button class="btn btn-default dropdown-toggle drop-arrow-none" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="ti ti-download me-1"></i> Exportar <i class="ti ti-chevron-down align-middle ms-1"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><button class="dropdown-item" type="button" data-exportar="csv">Exportar como CSV</button></li>
                            <li><button class="dropdown-item" type="button" data-exportar="xls">Exportar como Excel</button></li>
                        </ul>
                    </div>
                    <button type="button" class="btn btn-light" data-limpar>Limpar</button>
                    <button type="button" class="btn btn-primary" data-buscar><i class="ti ti-search me-1"></i>Buscar</button>
                </div>
            </div>
        </div>`;

    const aba = (idAba, icone, rotulo, n, ativa) => `
        <li class="nav-item"><a class="nav-link${ativa ? " active" : ""}" data-bs-toggle="tab" href="#${idAba}" role="tab">
            <i class="ti ${icone} fs-lg me-md-1 align-middle"></i>
            <span class="d-none d-md-inline-block align-middle">${rotulo} (${n})</span></a></li>`;

    const meta = (r, v) => `<div class="col-md-4 col-xl-3"><h6 class="mb-1 text-muted text-uppercase">${r}</h6><p class="fw-medium mb-0">${v}</p></div>`;

    document.getElementById("conteudo").innerHTML = `
    ${barraTitulo("Home", [])}
    <div class="row g-0">
        <div class="col-xl-9">
            <div class="card card-h-100 rounded-0 rounded-start">
                <div class="card-header align-items-start p-4">
                    <div class="avatar-xxl me-3"><span class="avatar-title text-bg-light rounded fs-2 fw-semibold">${esc(ppa.primeiroAno)}</span></div>
                    <div>
                        <h3 class="mb-1 fs-xl">${esc(ppa.nome)}</h3>
                        <p class="text-muted mb-2 fs-xxs">${esc(ppa.primeiroAno)}–${esc(ppa.ultimoAno)}</p>
                        ${chip(s.rotulo, s.tom)}
                    </div>
                    <div class="ms-auto d-flex gap-2">
                        ${
                            leitura
                                ? ""
                                : `<div class="dropdown">
                            <button type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-plus me-1"></i>Adicionar</button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                ${[
                                    ["central-programas", "Programa", "ti-stack-2"],
                                    ["central-eixo", "Eixo", "ti-layout-grid"],
                                    ["central-objetivo", "Objetivo estratégico", "ti-target"],
                                    ["central-causa", "Causa", "ti-git-branch"],
                                    ["central-indicador", "Indicador", "ti-chart-line"],
                                    ["central-problema", "Problema", "ti-alert-triangle"],
                                ]
                                    .map(([pasta, nome, icone]) => `<li><a class="dropdown-item" href="${url(`${pasta}/criar.html`)}"><i class="ti ${icone} me-2"></i>${nome}</a></li>`)
                                    .join("")}
                            </ul>
                        </div>`
                        }
                        <a href="${url(`central-ppa/editar.html?id=${encodeURIComponent(ppa.id)}`)}" class="btn btn-light"><i class="ti ti-pencil me-1"></i>Editar</a>
                    </div>
                </div>
                <div class="card-body px-4">
                    <div class="mb-4">
                        <h5 class="fs-base mb-2">Descrição:</h5>
                        ${(ppa.descricao ?? "").split("\n\n").map((t) => `<p class="text-muted">${esc(t)}</p>`).join("") || vazio("Sem descrição.")}
                    </div>
                    <div class="row mb-4 gy-3">
                        ${meta("Vigência", `${esc(ppa.primeiroAno)}–${esc(ppa.ultimoAno)}`)}
                        ${meta("Processo SEI", esc(ppa.processoSei || "—"))}
                        ${meta("Valor previsto", moeda(total))}
                        ${meta("Programas", programas.length)}
                    </div>
                    <ul class="nav nav-tabs nav-bordered mb-3" role="tablist">
                        ${aba("t-programas", "ti-stack-2", "Programas", programas.length, true)}
                        ${aba("t-eixos", "ti-layout-grid", "Eixos", eixos.length)}
                        ${aba("t-objetivos", "ti-target", "Objetivos estratégicos", objetivos.length)}
                        ${aba("t-causas", "ti-git-branch", "Causas", causas.length)}
                        ${aba("t-indicadores", "ti-chart-line", "Indicadores", indicadores.length)}
                        ${aba("t-problemas", "ti-alert-triangle", "Problemas", problemas.length)}
                    </ul>
                    <div class="tab-content">
                        <div class="tab-pane fade active show" id="t-programas" role="tabpanel">${filtroDaAba("t-programas")}${abaProgramas}</div>
                        <div class="tab-pane fade" id="t-eixos" role="tabpanel">${filtroDaAba("t-eixos")}${abaEixos}</div>
                        <div class="tab-pane fade" id="t-objetivos" role="tabpanel">${filtroDaAba("t-objetivos")}${abaObjetivos}</div>
                        <div class="tab-pane fade" id="t-causas" role="tabpanel">${filtroDaAba("t-causas")}${simples(causas, "Causa", "Este plano ainda não tem Causas.", "central-causa")}</div>
                        <div class="tab-pane fade" id="t-indicadores" role="tabpanel">${filtroDaAba("t-indicadores")}${simples(indicadores, "Indicador", "Este plano ainda não tem Indicadores.", "central-indicador")}</div>
                        <div class="tab-pane fade" id="t-problemas" role="tabpanel">${filtroDaAba("t-problemas")}${simples(problemas, "Problema", "Este plano ainda não tem Problemas.", "central-problema")}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-xl-3">
            <div class="card card-h-100 rounded-0 rounded-end">
                <div class="card-body p-0">
                    <div class="p-3 border-bottom border-dashed">
                        <h5 class="mb-2">Situação</h5>
                        <input type="text" class="form-control" value="${esc(s.rotulo)}" disabled />
                    </div>
                    <div class="p-3 border-bottom border-dashed">
                        <div class="d-flex mb-3 justify-content-between align-items-center">
                            <h5 class="mb-0">Equipe:</h5>
                            ${leitura ? "" : `<a href="${url(`ppa-equipe.html?id=${encodeURIComponent(ppa.id)}`)}" class="btn btn-light btn-sm btn-icon rounded-circle" title="Editar equipe" aria-label="Editar equipe"><i class="ti ti-pencil"></i></a>`}
                        </div>
                        ${
                            equipe
                                .map(
                                    ({ u, funcao }) => `
                        <div class="d-flex align-items-center gap-2 py-1">
                            <div class="avatar avatar-sm"><span class="avatar-title rounded-circle text-bg-primary">${esc(u.nome.charAt(0))}</span></div>
                            <div><h5 class="mb-0 lh-base fs-13">${esc(u.nome)}</h5><p class="text-muted fs-xxs mb-0">${esc(funcao)}</p></div>
                        </div>`
                                )
                                .join("") || vazio("Ninguém na equipe.")
                        }
                    </div>
                    <div class="p-3">
                        <div class="d-flex mb-3 justify-content-between align-items-center">
                            <h5 class="mb-0">Documentos:</h5>
                            ${
                                leitura
                                    ? ""
                                    : `<button type="button" class="btn btn-light btn-sm btn-icon rounded-circle" id="add-documento" title="Adicionar documento" aria-label="Adicionar documento"><i class="ti ti-plus"></i></button>
                            <input type="file" id="arquivo-documento" class="d-none" multiple />`
                            }
                        </div>
                        ${[
                            ...(ppa.processoSei ? [{ nome: "Processo SEI", detalhe: ppa.processoSei }] : []),
                            ...(ppa.documentos ?? []).map((d) => ({ nome: d.nome, detalhe: `${tamanhoLegivel(d.tamanho)} · ${d.em}` })),
                        ]
                            .map(
                                (d) => `<div class="d-flex align-items-center gap-2 border border-dashed rounded p-2 mb-2">
                            <i class="ti ti-file-text fs-xl text-muted"></i>
                            <div class="text-truncate"><div class="fs-13 fw-medium text-truncate">${esc(d.nome)}</div><div class="fs-xxs text-muted">${esc(d.detalhe)}</div></div></div>`
                            )
                            .join("") || vazio("Nenhum documento.")}
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    // Documentos do plano: guarda o nome e o tamanho; o arquivo em si não sai do navegador.
    const seletor = document.getElementById("arquivo-documento");
    document.getElementById("add-documento")?.addEventListener("click", () => seletor.click());
    seletor?.addEventListener("change", () => {
        const novos = [...seletor.files].map((f) => ({ nome: f.name, tamanho: f.size, em: new Date().toLocaleDateString("pt-BR") }));
        if (!novos.length) return;
        updPpa(ppa.id, { documentos: [...(ppa.documentos ?? []), ...novos] });
        render();
    });

    // Exporta o que a aba mostra agora — as linhas que passaram pelo filtro.
    function exportarAba(painel, idAba, formato) {
        const tabela = painel.querySelector("table");
        if (!tabela) return;
        const texto = (cs) => [...cs].filter((c) => !c.classList.contains("coluna-acoes")).map((c) => c.textContent.replace(/\s+/g, " ").trim());
        const cabecalho = texto(tabela.querySelectorAll("thead th"));
        const linhas = [...tabela.querySelectorAll("tbody tr:not(.d-none):not([data-vazio])")].map((tr) => texto(tr.querySelectorAll("td")));
        const nome = `ppa-${ppa.primeiroAno}-${ppa.ultimoAno}-${idAba.replace("t-", "")}-${new Date().toISOString().slice(0, 10)}`;
        const baixar = (arquivo, conteudo, tipo) => {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
            link.download = arquivo;
            link.click();
            URL.revokeObjectURL(link.href);
        };
        if (formato === "csv") {
            const linha = (cs) => cs.map((c) => `"${c.replace(/"/g, '""')}"`).join(";");
            baixar(`${nome}.csv`, String.fromCharCode(0xfeff) + [cabecalho, ...linhas].map(linha).join(String.fromCharCode(13, 10)), "text/csv;charset=utf-8");
            return;
        }
        const cela = (v, tag) => `<${tag}>${esc(v)}</${tag}>`;
        baixar(
            `${nome}.xls`,
            `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8" /></head><body><table><thead><tr>${cabecalho.map((c) => cela(c, "th")).join("")}</tr></thead><tbody>${linhas.map((cs) => `<tr>${cs.map((c) => cela(c, "td")).join("")}</tr>`).join("")}</tbody></table></body></html>`,
            "application/vnd.ms-excel;charset=utf-8"
        );
    }

    // Filtros das abas: escondem as linhas que não casam e avisam quando nenhuma casa.
    const norm = (v) => String(v ?? "").toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[̀-ͯ]/g, "");
    document.querySelectorAll("[data-filtros]").forEach((barra) => {
        const painel = barra.closest(".tab-pane");
        const aplicar = () => {
            const termo = norm(barra.querySelector("[data-busca]").value).trim();
            const eixo = barra.querySelector("[data-eixo]")?.value ?? "";
            let visiveis = 0;
            painel.querySelectorAll("tbody tr").forEach((tr) => {
                if (tr.dataset.vazio) return;
                const ok = (!termo || norm(tr.textContent).includes(termo)) && (!eixo || tr.cells[1]?.textContent.trim() === eixo);
                tr.classList.toggle("d-none", !ok);
                if (ok) visiveis++;
            });
            painel.querySelector("[data-vazio]")?.remove();
            const corpo = painel.querySelector("tbody");
            if (corpo && !visiveis) {
                corpo.insertAdjacentHTML("beforeend", `<tr data-vazio="1"><td colspan="${painel.querySelectorAll("thead th").length}" class="text-center text-muted py-4 fs-12">Nada encontrado para este filtro.</td></tr>`);
            }
        };
        barra.querySelector("[data-buscar]").addEventListener("click", aplicar);
        barra.querySelector("[data-busca]").addEventListener("keydown", (e) => {
            if (e.key === "Enter") aplicar();
        });
        barra.querySelector("[data-limpar]").addEventListener("click", () => {
            barra.querySelector("[data-busca]").value = "";
            const eixo = barra.querySelector("[data-eixo]");
            if (eixo) eixo.value = "";
            aplicar();
        });
        barra.querySelectorAll("[data-exportar]").forEach((b) =>
            b.addEventListener("click", () => exportarAba(painel, barra.dataset.filtros, b.dataset.exportar))
        );
    });
}
