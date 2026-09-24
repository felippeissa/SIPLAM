import { esc } from "../ui.js";
import { catalogo } from "../catalogo.js";

/**
 * Cadastro de Objetivos Estratégicos.
 *
 * O eixo deixou de ser um campo de seleção: quem cadastra um objetivo costuma
 * estar montando o plano de cima para baixo, e o eixo de que ele precisa às
 * vezes ainda não existe. Com o catálogo, ele busca o que há e cadastra o que
 * falta sem sair daqui.
 *
 * O vínculo é de um só — um objetivo pertence a um eixo — e continua guardado
 * em `eixoId`, no próprio objetivo.
 */

const eixos = catalogo({
    colecao: "eixos",
    singular: "Eixo",
    plural: "Eixo",
    artigo: "o",
    prefixo: "eix",
    unico: true,
    campos: [{ id: "descricao", rotulo: "Descrição", ajuda: "O que este eixo reúne" }],
    usos: (id, estado) => (estado.objetivos ?? []).filter((o) => o.eixoId === id).length,
});

export const objetivo = {
    colecao: "objetivos",
    pasta: "central-objetivo",
    listagem: "central-objetivo.html",
    titulo: "Cadastro de Objetivos Estratégicos",
    subtitulo: "O que cada eixo se propõe a alcançar.",
    novoRotulo: "Novo objetivo estratégico",
    singular: "Objetivo estratégico",
    rotuloNome: "Nome",
    exemplo: "Ampliar a rede de cuidado à pessoa idosa.",
    podeExcluir: true,

    // A descrição vem antes do eixo, porque explica o registro que está sendo
    // cadastrado — e não o nível acima dele.
    semDescricao: true,

    filtros: [{ tipo: "vinculo", id: "eixo", rotulo: "Eixo", colecao: "eixos", campo: "eixoId" }],

    extra: {
        coluna: {
            rotulo: "Eixo",
            valor: (item, estado) => {
                const eixo = (estado.eixos ?? []).find((e) => e.id === item.eixoId);
                return eixo ? esc(eixo.nome) : '<span class="text-muted">Sem eixo</span>';
            },
        },

        html: (item) => `
            <div class="mb-3">
                <label class="form-label" for="f-descricao">Descrição</label>
                <textarea class="form-control" id="f-descricao" rows="3"
                          placeholder="O que este objetivo persegue">${esc(item.descricao ?? "")}</textarea>
            </div>
            ${eixos.html(item.eixoId ? [item.eixoId] : [])}`,

        ligar: (escopo) => eixos.ligar(escopo),

        ler: () => ({ eixoId: eixos.ler()[0] ?? "" }),
    },

    // `filhos` não aparece mais na tela: nem coluna na listagem, nem campo no
    // formulário. Fica porque é ele que impede excluir um objetivo do qual
    // Programas dependem — apagar aqui deixaria Programas apontando para o nada.
    filhos: [
        {
            colecao: "programas",
            campo: "objetivoId",
            rotulo: "Programas",
            href: "central-programas.html",
            tela: "Cadastro de Programa",
        },
    ],
};
