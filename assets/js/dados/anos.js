/**
 * Os anos do plano corrente.
 *
 * O ciclo não tem tamanho fixo: os anos vêm do PPA, e podem ser menos de
 * quatro — se um governador sai e o vice assume, o plano cobre dois. Toda
 * tabela de meta depende disto para ter o número certo de colunas.
 *
 * Lê o armazenamento direto, sem passar pelo `store.js`: o seed é carregado por
 * ele, e importar de volta fecharia um ciclo. O preço é a regra de qual plano
 * está corrente aparecer em dois lugares — se ela mudar em `store.js`, muda
 * aqui também.
 */

const CHAVE_ESTADO = "siplam.estado.v1";
const CHAVE_PPA = "siplam.ppaSelecionado";

/** O ciclo do seed, usado enquanto não há plano nenhum gravado. */
const PADRAO = ["2028", "2029", "2030", "2031"];

function planoCorrente() {
    try {
        const bruto = localStorage.getItem(CHAVE_ESTADO);
        if (!bruto) return null;
        const ppas = JSON.parse(bruto)?.ppas ?? [];
        const escolhido = localStorage.getItem(CHAVE_PPA);
        return (
            ppas.find((p) => p.id === escolhido) ??
            ppas.find((p) => p.situacao === "elaboracao") ??
            ppas.find((p) => p.situacao === "vigente") ??
            [...ppas].sort((a, b) => Number(b.primeiroAno) - Number(a.primeiroAno))[0] ??
            null
        );
    } catch (e) {
        console.warn("SIPLAM: não foi possível ler os anos do plano corrente.", e);
        return null;
    }
}

/** Os anos de um plano, do primeiro ao último, como texto. */
export function anosDoPlano(ppa) {
    const inicio = Number(ppa?.primeiroAno);
    const fim = Number(ppa?.ultimoAno);
    if (!inicio || !fim || fim < inicio) return [...PADRAO];
    const anos = [];
    for (let a = inicio; a <= fim; a++) anos.push(String(a));
    return anos;
}

export const anosCorrentes = () => anosDoPlano(planoCorrente());
