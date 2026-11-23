/**
 * Programas do PPA — tela inicial do órgão.
 * Porta `index.tsx` do protótipo.
 *
 * Corrige T6.1.7: a ordenação por prioridade aplicava uma regra implícita que a
 * interface nunca explicava.
 */
import { obterEstado, updPrograma, marcarSemContribuicao, reconsiderarParticipacao, removeIniciativa, noPlano, vinculosDe, descreverVinculos } from "../dados/store.js";
import { confirmarExclusao } from "../confirmar.js";
import { avisar } from "../toast.js";
import {
    iniciativasDoOrgao,
    entregasDaIniciativa,
    participacaoOrgao,
    PARTICIPACAO_LABEL,
    prioridadePrograma,
    financeiroProgramaOrgao,
    pendenciasIniciativa,
    resumoPendencias,
    situacaoEntrega,
    moeda,
    moedaCurta,
    pct,
} from "../dados/regras.js";
import { montarShell, barraTitulo, somenteLeitura } from "../shell.js";
import { criarFiltros, opcoesDe } from "../filtros.js";
import { chip, statusChip, esc, faixaIndicadores } from "../ui.js";
import { chipsPendencias } from "../ui-financeiro.js";
import { seloDoIcone } from "../icone-programa.js";
import { selosDeMarcadores, iniciarDicasDeMarcador, marcadoresParaFiltro, abrirJanelaDeMarcadores } from "../cadastros/marcador.js";

const { estado } = montarShell();
const orgao = estado.orgaoAtual;

let ordem = "prioridade";
const abertos = new Set();

const TOM_PARTICIPACAO = {
    com_contribuicao: "ok",
    sem_contribuicao: "neutro",
    nao_avaliado: "alerta",
};

/** Um registro por Programa visível ao órgão, com o que a tabela e os filtros precisam. */
function linhasBase() {
    return noPlano(estado)
        .programas.filter((p) => p.disponibilizacao === "disponivel" || iniciativasDoOrgao(estado, p.id, orgao).length > 0)
        .map((p) => {
            const inis = iniciativasDoOrgao(estado, p.id, orgao);
            const pend = inis.flatMap((i) => pendenciasIniciativa(estado, i));
            return {
                programa: p,
                inis,
                participacao: participacaoOrgao(estado, p.id, orgao),
                entregas: inis.reduce((s, i) => s + entregasDaIniciativa(estado, i.id).length, 0),
                resumo: resumoPendencias(pend),
                financeiro: financeiroProgramaOrgao(estado, p.id, orgao),
                prioridade: prioridadePrograma(estado, p.id, orgao),
            };
        });
}

const por = {
    prioridade: (a, b) => a.prioridade - b.prioridade || a.programa.codigo.localeCompare(b.programa.codigo),
    codigo: (a, b) => a.programa.codigo.localeCompare(b.programa.codigo),
    nome: (a, b) => a.programa.nome.localeCompare(b.programa.nome),
    iniciativas: (a, b) => b.inis.length - a.inis.length,
};

const linhas = () => linhasBase().filter((l) => filtros.passa(l)).sort(por[ordem]);

const SITUACOES = [
    { valor: "com", rotulo: "Com Iniciativas do meu órgão" },
    { valor: "sem", rotulo: "Sem Iniciativas do meu órgão" },
    { valor: "sem_contribuicao", rotulo: "Marcados como sem contribuição" },
    { valor: "nao_avaliado", rotulo: "Ainda não avaliados pelo órgão" },
    { valor: "em_preenchimento", rotulo: "Com Iniciativa em preenchimento" },
    { valor: "devolvida", rotulo: "Com Iniciativa devolvida" },
];
const situacoesDe = (l) => [
    l.inis.length > 0 ? "com" : "sem",
    ...(l.participacao === "sem_contribuicao" ? ["sem_contribuicao"] : []),
    ...(l.participacao === "nao_avaliado" ? ["nao_avaliado"] : []),
    ...(l.inis.some((i) => i.status === "em_preenchimento") ? ["em_preenchimento"] : []),
    ...(l.inis.some((i) => i.status === "devolvida") ? ["devolvida"] : []),
];

