/**
 * Cadastro 3 — o plano montado como um checkout.
 *
 * A terceira leitura do mesmo trabalho. A tela "Cadastro" põe o plano inteiro
 * numa superfície e deixa a pessoa circular por ele; esta faz o contrário:
 * conduz por um caminho só, um passo de cada vez, e **não grava nada até o
 * fim**.
 *
 *   Eixo → Objetivo → Programa → Problema → Causas → Indicadores → Revisão
 *
 * Por que isso vale a pena existir ao lado da outra:
 *
 * 1. **Quem cadastra o primeiro Programa não sabe a ordem.** A tela de
 *    superfície pressupõe que a pessoa já entendeu a cadeia; esta ensina a
 *    cadeia enquanto ela é percorrida. Serve ao servidor novo e ao setorial que
 *    entra uma vez por ciclo.
 *
 * 2. **A barra responde "quanto falta".** Numa tela de cadastro comum, a pessoa
 *    só descobre o tamanho do trabalho quando chega ao fim. Aqui o tamanho é
 *    dito na primeira tela.
 *
 * 3. **Nada se grava até "Concluir".** É a diferença que o carrinho de compras
 *    ensinou a todo mundo: montar não é comprar. Metade de um Programa salva no
 *    meio do caminho vira pendência que alguém vai ter de limpar depois — e o
 *    resumo à direita existe para que a revisão seja possível antes disso.
 *
 * O resumo à direita é o carrinho: mostra o que já foi escolhido e permite
 * voltar a qualquer passo sem perder o resto.
 */
import { obterEstado, ppaCorrente, addItem, addPrograma, updItem } from "../dados/store.js";
import { montarShell, barraTitulo, somenteLeitura, url } from "../shell.js";
import { esc, chip } from "../ui.js";
import { avisar } from "../toast.js";
import { catalogo } from "../catalogo.js";

const { estado } = montarShell();
const leitura = somenteLeitura();
const plano = ppaCorrente(estado);

/* ---------- o carrinho ---------- */

/** O que está sendo montado. Só vira registro no último passo. */
const carrinho = {
    eixoId: "",
    objetivoId: "",
    programa: { codigo: "", nome: "", orgaoCoordenador: "", objetivo: "", resultadoEsperado: "" },
    problema: { nome: "", descricao: "", consequencias: "" },
    populacaoIds: [],
    causaIds: [],
    indicadorIds: [],
};

let passo = 0;
let concluido = null;

/* ---------- catálogos ---------- */

const doPlano = (r) => !r.ppaId || !plano || r.ppaId === plano.id;

const catEixo = catalogo({
    colecao: "eixos",
    singular: "Eixo",
    plural: "Eixo",
    artigo: "o",
    prefixo: "c3eixo",
    unico: true,
    ajuda: "O nível mais alto do plano. Se o eixo de que você precisa ainda não existe, cadastre-o aqui.",
    campos: [{ id: "descricao", rotulo: "Descrição", ajuda: "O que este eixo reúne" }],
});

const catObjetivo = catalogo({
    colecao: "objetivos",
    singular: "Objetivo estratégico",
    plural: "Objetivo estratégico",
    artigo: "o",
    prefixo: "c3obj",
    unico: true,
    ajuda: "O que o eixo se propõe a alcançar. É a ele que o Programa se vincula.",
    campos: [{ id: "descricao", rotulo: "Descrição", ajuda: "O que este objetivo persegue" }],
    detalhe: (o, est) => {
        const e = (est.eixos ?? []).find((x) => x.id === o.eixoId);
        return e ? `Eixo: ${e.nome}` : "Sem eixo";
    },
});

const catPopulacao = catalogo({
    colecao: "populacoes",
    singular: "Grupo populacional",
    plural: "População afetada",
    artigo: "o",
    prefixo: "c3pop",
    ajuda: "Quem é atingido pelo problema.",
    campos: [{ id: "estimativa", rotulo: "Estimativa de pessoas", tipo: "texto" }],
});

