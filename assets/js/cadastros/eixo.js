import { esc } from "../ui.js";

/**
 * Cadastro de Eixos.
 *
 * O eixo é o nível mais alto do plano: reúne os objetivos estratégicos e, por
 * eles, os Programas.
 *
 * Dois campos, e são os da matriz de mapeamento: **nome** e **descrição**. A
 * tabela de objetivos que morava aqui saiu em 06/10/2026 — o vínculo se faz do
 * outro lado, no Objetivo estratégico, que é quem guarda o `eixoId`.
 */
export const eixo = {
    colecao: "eixos",
    pasta: "central-eixo",
    listagem: "central-eixo.html",
    titulo: "Cadastro de Eixos",
    subtitulo: "Os eixos do plano, que reúnem os objetivos estratégicos.",
    novoRotulo: "Novo eixo",
    singular: "Eixo",
    rotuloNome: "Nome do eixo",
    exemplo: "Goiás que cuida",
    podeExcluir: true,

    filtros: [
        { tipo: "inverso", id: "objetivos", rotulo: "Objetivos estratégicos", colecao: "objetivos", campo: "eixoId" },
    ],

    extra: {
        colunas: [
            {
                rotulo: "Objetivos estratégicos",
                valor: (item, estado) => {
                    const total = (estado.objetivos ?? []).filter((o) => o.eixoId === item.id).length;
                    return total
                        ? `${total} ${total === 1 ? "objetivo" : "objetivos"}`
                        : '<span class="text-muted">—</span>';
                },
            },
        ],
    },
};