// O mesmo componente de filtros das telas da Central: campos com rótulo, e o filtro só vale ao clicar em Filtrar.
const filtros = criarFiltros({
    livre: { rotulo: "Programa", texto: (l) => `${l.programa.codigo} ${l.programa.nome}` },
    campos: [
        { id: "situacao", rotulo: "Situação", opcoes: () => SITUACOES, valorDe: situacoesDe },
        { id: "eixo", rotulo: "Eixo", opcoes: () => opcoesDe(linhasBase(), (l) => l.programa.eixo), valorDe: (l) => (l.programa.eixo ? [l.programa.eixo] : []) },
        {
            id: "objetivo",
            rotulo: "Objetivo estratégico",
            opcoes: () => opcoesDe(linhasBase(), (l) => l.programa.objetivoEstrategico),
            valorDe: (l) => (l.programa.objetivoEstrategico ? [l.programa.objetivoEstrategico] : []),
        },
        {
            id: "marcador",
            rotulo: "Marcador",
            opcoes: () => marcadoresParaFiltro(linhasBase().map((l) => l.programa), estado).map((m) => ({ valor: m.id, rotulo: m.nome })),
            valorDe: (l) => l.programa.marcadorIds ?? [],
        },
    ],
    exportar: "programas",
});

function linhaPrograma(l) {
    const p = l.programa;
    const aberto = abertos.has(p.id);
    const semCausas = (p.causas ?? []).length === 0;

    return `
    <tr>
        <td style="width:2.5rem">
            ${
                l.inis.length
                    ? `<button class="btn-expandir" data-programa="${p.id}" aria-expanded="${aberto}" aria-label="${aberto ? "Recolher" : "Expandir"}">
                <i class="ti ti-chevron-right"></i>
            </button>`
                    : ""
            }
        </td>
        <td>${selosDeMarcadores(p.marcadorIds, estado, p.marcadorObs)}</td>
        <td>
            <div class="d-flex align-items-center gap-2">
                ${seloDoIcone(p)}
                <div>
                    <a href="programa.html?id=${p.id}" class="fw-medium">${esc(p.nome)}</a>
                    <div class="fs-12 text-muted"><span class="codigo">${esc(p.codigo)}</span> · ${esc(p.eixo)}</div>
                </div>
            </div>
            ${semCausas ? `<div class="fs-12 text-warning mt-1">Programa sem causas cadastradas — não é possível concluir uma Iniciativa nele.</div>` : ""}
        </td>
        <td>${chip(PARTICIPACAO_LABEL[l.participacao], TOM_PARTICIPACAO[l.participacao])}</td>
        <td class="num">${l.inis.length || "—"}</td>
        <td>${l.inis.length ? chipsPendencias(l.resumo) : "—"}</td>
        <td class="num">${l.financeiro.previsto ? moedaCurta(l.financeiro.previsto) : "—"}</td>
        <td>
            <div class="d-flex gap-1">
                ${somenteLeitura() ? "" : `<button class="btn btn-sm btn-primary" data-nova="${p.id}" title="Nova Iniciativa"><i class="ti ti-plus"></i></button>`}
                ${somenteLeitura() ? "" : `<button class="btn btn-sm btn-terciario btn-icon" data-marcar="${p.id}" title="Adicionar marcadores" aria-label="Adicionar marcadores a ${esc(p.nome)}"><i class="ti ti-tag-plus"></i></button>`}
                <div class="dropdown">
                    <button class="btn btn-sm btn-terciario btn-icon" data-bs-toggle="dropdown" aria-label="Mais ações" title="Mais ações"><i class="ti ti-dots-vertical"></i></button>
                    <ul class="dropdown-menu dropdown-menu-end fs-13">
                        <li><a class="dropdown-item" href="programa.html?id=${p.id}">Ver diagnóstico</a></li>
                        ${
                            somenteLeitura()
                                ? ""
                                : l.participacao === "sem_contribuicao"
                                ? `<li><button class="dropdown-item" data-reconsiderar="${p.id}">Reconsiderar participação</button></li>`
                                : l.inis.length === 0
                                  ? `<li><button class="dropdown-item" data-sem="${p.id}">Marcar sem contribuição</button></li>`
                                  : ""
                        }
                    </ul>
                </div>
            </div>
        </td>
    </tr>
    ${
        aberto
            ? `<tr class="linha-filha"><td></td><td colspan="7" class="py-3">
        <table class="table table-sm tabela-aninhada mb-0">
            <thead><tr>
                <th>Iniciativa</th><th style="width:11rem">Status</th><th class="num" style="width:6rem">Entregas</th>
                <th style="width:13rem">Pendências</th><th class="num" style="width:8rem">Previsto</th><th style="width:10rem">Ações</th>
            </tr></thead>
            <tbody>
                ${l.inis
                    .map((i) => {
                        const r = resumoPendencias(pendenciasIniciativa(estado, i));
                        const fin = financeiroProgramaOrgao(estado, p.id, orgao);
                        return `<tr>
                    <td><a href="iniciativa.html?id=${i.id}">${esc(i.nome)}</a></td>
                    <td>${statusChip(i.status)}</td>
                    <td class="num">${entregasDaIniciativa(estado, i.id).length}</td>
                    <td>${chipsPendencias(r)}</td>
                    <td class="num">${moedaCurta(fin.previsto)}</td>
                    <td>
                        <a href="iniciativa.html?id=${i.id}" class="btn btn-sm btn-icon btn-terciario" title="Visualizar" aria-label="Visualizar ${esc(i.nome)}"><i class="ti ti-eye fs-16"></i></a>
                        ${somenteLeitura() ? "" : `<button class="btn btn-sm btn-icon btn-terciario" data-excluir="${i.id}" title="Excluir" aria-label="Excluir ${esc(i.nome)}"><i class="ti ti-trash fs-16"></i></button>`}
                    </td>
                </tr>`;
                    })
                    .join("")}
            </tbody>
        </table>
    </td></tr>`
            : ""
    }`;
}

