/**
 * PPA — Administração.
 *
 * Tabela dos planos cadastrados e um modal para criar ou editar, no padrão da
 * Cadastro de Programa.
 *
 * Quatro campos: nome, vigência, situação e descrição. Situação é reflexo, nunca
 * escolha; a vigência só é editável na criação.
 */
import {
    obterEstado,
    addPpa,
    updPpa,
    removePpa,
    ppaVazio,
    situacaoPpa,
    anoDeElaboracao,
    ppaQueColide,
} from "../dados/store.js";
import { montarShell, cabecalhoPagina, somenteLeitura, perfilAtual } from "../shell.js";
import { esc, chip } from "../ui.js";
import { confirmarExclusao } from "../confirmar.js";
import { avisar } from "../toast.js";
import { campoErro, validar, limparAoDigitar } from "../validacao.js";

const { estado } = montarShell();

/**
 * O cadastro do PPA é exclusivo do Administrador central. Os demais perfis
 * enxergam o plano — precisam dele para se situar — mas não o criam nem o
 * alteram: abrir o ciclo é ato da administração do plano.
 */
const leitura = somenteLeitura() || perfilAtual() !== "admin-central";

let edicao = null;
let novo = false;
let busca = "";

/**
 * Anos que o seletor oferece. Só o ano importa: o plano sempre começa em 1º de
 * janeiro e termina em 31 de dezembro, então a data em si nunca é escolhida.
 */
function anosPossiveis() {
    const base = new Date().getFullYear();
    const anos = [];
    for (let a = base - 2; a <= base + 14; a++) anos.push(a);
    // Um plano gravado fora da faixa não pode sumir do seletor.
    for (const ppa of estado.ppas) {
        for (const a of [Number(ppa.primeiroAno), Number(ppa.ultimoAno)]) {
            if (a && !anos.includes(a)) anos.push(a);
        }
    }
    return anos.sort((x, y) => x - y);
}

function render() {
    const termo = busca.trim().toLowerCase();
    const ppas = [...estado.ppas]
        .filter(
            (p) =>
                !termo ||
                p.nome.toLowerCase().includes(termo) ||
                (p.descricao ?? "").toLowerCase().includes(termo) ||
                `${p.primeiroAno}-${p.ultimoAno}`.includes(termo)
        )
        .sort((a, b) => Number(b.primeiroAno) - Number(a.primeiroAno));

    document.getElementById("conteudo").innerHTML = `
    ${cabecalhoPagina(
        "Cadastro de Planos Plurianuais",
        "Planos plurianuais cadastrados no sistema.",
        `
        <div class="app-search">
            <input type="search" id="busca" class="form-control form-control-sm" placeholder="Buscar" value="${esc(busca)}" />
            <i class="ti ti-search app-search-icon text-muted"></i>
        </div>
        ${
            leitura
                ? `<span class="fs-12 text-muted">O cadastro do PPA é exclusivo do Administrador central.</span>`
                : `<button class="btn btn-sm btn-primary" id="novo"><i class="ti ti-plus me-1"></i>Novo PPA</button>`
        }`
    )}

    <div class="card">
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th style="width:20rem">Plano</th>
                        <th style="width:9rem">Vigência</th>
                        <th style="width:8rem">Situação</th>
                        <th>Descrição</th>
                        <th style="width:7rem">Ações</th>
                    </tr>
                </thead>
                <tbody>
                ${
                    ppas.length === 0
                        ? `<tr><td colspan="5" class="text-center text-muted py-4 fs-12">${
                              estado.ppas.length === 0
                                  ? "Nenhum plano cadastrado. Comece por “Novo PPA”."
                                  : "Nenhum plano corresponde à busca."
                          }</td></tr>`
                        : ppas
                              .map(
                                  (p) => `
                    <tr>
                        <td class="fw-medium">${esc(p.nome)}</td>
                        <td class="codigo">${esc(p.primeiroAno)}–${esc(p.ultimoAno)}</td>
                        <td>${chip(situacaoPpa(p.situacao).rotulo, situacaoPpa(p.situacao).tom)}</td>
                        <td class="fs-13 text-muted">${esc(p.descricao || "—")}</td>
                        <td>${
                            leitura
                                ? `<button class="btn btn-sm btn-light" data-editar="${p.id}">Ver</button>`
                                : `<button class="btn btn-sm btn-outline-primary" data-editar="${p.id}">Editar</button>`
                        }</td>
                    </tr>`
                              )
                              .join("")
                }
                </tbody>
            </table>
        </div>
    </div>
    ${edicao ? modal() : ""}`;

    if (edicao) {
        const el = document.getElementById("modal-ppa");
        ligarVigencia(el);
        limparAoDigitar(el);
        new bootstrap.Modal(el).show();
        el.addEventListener("hidden.bs.modal", () => {
            edicao = null;
            render();
        }, { once: true });
    }
}

