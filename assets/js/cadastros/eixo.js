import { updItem } from "../dados/store.js";
import { catalogo } from "../catalogo.js";
import { esc } from "../ui.js";

/**
 * Cadastro de Eixos.
 *
 * O eixo é o nível mais alto do plano: reúne os objetivos estratégicos e, por
 * eles, os Programas.
 *
 * O vínculo com o objetivo é montado aqui, mas **guardado no objetivo** — é ele
 * que tem `eixoId`, porque um objetivo pertence a um eixo só. A tabela desta
 * tela escreve do outro lado: escolher um objetivo o traz para este eixo, e
 * tirá-lo o deixa sem eixo.
 */

const objetivos = catalogo({
    colecao: "objetivos",
    singular: "Objetivo estratégico",
    plural: "Objetivos estratégicos",
    artigo: "o",
    prefixo: "obj",
    ajuda: "Busque entre os objetivos já cadastrados. Um objetivo pertence a um eixo só — trazer para cá um que está em outro eixo o move.",
    campos: [{ id: "descricao", rotulo: "Descrição", ajuda: "O que este objetivo persegue" }],

    // Na lista de busca, o que importa saber antes de escolher é de onde o
    // objetivo vem: trazê-lo para cá o tira do eixo em que está hoje.
    detalhe: (o, estado) => {
        const atual = (estado.eixos ?? []).find((e) => e.id === o.eixoId);
        return atual ? `Hoje em: ${atual.nome}` : "Sem eixo";
    },
});

export const eixo = {
    colecao: "eixos",
    pasta: "central-eixo",
    listagem: "central-eixo.html",
    titulo: "Cadastro de Eixos",
    subtitulo: "Os eixos do plano, que reúnem os objetivos estratégicos.",
    novoRotulo: "Novo eixo",
    singular: "Eixo",
    rotuloNome: "Nome",
    exemplo: "Goiás que cuida",
    ajuda: "O eixo é o nível mais alto do plano: reúne os objetivos estratégicos e, por eles, os Programas.",
    podeExcluir: true,

    // A descrição é desenhada aqui dentro, para a tabela de objetivos vir
    // depois dela e não entre o nome e a descrição.
    semDescricao: true,

    extra: {
        coluna: {
            rotulo: "Objetivos estratégicos",
            valor: (item, estado) => {
                const total = (estado.objetivos ?? []).filter((o) => o.eixoId === item.id).length;
                return total
                    ? `${total} ${total === 1 ? "objetivo" : "objetivos"}`
                    : '<span class="text-muted">—</span>';
            },
        },

        html: (item, estado) => `
            <div class="mb-3">
                <label class="form-label" for="f-descricao">Descrição</label>
                <textarea class="form-control" id="f-descricao" rows="3"
                          placeholder="O que este eixo reúne">${esc(item.descricao ?? "")}</textarea>
            </div>
            ${objetivos.html((estado.objetivos ?? []).filter((o) => o.eixoId === item.id).map((o) => o.id))}`,

        ligar: (escopo) => objetivos.ligar(escopo),

        // O eixo não guarda a lista: quem guarda o vínculo é o objetivo.
        ler: () => ({}),

        /**
         * Grava o vínculo do outro lado, depois que o eixo já tem id.
         *
         * O que entrou passa a apontar para este eixo; o que saiu fica sem eixo,
         * e não some — objetivo sem eixo continua no cadastro dele, para ser
         * realocado.
         */
        aoSalvar(salvo, estado) {
            const escolhidos = objetivos.ler();
            for (const o of estado.objetivos ?? []) {
                const deveter = escolhidos.includes(o.id);
                if (deveter && o.eixoId !== salvo.id) updItem("objetivos", o.id, { eixoId: salvo.id });
                else if (!deveter && o.eixoId === salvo.id) updItem("objetivos", o.id, { eixoId: "" });
            }
        },
    },

    /** Excluir o eixo deixa os objetivos sem eixo, em vez de apagá-los junto. */
    aoExcluir(item, estado) {
        for (const o of (estado.objetivos ?? []).filter((o) => o.eixoId === item.id)) {
            updItem("objetivos", o.id, { eixoId: "" });
        }
    },
};
