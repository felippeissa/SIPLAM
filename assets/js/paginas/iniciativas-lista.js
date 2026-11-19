/**
 * Lista de Iniciativas — a mesma tela para as duas visões.
 *
 * Central: todas as Iniciativas do plano; só avalia (aprova ou reprova).
 * Setorial: as do órgão; cria e ajusta, e envia para avaliação.
 *
 * Os big numbers do alto são a contagem por status da Iniciativa.
 */
import { noPlano, ppaCorrente, updIniciativa, iniciarAnalise, reavaliarIniciativa, inativarIniciativa, reativarIniciativa } from "../dados/store.js";
import {
    STATUS_CURTO,
    podeEditar,
    entregasDaIniciativa,
    pendenciasIniciativa,
} from "../dados/regras.js";
import { montarShell, barraTitulo, somenteLeitura, url } from "../shell.js";
import { esc, statusChip, criarPaginacao, listaResumida, textoLongo } from "../ui.js";
import { criarFiltros, opcoesDe } from "../filtros.js";
import { listaPendencias } from "../ui-financeiro.js";
import { selosDeMarcadores, iniciarDicasDeMarcador, marcadoresParaFiltro, abrirJanelaDeMarcadores } from "../cadastros/marcador.js";
import { avisar, avisarDepois } from "../toast.js";
import { pedirJustificativa } from "../justificar.js";
import { STATUS_CENTRAL } from "../iniciativa-campos.js";