/** Monta a tela uma vez: a barra de filtros fica de pé, e só a faixa e o corpo da tabela se refazem. */
function montar() {
    document.getElementById("conteudo").innerHTML = `
    ${barraTitulo("Programas do PPA")}
    <div id="faixa" class="mt-3"></div>
    <div class="card">
        ${filtros.html()}
        <div class="d-flex justify-content-end align-items-center gap-2 px-3 py-2 border-bottom">
            <label class="form-label mb-0 text-nowrap" for="ordem">Ordenar por</label>
            <select class="form-select form-select-sm" style="width:12rem" id="ordem" title="A ordenação por prioridade traz primeiro o que depende de você">
                <option value="prioridade">Prioridade</option>
                <option value="codigo">Código</option>
                <option value="nome">Nome</option>
                <option value="iniciativas">Nº de Iniciativas</option>
            </select>
        </div>
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th></th>
                        <th style="width:9rem">Marcador</th>
                        <th>Programa</th>
                        <th style="width:12rem">Participação</th>
                        <th class="num" style="width:6rem">Iniciativas</th>
                        <th style="width:14rem">Pendências</th>
                        <th class="num" style="width:8rem">Previsto</th>
                        <th style="width:7rem">Ações</th>
                    </tr>
                </thead>
                <tbody id="corpo-programas"></tbody>
            </table>
        </div>
    </div>`;
    filtros.ligar(() => render());
}

