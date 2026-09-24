/**
 * Gráficos dos relatórios.
 *
 * Uma casca fina sobre o ApexCharts, que já vem no `vendors.min.js` do
 * Inspinia. Existe para três coisas: manter a mesma paleta e a mesma tipografia
 * em todas as telas, desligar a animação — o protótipo não anima nada — e
 * destruir o gráfico anterior antes de desenhar o novo, que é o vazamento de
 * memória mais fácil de cometer numa tela que se redesenha a cada filtro.
 */

/** A paleta da marca primeiro; as demais matizes só quando há séries a separar. */
export const CORES = ["#1ab394", "#1c84c6", "#23c6c8", "#f8ac59", "#ed5565", "#8e6bbf", "#5b7a9a", "#c2cddb"];

const FONTE = "IBM Plex Sans, sans-serif";
const TINTA = "#9ba6b7";
const GRADE = "#eef2f7";

/** Gráficos vivos por elemento, para não redesenhar por cima do anterior. */
const vivos = new Map();

/**
 * Desenha dentro de `id`, substituindo o que houver lá.
 * @param {string} id        id do elemento que recebe o gráfico
 * @param {object} opcoes    opções do ApexCharts, mescladas sobre as da casa
 */
export function grafico(id, opcoes) {
    const alvo = document.getElementById(id);
    const anterior = vivos.get(id);
    if (anterior) {
        anterior.destroy();
        vivos.delete(id);
    }
    if (!alvo || typeof ApexCharts === "undefined") return null;

    const base = {
        chart: {
            fontFamily: FONTE,
            toolbar: { show: false },
            animations: { enabled: false },
            ...opcoes.chart,
        },
        colors: opcoes.colors ?? CORES,
        grid: { borderColor: GRADE, strokeDashArray: 3, ...opcoes.grid },
        dataLabels: { enabled: false, ...opcoes.dataLabels },
        legend: {
            fontSize: "12px",
            markers: { width: 9, height: 9, radius: 9 },
            itemMargin: { horizontal: 8, vertical: 2 },
            ...opcoes.legend,
        },
        tooltip: { style: { fontSize: "12px" }, ...opcoes.tooltip },
    };

    // Os eixos só ganham estilo quando a tela pede eixo: num donut, `xaxis`
    // vazio atrapalha.
    if (opcoes.xaxis) {
        base.xaxis = {
            axisBorder: { show: false },
            axisTicks: { show: false },
            ...opcoes.xaxis,
            labels: { style: { colors: TINTA, fontSize: "11px" }, ...opcoes.xaxis.labels },
        };
    }
    if (opcoes.yaxis) {
        base.yaxis = {
            ...opcoes.yaxis,
            labels: { style: { colors: TINTA, fontSize: "11px" }, ...opcoes.yaxis.labels },
        };
    }

    const desenho = new ApexCharts(alvo, { ...opcoes, ...base });
    desenho.render();
    vivos.set(id, desenho);
    return desenho;
}

/** Cartão de gráfico: título, uma linha de contexto e a área de desenho. */
export function cartaoGrafico(id, titulo, nota, altura = 300) {
    return `
    <div class="card h-100">
        <div class="card-header d-block p-3">
            <h4 class="card-title mb-1">${titulo}</h4>
            ${nota ? `<p class="text-muted mb-0 fs-12">${nota}</p>` : ""}
        </div>
        <div class="card-body pt-2">
            <div id="${id}" style="min-height:${altura}px"></div>
        </div>
    </div>`;
}