const catCausa = catalogo({
    colecao: "causas",
    singular: "Causa",
    plural: "Causas",
    artigo: "a",
    prefixo: "c3cau",
    ajuda: "O que origina o problema. As subcausas de cada causa aparecem na grade.",
    campos: [
        { id: "justificativa", rotulo: "Justificativa", ajuda: "Por que ela origina o problema" },
        { id: "evidencia", rotulo: "Evidência", ajuda: "O número que a sustenta" },
    ],
    colunasExtra: [
        {
            rotulo: "Subcausas",
            valor: (c, est) => {
                const subs = (c.subcausaIds ?? []).map((id) => (est.subcausas ?? []).find((s) => s.id === id)).filter(Boolean);
                return subs.length ? subs.map((s) => chip(s.nome, "neutro")).join(" ") : '<span class="text-muted">—</span>';
            },
        },
    ],
});

const catIndicador = catalogo({
    colecao: "indicadores",
    singular: "Indicador",
    plural: "Indicadores",
    artigo: "o",
    prefixo: "c3ind",
    ajuda: "O que diz se o problema está diminuindo.",
    campos: [{ id: "unidade", rotulo: "Unidade", tipo: "texto" }],
    colunasExtra: [{ rotulo: "Linha de base", valor: (i) => esc(i.linhaBase || "—") }],
});

/* ---------- os passos ---------- */

const PASSOS = [
    { id: "eixo", rotulo: "Eixo", icone: "ti-layout-columns" },
    { id: "objetivo", rotulo: "Objetivo", icone: "ti-target-arrow" },
    { id: "programa", rotulo: "Programa", icone: "ti-layout-grid" },
    { id: "problema", rotulo: "Problema", icone: "ti-alert-triangle" },
    { id: "causas", rotulo: "Causas", icone: "ti-binary-tree" },
    { id: "indicadores", rotulo: "Indicadores", icone: "ti-chart-dots" },
    { id: "revisao", rotulo: "Revisão", icone: "ti-checkbox" },
];

/** O que impede de seguir daqui. Vazio quer dizer que o passo está pronto. */
function trava(n) {
    const p = PASSOS[n].id;
    if (p === "eixo") return carrinho.eixoId ? "" : "Escolha ou cadastre um eixo.";
    if (p === "objetivo") return carrinho.objetivoId ? "" : "Escolha ou cadastre um objetivo estratégico.";
    if (p === "programa") {
        if (!carrinho.programa.nome.trim()) return "Informe o nome do Programa.";
        if (!carrinho.programa.objetivo.trim()) return "Informe o objetivo do Programa.";
        return "";
    }
    if (p === "problema") return carrinho.problema.nome.trim() ? "" : "Informe o problema central.";
    if (p === "causas") return carrinho.causaIds.length ? "" : "Escolha ao menos uma causa.";
    if (p === "indicadores") return carrinho.indicadorIds.length ? "" : "Escolha ao menos um indicador.";
    return "";
}

const prontos = () => PASSOS.slice(0, -1).filter((_, n) => !trava(n)).length;

/* ---------- barra de progresso ---------- */

function barra() {
    const total = PASSOS.length - 1;
    const pct = Math.round((prontos() / total) * 100);

    return `
    <div class="card mb-3">
        <div class="card-body p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="rotulo-secao mb-0">Passo ${passo + 1} de ${PASSOS.length} · ${esc(PASSOS[passo].rotulo)}</span>
                <span class="fs-12 text-muted">${prontos()} de ${total} prontos · ${pct}%</span>
            </div>

            <div class="progress mb-3" style="height:6px">
                <div class="progress-bar bg-primary" style="width:${pct}%"></div>
            </div>

            <div class="passos">
                ${PASSOS.map((s, n) => {
                    const pronto = n < PASSOS.length - 1 && !trava(n);
                    const aqui = n === passo;
                    // Só se anda para um passo já alcançado: pular etapa deixaria
                    // o caminho pela metade sem a pessoa perceber.
                    const alcancavel = n <= passo || pronto;
                    return `
                <button type="button" class="passo ${aqui ? "atual" : ""} ${pronto ? "pronto" : ""}"
                        ${alcancavel ? `data-passo="${n}"` : "disabled"}>
                    <span class="passo-marca">
                        ${pronto && !aqui ? '<i class="ti ti-check"></i>' : `<i class="ti ${s.icone}"></i>`}
                    </span>
                    <span class="passo-rotulo">${esc(s.rotulo)}</span>
                </button>`;
                }).join("")}
            </div>
        </div>
    </div>`;
}