function render() {
    const ls = linhas();
    const inis = estado.iniciativas.filter((i) => i.orgao === orgao && noPlano(estado).iniciativa(i));
    const entregas = inis.reduce((s, i) => s + entregasDaIniciativa(estado, i.id).length, 0);
    const previsto = ls.reduce((s, l) => s + l.financeiro.previsto, 0);
    const executado = ls.reduce((s, l) => s + l.financeiro.executado, 0);
    const comContribuicao = ls.filter((l) => l.inis.length > 0).length;

    document.getElementById("faixa").innerHTML = faixaIndicadores(
        [
            { valor: ls.length, rotulo: "Programas do PPA" },
            { valor: comContribuicao, rotulo: "Com contribuição do órgão" },
            { valor: inis.length, rotulo: "Iniciativas" },
            { valor: entregas, rotulo: "Entregas" },
            { valor: moeda(previsto), rotulo: "Previsto no PPA" },
            { valor: pct(previsto > 0 ? (executado / previsto) * 100 : null), rotulo: "% execução financeira" },
        ]
    );
    document.getElementById("corpo-programas").innerHTML =
        ls.length === 0
            ? '<tr><td colspan="8" class="text-center text-muted py-4 fs-12">Nenhum Programa corresponde ao filtro.</td></tr>'
            : ls.map(linhaPrograma).join("");
    document.getElementById("ordem").value = ordem;

    // A dica dos selos (nome, descrição e observação). O conteúdo é refeito a cada render: some a dica que ficou solta.
    document.querySelectorAll(".tooltip").forEach((d) => d.remove());
    iniciarDicasDeMarcador(document.getElementById("conteudo"));
}

document.addEventListener("click", (e) => {
    const prog = e.target.closest("[data-programa]");
    if (prog) {
        const id = prog.dataset.programa;
        abertos.has(id) ? abertos.delete(id) : abertos.add(id);
        return render();
    }

    // "Adicionar marcadores": pôr ou tirar marcadores de um Programa sem sair da lista.
    const marcar = e.target.closest("[data-marcar]");
    if (marcar) {
        const programa = estado.programas.find((x) => x.id === marcar.dataset.marcar);
        if (!programa) return;
        return abrirJanelaDeMarcadores({
            titulo: `Marcadores — ${programa.nome}`,
            selecionados: programa.marcadorIds ?? [],
            observacoes: programa.marcadorObs ?? {},
            estado,
            aoSalvar: (ids, observacoes) => {
                updPrograma(programa.id, { marcadorIds: ids, marcadorObs: observacoes });
                render();
                avisar("Marcadores do Programa atualizados.");
            },
        });
    }

    const nova = e.target.closest("[data-nova]");
    if (nova) {
        // Criar tem tela própria, com os mesmos campos da ficha.
        location.href = `iniciativa/criar.html?programa=${encodeURIComponent(nova.dataset.nova)}`;
        return;
    }

    const sem = e.target.closest("[data-sem]");
    if (sem) {
        marcarSemContribuicao(sem.dataset.sem, orgao);
        render();
        return avisar("Programa marcado como sem contribuição do órgão.");
    }

    const rec = e.target.closest("[data-reconsiderar]");
    if (rec) {
        reconsiderarParticipacao(rec.dataset.reconsiderar, orgao);
        render();
        return avisar("Participação do órgão reconsiderada.");
    }

    const excluir = e.target.closest("[data-excluir]");
    if (excluir) {
        const ini = estado.iniciativas.find((i) => i.id === excluir.dataset.excluir);
        const vinculos = vinculosDe("iniciativas", ini.id);
        if (vinculos.length) {
            avisar(`Iniciativa vinculada a ${descreverVinculos(vinculos)}. Desfaça os vínculos para excluir.`, "erro");
            return;
        }
        confirmarExclusao({
            titulo: "Excluir Iniciativa",
            texto: `A Iniciativa “${ini.nome}” será removida. A exclusão fica registrada no histórico.`,
        }).then((justificativa) => {
            if (!justificativa) return;
            const r = removeIniciativa(ini.id, justificativa);
            if (!r.ok) return avisar(r.motivo || "Não foi possível excluir a Iniciativa.", "erro");
            render();
            avisar("Iniciativa excluída com sucesso.");
        });
        return;
    }
});

document.addEventListener("change", (e) => {
    if (e.target.id !== "ordem") return;
    ordem = e.target.value;
    render();
});

montar();
render();
