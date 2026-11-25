/**
 * Dimensões e tipos de marcador.
 *
 * Começam com as três dimensões (ambiental, social e de governança) e os tipos de cada uma, e crescem: quem cadastra um
 * marcador pode digitar uma dimensão ou um tipo que não existe e cadastrá-lo ali mesmo. Por isso moram no estado, como
 * qualquer cadastro, e não numa lista fixa na tela.
 *
 * O marcador guarda o `id` da dimensão e o nome do tipo. O tipo pertence a uma dimensão (`dimensaoId`).
 */

export const DIMENSOES = {
    ambiental: {
        rotulo: "Dimensão ambiental",
        tipos: ["Sustentabilidade ambiental", "Mudanças climáticas", "Biodiversidade", "Gestão de resíduos", "Poluição ambiental", "Eficiência no uso de recursos"],
    },
    social: {
        rotulo: "Dimensão social",
        tipos: ["Igualdade de gênero", "Inclusão social", "Direitos humanos", "Saúde e bem-estar", "Trabalho e emprego", "Proteção a grupos vulneráveis"],
    },
    governanca: {
        rotulo: "Dimensão de governança",
        tipos: ["Governança pública", "Integridade pública", "Compliance público", "Gestão de riscos", "Transparência pública", "Controle interno", "Prestação de contas", "Políticas baseadas em evidências"],
    },
};

/** Garante as coleções de dimensão e tipo no estado. Idempotente: só cria o que falta, nunca mexe no que a pessoa cadastrou. */
export function garantirDimensoes(base) {
    base.dimensoesMarcador ??= [];
    base.tiposMarcador ??= [];
    for (const [id, d] of Object.entries(DIMENSOES)) {
        if (!base.dimensoesMarcador.some((x) => x.id === id)) {
            base.dimensoesMarcador.push({ id, ppaId: "", nome: d.rotulo, criadoEm: new Date().toLocaleDateString("pt-BR") });
        }
        d.tipos.forEach((nome, i) => {
            const tid = `tm-${id}-${i + 1}`;
            if (!base.tiposMarcador.some((x) => x.id === tid)) {
                base.tiposMarcador.push({ id: tid, ppaId: "", nome, dimensaoId: id, criadoEm: new Date().toLocaleDateString("pt-BR") });
            }
        });
    }
}
