import { montarRelatorio } from "../relatorio-vazio.js";

/**
 * Relatório consolidado de finalísticas.
 * Corresponde à funcionalidade F021 do inventário do discovery: consolidar as
 * informações das áreas finalísticas de cada órgão.
 */
montarRelatorio({
    titulo: "Relatório consolidado de finalísticas",
    subtitulo: "O que cada área finalística contribuiu, reunido por órgão.",
    reune: [
        "A contribuição de cada órgão, por Programa",
        "As Entregas e suas metas, agrupadas por área",
        "As causas que cada área enfrenta",
        "O que ficou pendente em cada contribuição",
    ],
    jaTemos: [
        "Iniciativas e Entregas por órgão",
        "Metas por ano de cada Entrega",
        "Vínculo entre causas e Iniciativas",
    ],
    falta: [
        "O que é uma área finalística no modelo — hoje só existe o órgão",
        "Se a consolidação é por órgão, por unidade responsável ou por eixo",
        "Se o relatório é do plano inteiro ou de um recorte escolhido",
    ],
});
