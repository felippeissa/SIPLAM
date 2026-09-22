/**
 * Programas do PPA — tela inicial do órgão.
 * Porta `index.tsx` do protótipo.
 *
 * Corrige T6.1.7: a ordenação por prioridade aplicava uma regra implícita que a
 * interface nunca explicava.
 */
import { obterEstado, marcarSemContribuicao, reconsiderarParticipacao, removeIniciativa, addIniciativa, noPlano } from "../dados/store.js";
import {
    eixos,
    objetivos,
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
import { montarShell, cabecalhoPagina , somenteLeitura } from "../shell.js";
import { chip, statusChip, esc, faixaIndicadores } from "../ui.js";
import { chipsPendencias } from "../ui-financeiro.js";

const { estado } = montarShell();
const orgao = estado.orgaoAtual;

let busca = "";
let filtro = "todos";
let eixo = "todos";
let objetivo = "todos";
let ordem = "prioridade";
let novaEm = null;
const abertos = new Set();

const TOM_PARTICIPACAO = {
    com_contribuicao: "ok",
    sem_contribuicao: "neutro",
    nao_avaliado: "alerta",
};

function linhas() {
    const q = busca.trim().toLowerCase();

    const plano = noPlano(estado);
    let ls = plano.programas
        .filter((p) => p.disponibilizacao === "disponivel" || iniciativasDoOrgao(estado, p.id, orgao).length > 0)
        .filter((p) => !q || p.nome.toLowerCase().includes(q) || p.codigo.includes(q))
        .filter((p) => eixo === "todos" || p.eixo === eixo)
        .filter((p) => objetivo === "todos" || p.objetivoEstrategico === objetivo)
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
        })
        .filter((l) => {
            switch (filtro) {
                case "com":
                    return l.inis.length > 0;
                case "sem":
                    return l.inis.length === 0;
                case "sem_contribuicao":
                    return l.participacao === "sem_contribuicao";
                case "nao_avaliado":
                    return l.participacao === "nao_avaliado";
                case "em_preenchimento":
                    return l.inis.some((i) => i.status === "em_preenchimento");
                case "devolvida":
                    return l.inis.some((i) => i.status === "devolvida");
                default:
                    return true;
            }
        });

    const por = {
        prioridade: (a, b) => a.prioridade - b.prioridade || a.programa.codigo.localeCompare(b.programa.codigo),
        codigo: (a, b) => a.programa.codigo.localeCompare(b.programa.codigo),
        nome: (a, b) => a.programa.nome.localeCompare(b.programa.nome),
        iniciativas: (a, b) => b.inis.length - a.inis.length,
    };
    return ls.sort(por[ordem]);
}