/* ---------- conteúdo de cada passo ---------- */

const campo = (id, rotulo, valor, { linhas = 0, exemplo = "", ajuda = "" } = {}) => `
<div class="mb-3">
    <label class="form-label" for="${id}">${esc(rotulo)}</label>
    ${
        linhas
            ? `<textarea class="form-control" id="${id}" rows="${linhas}" placeholder="${esc(exemplo)}">${esc(valor ?? "")}</textarea>`
            : `<input type="text" class="form-control" id="${id}" value="${esc(valor ?? "")}" placeholder="${esc(exemplo)}" />`
    }
    ${ajuda ? `<div class="form-text fs-12">${esc(ajuda)}</div>` : ""}
</div>`;

const cabecalho = (titulo, explicacao) => `
<div class="mb-3">
    <h4 class="fs-16 fw-bold mb-1">${esc(titulo)}</h4>
    <p class="text-muted fs-13 mb-0">${esc(explicacao)}</p>
</div>`;

function conteudo() {
    const p = PASSOS[passo].id;

    if (p === "eixo") {
        return `
        ${cabecalho("Em que eixo este Programa entra?", "O eixo é o nível mais alto do plano. Ele reúne os objetivos estratégicos e, por eles, os Programas.")}
        ${catEixo.html(carrinho.eixoId ? [carrinho.eixoId] : [])}`;
    }

    if (p === "objetivo") {
        const e = (estado.eixos ?? []).find((x) => x.id === carrinho.eixoId);
        return `
        ${cabecalho("Que objetivo estratégico ele persegue?", `Dentro de ${e?.nome ?? "o eixo escolhido"}. É ao objetivo que o Programa se vincula.`)}
        ${catObjetivo.html(carrinho.objetivoId ? [carrinho.objetivoId] : [])}`;
    }

    if (p === "programa") {
        const c = carrinho.programa;
        return `
        ${cabecalho("O Programa", "O que o Estado vai fazer, e o que espera mudar com isso.")}
        <div class="row g-3">
            <div class="col-md-3">${campo("f-codigo", "Código", c.codigo, { exemplo: "1040" })}</div>
            <div class="col-md-9">${campo("f-nome", "Nome do Programa", c.nome, { exemplo: "Assistência Social e Promoção da Cidadania" })}</div>
        </div>
        ${campo("f-orgao", "Órgão coordenador", c.orgaoCoordenador, { exemplo: "Secretaria de Estado de Desenvolvimento Social" })}
        ${campo("f-objetivo", "Objetivo do Programa", c.objetivo, { linhas: 2, exemplo: "O que este Programa se propõe a mudar" })}
        ${campo("f-resultado", "Resultado esperado", c.resultadoEsperado, { linhas: 2 })}`;
    }

    if (p === "problema") {
        const c = carrinho.problema;
        return `
        ${cabecalho("Que problema ele enfrenta?", "Um Programa existe para resolver um problema. Sem ele, não há como dizer se o Programa serviu para alguma coisa.")}
        ${campo("f-problema", "Problema central", c.nome, { linhas: 2, exemplo: "Acesso desigual ao cuidado integral na primeira infância" })}
        ${campo("f-descricao", "Descrição", c.descricao, { linhas: 2, exemplo: "O que caracteriza este problema" })}
        ${campo("f-consequencias", "Consequências", c.consequencias, { linhas: 2, exemplo: "O que acontece se ele não for enfrentado" })}
        ${catPopulacao.html(carrinho.populacaoIds)}`;
    }

    if (p === "causas") {
        return `
        ${cabecalho("O que origina esse problema?", "A causa explica por que o problema acontece. É a ela que as Iniciativas dos órgãos vão se vincular.")}
        ${catCausa.html(carrinho.causaIds)}`;
    }

    if (p === "indicadores") {
        return `
        ${cabecalho("Como saber se está melhorando?", "O indicador é o que mede o problema. Sem ele, o Programa não se acompanha.")}
        ${catIndicador.html(carrinho.indicadorIds)}`;
    }

    return revisao();
}