export function montarListaDeIniciativas({ visao }) {
    const { estado } = montarShell();
    const leitura = somenteLeitura();
    const central = visao === "central";
    const detalhe = central ? "central-iniciativa.html" : "iniciativa.html";
    
    // Um PPA por vez: a Iniciativa pertence ao plano do Programa de onde descende.
    // O Programa é opcional; sem ele, quem diz o plano é o `ppaId` da Iniciativa.
    const plano = noPlano(estado);
    const ppa = ppaCorrente(estado);
    const doPlano = (i) => (i.programaId ? plano.iniciativa(i) : !i.ppaId || !ppa || i.ppaId === ppa.id);
    const iniciativasDoPlano = () =>
        (estado.iniciativas ?? []).filter(doPlano).filter((i) => central || i.orgao === estado.orgaoAtual);
    const programaDe = (i) => (estado.programas ?? []).find((p) => p.id === i.programaId);
    // O motivo da divergência é uma das três respostas da lista; o gravado antes dela era texto livre.
    const MOTIVOS = Object.fromEntries(STATUS_CENTRAL);
    const rotuloMotivo = (m, max = Infinity) => MOTIVOS[m] ?? (m.length > max ? `${m.slice(0, max)}…` : m);
    /** As causas que a Iniciativa enfrenta: o vínculo mora na causa (`iniciativaIds`). */
    const causasDe = (i) => (estado.causas ?? []).filter((c) => (c.iniciativaIds ?? []).includes(i.id));
    /** Os indicadores escolhidos no cadastro (`indicadorIds`), do cadastro de Indicadores. */
    const indicadoresDe = (i) =>
        (i.indicadorIds ?? []).map((id) => (estado.indicadores ?? []).find((x) => x.id === id)).filter(Boolean);
    /**
     * O problema da Iniciativa: o que ela guarda ou, sem ele, o do Programa
     * (`pb-<programa>`). O campo saiu do formulário, mas o dado gravado vale.
     */
    const problemaDe = (i) => (estado.problemas ?? []).find((p) => p.id === (i.problemaId || `pb-${i.programaId}`));
    const rotuloPrograma = (p) => (p ? `${p.codigo} — ${p.nome}` : "—");
    
    /**
     * Pendências impeditivas, contadas enquanto a Iniciativa está em preenchimento:
     * é quando o órgão ainda pode resolvê-las antes de enviar. Depois disso quem
     * fala é o status.
     */
    const pendDe = (i) => pendenciasIniciativa(estado, { causas: [], descricao: "", ...i });
    
    // A tabela mostra uma página por vez. A faixa conta o filtro inteiro.
    const paginacao = criarPaginacao(() => {
        repintarCorpo();
        paginacao.atualizar();
    });
    
    const filtros = criarFiltros({
        paginacao,
        livre: {
            rotulo: "Iniciativa",
            texto: (i) =>
                `${i.nome} ${i.descricao ?? ""} ${i.motivo ? rotuloMotivo(i.motivo) : ""} ${i.unidadeResponsavel ?? ""} ${i.orgao ?? ""} ${rotuloPrograma(programaDe(i))} ${problemaDe(i)?.nome ?? ""} ${causasDe(i).map((c) => c.nome).join(" ")} ${indicadoresDe(i).map((x) => x.nome).join(" ")}`,
        },
        campos: [
            {
                // Os que a pessoa pode usar e os que já estão postos nas Iniciativas: o selo que ela vê ela também filtra.
                id: "marcador",
                rotulo: "Marcador",
                opcoes: () => marcadoresParaFiltro(iniciativasDoPlano(), estado).map((m) => ({ valor: m.id, rotulo: m.nome })),
                valorDe: (i) => i.marcadorIds ?? [],
            },
            {
                id: "programa",
                rotulo: "Programa",
                opcoes: () =>
                    plano.programas
                        .map((p) => ({ valor: p.id, rotulo: rotuloPrograma(p) }))
                        .sort((a, b) => a.rotulo.localeCompare(b.rotulo, "pt-BR")),
                valorDe: (i) => (i.programaId ? [i.programaId] : []),
            },
            {
                id: "motivo",
                rotulo: "Motivo",
                opcoes: () =>
                    opcoesDe(
                        iniciativasDoPlano().filter((i) => i.status === "divergencia"),
                        (i) => i.motivo
                    ).map((o) => ({ valor: o.valor, rotulo: rotuloMotivo(o.valor, 60) })),
                valorDe: (i) => (i.status === "divergencia" && i.motivo ? [i.motivo] : []),
            },
            {
                id: "causas",
                rotulo: "Causas",
                opcoes: () =>
                    [...new Map(iniciativasDoPlano().flatMap(causasDe).map((c) => [c.id, c])).values()]
                        .map((c) => ({ valor: c.id, rotulo: c.nome }))
                        .sort((a, b) => a.rotulo.localeCompare(b.rotulo, "pt-BR")),
                valorDe: (i) => causasDe(i).map((c) => c.id),
            },
            {
                id: "indicadores",
                rotulo: "Indicadores",
                opcoes: () =>
                    [...new Map(iniciativasDoPlano().flatMap(indicadoresDe).map((x) => [x.id, x])).values()]
                        .map((x) => ({ valor: x.id, rotulo: x.nome }))
                        .sort((a, b) => a.rotulo.localeCompare(b.rotulo, "pt-BR")),
                valorDe: (i) => indicadoresDe(i).map((x) => x.id),
            },
            {
                // O órgão gravado na Iniciativa: o informado no cadastro antigo ou,
                // na nova, o órgão de quem a cadastrou.
                id: "orgao",
                rotulo: "Órgão",
                opcoes: () => opcoesDe(iniciativasDoPlano(), (i) => i.orgao),
                valorDe: (i) => (i.orgao ? [i.orgao] : []),
            },
            {
                id: "status",
                rotulo: "Status",
                opcoes: () =>
                    opcoesDe(iniciativasDoPlano(), (i) => i.status).map((o) => ({
                        valor: o.valor,
                        rotulo: STATUS_CURTO[o.valor] ?? o.rotulo,
                    })),
                valorDe: (i) => (i.status ? [i.status] : []),
            },
        ].filter((c) => central || c.id !== "orgao"),
        exportar: "iniciativas",
        acao: () =>
            central || leitura
                ? ""
                : `<a href="${url("iniciativa/criar.html")}" class="btn btn-primary"><i class="ti ti-plus me-1"></i>Criar iniciativa</a>`,
    });
    
    const linhas = () => iniciativasDoPlano().filter((i) => filtros.passa(i));
    
    /** A faixa de números conta o que a tabela mostra, e por isso segue o filtro. */
    function faixa() {
        // Os big numbers são os status da Iniciativa, na ordem do fluxo, com as cores da Home.
        const ls = linhas();
        const itens = [
            ["em_preenchimento", "ti-pencil", "secondary"],
            ["enviada", "ti-send", "info"],
            ["em_analise", "ti-search", "warning"],
            ["devolvida", "ti-arrow-back-up", "danger"],
            ["validada", "ti-circle-check", "primary"],
            ["divergencia", "ti-alert-triangle", "purple"],
        ["inativa", "ti-ban", "dark"],
        ];
        // Uma linha só: os sete cartões dividem a largura por igual, sem quebrar para a linha de baixo.
    return `<div class="row g-2 mb-2 flex-nowrap">${itens
            .map(
                ([st, icone, tom]) => `
            <div class="col" style="min-width:8rem">
                <div class="card border border-dashed shadow-none rounded-0 mb-0 h-100 numero-plano pe-none" style="--np: var(--theme-${tom}); --np-rgb: var(--theme-${tom}-rgb)">
                    <div class="card-body p-3">
                        <div class="mb-2 d-flex justify-content-between align-items-center">
                            <h5 class="fs-xl mb-0 numero-plano-valor">${ls.filter((i) => i.status === st).length}</h5>
                            <span class="avatar-sm rounded numero-plano-icone"><span class="avatar-title rounded"><i class="ti ${icone} fs-xl"></i></span></span>
                        </div>
                        <p class="text-muted mb-0 numero-plano-rotulo">${STATUS_CURTO[st]}</p>
                    </div>
                </div>
            </div>`
            )
            .join("")}</div>`;
    }
    
    /**
     * As ações da linha, conforme o status da Iniciativa e quem olha.
     *
     * Setorial: edita enquanto a Iniciativa está aberta para ele (em preenchimento, devolvida, divergência); nos demais
     * status só visualiza. Central: inicia a revisão da Enviada, continua a Em revisão, e reavalia a Validada. Marcar é
     * uma etiqueta de quem acompanha e vale em qualquer status; as pendências só importam enquanto a Iniciativa se edita.
     */
    function acoesDaIniciativa(i) {
        const ficha = url(`${detalhe}?id=${encodeURIComponent(i.id)}`);
        // Inativa: só para consulta. A Central a reativa; o setorial só a vê.
        if (i.status === "inativa") {
            const so = [{ link: ficha, icone: "ti-eye", rotulo: "Visualizar" }];
            if (central && !leitura) so.push({ acao: "reativar", icone: "ti-player-play", rotulo: "Reativar" });
            if (!leitura) so.push({ acao: "marcar", icone: "ti-tag-plus", rotulo: "Adicionar marcadores" });
            return so;
        }
        const abertaParaEditar = podeEditar(i.status);
        const itens = [];
        if (central) {
            if (!leitura && i.status === "enviada") itens.push({ acao: "iniciar-revisao", icone: "ti-player-play", rotulo: "Iniciar revisão" });
            else if (!leitura && i.status === "em_analise") itens.push({ link: ficha, icone: "ti-clipboard-check", rotulo: "Continuar revisão" });
            else itens.push({ link: ficha, icone: "ti-eye", rotulo: "Visualizar" });
            if (!leitura && i.status === "validada") itens.push({ acao: "reavaliar", icone: "ti-refresh", rotulo: "Reavaliar" });
        } else {
            itens.push(!leitura && abertaParaEditar ? { link: ficha, icone: "ti-pencil", rotulo: "Editar" } : { link: ficha, icone: "ti-eye", rotulo: "Visualizar" });
        }
        if (!leitura) itens.push({ acao: "marcar", icone: "ti-tag-plus", rotulo: "Adicionar marcadores" });
        const pendencias = pendDe(i).length;
        if (abertaParaEditar && pendencias) itens.push({ acao: "pendencias", icone: "ti-alert-triangle", rotulo: `Ver pendências (${pendencias})`, classe: "text-danger" });
        // Só a Central inativa e reativa.
        if (central && !leitura) itens.push({ divisor: true }, { acao: "inativar", icone: "ti-ban", rotulo: "Inativar" });
        return itens;
    }

    function menuDeAcoes(i) {
        const itens = acoesDaIniciativa(i)
            .map((a) =>
                a.divisor
                    ? '<li><hr class="dropdown-divider" /></li>'
                    : a.link
                    ? `<li><a class="dropdown-item" href="${a.link}"><i class="ti ${a.icone} me-2"></i>${esc(a.rotulo)}</a></li>`
                    : `<li><button type="button" class="dropdown-item ${a.classe ?? ""}" data-${a.acao === "marcar" ? "marcar" : a.acao}="${esc(i.id)}"><i class="ti ${a.icone} me-2"></i>${esc(a.rotulo)}</button></li>`
            )
            .join("");
        // A tabela rola dentro do cartão: sem a estratégia "fixed" o menu seria cortado nas últimas linhas.
        return `<div class="dropdown">
            <button type="button" class="btn btn-sm btn-light btn-icon" data-bs-toggle="dropdown" data-bs-popper-config='{"strategy":"fixed"}'
                    aria-expanded="false" aria-label="Ações de ${esc(i.nome)}"><i class="ti ti-dots-vertical"></i></button>
            <ul class="dropdown-menu dropdown-menu-end fs-13">${itens}</ul>
        </div>`;
    }

    function corpo() {
        const ls = linhas();
        if (ls.length === 0) {
            return `<tr><td colspan="${central ? 10 : 9}" class="text-center text-muted py-4 fs-12">${
                iniciativasDoPlano().length === 0
                    ? `Nenhuma Iniciativa neste plano.${central ? "" : " Comece por “Criar iniciativa”."}`
                    : "Nenhuma Iniciativa corresponde ao filtro."
            }</td></tr>`;
        }
        return paginacao
            .fatia(ls)
            .map((i) => {
                            const qtdEntregas = entregasDaIniciativa(estado, i.id).length;
                return `
            <tr${i.status === "inativa" ? ' class="linha-inativa"' : ""}>
                <td>${selosDeMarcadores(i.marcadorIds, estado, i.marcadorObs)}</td>
                <td>
                    <span class="fw-medium text-nowrap">${esc(i.nome)}</span>
                </td>
                <td class="fs-13 text-nowrap">${
                    programaDe(i) ? `${esc(programaDe(i).codigo)}-${esc(programaDe(i).nome)}` : '<span class="text-muted">—</span>'
                }</td>
                <td class="fs-13 text-muted">${
                    problemaDe(i)
                        ? textoLongo(problemaDe(i).nome, 1, "24rem")
                        : "—"
                }</td>
                <td class="fs-13">${
                    causasDe(i).length ? textoLongo(causasDe(i).map((c) => c.nome), 1, "20rem") : '<span class="text-muted">—</span>'
                }</td>
                <td class="text-center" style="font-variant-numeric:tabular-nums">${indicadoresDe(i).length}</td>
                ${central ? `<td class="fs-13 text-muted text-nowrap">${esc(i.orgao ?? "—")}</td>` : ""}
                <td>
                    ${statusChip(i.status)}
                    ${i.status === "divergencia" && i.motivo ? `<div class="fs-12 text-muted mt-1" title="${esc(rotuloMotivo(i.motivo))}">Motivo: ${esc(rotuloMotivo(i.motivo, 60))}</div>` : ""}
                </td>
                <td class="text-center" style="font-variant-numeric:tabular-nums">${qtdEntregas}</td>
                <td class="text-end coluna-acoes">${menuDeAcoes(i)}</td>
            </tr>`;
            })
            .join("");
    }
    
    function render() {
        document.getElementById("conteudo").innerHTML = `
        ${barraTitulo(central ? "Cadastro de Iniciativas" : "Iniciativas")}
        <div id="faixa">${faixa()}</div>
        <div class="card">
            ${filtros.html()}
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead>
                        <tr>
                            <th style="width:9rem">Marcador</th>
                            <th>Iniciativa</th>
                            <th>Programa</th>
                            <th>Problema</th>
                            <th>Causas</th>
                            <th class="text-center" style="width:6rem">Indicadores</th>
                            ${central ? `<th>Órgão</th>` : ""}
                            <th style="width:9rem">Status</th>
                            <th class="text-center" style="width:5rem">Entregas</th>
                            <th class="text-end coluna-acoes" style="width:5rem">Ações</th>
                        </tr>
                    </thead>
                    <!-- Tudo alinhado ao topo: as células têm alturas diferentes, e
                         centralizar deixava cada coluna começando numa altura. O
                         template centraliza toda célula, por isso o !important. -->
                    <style>#corpo-lista > tr > td { vertical-align: top !important; }</style>
                    <tbody id="corpo-lista">${corpo()}</tbody>
                </table>
            </div>
            ${paginacao.html()}
        </div>`;
    
        paginacao.ligar();
        iniciarDicasDeMarcador(document.getElementById("corpo-lista"));
        filtros.ligar(() => {
            paginacao.inicio();
            repintarCorpo();
            paginacao.atualizar();
            document.getElementById("faixa").innerHTML = faixa();
        });
    }

    function repintarCorpo() {
        const corpoEl = document.getElementById("corpo-lista");
        corpoEl.innerHTML = corpo();
        iniciarDicasDeMarcador(corpoEl);
    }
    
    render();
    
    // Pendências da Iniciativa: o ícone da coluna Ações abre a lista; sem pendência, fica bloqueado.
    // Iniciar revisão (Central, Iniciativa enviada): muda o status e abre a ficha, onde a avaliação começa.
    document.addEventListener("click", (e) => {
        const b = e.target.closest("[data-iniciar-revisao]");
        if (!b) return;
        const ini = estado.iniciativas.find((x) => x.id === b.dataset.iniciarRevisao);
        if (!ini || ini.status !== "enviada") return;
        iniciarAnalise(ini.id);
        avisarDepois("Revisão iniciada.");
        location.href = url(`central-iniciativa.html?id=${encodeURIComponent(ini.id)}`);
    });

    // Inativar e reativar (só a Central): tira a Iniciativa de circulação, ou a devolve.
    document.addEventListener("click", (e) => {
        const b = e.target.closest("[data-inativar], [data-reativar]");
        if (!b || !central || leitura) return;
        const reativando = b.hasAttribute("data-reativar");
        const ini = estado.iniciativas.find((x) => x.id === (reativando ? b.dataset.reativar : b.dataset.inativar));
        if (!ini) return;
        if (reativando) reativarIniciativa(ini.id);
        else inativarIniciativa(ini.id);
        repintarCorpo();
        document.getElementById("faixa").innerHTML = faixa();
        avisar(reativando ? "Iniciativa reativada." : "Iniciativa inativada.");
    });

    // Reavaliar (Central, Iniciativa validada): pede o motivo, que fica no histórico, e devolve a Iniciativa à revisão.
    document.addEventListener("click", (e) => {
        const b = e.target.closest("[data-reavaliar]");
        if (!b) return;
        const ini = estado.iniciativas.find((x) => x.id === b.dataset.reavaliar);
        if (!ini || ini.status !== "validada") return;
        pedirJustificativa({
            titulo: "Reavaliar Iniciativa",
            texto: `“${ini.nome}” volta para revisão e a avaliação é refeita do zero, campo a campo.`,
            rotulo: "Por que esta Iniciativa precisa ser reavaliada?",
            exemplo: "Explique o motivo da reavaliação (mínimo de 20 caracteres)",
            confirmar: "Reavaliar",
            nota: "A justificativa fica registrada no histórico, junto com a avaliação anterior.",
        }).then((justificativa) => {
            if (!justificativa) return;
            reavaliarIniciativa(ini.id, justificativa);
            repintarCorpo();
            document.getElementById("faixa").innerHTML = faixa();
            avisar("Reavaliação iniciada: a Iniciativa voltou para revisão.");
        });
    });

    // "Adicionar marcadores": pôr ou tirar marcadores de uma Iniciativa sem abrir a ficha dela.
    document.addEventListener("click", (e) => {
        const botao = e.target.closest("[data-marcar]");
        if (!botao) return;
        const ini = estado.iniciativas.find((x) => x.id === botao.dataset.marcar);
        if (!ini) return;
        abrirJanelaDeMarcadores({
            titulo: `Marcadores — ${ini.nome}`,
            selecionados: ini.marcadorIds ?? [],
            observacoes: ini.marcadorObs ?? {},
            estado,
            aoSalvar: (ids, observacoes) => {
                updIniciativa(ini.id, { marcadorIds: ids, marcadorObs: observacoes });
                repintarCorpo();
                avisar("Marcadores da Iniciativa atualizados.");
            },
        });
    });

    document.addEventListener("click", (e) => {
        const b = e.target.closest("[data-pendencias]");
        if (!b || b.disabled) return;
        const ini = estado.iniciativas.find((x) => x.id === b.dataset.pendencias);
        if (!ini) return;
        document.getElementById("modal-pendencias")?.remove();
        document.body.insertAdjacentHTML(
            "beforeend",
            `<div class="modal fade" id="modal-pendencias" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-scrollable"><div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title fs-15">Pendências — ${esc(ini.nome)}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">${listaPendencias(pendDe(ini), { linkEntrega: false })}</div>
            <div class="modal-footer"><button type="button" class="btn btn-light" data-bs-dismiss="modal">Fechar</button></div>
        </div></div>
    </div>`
        );
        const el = document.getElementById("modal-pendencias");
        el.addEventListener("hidden.bs.modal", () => el.remove());
        new bootstrap.Modal(el).show();
    });
}