function filtros() {
    return `
    <div class="app-search">
        <input type="search" id="busca" class="form-control form-control-sm" placeholder="Buscar por código ou nome" value="${esc(busca)}" />
        <i class="ti ti-search app-search-icon text-muted"></i>
    </div>
    <select class="form-select form-select-sm" id="filtro">
        <option value="todos">Todos os Programas</option>
        <option value="com">Com Iniciativas do meu órgão</option>
        <option value="sem">Sem Iniciativas do meu órgão</option>
        <option value="sem_contribuicao">Marcados como sem contribuição</option>
        <option value="nao_avaliado">Ainda não avaliados pelo órgão</option>
        <option value="em_preenchimento">Com Iniciativa em preenchimento</option>
        <option value="devolvida">Com Iniciativa devolvida</option>
    </select>
    <select class="form-select form-select-sm" id="eixo">
        <option value="todos">Todos os Eixos</option>
        ${eixos(noPlano(estado).programas).map((e) => `<option value="${esc(e)}">${esc(e)}</option>`).join("")}
    </select>
    <select class="form-select form-select-sm" id="objetivo">
        <option value="todos">Todos os Objetivos</option>
        ${objetivos(noPlano(estado).programas, eixo).map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join("")}
    </select>
    <select class="form-select form-select-sm" id="ordem" title="A ordenação por prioridade traz primeiro o que depende de você">
        <option value="prioridade">Ordenar por prioridade</option>
        <option value="codigo">Ordenar por código</option>
        <option value="nome">Ordenar por nome</option>
        <option value="iniciativas">Ordenar por nº de Iniciativas</option>
    </select>`;
}

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
        <td class="codigo text-muted">${esc(p.codigo)}</td>
        <td>
            <a href="programa.html?id=${p.id}" class="fw-medium">${esc(p.nome)}</a>
            <div class="fs-12 text-muted">${esc(p.eixo)}</div>
            ${semCausas ? `<div class="fs-12 text-warning mt-1">Programa sem causas cadastradas — não é possível concluir uma Iniciativa nele.</div>` : ""}
        </td>
        <td>${chip(PARTICIPACAO_LABEL[l.participacao], TOM_PARTICIPACAO[l.participacao])}</td>
        <td class="num">${l.inis.length || "—"}</td>
        <td class="num">${l.entregas || "—"}</td>
        <td>${l.inis.length ? chipsPendencias(l.resumo) : "—"}</td>
        <td class="num">${l.financeiro.previsto ? moedaCurta(l.financeiro.previsto) : "—"}</td>
        <td class="num">${pct(l.financeiro.percentual)}</td>
        <td>
            <div class="d-flex gap-1">
                ${somenteLeitura() ? "" : `<button class="btn btn-sm btn-primary" data-nova="${p.id}" title="Nova Iniciativa"><i class="ti ti-plus"></i></button>`}
                <div class="dropdown">
                    <button class="btn btn-sm btn-light btn-icon" data-bs-toggle="dropdown" aria-label="Mais ações"><i class="ti ti-dots-vertical"></i></button>
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
            ? `<tr class="linha-filha"><td></td><td colspan="9" class="py-3">
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
                        <a href="iniciativa.html?id=${i.id}" class="btn btn-sm btn-outline-primary">Abrir</a>
                        ${somenteLeitura() ? "" : `<button class="btn btn-sm btn-light" data-excluir="${i.id}" title="Excluir Iniciativa"><i class="ti ti-trash"></i></button>`}
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

function modalNova() {
    const p = estado.programas.find((x) => x.id === novaEm);
    const causas = p?.causas ?? [];

    return `
<div class="modal fade" id="modal-nova" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <div>
                    <h5 class="modal-title fs-15">Nova Iniciativa</h5>
                    <div class="fs-12 text-muted">${esc(p?.codigo)} — ${esc(p?.nome)}</div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
                <div class="mb-3">
                    <label class="form-label" for="n-nome">Nome da Iniciativa <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="n-nome" placeholder="Ex.: Ampliação da rede pública de alimentação" />
                </div>
                <div class="mb-3">
                    <label class="form-label" for="n-descricao">Detalhamento</label>
                    <textarea class="form-control" id="n-descricao" rows="3"></textarea>
                </div>
                <div class="mb-3">
                    <label class="form-label" for="n-publico">Público-alvo</label>
                    <input type="text" class="form-control" id="n-publico" />
                </div>
                <div class="mb-0">
                    <label class="form-label">Causas do Programa enfrentadas</label>
                    ${
                        causas.length === 0
                            ? '<div class="alert alert-warning py-2 px-3 fs-12 mb-0">Este Programa não tem causas cadastradas. Sem ao menos uma, a Iniciativa não poderá ser enviada.</div>'
                            : causas
                                  .map(
                                      (c) => `
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="${c.id}" id="c-${c.id}" data-causa />
                        <label class="form-check-label" for="c-${c.id}">${esc(c.texto)}</label>
                    </div>`
                                  )
                                  .join("")
                    }
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary" id="criar">Criar Iniciativa</button>
            </div>
        </div>
    </div>