/* ---------- revisão ---------- */

function revisao() {
    if (concluido) {
        return `
        <div class="text-center py-4">
            <i class="ti ti-circle-check fs-32 text-success d-block mb-2"></i>
            <h4 class="fs-16 fw-bold mb-2">Cadastro concluído</h4>
            <p class="text-muted fs-13 mb-4">
                O Programa <strong>${esc(concluido.nome)}</strong> entrou no plano, com o problema,
                as causas e os indicadores que você escolheu.
            </p>
            <div class="d-flex gap-2 justify-content-center">
                <a href="${url("central-cadastro.html")}" class="btn btn-light">Ver no plano</a>
                <button type="button" class="btn btn-primary" id="outro">Cadastrar outro</button>
            </div>
        </div>`;
    }

    const faltando = PASSOS.slice(0, -1)
        .map((s, n) => ({ n, rotulo: s.rotulo, erro: trava(n) }))
        .filter((x) => x.erro);

    return `
    ${cabecalho("Confira antes de concluir", "Até aqui nada foi gravado. Concluir é o que põe tudo no plano de uma vez.")}
    ${
        faltando.length
            ? `<div class="alert alert-warning py-2 px-3 fs-13">
        <i class="ti ti-alert-circle me-1"></i>Falta preencher:
        ${faltando.map((x) => `<button type="button" class="btn-link-tabela" data-passo="${x.n}">${esc(x.rotulo)}</button>`).join(", ")}
    </div>`
            : `<div class="alert alert-success py-2 px-3 fs-13">
        <i class="ti ti-circle-check me-1"></i>Tudo pronto. Concluir grava o Programa e o diagnóstico dele.
    </div>`
    }
    ${resumoLongo()}`;
}

function nomeDe(colecao, id) {
    return (estado[colecao] ?? []).find((x) => x.id === id)?.nome ?? "";
}

function resumoLongo() {
    const linha = (rotulo, valor) => `
    <div class="mb-3">
        <div class="rotulo-secao mb-1">${esc(rotulo)}</div>
        <div class="fs-13">${valor || '<span class="text-muted">—</span>'}</div>
    </div>`;

    return `
    <div class="card">
        <div class="card-body">
            ${linha("Eixo", esc(nomeDe("eixos", carrinho.eixoId)))}
            ${linha("Objetivo estratégico", esc(nomeDe("objetivos", carrinho.objetivoId)))}
            ${linha("Programa", `${esc(carrinho.programa.codigo)} ${esc(carrinho.programa.nome)}`.trim())}
            ${linha("Órgão coordenador", esc(carrinho.programa.orgaoCoordenador))}
            ${linha("Objetivo do Programa", esc(carrinho.programa.objetivo))}
            ${linha("Resultado esperado", esc(carrinho.programa.resultadoEsperado))}
            ${linha("Problema central", esc(carrinho.problema.nome))}
            ${linha("Consequências", esc(carrinho.problema.consequencias))}
            ${linha("População afetada", carrinho.populacaoIds.map((id) => chip(nomeDe("populacoes", id), "neutro")).join(" "))}
            ${linha("Causas", carrinho.causaIds.map((id) => chip(nomeDe("causas", id), "neutro")).join(" "))}
            ${linha("Indicadores", carrinho.indicadorIds.map((id) => chip(nomeDe("indicadores", id), "neutro")).join(" "))}
        </div>
    </div>`;
}

/* ---------- o carrinho à direita ---------- */

