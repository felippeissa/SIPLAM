/**
 * Criar e editar o Programa, em tela própria.
 *
 * Os campos são os da matriz de mapeamento, na ordem dela:
 *
 *   Nome* · Status* · Descrição do programa* · Objetivo do programa ·
 *   Resultado esperado · Eixo · Objetivo estratégico · Problema ·
 *   População afetada · Causa e subcausa · Indicadores de resultado · Iniciativas
 *
 * Só três são obrigatórios. O resto é **vínculo**: o Programa aponta para
 * cadastros que existem em outro lugar — eixo, objetivo, problema, indicadores —
 * e por isso a tela escolhe, e não digita.
 *
 * **População afetada, Causa e subcausa e Iniciativas são listas editáveis**, como
 * a matriz as marca. As duas primeiras começam pelas do Problema escolhido — a
 * matriz as chama de "vínculo de problema" — e escolher outro Problema as refaz;
 * dali em diante a pessoa acrescenta e tira o que quiser. As Iniciativas são do
 * órgão e guardam o Programa delas: incluir uma aqui a traz para este Programa, e
 * tirá-la a deixa sem Programa, que a matriz dá como opcional.
 *
 * **Status** diz onde o Programa está na oferta aos órgãos, e inclui "vigente",
 * que a matriz acrescenta. Regra de negócio dela: o Programa só fica vigente
 * quando tem problema e indicadores cadastrados.
 *
 * Saíram do formulário, em 06/10/2026, por não constarem da matriz: código,
 * aptidão, órgão coordenador e governança. O código passa a ser do sistema; a
 * aptidão, derivada do que o Programa tem; os outros dois ficam guardados.
 */
import { addPrograma, updPrograma, updIniciativa, ppaCorrente } from "../dados/store.js";
import { DISPONIBILIZACAO_LABEL } from "../dados/regras.js";
import { montarShell, barraTitulo, somenteLeitura, url } from "../shell.js";
import { catalogo } from "../catalogo.js";
import { esc, chip } from "../ui.js";
import { avisar } from "../toast.js";
import { campoErro, validar, limparAoDigitar } from "../validacao.js";

const uid = () => Math.random().toString(36).slice(2, 9);

/**
 * Eixo e objetivo estratégico por catálogo, e não por lista suspensa.
 *
 * Quem cadastra um Programa costuma estar montando o plano, e o eixo ou o
 * objetivo de que ele precisa às vezes ainda não existe. Os dois são vínculo de
 * um só: um Programa pertence a um eixo e a um objetivo.
 */
const catalogoEixo = catalogo({
    colecao: "eixos",
    singular: "Eixo",
    plural: "Eixo",
    artigo: "o",
    prefixo: "peix",
    unico: true,
    campos: [{ id: "descricao", rotulo: "Descrição", ajuda: "O que este eixo reúne" }],
    usos: (id, estado) => (estado.objetivos ?? []).filter((o) => o.eixoId === id).length,
});

const catalogoObjetivo = catalogo({
    colecao: "objetivos",
    singular: "Objetivo estratégico",
    plural: "Objetivo estratégico",
    artigo: "o",
    prefixo: "pobj",
    unico: true,
    campos: [{ id: "descricao", rotulo: "Descrição", ajuda: "O que este objetivo persegue" }],
    detalhe: (o, estado) => {
        const eixo = (estado.eixos ?? []).find((e) => e.id === o.eixoId);
        return eixo ? `Eixo: ${eixo.nome}` : "Sem eixo";
    },
    usos: (id, estado) => (estado.programas ?? []).filter((pr) => pr.objetivoId === id).length,
});

/**
 * O problema e os indicadores são cadastros próprios, com muitos campos e regras
 * que não cabem numa janela de três linhas: aqui só se escolhe o que já existe.
 */
