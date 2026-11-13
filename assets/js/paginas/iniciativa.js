/**
 * Ficha da Iniciativa — tela de trabalho do órgão.
 * Porta `iniciativa.$id.tsx`.
 *
 * Corrige T6.4.16: o protótipo salvava a cada tecla sem dar retorno; aqui o
 * salvamento continua automático, mas a tela diz quando gravou.
 */
import {
    obterEstado,
    updIniciativa,
    addEntrega,
    removeEntrega,
    vinculosDe,
    descreverVinculos,
    enviar,
    reportarDivergencia,
    retomarPreenchimento,
} from "../dados/store.js";
import {
    podeEditar,
    entregasDaIniciativa,
    pendenciasIniciativa,
    resumoPendencias,
    situacaoEntrega,
    STATUS_LABEL,
} from "../dados/regras.js";
import { ANOS } from "../dados/seed.js";
import { montarShell, barraTitulo, somenteLeitura, url } from "../shell.js";
import { confirmarExclusao } from "../confirmar.js";
import { avisar } from "../toast.js";
import { chip, statusChip, esc, secao } from "../ui.js";
import { listaPendencias, chipsPendencias } from "../ui-financeiro.js";
import { camposDaIniciativa, idDoStatus, podeIr, catalogoIndicadores, aoMudarIndicadores } from "../iniciativa-campos.js";

const { estado } = montarShell();
const id = new URLSearchParams(location.search).get("id");

let envioAberto = false;
// As alterações ficam aqui até a pessoa clicar em Salvar: só então vão para a Iniciativa.
// Cancelar as descarta.
let rascunho = {};
const alterar = (patch) => {
    Object.assign(rascunho, patch);
    avisarSalvo();
    atualizarEnvio();
};

/** Enviar para avaliação só fica clicável com os campos obrigatórios preenchidos. */
function atualizarEnvio() {
    const botao = document.getElementById("abrir-envio");
    const salva = estado.iniciativas.find((i) => i.id === id);
    if (!botao || !salva) return;
    const faltam = resumoPendencias(pendenciasIniciativa(estado, { ...salva, ...rascunho })).impeditivos > 0;
    botao.disabled = faltam;
    botao.title = faltam ? "Preencha os campos obrigatórios para enviar" : "";
}

/** Mostra que há alterações ainda não salvas. */
function avisarSalvo() {
    document.getElementById("aviso-salvo")?.classList.remove("d-none");
}