function resumo() {
    const item = (rotulo, valor, n) => `
    <li class="resumo-item ${valor ? "" : "vazio"}">
        <button type="button" class="resumo-ir" data-passo="${n}">
            <span class="resumo-rotulo">${esc(rotulo)}</span>
            <span class="resumo-valor">${valor ? esc(valor) : "a preencher"}</span>
        </button>
    </li>`;

    const contar = (lista, um, muitos) => (lista.length ? `${lista.length} ${lista.length === 1 ? um : muitos}` : "");

    return `
    <div class="card sticky-top" style="top:5rem">
        <div class="card-header d-block p-3">
            <h4 class="card-title mb-0">O que você está cadastrando</h4>
        </div>
        <div class="card-body p-2">
            <ul class="resumo">
                ${item("Eixo", nomeDe("eixos", carrinho.eixoId), 0)}
                ${item("Objetivo", nomeDe("objetivos", carrinho.objetivoId), 1)}
                ${item("Programa", carrinho.programa.nome, 2)}
                ${item("Problema", carrinho.problema.nome, 3)}
                ${item("Causas", contar(carrinho.causaIds, "causa", "causas"), 4)}
                ${item("Indicadores", contar(carrinho.indicadorIds, "indicador", "indicadores"), 5)}
            </ul>
        </div>
        <div class="card-footer fs-12 text-muted">
            <i class="ti ti-lock me-1"></i>Nada é gravado até você concluir.
        </div>
    </div>`;
}

/* ---------- gravação ---------- */

function concluir() {
    for (let n = 0; n < PASSOS.length - 1; n++) {
        const erro = trava(n);
        if (erro) {
            passo = n;
            avisar(erro);
            render();
            return;
        }
    }

    const objetivo = (estado.objetivos ?? []).find((o) => o.id === carrinho.objetivoId);
    const eixo = (estado.eixos ?? []).find((e) => e.id === carrinho.eixoId);

    // O objetivo escolhido passa a pertencer ao eixo escolhido: o caminho
    // percorrido é o vínculo, e não haveria por que guardá-lo diferente.
    if (objetivo && objetivo.eixoId !== carrinho.eixoId) updItem("objetivos", objetivo.id, { eixoId: carrinho.eixoId });

    const programaId = `pg-${Math.random().toString(36).slice(2, 9)}`;
    const causas = carrinho.causaIds.map((id, n) => ({ id: `c${n + 1}`, texto: nomeDe("causas", id) }));

    addPrograma({
        id: programaId,
        codigo: carrinho.programa.codigo || String((estado.programas ?? []).length + 1).padStart(3, "0"),
        nome: carrinho.programa.nome,
        eixo: eixo?.nome ?? "",
        eixoId: carrinho.eixoId,
        objetivoEstrategico: objetivo?.nome ?? "",
        objetivoId: carrinho.objetivoId,
        orgaoCoordenador: carrinho.programa.orgaoCoordenador,
        problema: carrinho.problema.nome,
        evidencias: carrinho.problema.descricao ? [carrinho.problema.descricao] : [],
        causas,
        consequencias: carrinho.problema.consequencias ? [carrinho.problema.consequencias] : [],
        populacaoAfetada: carrinho.populacaoIds.map((id) => nomeDe("populacoes", id)).join(" · "),
        objetivo: carrinho.programa.objetivo,
        resultadoEsperado: carrinho.programa.resultadoEsperado,
        indicadores: carrinho.indicadorIds.map((id) => {
            const i = (estado.indicadores ?? []).find((x) => x.id === id);
            return { nome: i?.nome ?? "", unidade: i?.unidade ?? "", linhaBase: i?.linhaBase ?? "", meta: "" };
        }),
        aptidao: "apto",
        disponibilizacao: "disponivel",
        ppaId: plano?.id ?? "",
    });

    // O problema entra no Cadastro de Problemas com tudo o que foi reunido.
    addItem("problemas", {
        id: `pb-${programaId}`,
        nome: carrinho.problema.nome,
        descricao: carrinho.problema.descricao,
        consequencias: carrinho.problema.consequencias,
        populacaoIds: [...carrinho.populacaoIds],
        indicadorIds: [...carrinho.indicadorIds],
        causaIds: [...carrinho.causaIds],
    });

    concluido = { nome: carrinho.programa.nome };
    avisar("Programa cadastrado com o diagnóstico completo.");
    render();
}