</div>`;
}

function render() {
    const ls = linhas();
    const inis = estado.iniciativas.filter((i) => i.orgao === orgao && noPlano(estado).iniciativa(i));
    const entregas = inis.reduce((s, i) => s + entregasDaIniciativa(estado, i.id).length, 0);
    const previsto = ls.reduce((s, l) => s + l.financeiro.previsto, 0);
    const executado = ls.reduce((s, l) => s + l.financeiro.executado, 0);
    const comContribuicao = ls.filter((l) => l.inis.length > 0).length;

    document.getElementById("conteudo").innerHTML = `
    ${cabecalhoPagina("Programas do PPA", `Iniciativas e Entregas cadastradas por ${esc(orgao)}.`, filtros())}
    ${faixaIndicadores(
        [
            { valor: ls.length, rotulo: "Programas do PPA" },
            { valor: comContribuicao, rotulo: "Com contribuição do órgão" },
            { valor: inis.length, rotulo: "Iniciativas" },
            { valor: entregas, rotulo: "Entregas" },
            { valor: moeda(previsto), rotulo: "Previsto no PPA" },
            { valor: pct(previsto > 0 ? (executado / previsto) * 100 : null), rotulo: "% execução financeira" },
        ],
        `Os valores derivam das Ações Orçamentárias vinculadas às Entregas do órgão. ${
            ordem === "prioridade"
                ? "<strong>Ordenação por prioridade:</strong> primeiro o que foi devolvido, depois o que está em preenchimento, em seguida o que já foi enviado, e por último o que ainda não foi avaliado."
                : ""
        }`
    )}
    <div class="card">
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th></th>
                        <th style="width:5rem">Código</th>
                        <th>Programa</th>
                        <th style="width:12rem">Participação</th>
                        <th class="num" style="width:6rem">Iniciativas</th>
                        <th class="num" style="width:6rem">Entregas</th>
                        <th style="width:14rem">Pendências</th>
                        <th class="num" style="width:8rem">Previsto</th>
                        <th class="num" style="width:5rem">%</th>
                        <th style="width:7rem">Ações</th>
                    </tr>
                </thead>
                <tbody>
                ${
                    ls.length === 0
                        ? '<tr><td colspan="10" class="text-center text-muted py-4 fs-12">Nenhum Programa corresponde ao filtro.</td></tr>'
                        : ls.map(linhaPrograma).join("")
                }
                </tbody>
            </table>
        </div>
    </div>
    ${novaEm ? modalNova() : ""}`;

    document.getElementById("busca").value = busca;
    document.getElementById("filtro").value = filtro;
    document.getElementById("eixo").value = eixo;
    document.getElementById("objetivo").value = objetivo;
    document.getElementById("ordem").value = ordem;

    if (novaEm) {
        const el = document.getElementById("modal-nova");
        new bootstrap.Modal(el).show();
        el.addEventListener("hidden.bs.modal", () => {
            novaEm = null;
            render();
        }, { once: true });
    }
}

document.addEventListener("click", (e) => {
    const prog = e.target.closest("[data-programa]");
    if (prog) {
        const id = prog.dataset.programa;
        abertos.has(id) ? abertos.delete(id) : abertos.add(id);
        return render();
    }

    const nova = e.target.closest("[data-nova]");
    if (nova) {
        novaEm = nova.dataset.nova;
        return render();
    }

    const sem = e.target.closest("[data-sem]");
    if (sem) {
        marcarSemContribuicao(sem.dataset.sem, orgao);
        return render();
    }

    const rec = e.target.closest("[data-reconsiderar]");
    if (rec) {
        reconsiderarParticipacao(rec.dataset.reconsiderar, orgao);
        return render();
    }

    const excluir = e.target.closest("[data-excluir]");
    if (excluir) {
        const ini = estado.iniciativas.find((i) => i.id === excluir.dataset.excluir);
        if (confirm(`Excluir a Iniciativa “${ini.nome}”? As Entregas e os vínculos vão junto.`)) {
            removeIniciativa(ini.id);
            render();
        }
        return;
    }

    if (e.target.closest("#criar")) {
        const nome = document.getElementById("n-nome").value.trim();
        if (!nome) {
            alert("Informe o nome da Iniciativa.");
            return;
        }
        const causas = [...document.querySelectorAll("[data-causa]:checked")].map((c) => c.value);
        const id = addIniciativa({
            programaId: novaEm,
            nome,
            descricao: document.getElementById("n-descricao").value.trim(),
            publicoAlvo: document.getElementById("n-publico").value.trim(),
            causas,
        });
        location.href = `iniciativa.html?id=${id}`;
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
    if (id === "filtro") filtro = e.target.value;
    else if (id === "eixo") {
        eixo = e.target.value;
        objetivo = "todos";
    } else if (id === "objetivo") objetivo = e.target.value;
    else if (id === "ordem") ordem = e.target.value;
    else return;
    render();
});

render();