/**
 * Ao trocar o primeiro ano, o último acompanha se tiver ficado para trás. O
 * ciclo costuma ter quatro anos, mas pode ser menor quando um vice assume, então
 * a sugestão é só ponto de partida — o campo segue livre.
 */
function ligarVigencia(el) {
    const primeiro = el.querySelector("#f-primeiroAno");
    const ultimo = el.querySelector("#f-ultimoAno");
    if (!primeiro || !ultimo) return;

    primeiro.addEventListener("change", () => {
        if (Number(ultimo.value) >= Number(primeiro.value)) return;
        const alvo = Number(primeiro.value) + 3;
        const existe = [...ultimo.options].some((o) => Number(o.value) === alvo);
        ultimo.value = String(existe ? alvo : primeiro.value);
        ultimo.classList.remove("is-invalid");
    });
}

function modal() {
    const p = edicao;
    // Plano com diagnóstico vinculado não pode ser excluído.
    const diagnosticos = novo ? 0 : (estado.diagnosticos ?? []).filter((d) => d.ppaId === p.id).length;

    return `
<div class="modal fade" id="modal-ppa" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title fs-15">${novo ? "Novo PPA" : leitura ? esc(p.nome) : `Editar ${esc(p.nome)}`}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
                <div class="row g-3">
                    <div class="col-md-8">
                        <label class="form-label" for="f-nome">Nome do plano <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="f-nome" value="${esc(p.nome)}" ${leitura ? "disabled" : ""} />
                        ${campoErro("f-nome")}
                    </div>
                    <div class="col-md-4">
                        <label class="form-label" for="f-processoSei">Processo SEI</label>
                        <input type="text" class="form-control codigo" id="f-processoSei"
                               value="${esc(p.processoSei ?? "")}" disabled />
                    </div>
                    <div class="col-md-6">
                        <label class="form-label" for="f-primeiroAno">Vigência <span class="text-danger">*</span></label>
                        <div class="input-group" id="f-vigencia">
                            <select class="form-select" id="f-primeiroAno" ${leitura || !novo ? "disabled" : ""}>
                                ${anosPossiveis().map((a) => `<option value="${a}" ${String(p.primeiroAno) === String(a) ? "selected" : ""}>${a}</option>`).join("")}
                            </select>
                            <span class="input-group-text">a</span>
                            <select class="form-select" id="f-ultimoAno" ${leitura || !novo ? "disabled" : ""}>
                                ${anosPossiveis().map((a) => `<option value="${a}" ${String(p.ultimoAno) === String(a) ? "selected" : ""}>${a}</option>`).join("")}
                            </select>
                        </div>
                        <div class="invalid-feedback d-block" id="f-vigencia-erro"></div>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label" for="f-situacao">Situação</label>
                        <input type="text" class="form-control" id="f-situacao"
                               value="${esc(situacaoPpa(p.situacao).rotulo)}" disabled />
                    </div>
                    <div class="col-12">
                        <label class="form-label" for="f-descricao">Descrição</label>
                        <textarea class="form-control" id="f-descricao" rows="3" ${leitura ? "disabled" : ""}>${esc(p.descricao ?? "")}</textarea>
                    </div>
                </div>

                ${
                    diagnosticos
                        ? `<div class="alert alert-warning py-2 px-3 fs-12 mt-3 mb-0">
                    ${diagnosticos} diagnóstico(s) pertencem a este plano, e por isso ele não pode ser
                    excluído. Exclua os diagnósticos primeiro, em
                    <a href="central-diagnostico.html" class="fw-semibold">Cadastro de Diagnóstico</a>.
                </div>`
                        : ""
                }
            </div>
            <div class="modal-footer">
                ${
                    leitura || novo
                        ? ""
                        : `<button type="button" class="btn btn-outline-danger me-auto" id="excluir"
                        ${diagnosticos ? `disabled title="${diagnosticos} diagnóstico(s) pertencem a este plano"` : ""}>
                        Excluir plano
                    </button>`
                }
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">${leitura ? "Fechar" : "Cancelar"}</button>
                ${leitura ? "" : '<button type="button" class="btn btn-primary" id="salvar">Salvar</button>'}
            </div>
        </div>
    </div>
</div>`;
}

