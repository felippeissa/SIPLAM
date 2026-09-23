import { esc, chip } from "../ui.js";
import { campoErro } from "../validacao.js";
import { catalogo } from "../catalogo.js";

/**
 * Cadastro de Problemas.
 *
 * Nome, descrição, quem o problema atinge, o que o mede, o que o explica e o
 * que acontece se ele não for enfrentado:
 *
 *   Problema → População afetada → Indicadores → Causas (e subcausas) → Consequências
 *
 * O problema **não pertence** a uma causa: ele aponta para elas. A mesma causa
 * explica mais de um problema, o que uma hierarquia proibiria.
 *
 * População afetada é catálogo, e não campo de texto. Dois motivos: "famílias
 * em insegurança alimentar grave" e "crianças de 0 a 3 anos fora da creche" são
 * grupos distintos, com tamanhos distintos, e somá-los numa frase apaga a
 * diferença que o plano precisa enxergar; e o mesmo grupo é atingido por mais de
 * um problema, então o texto vive num lugar só.
 */

const valor = (id) => document.getElementById(id)?.value.trim() ?? "";

/* ---------- catálogos ---------- */

const indicadores = catalogo({
    colecao: "indicadores",
    singular: "Indicador",
    plural: "Indicadores",
    artigo: "o",
    prefixo: "ind",
    ajuda: "Ao menos um. É o indicador que diz se o problema está diminuindo — sem ele, o problema não se acompanha.",
    campos: [{ id: "unidade", rotulo: "Unidade", tipo: "texto", ajuda: "Percentual, Unidade, Pessoa atendida…" }],
    colunasExtra: [
        { rotulo: "Periodicidade", valor: (i) => esc(i.periodicidade || "—") },
        { rotulo: "Linha de base", valor: (i) => esc(i.linhaBase || "—") },
    ],
    usos: (id, estado) => (estado.problemas ?? []).filter((p) => (p.indicadorIds ?? []).includes(id)).length,
});

const populacoes = catalogo({
    colecao: "populacoes",
    singular: "Grupo populacional",
    plural: "População afetada",
    artigo: "o",
    prefixo: "pop",
    ajuda: "Quem é atingido pelo problema. O mesmo grupo costuma aparecer em mais de um problema — busque antes de cadastrar.",
    campos: [
        {
            id: "estimativa",
            rotulo: "Estimativa de pessoas",
            tipo: "texto",
            ajuda: "Opcional, mas é ela que permite comparar o tamanho de um problema com o de outro.",
        },
    ],
    usos: (id, estado) => (estado.problemas ?? []).filter((p) => (p.populacaoIds ?? []).includes(id)).length,
});

const causas = catalogo({
    colecao: "causas",
    singular: "Causa",
    plural: "Causas e subcausas",
    artigo: "a",
    prefixo: "cau",
    ajuda: "Busque entre as causas já cadastradas. As subcausas de cada uma aparecem na grade, e se cadastram na tela de Causas.",
    campos: [
        { id: "justificativa", rotulo: "Justificativa", ajuda: "Por que ela origina o problema" },
        { id: "evidencia", rotulo: "Evidência", ajuda: "O número, a série ou o estudo que a sustenta" },
    ],
    colunasExtra: [
        {
            rotulo: "Subcausas",
            valor: (c, estado) => {
                const subs = (c.subcausaIds ?? [])
                    .map((id) => (estado.subcausas ?? []).find((s) => s.id === id))
                    .filter(Boolean);
                return subs.length ? subs.map((s) => chip(s.nome, "neutro")).join(" ") : '<span class="text-muted">—</span>';
            },
        },
    ],
    usos: (id, estado) => (estado.problemas ?? []).filter((p) => (p.causaIds ?? []).includes(id)).length,
});

/* ---------- o cadastro ---------- */

export const problema = {
    colecao: "problemas",
    pasta: "central-problema",
    listagem: "central-problema.html",
    titulo: "Cadastro de Problemas",
    subtitulo: "O que o plano enfrenta: quem atinge, o que o mede e o que o explica.",
    novoRotulo: "Novo problema",
    singular: "Problema",
    rotuloNome: "Nome",
    exemplo: "Acesso desigual ao cuidado integral na primeira infância",
    ajuda: "O problema é o que o Programa existe para enfrentar. As causas escolhidas aqui são o que o explica.",
    podeExcluir: true,

    // A descrição vem logo abaixo do nome, e não no fim do formulário.
    semDescricao: true,

    extra: {
        colunas: [
            {
                rotulo: "Causas",
                valor: (item) => {
                    const total = (item.causaIds ?? []).length;
                    return total ? `${total} ${total === 1 ? "causa" : "causas"}` : '<span class="text-muted">—</span>';
                },
            },
            {
                rotulo: "Indicadores",
                valor: (item) => {
                    const total = (item.indicadorIds ?? []).length;
                    return total ? `${total} ${total === 1 ? "indicador" : "indicadores"}` : '<span class="text-muted">—</span>';
                },
            },
            {
                rotulo: "População afetada",
                valor: (item) => {
                    const total = (item.populacaoIds ?? []).length;
                    return total ? `${total} ${total === 1 ? "grupo" : "grupos"}` : '<span class="text-muted">—</span>';
                },
            },
        ],

        html(item) {
            return `
            <div class="mb-3">
                <label class="form-label" for="f-descricao">Descrição</label>
                <textarea class="form-control" id="f-descricao" rows="3"
                          placeholder="O que caracteriza este problema">${esc(item.descricao ?? "")}</textarea>
            </div>

            ${populacoes.html(item.populacaoIds ?? [])}

            ${indicadores.html(item.indicadorIds ?? [])}
            <div class="invalid-feedback d-block" id="f-indicadores-erro"></div>

            ${causas.html(item.causaIds ?? [])}
            <div class="invalid-feedback d-block" id="f-causas-erro"></div>

            <div class="mb-0">
                <label class="form-label" for="f-consequencias">Consequências</label>
                <textarea class="form-control" id="f-consequencias" rows="3"
                          placeholder="O que acontece se este problema não for enfrentado">${esc(item.consequencias ?? "")}</textarea>
                ${campoErro("f-consequencias")}
            </div>`;
        },

        ligar(escopo) {
            populacoes.ligar(escopo);
            indicadores.ligar(escopo);
            causas.ligar(escopo);
        },

        ler: () => ({
            populacaoIds: populacoes.ler(),
            indicadorIds: indicadores.ler(),
            causaIds: causas.ler(),
            consequencias: valor("f-consequencias"),
        }),

        regras(dados) {
            for (const id of ["f-indicadores-erro", "f-causas-erro"]) {
                const erro = document.getElementById(id);
                if (erro) erro.textContent = "";
            }

            const falha = (id, mensagem) => {
                document.getElementById(id).textContent = mensagem;
                return [{ campo: id.replace("-erro", ""), valido: false, mensagem: "" }];
            };

            if (!(dados.indicadorIds ?? []).length) {
                return falha("f-indicadores-erro", "Escolha ao menos um indicador: é ele que diz se o problema está diminuindo.");
            }
            if (!(dados.causaIds ?? []).length) {
                return falha("f-causas-erro", "Escolha ao menos uma causa. Um problema sem causa não se explica.");
            }
            return [];
        },
    },
};