function recomeçar() {
    Object.assign(carrinho, {
        eixoId: "",
        objetivoId: "",
        programa: { codigo: "", nome: "", orgaoCoordenador: "", objetivo: "", resultadoEsperado: "" },
        problema: { nome: "", descricao: "", consequencias: "" },
        populacaoIds: [],
        causaIds: [],
        indicadorIds: [],
    });
    concluido = null;
    passo = 0;
    render();
}

/* ---------- ler o que está na tela antes de sair do passo ---------- */

const v = (id) => document.getElementById(id)?.value.trim() ?? "";

function guardar() {
    const p = PASSOS[passo].id;
    if (p === "eixo") carrinho.eixoId = catEixo.ler()[0] ?? "";
    if (p === "objetivo") carrinho.objetivoId = catObjetivo.ler()[0] ?? "";
    if (p === "programa") {
        carrinho.programa = {
            codigo: v("f-codigo"),
            nome: v("f-nome"),
            orgaoCoordenador: v("f-orgao"),
            objetivo: v("f-objetivo"),
            resultadoEsperado: v("f-resultado"),
        };
    }
    if (p === "problema") {
        carrinho.problema = { nome: v("f-problema"), descricao: v("f-descricao"), consequencias: v("f-consequencias") };
        carrinho.populacaoIds = catPopulacao.ler();
    }
    if (p === "causas") carrinho.causaIds = catCausa.ler();
    if (p === "indicadores") carrinho.indicadorIds = catIndicador.ler();
}

/* ---------- desenho ---------- */

function render() {
    const ultimo = passo === PASSOS.length - 1;
    const erro = trava(passo);

    document.getElementById("conteudo").innerHTML = `
    ${barraTitulo("Cadastro 3")}
    <p class="text-muted fs-13 mb-3">
        Um passo de cada vez, do eixo ao indicador. Nada entra no plano até você concluir.
    </p>
    ${concluido ? "" : barra()}
    <div class="row g-3 align-items-start">
        <div class="col-xxl-8 col-lg-7">
            <div class="card">
                <div class="card-body" id="passo-corpo">${conteudo()}</div>
                ${
                    concluido || leitura
                        ? ""
                        : `<div class="card-footer d-flex align-items-center gap-2">
                    <button type="button" class="btn btn-light" id="voltar" ${passo === 0 ? "disabled" : ""}>
                        <i class="ti ti-arrow-left me-1"></i>Voltar
                    </button>
                    <span class="fs-12 text-danger flex-grow-1">${ultimo ? "" : esc(erro)}</span>
                    ${
                        ultimo
                            ? `<button type="button" class="btn btn-primary" id="concluir"><i class="ti ti-check me-1"></i>Concluir cadastro</button>`
                            : `<button type="button" class="btn btn-primary" id="avancar">Continuar<i class="ti ti-arrow-right ms-1"></i></button>`
                    }
                </div>`
                }
            </div>
        </div>
        <div class="col-xxl-4 col-lg-5">${concluido ? "" : resumo()}</div>
    </div>`;

    const escopo = document.getElementById("passo-corpo");
    const atual = PASSOS[passo].id;
    if (atual === "eixo") catEixo.ligar(escopo);
    if (atual === "objetivo") catObjetivo.ligar(escopo);
    if (atual === "problema") catPopulacao.ligar(escopo);
    if (atual === "causas") catCausa.ligar(escopo);
    if (atual === "indicadores") catIndicador.ligar(escopo);
}

/* ---------- eventos ---------- */

document.addEventListener("click", (e) => {
    if (e.target.closest("#avancar")) {
        guardar();
        const erro = trava(passo);
        if (erro) return avisar(erro);
        passo = Math.min(passo + 1, PASSOS.length - 1);
        return render();
    }

    if (e.target.closest("#voltar")) {
        guardar();
        passo = Math.max(passo - 1, 0);
        return render();
    }

    const ir = e.target.closest("[data-passo]");
    if (ir) {
        guardar();
        passo = Number(ir.dataset.passo);
        return render();
    }

    if (e.target.closest("#concluir")) {
        guardar();
        return concluir();
    }

    if (e.target.closest("#outro")) return recomeçar();
});

render();