function render() {
    const salva = estado.iniciativas.find((i) => i.id === id);
    const ini = salva && { ...salva, ...rascunho };
    if (!ini) {
        document.getElementById("conteudo").innerHTML = `
        <div class="text-center py-5">
            <h4 class="fw-bold">Iniciativa não encontrada</h4>
            <a href="iniciativas.html" class="btn btn-primary">Voltar às Iniciativas</a>
        </div>`;
        return;
    }

    const programa = estado.programas.find((p) => p.id === ini.programaId);
    const pendencias = pendenciasIniciativa(estado, ini);
    const resumo = resumoPendencias(pendencias);
    // Alta gestão e controle acompanham sem operar.
    const editavel = podeEditar(ini.status) && !somenteLeitura();
    // Devolvida: só se edita o que a Central reprovou; o que foi aprovado fica travado.
    const reprovados = Object.entries(ini.avaliacao ?? {}).filter(([, a]) => a.decisao === "reprovado").map(([c]) => c);
    const liberados = ini.status === "devolvida" && reprovados.length ? new Set(reprovados) : null;
    const dis = editavel ? "" : " disabled";


    document.getElementById("conteudo").innerHTML = `
    ${barraTitulo(esc(ini.nome), [
        { rotulo: programa ? `${programa.codigo} — ${programa.nome}` : "Programa", href: `programa.html?id=${ini.programaId}` },
        { rotulo: ini.nome },
    ])}
    <div class="ilha p-3 mb-2">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
                <h4 class="fw-bold mb-1">${esc(ini.nome)}</h4>
                <div class="d-flex flex-wrap align-items-center gap-2 fs-13 text-muted">
                    ${statusChip(ini.status)}
                    <span>versão ${ini.versao}</span>
                    <span>·</span>
                    <span>atualizada em ${esc(ini.atualizadoEm)}</span>
                    ${ini.analista ? `<span>·</span><span>analista: ${esc(ini.analista)}</span>` : ""}
                    <span id="aviso-salvo" class="${Object.keys(rascunho).length ? "" : "d-none"}">${chip("alterações não salvas", "alerta")}</span>
                </div>
            </div>
            <div class="d-flex flex-wrap gap-2">
                ${editavel ? `<button type="button" class="btn btn-light" id="cancelar-edicao">Cancelar</button>
                <button type="button" class="btn btn-outline-primary" id="salvar-edicao"><i class="ti ti-device-floppy me-1"></i>Salvar</button>` : ""}
                ${editavel && ini.status !== "divergencia" ? `<button type="button" class="btn btn-primary" id="abrir-envio"${resumo.impeditivos ? ' disabled title="Preencha os campos obrigatórios para enviar"' : ""}><i class="ti ti-send me-1"></i>${ini.status === "devolvida" ? "Reenviar para avaliação" : "Enviar para avaliação"}</button>` : ""}
                ${editavel ? "" : `<span class="fs-12 text-muted align-self-center">${esc(STATUS_LABEL[ini.status])} — edição bloqueada</span>`}
            </div>
        </div>
    </div>

    <div class="row g-3">
        <div class="col-12">
            ${secao(
                "Dados da Iniciativa",
                camposDaIniciativa({ ini, estado, visao: "setorial", travado: !editavel, liberados, statusTravado: somenteLeitura() })
            )}

        </div>

        ${
            // As pendências só existem depois que a Central avalia e devolve: são os campos
            // reprovados, cada um com a justificativa.
            ini.status === "devolvida"
                ? `<div class="col-12">${secao(
                      `Pendências <span class="ms-1">${chip("devolvida pela Área Central", "impeditivo")}</span>`,
                      Object.values(ini.avaliacao ?? {}).some((a) => a.decisao === "reprovado")
                          ? `<ul class="list-group list-group-flush">${Object.entries(ini.avaliacao)
                                .filter(([, a]) => a.decisao === "reprovado")
                                .map(
                                    ([c, a]) => `
                    <li class="list-group-item d-flex align-items-start gap-2 px-0 py-2">
                        <i class="ti ti-circle-x text-danger mt-1"></i>
                        <div>
                            <div class="fw-medium">${esc(a.rotulo ?? c)}</div>
                            <div class="fs-13">${esc(a.justificativa)}</div>
                        </div>
                    </li>`
                                )
                                .join("")}</ul>`
                          : `<p class="fs-13 mb-0">${esc(ini.justificativaDevolucao || "A Área Central não registrou justificativa.")}</p>`
                  )}</div>`
                : ""
        }
    </div>

    ${envioAberto ? modalEnvio(ini, pendencias, resumo) : ""}`;

    // Devolvida: o que a Central aprovou aparece em verde, travado; o reprovado fica livre para editar.
    if (liberados) {
        const bloco = {
            nome: "f-nome",
            descricao: "f-descricao",
            programa: "f-programa",
            indicadores: "iind-bloco",
            causas: "bloco-causas",
        };
        for (const [campo, a] of Object.entries(ini.avaliacao ?? {})) {
            if (a.decisao !== "ok" || !bloco[campo]) continue;
            const el = document.getElementById(bloco[campo]);
            (campo === "causas" ? el : el?.closest(".mb-3"))?.classList.add("aval-ok");
        }
    }

    // Indicadores: escolher ou desvincular grava na hora, como os demais campos da ficha.
    const escopo = document.getElementById("conteudo");
    if (editavel && (!liberados || liberados.has("indicadores"))) {
        aoMudarIndicadores((ids) => {
            alterar({ indicadorIds: ids });
        });
        catalogoIndicadores.ligar(escopo);
    } else {
        document.getElementById("iind-bloco")?.querySelectorAll("input, button").forEach((c) => (c.disabled = true));
    }

    if (envioAberto) {
        const el = document.getElementById("modal-envio");
        new bootstrap.Modal(el).show();
        el.addEventListener("hidden.bs.modal", () => {
            envioAberto = false;
            render();
        }, { once: true });
    }
}