const catalogoProblema = catalogo({
    colecao: "problemas",
    singular: "Problema",
    plural: "Problema",
    artigo: "o",
    prefixo: "pprb",
    unico: true,
    semCriar: true,
    campos: [],
    colunasExtra: [{ rotulo: "Descrição", valor: (p) => (p.descricao ? esc(p.descricao) : '<span class="text-muted">—</span>') }],
    detalhe: (p) => p.descricao ?? "",
});

const catalogoIndicadores = catalogo({
    colecao: "indicadores",
    singular: "Indicador",
    plural: "Indicadores de resultado",
    artigo: "o",
    prefixo: "pind",
    semCriar: true,
    campos: [],
    colunasExtra: [
        { rotulo: "Tipo", valor: (i) => (i.tipo ? esc(i.tipo) : '<span class="text-muted">—</span>') },
        { rotulo: "Unidade", valor: (i) => (i.unidade ? esc(i.unidade) : '<span class="text-muted">—</span>') },
        { rotulo: "Linha de base", valor: (i) => (i.linhaBase ? esc(i.linhaBase) : '<span class="text-muted">—</span>') },
    ],
    detalhe: (i) => [i.tipo, i.unidade].filter(Boolean).join(" · "),
});

const catalogoPopulacao = catalogo({
    colecao: "populacoes",
    singular: "Grupo populacional",
    plural: "População afetada",
    artigo: "o",
    prefixo: "ppop",
    campos: [{ id: "estimativa", rotulo: "Estimativa de pessoas", tipo: "texto", ajuda: "Opcional" }],
    usos: (id, estado) => (estado.problemas ?? []).filter((p) => (p.populacaoIds ?? []).includes(id)).length,
});

const catalogoCausas = catalogo({
    colecao: "causas",
    singular: "Causa",
    plural: "Causa e subcausa",
    artigo: "a",
    prefixo: "pcau",
    campos: [
        { id: "justificativa", rotulo: "Justificativa", ajuda: "Por que ela origina o problema" },
        { id: "descricao", rotulo: "Descrição", ajuda: "O que caracteriza esta causa" },
    ],
    colunasExtra: [
        {
            rotulo: "Subcausas",
            valor: (c, estado) => {
                const subs = (c.subcausaIds ?? []).map((id) => (estado.subcausas ?? []).find((s) => s.id === id)).filter(Boolean);
                return subs.length ? subs.map((s) => chip(s.nome, "neutro")).join(" ") : '<span class="text-muted">—</span>';
            },
        },
    ],
    usos: (id, estado) => (estado.problemas ?? []).filter((p) => (p.causaIds ?? []).includes(id)).length,
});

// A Iniciativa é do órgão: aqui só se escolhe a que já existe.
const catalogoIniciativas = catalogo({
    colecao: "iniciativas",
    singular: "Iniciativa",
    plural: "Iniciativas",
    artigo: "a",
    prefixo: "pini",
    semCriar: true,
    campos: [],
    colunasExtra: [{ rotulo: "Órgão", valor: (i) => (i.orgao ? esc(i.orgao) : '<span class="text-muted">—</span>') }],
    detalhe: (i, estado) => {
        const programa = (estado.programas ?? []).find((p) => p.id === i.programaId);
        return [i.orgao, programa ? `hoje em ${programa.nome}` : "sem Programa"].filter(Boolean).join(" · ");
    },
});

/** Os cinco status da matriz, na ordem dela. */
const STATUS = [
    ["em_estruturacao", "Em estruturação"],
    ["pronto", "Pronto para disponibilização"],
    ["disponivel", "Disponível para contribuições"],
    ["encerrado", "Encerrado para novas contribuições"],
    ["vigente", "Vigente"],
];

