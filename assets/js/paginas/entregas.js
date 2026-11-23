/**
 * Entregas do órgão — listagem.
 * Porta `entregas.tsx`.
 */
import { obterEstado, noPlano } from "../dados/store.js";
import { ANOS } from "../dados/seed.js";
import {
    situacaoEntrega,
    recursosDaEntrega,
    moedaCurta,
    TERRITORIO_LABEL,
} from "../dados/regras.js";
import { acoesDaEntrega } from "../dados/financeiro.js";
import { montarShell, barraTitulo } from "../shell.js";
import { criarFiltros, opcoesDe } from "../filtros.js";
import { chip, esc, faixaIndicadores } from "../ui.js";

const { estado } = montarShell();
const orgao = estado.orgaoAtual;

function linhasBase() {
    const plano = noPlano(estado);
    return estado.entregas.filter(plano.entrega)
        .map((e) => {
            const ini = estado.iniciativas.find((i) => i.id === e.iniciativaId);
            const p = ini ? estado.programas.find((x) => x.id === ini.programaId) : null;
            return { entrega: e, ini, programa: p, sit: situacaoEntrega(estado, e) };
        })
        .filter((l) => l.ini && l.ini.orgao === orgao);
}

const linhas = () => linhasBase().filter((l) => filtros.passa(l));

// O mesmo componente de filtros das demais telas: campos com rótulo, e o filtro só vale ao clicar em Filtrar.
const filtros = criarFiltros({
    livre: { rotulo: "Entrega", texto: (l) => l.entrega.nome ?? "" },
    campos: [
        { id: "eixo", rotulo: "Eixo", opcoes: () => opcoesDe(linhasBase(), (l) => l.programa?.eixo), valorDe: (l) => (l.programa?.eixo ? [l.programa.eixo] : []) },
        {
            id: "objetivo",
            rotulo: "Objetivo estratégico",
            opcoes: () => opcoesDe(linhasBase(), (l) => l.programa?.objetivoEstrategico),
            valorDe: (l) => (l.programa?.objetivoEstrategico ? [l.programa.objetivoEstrategico] : []),
        },
        {
            id: "programa",
            rotulo: "Programa",
            opcoes: () => noPlano(estado).programas.map((p) => ({ valor: p.id, rotulo: `${p.codigo} — ${p.nome}` })),
            valorDe: (l) => (l.ini.programaId ? [l.ini.programaId] : []),
        },
        {
            id: "situacao",
            rotulo: "Situação",
            opcoes: () => [
                { valor: "impeditivo", rotulo: "Com pendência impeditiva" },
                { valor: "alerta", rotulo: "Com alerta" },
                { valor: "ok", rotulo: "Completas" },
            ],
            valorDe: (l) => [l.sit.tom],
        },
    ],
    exportar: "entregas",
});

/** Monta a tela uma vez: a barra de filtros fica de pé, e só a faixa e o corpo da tabela se refazem. */
function montar() {
    document.getElementById("conteudo").innerHTML = `
    ${barraTitulo("Entregas")}
    <div id="faixa" class="mt-3"></div>
    <div class="card">
        ${filtros.html()}
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
                <tbody id="corpo-entregas"></tbody>
            </table>
        </div>
    </div>`;
    filtros.ligar(() => render());
}

function render() {
    const ls = linhas();
    const semMeta = ls.filter((l) => ANOS.some((a) => l.entrega.metas[a] == null)).length;
    const semAcao = ls.filter((l) => acoesDaEntrega(estado, l.entrega.id).length === 0).length;

    document.getElementById("faixa").innerHTML = faixaIndicadores([
        { valor: ls.length, rotulo: "Entregas" },
        { valor: semMeta, rotulo: "Com meta faltando" },
        { valor: semAcao, rotulo: "Sem Ação vinculada" },
        { valor: ls.filter((l) => l.sit.tom === "ok").length, rotulo: "Completas" },
        { valor: moedaCurta(ls.reduce((s, l) => s + recursosDaEntrega(estado, l.entrega.id), 0)), rotulo: "Previsto" },
    ]);
    document.getElementById("corpo-entregas").innerHTML =
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
                        <td><a href="entrega.html?id=${l.entrega.id}" class="btn btn-sm btn-icon btn-terciario" title="Visualizar" aria-label="Visualizar entrega"><i class="ti ti-eye fs-16"></i></a></td>
                    </tr>`
                  )
                  .join("");
}

montar();
render();