/** Fecha o modal de edição e resolve quando ele terminou de sair da tela. */
function fecharModal() {
    return new Promise((resolve) => {
        const el = document.getElementById("modal-ppa");
        const instancia = el && bootstrap.Modal.getInstance(el);
        if (!instancia) return resolve();
        el.addEventListener("hidden.bs.modal", () => resolve(), { once: true });
        instancia.hide();
    });
}

function lerModal() {
    const v = (id) => document.getElementById(id)?.value ?? "";
    return {
        ...edicao,
        nome: v("f-nome").trim(),
        primeiroAno: v("f-primeiroAno").trim(),
        ultimoAno: v("f-ultimoAno").trim(),
        descricao: v("f-descricao").trim(),
    };
}

document.addEventListener("input", (e) => {
    if (e.target.id === "busca") {
        busca = e.target.value;
        render();
        // O campo é recriado a cada tecla: sem devolver o cursor ao fim, o
        // texto digitado sai embaralhado.
        const campo = document.getElementById("busca");
        campo.focus();
        campo.setSelectionRange(campo.value.length, campo.value.length);
    }
});

document.addEventListener("click", (e) => {
    if (e.target.closest("#novo")) {
        edicao = ppaVazio();
        novo = true;
        return render();
    }

    const editar = e.target.closest("[data-editar]");
    if (editar) {
        edicao = structuredClone(estado.ppas.find((p) => p.id === editar.dataset.editar));
        novo = false;
        return render();
    }

    if (!edicao || leitura) return;

    if (e.target.closest("#excluir")) {
        if ((estado.diagnosticos ?? []).some((d) => d.ppaId === edicao.id)) return;

        const plano = edicao;

        // O modal do Bootstrap prende o foco: com ele aberto, não dá para
        // digitar na confirmação. Fecha primeiro, confirma depois.
        fecharModal().then(async () => {
            // Um plano carrega o ciclo inteiro: pede o nome exato antes de remover.
            const confirmou = await confirmarExclusao({
                titulo: "Excluir plano plurianual",
                texto: `O plano ${plano.nome}, de ${plano.primeiroAno} a ${plano.ultimoAno}, será removido do sistema. Não há como desfazer.`,
                confirmar: "Excluir plano",
                digitar: plano.nome,
            });

            if (confirmou) {
                removePpa(plano.id);
                avisar("Plano plurianual excluído com sucesso.");
                edicao = null;
            } else {
                // Desistiu: devolve a pessoa ao formulário onde estava.
                edicao = plano;
                novo = false;
            }
            render();
        });
        return;
    }

    if (e.target.closest("#salvar")) {
        const dados = lerModal();
        const caixa = document.getElementById("modal-ppa");

        document.getElementById("f-vigencia-erro").textContent = "";

        const ok = validar(caixa, [
            { campo: "f-nome", valido: !!dados.nome, mensagem: "Informe o nome do plano." },
            {
                campo: "f-vigencia",
                valido: Number(dados.ultimoAno) >= Number(dados.primeiroAno),
                mensagem: "O último ano não pode ser anterior ao primeiro.",
            },
            {
                // Dois planos no mesmo ano seriam duas leis regendo o mesmo
                // exercício. Basta um ano em comum para haver conflito.
                campo: "f-vigencia",
                valido: !ppaQueColide(estado, dados),
                mensagem: `Já existe um plano para esse período: ${esc(ppaQueColide(estado, dados)?.nome ?? "")}.`,
            },
            {
                // O plano é construído no ano anterior ao início da vigência.
                // Criar antes disso é abrir um ciclo que ainda não começou a ser
                // pensado; criar depois é atraso, e atraso a interface não impede.
                campo: "f-vigencia",
                valido: !novo || anoDeElaboracao(dados) <= new Date().getFullYear(),
                mensagem: `Este plano só pode ser criado a partir de ${anoDeElaboracao(dados)}, seu ano de elaboração.`,
            },
        ]);
        if (!ok) return;
        const existente = estado.ppas.some((p) => p.id === dados.id);
        if (existente) updPpa(dados.id, dados);
        else addPpa(dados);
        avisar(`Plano plurianual ${existente ? "editado" : "criado"} com sucesso.`);

        bootstrap.Modal.getInstance(document.getElementById("modal-ppa")).hide();
        edicao = null;
        render();
    }
});

render();
