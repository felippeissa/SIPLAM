/**
 * PPA — Administração.
 *
 * Tabela dos planos cadastrados e um modal para criar ou editar, no padrão da
 * Administração de Programas.
 *
 * São quatro campos por ora: nome, primeiro ano, último ano e descrição. Os
 * demais entram depois de conversar com o usuário.
 */
import { obterEstado, addPpa, updPpa, removePpa, ppaVazio } from "../dados/store.js";
import { moedaCurta } from "../dados/regras.js";
import { linhasFinanceiras } from "../dados/financeiro.js";
import { montarShell, cabecalhoPagina, somenteLeitura } from "../shell.js";
import { esc } from "../ui.js";
import { confirmarExclusao } from "../confirmar.js";
import { avisar } from "../toast.js";

const { estado } = montarShell();
const leitura = somenteLeitura();

let edicao = null;
let novo = false;
let busca = "";

/** O previsto de um plano soma apenas os anos da sua vigência. */
function previstoDoPlano(ppa) {
    const anos = [];
    for (let a = Number(ppa.primeiroAno); a <= Number(ppa.ultimoAno); a++) anos.push(String(a));
    return linhasFinanceiras(estado).reduce((s, l) => s + anos.reduce((t, a) => t + (l.anos[a] ?? 0), 0), 0);
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
                ? `<span class="fs-12 text-muted">Perfil de acompanhamento — sem edição.</span>`
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
                        <th>Descrição</th>
                        <th class="num" style="width:9rem">Previsto</th>
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
                        <td class="fs-13 text-muted">${esc(p.descricao || "—")}</td>
                        <td class="num">${moedaCurta(previstoDoPlano(p))}</td>
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
        prepararCalendarios(el);
        new bootstrap.Modal(el).show();
        el.addEventListener("hidden.bs.modal", () => {
            edicao = null;
            render();
        }, { once: true });
    }
}

/** O pacote do Inspinia traz o flatpickr sem tradução; esta é a mínima. */
const PT_BR = {
    weekdays: {
        shorthand: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
        longhand: ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"],
    },
    months: {
        shorthand: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
        longhand: [
            "Janeiro",
            "Fevereiro",
            "Março",
            "Abril",
            "Maio",
            "Junho",
            "Julho",
            "Agosto",
            "Setembro",
            "Outubro",
            "Novembro",
            "Dezembro",
        ],
    },
    firstDayOfWeek: 0,
    rangeSeparator: " até ",
    time_24hr: true,
};

/**
 * O calendário dos anos de vigência. O template inicializa o flatpickr pelos
 * atributos `data-provider` ao carregar a página; como o modal só existe depois,
 * inicializamos aqui.
 */
function prepararCalendarios(el) {
    if (leitura || typeof flatpickr === "undefined") return;

    const calendarios = [];

    el.querySelectorAll("[data-provider='flatpickr']").forEach((campo) => {
        const ano = Number(campo.value) || new Date().getFullYear();
        const primeiro = campo.id === "f-primeiroAno";

        calendarios.push(flatpickr(campo, {
            locale: PT_BR,
            dateFormat: "Y",
            defaultDate: new Date(ano, primeiro ? 0 : 11, primeiro ? 1 : 31),
            // O campo guarda o ano; o calendário é só a ajuda para escolhê-lo.
            onChange: (datas) => {
                if (datas[0]) campo.value = String(datas[0].getFullYear());
            },
        }));
    });

    // Com o calendário aberto, Esc precisa fechar só o calendário. O flatpickr
    // deixa a tecla subir e o modal do Bootstrap se fecha junto, levando embora
    // a edição em andamento.
    el.addEventListener(
        "keydown",
        (e) => {
            if (e.key !== "Escape") return;
            const abertos = calendarios.filter((c) => c.isOpen);
            if (!abertos.length) return;
            e.stopPropagation();
            abertos.forEach((c) => c.close());
        },
        true // captura: antes de o Bootstrap ouvir
    );
}

function modal() {
    const p = edicao;
    const temContribuicoes = estado.iniciativas.length > 0 && !novo;
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
                    <div class="col-12">
                        <label class="form-label" for="f-nome">Nome do plano <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="f-nome" value="${esc(p.nome)}" ${leitura ? "disabled" : ""} />
                    </div>
                    <div class="col-md-6">
                        <label class="form-label" for="f-primeiroAno">Primeiro ano <span class="text-danger">*</span></label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="f-primeiroAno"
                                   data-provider="flatpickr" data-date-format="Y"
                                   value="${esc(p.primeiroAno)}" ${leitura ? "disabled" : ""} />
                            <span class="input-group-text"><i class="ti ti-calendar"></i></span>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label" for="f-ultimoAno">Último ano <span class="text-danger">*</span></label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="f-ultimoAno"
                                   data-provider="flatpickr" data-date-format="Y"
                                   value="${esc(p.ultimoAno)}" ${leitura ? "disabled" : ""} />
                            <span class="input-group-text"><i class="ti ti-calendar"></i></span>
                        </div>
                    </div>
                    <div class="col-12">
                        <label class="form-label" for="f-descricao">Descrição</label>
                        <textarea class="form-control" id="f-descricao" rows="3" ${leitura ? "disabled" : ""}>${esc(p.descricao ?? "")}</textarea>
                    </div>
                </div>

                ${
                    temContribuicoes
                        ? `<div class="alert alert-light py-2 px-3 fs-12 mt-3 mb-0">
                    A vigência define os anos das metas das Entregas. Alterá-la com contribuições já
                    cadastradas afeta as séries preenchidas.
                </div>`
                        : ""
                }
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
        if (!dados.nome || !dados.primeiroAno || !dados.ultimoAno) {
            alert("Nome e vigência são obrigatórios.");
            return;
        }
        if (Number(dados.ultimoAno) < Number(dados.primeiroAno)) {
            alert("O último ano não pode ser anterior ao primeiro.");
            return;
        }
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
