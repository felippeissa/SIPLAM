/**
 * Ficha do Programa — leitura do diagnóstico definido pela Área Central.
 * Porta `programa.$id.tsx`.
 *
 * Corrige T6.2.7: o protótipo lia o Programa do seed, então edições feitas na
 * Administração não apareciam aqui.
 * Acréscimo T6.2.3.2: marca as causas que o órgão já enfrenta.
 */
import { obterEstado } from "../dados/store.js";
import { iniciativasDoOrgao, entregasDaIniciativa, APTIDAO_LABEL, DISPONIBILIZACAO_LABEL } from "../dados/regras.js";
import { montarShell } from "../shell.js";
import { chip, statusChip, esc, secao, contexto } from "../ui.js";

const { estado } = montarShell();
const id = new URLSearchParams(location.search).get("id");
const p = estado.programas.find((x) => x.id === id);
const central = location.pathname.includes("central");

if (!p) {
    document.getElementById("conteudo").innerHTML = `
    <div class="text-center py-5">
        <h4 class="fw-bold">Programa não encontrado</h4>
        <p class="text-muted">O endereço aponta para um Programa que não existe neste protótipo.</p>
        <a href="programas.html" class="btn btn-primary">Voltar aos Programas</a>
    </div>`;
} else {
    const orgao = estado.orgaoAtual;
    const inis = iniciativasDoOrgao(estado, p.id, orgao);
    const causasDoOrgao = new Set(inis.flatMap((i) => i.causas));

    const lista = (itens, vazio) =>
        itens?.length
            ? `<ul class="mb-0">${itens.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`
            : `<p class="fs-12 text-muted mb-0">${vazio}</p>`;

    document.getElementById("conteudo").innerHTML = `
    <div class="my-3">
        ${contexto([{ rotulo: "Programas", href: "programas.html" }, { rotulo: `${p.codigo} — ${p.nome}` }])}
        <div class="d-flex flex-wrap align-items-start justify-content-between gap-3">
            <div>
                <h4 class="fw-bold mb-1">${esc(p.nome)}</h4>
                <div class="d-flex flex-wrap align-items-center gap-2 fs-13 text-muted">
                    <span class="codigo">${esc(p.codigo)}</span>
                    <span>·</span>
                    <span>${esc(p.eixo)}</span>
                    ${chip(APTIDAO_LABEL[p.aptidao ?? "incompleto"], p.aptidao === "apto" ? "ok" : "alerta")}
                    ${chip(DISPONIBILIZACAO_LABEL[p.disponibilizacao ?? "em_estruturacao"], p.disponibilizacao === "disponivel" ? "ok" : "neutro")}
                </div>
            </div>
        </div>
        <p class="fs-13 text-muted mt-2 mb-0">${esc(p.objetivoEstrategico)}</p>
    </div>

    <div class="row g-3">
        <div class="col-xl-7">
            ${secao(
                "Problema central",
                `<p class="fs-13">${esc(p.problema || "—")}</p>
                 <div class="rotulo-secao mb-1 mt-3">Evidências</div>
                 ${lista(p.evidencias, "Nenhuma evidência cadastrada.")}`
            )}

            ${secao(
                "Causas e subcausas",
                (p.causas ?? []).length === 0
                    ? '<div class="alert alert-warning py-2 px-3 fs-12 mb-0">Este Programa não tem causas cadastradas. Sem ao menos uma, a Iniciativa do órgão não pode ser enviada.</div>'
                    : `<ul class="list-group list-group-flush">
                    ${p.causas
                        .map(
                            (c) => `
                    <li class="list-group-item px-0">
                        <div class="d-flex justify-content-between align-items-start gap-2">
                            <span>${esc(c.texto)}</span>
                            ${causasDoOrgao.has(c.id) ? chip("seu órgão atua", "ok") : ""}
                        </div>
                        ${
                            c.subcausas.length
                                ? `<ul class="mt-2 mb-0 fs-13">${c.subcausas
                                      .map(
                                          (s) =>
                                              `<li>${esc(s.texto)} ${causasDoOrgao.has(s.id) ? chip("seu órgão atua", "ok") : ""}</li>`
                                      )
                                      .join("")}</ul>`
                                : ""
                        }
                    </li>`
                        )
                        .join("")}
                </ul>`
            )}

            ${secao("Consequências", lista(p.consequencias, "Nenhuma consequência cadastrada."))}
        </div>

        <div class="col-xl-5">
            ${secao(
                "Objetivos e resultado",
                `<div class="rotulo-secao mb-1">Objetivo</div>
                 <p class="fs-13">${esc(p.objetivo || "—")}</p>
                 <div class="rotulo-secao mb-1 mt-3">Resultado esperado</div>
                 <p class="fs-13">${esc(p.resultadoEsperado || "—")}</p>
                 <div class="rotulo-secao mb-1 mt-3">População afetada</div>
                 <p class="fs-13 mb-0">${esc(p.populacaoAfetada || "—")}</p>`
            )}

            ${secao(
                "Indicadores de resultado",
                (p.indicadores ?? []).length === 0
                    ? '<p class="fs-12 text-muted mb-0">Nenhum indicador cadastrado.</p>'
                    : `<div class="table-responsive"><table class="table table-sm mb-0">
                    <thead><tr><th>Indicador</th><th style="width:6rem">Unidade</th><th class="num" style="width:6rem">Linha base</th><th class="num" style="width:5rem">Meta</th></tr></thead>
                    <tbody>${p.indicadores
                        .map(
                            (i) => `<tr>
                        <td>${esc(i.nome)}</td>
                        <td class="fs-12">${esc(i.unidade)}</td>
                        <td class="num">${esc(i.linhaBase)}</td>
                        <td class="num">${esc(i.meta)}</td>
                    </tr>`
                        )
                        .join("")}</tbody>
                </table></div>`
            )}

            ${secao(
                "Governança",
                `<div class="rotulo-secao mb-1">Órgão coordenador</div>
                 <p class="fs-13">${esc(p.orgaoCoordenador || "—")}</p>
                 <div class="rotulo-secao mb-1 mt-3">Governança do Programa</div>
                 <p class="fs-13 mb-0">${esc(p.governanca || "—")}</p>`
            )}

            ${secao(
                `Iniciativas de ${esc(orgao)} neste Programa`,
                inis.length === 0
                    ? '<p class="fs-12 text-muted mb-0">Seu órgão ainda não cadastrou Iniciativas neste Programa.</p>'
                    : `<ul class="list-group list-group-flush">${inis
                          .map(
                              (i) => `
                    <li class="list-group-item px-0 d-flex justify-content-between align-items-center gap-2">
                        <a href="iniciativa.html?id=${i.id}">${esc(i.nome)}</a>
                        <span class="d-flex gap-2 align-items-center">
                            <span class="fs-12 text-muted">${entregasDaIniciativa(estado, i.id).length} entrega(s)</span>
                            ${statusChip(i.status)}
                        </span>
                    </li>`
                          )
                          .join("")}</ul>`,
                `<a href="programas.html" class="btn btn-sm btn-outline-primary">Nova Iniciativa</a>`
            )}
        </div>
    </div>`;
}
