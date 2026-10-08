/**
 * O cartão de um plano, no desenho da grade de projetos do Inspinia.
 *
 * É um só para quem escolhe o plano — a tela de entrada e a janela de troca —,
 * para que os dois sejam o mesmo cartão. Quem usa liga o clique: o cartão traz
 * `data-plano` com o id.
 */
import { situacaoPpa } from "./dados/store.js";
import { esc } from "./ui.js";

const TONS = { elaboracao: "info", vigente: "success", encerrado: "secondary", aprovado: "primary", submetido: "warning", reprovado: "danger" };

/**
 * @param {object} estado
 * @param {object} p           o plano
 * @param {{href:string, ativo?:boolean}} opcoes  `href` do ícone que abre a visão do plano
 */
export function cartaoPlano(estado, p, { href, ativo = false } = {}) {
    const s = situacaoPpa(p.situacao);
    const programas = estado.programas.filter((x) => x.ppaId === p.id).length;
    const iniciativas = estado.iniciativas.filter((x) => estado.programas.some((g) => g.id === x.programaId && g.ppaId === p.id)).length;
    const eixos = estado.eixos.filter((x) => x.ppaId === p.id).length;
    const total = Number(p.ultimoAno) - Number(p.primeiroAno) + 1;
    const pct = Math.max(0, Math.min(100, Math.round(((new Date().getFullYear() - Number(p.primeiroAno) + 1) / total) * 100)));
    const metrica = (icone, texto) =>
        `<div class="col-sm-6"><div class="d-flex align-items-center gap-2 mb-3"><i class="ti ${icone} text-muted fs-lg"></i><h5 class="fs-base mb-0 fw-medium">${texto}</h5></div></div>`;

    return `<div class="col-md-6">
        <div class="card mb-0 h-100${ativo ? " border-primary" : ""}" role="button" tabindex="0" data-plano="${esc(p.id)}" aria-pressed="${ativo}" style="cursor:pointer">
            <div class="card-body">
                <div class="d-flex mb-4">
                    <div class="avatar-xl me-3"><span class="avatar-title text-bg-light rounded"><i class="ti ti-calendar-stats fs-24 text-muted"></i></span></div>
                    <div>
                        <h5 class="mb-1">${esc(p.nome)}</h5>
                        <p class="text-muted mb-2 fs-xxs">Vigência ${esc(p.primeiroAno)}–${esc(p.ultimoAno)}</p>
                        <span class="badge badge-soft-${TONS[p.situacao] ?? "secondary"} fs-xxs badge-label">${esc(s.rotulo)}</span>
                    </div>
                    <div class="ms-auto">
                        <a href="${esc(href)}" class="btn btn-icon btn-ghost-light text-muted" title="Ver detalhes do plano" data-detalhe><i class="ti ti-external-link fs-xl"></i></a>
                    </div>
                </div>
                <div class="row">${metrica("ti-stack-2", programas + " Programas")}${metrica("ti-target-arrow", iniciativas + " Iniciativas")}</div>
                <div class="row">${metrica("ti-layout-grid", eixos + " Eixos")}${metrica("ti-calendar-clock", total + " anos")}</div>
                <div class="mt-3">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <p class="mb-0 text-muted fw-semibold fs-xxs">Ciclo decorrido</p>
                        <p class="fw-semibold mb-0">${pct}%</p>
                    </div>
                    <div class="progress" style="height: 5px"><div class="progress-bar bg-success" style="width: ${pct}%"></div></div>
                </div>
            </div>
        </div>
    </div>`;
}