function modalEnvio(ini, pendencias, resumo) {
    const bloqueia = resumo.impeditivos > 0;

    return `
<div class="modal fade" id="modal-envio" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title fs-15">Enviar Iniciativa para análise</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
                ${
                    bloqueia
                        ? `<div class="alert alert-danger py-2 px-3 fs-13">
                    Há <strong>${resumo.impeditivos} pendência(s) impeditiva(s)</strong>. Corrija antes de enviar.
                </div>`
                        : `<div class="alert alert-success py-2 px-3 fs-13">
                    Nenhuma pendência impeditiva. A Iniciativa pode ser enviada${
                        resumo.alertas ? `, ainda que existam ${resumo.alertas} alerta(s)` : ""
                    }.
                </div>`
                }
                ${
                    ini.status === "devolvida"
                        ? `<p class="fs-12 text-muted">A Iniciativa foi devolvida: o reenvio cria a versão ${ini.versao + 1}.</p>`
                        : ""
                }
                ${pendencias.length ? listaPendencias(pendencias) : ""}
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Voltar</button>
                <button type="button" class="btn btn-primary" id="confirmar-envio"${bloqueia ? " disabled" : ""}>
                    Confirmar envio para análise
                </button>
            </div>
        </div>
    </div>
</div>`;
}

/* ---------- eventos ---------- */

document.addEventListener("input", (e) => {
    const campos = {
        "f-nome": "nome",
        "f-descricao": "descricao",
        "f-motivo": "motivo",
    };
    const campo = campos[e.target.id];
    if (!campo) return;
    alterar({ [campo]: e.target.value });
});

document.addEventListener("change", (e) => {
    if (e.target.matches("[data-causa]")) {
        const causas = [...document.querySelectorAll("[data-causa]:checked")].map((c) => c.value);
        alterar({ causas });
        render();
        return;
    }

    if (e.target.id === "f-programa") {
        // As causas pertencem ao Programa: trocar de Programa deixa as escolhidas
        // sem a que se ligar.
        const novo = e.target.value;
        alterar({ programaId: novo, causas: [] });
        render();
        return;
    }

    if (e.target.id === "f-status") {
        const destino = idDoStatus(e.target.value, "setorial");
        const ini = estado.iniciativas.find((i) => i.id === id);
        // Texto que não é um status, ou um status para onde a Iniciativa não pode ir
        // agora: a tela volta ao que ela tem.
        if (!destino || !podeIr("setorial", ini.status, destino)) return render();
        // Enviar tem conferência de pendências: abre a janela, que decide.
        if (destino === "enviada") {
            envioAberto = true;
            return render();
        }
        if (destino === "divergencia") reportarDivergencia(id);
        else if (destino === "em_preenchimento") retomarPreenchimento(id);
        return render();
    }
});

document.addEventListener("click", (e) => {
    // Cancelar desfaz o que foi alterado nesta ficha e volta para a lista.
    if (e.target.closest("#cancelar-edicao")) {
        rascunho = {};
        location.href = url("iniciativas.html");
        return;
    }
    if (e.target.closest("#salvar-edicao")) {
        // Fica na ficha: o que foi salvo passa a ser o novo ponto de volta do Cancelar.
        if (Object.keys(rascunho).length) updIniciativa(id, rascunho);
        rascunho = {};
        render();
        avisar("Iniciativa salva.");
        return;
    }
    if (e.target.closest("#abrir-envio")) {
        envioAberto = true;
        return render();
    }
    if (e.target.closest("#add-entrega")) {
        const campo = document.getElementById("nova-entrega");
        const nome = campo.value.trim();
        if (!nome) {
            alert("Informe o nome da Entrega.");
            return;
        }
        const novoId = addEntrega(id, nome);
        location.href = `entrega.html?id=${novoId}`;
        return;
    }

    const excluir = e.target.closest("[data-excluir-entrega]");
    if (excluir) {
        const entrega = estado.entregas.find((x) => x.id === excluir.dataset.excluirEntrega);
        const vinculos = vinculosDe("entregas", entrega.id);
        if (vinculos.length) {
            avisar(`A Entrega está vinculada a ${descreverVinculos(vinculos)}. Desfaça os vínculos antes de excluir.`, "erro");
            return;
        }
        confirmarExclusao({
            titulo: "Excluir Entrega",
            texto: `A Entrega “${entrega.nome || "sem nome"}” será removida. A exclusão fica registrada no histórico.`,
        }).then((justificativa) => {
            if (!justificativa) return;
            const r = removeEntrega(entrega.id, justificativa);
            if (!r.ok) return avisar(r.motivo, "erro");
            render();
        });
        return;
    }

    if (e.target.closest("#confirmar-envio")) {
        // O que foi alterado e ainda não salvo vai junto com o envio.
        if (Object.keys(rascunho).length) updIniciativa(id, rascunho);
        rascunho = {};
        enviar(id);
        bootstrap.Modal.getInstance(document.getElementById("modal-envio")).hide();
        envioAberto = false;
        render();
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.id === "nova-entrega") {
        e.preventDefault();
        document.getElementById("add-entrega").click();
    }
});

render();