export function montarFormularioPrograma({ novo }) {
    const { estado } = montarShell();
    const leitura = somenteLeitura();
    const voltar = url("central-programas.html");

    const id = new URLSearchParams(location.search).get("id");
    const original = novo ? null : estado.programas.find((p) => p.id === id);

    if (!novo && !original) {
        document.getElementById("conteudo").innerHTML = `
        <div class="my-4">
            <div class="alert alert-warning py-3 px-3">
                Este Programa não existe mais.
                <a href="${voltar}" class="fw-semibold">Voltar para o Cadastro de Programa</a>.
            </div>
        </div>`;
        return;
    }

    const edicao = novo ? vazio() : structuredClone(original);

    function vazio() {
        return {
            id: `pg-${uid()}`,
            ppaId: ppaCorrente(estado)?.id,
            codigo: "",
            nome: "",
            eixo: "",
            objetivoEstrategico: "",
            descricao: "",
            problema: "",
            evidencias: [],
            causas: [],
            consequencias: [],
            populacaoAfetada: "",
            objetivo: "",
            resultadoEsperado: "",
            indicadores: [],
            orgaoCoordenador: "",
            governanca: "",
            aptidao: "incompleto",
            disponibilizacao: "em_estruturacao",
        };
    }

    /** O próximo código do plano: o maior que existe, mais um. Quem cadastra não o escolhe. */
    function proximoCodigo() {
        const maior = estado.programas.reduce((m, p) => Math.max(m, Number(p.codigo) || 0), 0);
        return String(maior + 1);
    }

    /**
     * O que falta para o Programa operar: problema e indicadores. É a regra de
     * negócio que a matriz põe no status "vigente", e serve também à aptidão.
     */
    function faltaParaOperar({ problemaId, indicadorIds }) {
        const falta = [];
        if (!problemaId) falta.push("problema");
        if (!indicadorIds.length) falta.push("indicadores");
        return falta;
    }

    /** O problema que o Programa já enfrenta: o vínculo gravado ou, nos anteriores a ele, o derivado do próprio Programa. */
    const problemaInicial =
        edicao.problemaId ?? (estado.problemas ?? []).find((pb) => pb.id === `pb-${edicao.id}`)?.id ?? "";

    const problemaAtual = (estado.problemas ?? []).find((p) => p.id === problemaInicial);

    /** Começam pelo que o Programa já guarda; nos anteriores a estes campos, pelo que o Problema traz. */
    const populacaoInicial = edicao.populacaoIds ?? problemaAtual?.populacaoIds ?? [];
    const causasIniciais = edicao.causaIds ?? problemaAtual?.causaIds ?? [];

    /** As Iniciativas que hoje apontam para este Programa. */
    const iniciativasIniciais = (estado.iniciativas ?? []).filter((i) => i.programaId === edicao.id).map((i) => i.id);

    /** Os indicadores já ligados: por identificador ou, nos anteriores, pelo nome. */
    const indicadoresIniciais = (
        edicao.indicadorIds ??
        (edicao.indicadores ?? []).map((i) => (estado.indicadores ?? []).find((x) => x.nome === i.nome)?.id)
    ).filter(Boolean);

    /**
     * O vínculo estratégico, gravado de duas formas. Os ids são o vínculo de
     * verdade; o texto continua porque as telas de análise filtram por nome.
     */
    function vinculoEstrategico(eixoId, objetivoId) {
        const eixo = (estado.eixos ?? []).find((e) => e.id === eixoId);
        const objetivo = (estado.objetivos ?? []).find((o) => o.id === objetivoId);
        return {
            eixoId,
            objetivoId,
            eixo: eixo?.nome ?? "",
            objetivoEstrategico: objetivo?.nome ?? "",
        };
    }

    /* ---------- campos ---------- */

    function campoTexto(campo, rotulo, valor, { linhas = 1, obrigatorio = false } = {}) {
        const entrada =
            linhas > 1
                ? `<textarea class="form-control" id="${campo}" rows="${linhas}" ${leitura ? "disabled" : ""}>${esc(valor ?? "")}</textarea>`
                : `<input type="text" class="form-control" id="${campo}" value="${esc(valor ?? "")}" ${leitura ? "disabled" : ""} />`;
        return `
        <div class="mb-3">
            <label class="form-label" for="${campo}">${rotulo}${obrigatorio ? ' <span class="text-danger">*</span>' : ""}</label>
            ${entrada}
            ${campoErro(campo)}
        </div>`;
    }

    /* ---------- leitura ---------- */

    function lerFormulario() {
        const v = (campo) => document.getElementById(campo)?.value ?? "";
        const problemaId = catalogoProblema.ler()[0] ?? "";
        const indicadorIds = catalogoIndicadores.ler();
        const problema = (estado.problemas ?? []).find((p) => p.id === problemaId);

        Object.assign(edicao, {
            nome: v("f-nome").trim(),
            ...vinculoEstrategico(catalogoEixo.ler()[0] ?? "", catalogoObjetivo.ler()[0] ?? ""),
            descricao: v("f-descricao").trim(),
            objetivo: v("f-objetivo").trim(),
            resultadoEsperado: v("f-resultadoEsperado").trim(),
            disponibilizacao: v("f-status"),

            // O texto do problema acompanha o vínculo: as telas de análise o leem.
            problemaId,
            problema: problema?.nome ?? "",
            populacaoIds: catalogoPopulacao.ler(),
            causaIds: catalogoCausas.ler(),

            // Os indicadores ficam também no formato antigo, que o resto do
            // sistema lê; a identidade é o que vale.
            indicadorIds,
            indicadores: indicadorIds
                .map((iid) => (estado.indicadores ?? []).find((i) => i.id === iid))
                .filter(Boolean)
                .map((i) => ({ nome: i.nome, unidade: i.unidade ?? "", linhaBase: i.linhaBase ?? "", meta: "" })),
        });

        // A aptidão não se escolhe: é o que o Programa tem ou não tem.
        edicao.aptidao = faltaParaOperar({ problemaId, indicadorIds }).length ? "incompleto" : "apto";
    }

    /* ---------- desenho ---------- */

    function corpo() {
        return `
        <div class="row g-3">
            <div class="col-md-8">${campoTexto("f-nome", "Nome do programa", edicao.nome, { obrigatorio: true })}</div>
            <div class="col-md-4">
                <div class="mb-3">
                    <label class="form-label" for="f-status">Status <span class="text-danger">*</span></label>
                    <select class="form-select" id="f-status" ${leitura ? "disabled" : ""}>
                        ${STATUS.map(([k, rotulo]) => `<option value="${k}"${edicao.disponibilizacao === k ? " selected" : ""}>${esc(DISPONIBILIZACAO_LABEL[k] ?? rotulo)}</option>`).join("")}
                    </select>
                    ${campoErro("f-status")}
                </div>
            </div>
        </div>
        ${campoTexto("f-descricao", "Descrição do programa", edicao.descricao, { linhas: 3, obrigatorio: true })}
        ${campoTexto("f-objetivo", "Objetivo do programa", edicao.objetivo, { linhas: 2 })}
        ${campoTexto("f-resultadoEsperado", "Resultado esperado do programa", edicao.resultadoEsperado, { linhas: 2 })}

        <div class="row g-3">
            <div class="col-md-6">${catalogoEixo.html(edicao.eixoId ? [edicao.eixoId] : [])}</div>
            <div class="col-md-6">${catalogoObjetivo.html(edicao.objetivoId ? [edicao.objetivoId] : [])}</div>
        </div>

        ${catalogoProblema.html(problemaInicial ? [problemaInicial] : [])}
        ${catalogoPopulacao.html(populacaoInicial)}
        ${catalogoCausas.html(causasIniciais)}
        ${catalogoIndicadores.html(indicadoresIniciais)}
        ${catalogoIniciativas.html(iniciativasIniciais)}`;
    }

    function ligarCatalogos(escopo) {
        catalogoEixo.ligar(escopo);
        catalogoObjetivo.ligar(escopo);
        catalogoProblema.ligar(escopo);
        catalogoPopulacao.ligar(escopo);
        catalogoCausas.ligar(escopo);
        catalogoIndicadores.ligar(escopo);
        catalogoIniciativas.ligar(escopo);

        // Escolher outro Problema refaz a população e as causas — a matriz as chama
        // de "vínculo de problema". O catálogo redesenha o próprio bloco a cada
        // escolha; observá-lo é o jeito de saber, sem pedir ao catálogo um aviso
        // que ele não dá. Só a troca de Problema refaz: buscar não apaga o que a pessoa
        // ajustou.
        let ultimo = catalogoProblema.ler()[0] ?? "";
        const bloco = escopo.querySelector("#pprb-bloco");
        if (bloco) {
            new MutationObserver(() => {
                const atual = catalogoProblema.ler()[0] ?? "";
                if (atual === ultimo) return;
                ultimo = atual;
                const problema = (estado.problemas ?? []).find((p) => p.id === atual);
                catalogoPopulacao.definir(problema?.populacaoIds ?? []);
                catalogoCausas.definir(problema?.causaIds ?? []);
            }).observe(bloco, { childList: true, subtree: true });
        }
    }

    function render() {
        document.getElementById("conteudo").innerHTML = `
        ${barraTitulo(novo ? "Novo Programa" : `Editar Programa ${esc(edicao.codigo)}`, [novo ? "Novo" : "Editar"])}
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header d-flex flex-wrap justify-content-between align-items-start gap-2 p-3">
                        <div>
                        <h4 class="card-title mb-1">Programa</h4>
                        <p class="text-muted mb-0 fs-13">Identidade, vínculos e situação do Programa.</p></div>
                        <div class="d-flex gap-2 align-items-center">
            ${
                leitura
                    ? `<a href="${voltar}" class="btn btn-light">Voltar</a>`
                    : `<a href="${voltar}" class="btn btn-light">Cancelar</a>
                       <button type="button" class="btn btn-primary" id="salvar">${novo ? "Cadastrar Programa" : "Salvar Programa"}</button>`
            }</div>
                    </div>
                    <div class="card-body" id="formulario">${corpo()}</div>
                </div>
            </div>
        </div>`;

        const escopo = document.getElementById("formulario");
        limparAoDigitar(escopo);
        ligarCatalogos(escopo);
    }

    /* ---------- eventos ---------- */

    document.addEventListener("click", (e) => {
        if (leitura || !e.target.closest("#salvar")) return;

        lerFormulario();
        const escopo = document.getElementById("formulario");
        const falta = faltaParaOperar({ problemaId: edicao.problemaId, indicadorIds: edicao.indicadorIds });

        const ok = validar(escopo, [
            { campo: "f-nome", valido: !!edicao.nome, mensagem: "Informe o nome do Programa." },
            { campo: "f-status", valido: !!edicao.disponibilizacao, mensagem: "Escolha o status." },
            { campo: "f-descricao", valido: !!edicao.descricao, mensagem: "Descreva o Programa." },
            {
                // Regra de negócio da matriz: um programa só fica vigente com problema e indicadores.
                campo: "f-status",
                valido: edicao.disponibilizacao !== "vigente" || falta.length === 0,
                mensagem: `Um Programa só fica vigente com ${falta.join(" e ")} vinculado${falta.length > 1 ? "s" : ""}.`,
            },
        ]);
        if (!ok) return;

        if (novo) {
            edicao.codigo = proximoCodigo();
            addPrograma(edicao);
        } else {
            updPrograma(edicao.id, edicao);
        }

        // A Iniciativa guarda o Programa dela: incluir uma aqui a traz para este
        // Programa, tirá-la a deixa sem. As causas dela eram do Programa de antes,
        // e deixam de valer no novo.
        const escolhidas = new Set(catalogoIniciativas.ler());
        for (const ini of estado.iniciativas ?? []) {
            const estava = ini.programaId === edicao.id;
            const quer = escolhidas.has(ini.id);
            if (estava === quer) continue;
            updIniciativa(ini.id, { programaId: quer ? edicao.id : "", causas: [] });
        }
        avisar(`Programa ${novo ? "criado" : "editado"} com sucesso.`);
        window.location.href = voltar;
    });

    render();
}
