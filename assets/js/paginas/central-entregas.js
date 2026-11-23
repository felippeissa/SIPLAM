/**
 * Entregas do PPA — visão transversal da Área Central.
 * Porta `central_.entregas.tsx`.
 *
 * Acréscimo: filtros estruturados por órgão, programa e situação, que o
 * protótipo não tinha — lá tudo dependia de acertar o termo na busca (T5.2.3).
 */
import { obterEstado, noPlano } from "../dados/store.js";
import { moedaCurta, situacaoEntrega, recursosDaEntrega, STATUS_CURTO } from "../dados/regras.js";
import { ANOS } from "../dados/seed.js";
import { acoesDaEntrega } from "../dados/financeiro.js";
import { montarShell, barraTitulo } from "../shell.js";
import { criarFiltros, opcoesDe } from "../filtros.js";
import { chip, statusChip, esc, faixaIndicadores } from "../ui.js";

const { estado } = montarShell();

function metaTotal(e) {
    return ANOS.reduce((s, a) => s + (e.metas[a] ?? 0), 0);
}

function linhasBase() {
    const plano = noPlano(estado);
    return estado.entregas.filter(plano.entrega)
        .map((e) => {
            const ini = estado.iniciativas.find((i) => i.id === e.iniciativaId);
            const prog = ini ? estado.programas.find((p) => p.id === ini.programaId) : null;
            return { entrega: e, ini, prog, sit: situacaoEntrega(estado, e) };
        })
        .filter((l) => l.ini);
}

const linhas = () => linhasBase().filter((l) => filtros.passa(l));

// O mesmo componente de filtros das demais telas: campos com rótulo, e o filtro só vale ao clicar em Filtrar.
const filtros = criarFiltros({
    livre: {
        rotulo: "Entrega",
        texto: (l) => [l.entrega.nome, l.ini.orgao, l.ini.nome, l.prog?.nome, ...l.entrega.territorio.regioes].filter(Boolean).join(" "),
    },
    campos: [
        { id: "orgao", rotulo: "Órgão", opcoes: () => opcoesDe(linhasBase(), (l) => l.ini.orgao), valorDe: (l) => (l.ini.orgao ? [l.ini.orgao] : []) },
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
    exportar: "entregas-do-ppa",
});

/** Monta a tela uma vez: a barra de filtros fica de pé, e só a faixa e o corpo da tabela se refazem. */
function montar() {
    document.getElementById("conteudo").innerHTML = `
    ${barraTitulo("Entregas do PPA")}
    <div id="faixa" class="mt-3"></div>
    <div class="card">
        ${filtros.html()}
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th>Entrega</th>
                        <th style="width:14rem">Órgão</th>
                        <th style="width:15rem">Iniciativa</th>
                        <th style="width:13rem">Programa</th>
                        <th class="num" style="width:7rem">Meta total</th>
                        <th class="num" style="width:8rem">Previsto</th>
                        <th style="width:11rem">Situação</th>
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
    const previsto = ls.reduce((s, l) => s + recursosDaEntrega(estado, l.entrega.id), 0);
    const semAcao = ls.filter((l) => acoesDaEntrega(estado, l.entrega.id).length === 0).length;

    document.getElementById("faixa").innerHTML = faixaIndicadores(
        [
            { valor: ls.length, rotulo: "Entregas no recorte" },
            { valor: new Set(ls.map((l) => l.ini.orgao)).size, rotulo: "Órgãos" },
            { valor: new Set(ls.map((l) => l.ini.programaId)).size, rotulo: "Programas" },
            { valor: semAcao, rotulo: "Sem Ação vinculada" },
            { valor: moedaCurta(previsto), rotulo: "Previsto no recorte" },
        ],
        "O previsto deriva das Ações Orçamentárias vinculadas a cada Entrega."
    );
    document.getElementById("corpo-entregas").innerHTML =
        ls.length === 0
            ? '<tr><td colspan="8" class="text-center text-muted py-4 fs-12">Nenhuma Entrega corresponde ao filtro.</td></tr>'
            : ls
                  .map(
                      (l) => `
                    <tr>
                        <td>
                            <a href="entrega.html?id=${l.entrega.id}" class="fw-medium">${esc(l.entrega.nome || "Sem nome")}</a>
                            <div class="fs-12 text-muted">${esc(l.entrega.unidadeMedida || "unidade não informada")}</div>
                        </td>
                        <td class="fs-12">${esc(l.ini.orgao)}</td>
                        <td class="fs-12 text-muted">${esc(l.ini.nome)}</td>
                        <td class="fs-12 text-muted">${esc(l.prog?.nome ?? "—")}</td>
                        <td class="num">${metaTotal(l.entrega).toLocaleString("pt-BR")}</td>
                        <td class="num">${moedaCurta(recursosDaEntrega(estado, l.entrega.id))}</td>
                        <td>${chip(l.sit.texto, l.sit.tom)}<div class="fs-12 text-muted mt-1">${STATUS_CURTO[l.ini.status]}</div></td>
                        <td><a href="entrega.html?id=${l.entrega.id}" class="btn btn-sm btn-icon btn-terciario" title="Visualizar" aria-label="Visualizar entrega"><i class="ti ti-eye fs-16"></i></a></td>
                    </tr>`
                  )
                  .join("");
}

montar();
render();
