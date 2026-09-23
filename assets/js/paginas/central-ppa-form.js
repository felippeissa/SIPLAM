/**
 * Criar e editar o PPA, em tela própria.
 *
 * O PPA não usa o construtor genérico: tem vigência com dois anos, situação e
 * Processo SEI que só se leem, e regras que nenhum outro cadastro tem.
 *
 * Quatro campos preenchíveis — nome, vigência e descrição. Situação e Processo
 * SEI aparecem porque a pessoa precisa saber onde o plano está, não porque ela
 * os decide aqui.
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
import { montarShell, barraTitulo, somenteLeitura, perfilAtual, url } from "../shell.js";
import { esc, chip } from "../ui.js";
import { confirmarExclusao } from "../confirmar.js";
import { avisar } from "../toast.js";
import { campoErro, validar, limparAoDigitar } from "../validacao.js";

export function montarFormularioPpa({ novo }) {
    const { estado } = montarShell();

    // O cadastro do PPA é exclusivo do Administrador central: abrir um ciclo é
    // ato da administração do plano, não de quem o preenche.
    // Sem perfil na sessão — tela aberta direto pelo endereço, como no protótipo —
    // não há a quem restringir: trancar tudo faria o sistema parecer quebrado.
    const doPerfil = somenteLeitura() || (!!perfilAtual() && perfilAtual() !== "admin-central");
    const voltar = url("central-ppa.html");

    const id = new URLSearchParams(location.search).get("id");
    const original = novo ? null : estado.ppas.find((p) => p.id === id);

    if (!novo && !original) {
        document.getElementById("conteudo").innerHTML = `
        <div class="my-4">
            <div class="alert alert-warning py-3 px-3">
                Este plano não existe mais.
                <a href="${voltar}" class="fw-semibold">Voltar para o Cadastro de PPA</a>.
            </div>
        </div>`;
        return;
    }

    const p = novo ? ppaVazio() : structuredClone(original);

    /**
     * Um plano só se edita enquanto está em elaboração.
     *
     * Submetido, ele virou peça formal: mudar o nome de um plano que já foi
     * encaminhado para aprovação é mudar o que foi encaminhado. Daí para a frente
     * a tela mostra, e não edita — alterar plano aprovado é outro fluxo, que o
     * sistema ainda não tem.
     */
    const situacao = situacaoPpa(p.situacao);
    const fechado = !novo && !situacao.editavel;
    const leitura = doPerfil || fechado;

    /** Os anos oferecidos. Só o ano importa: o plano vai de 1º/01 a 31/12. */
    function anosPossiveis() {
        const base = new Date().getFullYear();
        const anos = [];
        for (let a = base - 2; a <= base + 14; a++) anos.push(a);
        for (const ppa of estado.ppas) {
            for (const a of [Number(ppa.primeiroAno), Number(ppa.ultimoAno)]) {
                if (a && !anos.includes(a)) anos.push(a);
            }
        }
        return anos.sort((x, y) => x - y);
    }

    const diagnosticos = novo ? 0 : (estado.diagnosticos ?? []).filter((d) => d.ppaId === p.id).length;

    function render() {
        const anos = anosPossiveis();
        document.getElementById("conteudo").innerHTML = `
        ${barraTitulo(novo ? "Novo PPA" : `Editar ${esc(p.nome)}`, [novo ? "Novo" : "Editar"])}

        <div class="row">
            <div class="col-xxl-8">
                <div class="card">
                    <div class="card-header d-block p-3">
                        <h4 class="card-title mb-1">Plano Plurianual</h4>
                        <p class="text-muted mb-0 fs-13">A identidade do plano e o período que ele rege.</p>
                    </div>
                    <div class="card-body" id="formulario">
                        <div class="row">
                            <div class="col-12">
                                <div class="mb-3">
                                    <label class="form-label" for="f-nome">Nome do plano <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="f-nome" value="${esc(p.nome)}" ${leitura ? "disabled" : ""} />
                                    ${campoErro("f-nome")}
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label" for="f-primeiroAno">Vigência <span class="text-danger">*</span></label>
                                    <div class="input-group" id="f-vigencia">
                                        <select class="form-select" id="f-primeiroAno" ${leitura || !novo ? "disabled" : ""}>
                                            ${anos.map((a) => `<option value="${a}"${String(p.primeiroAno) === String(a) ? " selected" : ""}>${a}</option>`).join("")}
                                        </select>
                                        <span class="input-group-text">a</span>
                                        <select class="form-select" id="f-ultimoAno" ${leitura || !novo ? "disabled" : ""}>
                                            ${anos.map((a) => `<option value="${a}"${String(p.ultimoAno) === String(a) ? " selected" : ""}>${a}</option>`).join("")}
                                        </select>
                                    </div>
                                    <div class="invalid-feedback d-block" id="f-vigencia-erro"></div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label" for="f-processoSei">Processo SEI</label>
                                    <input type="text" class="form-control codigo" id="f-processoSei"
                                           value="${esc(p.processoSei ?? "")}" disabled />
                                </div>
                            </div>
                            <div class="col-12">
                                <label class="form-label" for="f-descricao">Descrição</label>
                                <textarea class="form-control" id="f-descricao" rows="12" ${leitura ? "disabled" : ""}>${esc(p.descricao ?? "")}</textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-xxl-4">
                <div class="card">
                    <div class="card-header d-block p-3">
                        <h4 class="card-title mb-1">Sobre este plano</h4>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <div class="rotulo-secao mb-1">Situação</div>
                            <p class="mb-1">${chip(situacaoPpa(p.situacao).rotulo, situacaoPpa(p.situacao).tom)}</p>
                            <p class="fs-12 text-muted mb-0">${esc(situacaoPpa(p.situacao).ajuda)}</p>
                        </div>
                        <div class="mb-3">
                            <div class="rotulo-secao mb-1">Ano de elaboração</div>
                            <p class="fs-13 mb-0">${anoDeElaboracao(p)}</p>
                        </div>
                        ${
                            fechado
                                ? `<div class="alert alert-light border py-2 px-3 fs-12 mb-3">
                            <i class="ti ti-lock me-1"></i>
                            Só um plano <strong>em elaboração</strong> se edita. Este está
                            ${esc(situacao.rotulo.toLowerCase())}, então a tela mostra e não altera.
                        </div>`
                                : ""
                        }
                        ${
                            novo
                                ? `<p class="fs-12 text-muted mb-0">
                            A situação e o Processo SEI não se escolhem: a primeira é reflexo do fluxo,
                            o segundo vem do SEI quando o processo é aberto lá.
                        </p>`
                                : `<div class="mb-0">
                            <div class="rotulo-secao mb-1">Diagnósticos vinculados</div>
                            <p class="fs-13 mb-0">${diagnosticos === 0 ? "Nenhum." : `${diagnosticos} ${diagnosticos === 1 ? "diagnóstico" : "diagnósticos"}.`}</p>
                        </div>`
                        }
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-1 mb-4 d-flex gap-2 align-items-center">
            ${
                leitura
                    ? `<a href="${voltar}" class="btn btn-light">Voltar</a>`
                    : `
            ${
                novo
                    ? ""
                    : `<button type="button" class="btn btn-outline-danger me-auto" id="excluir"
                    ${diagnosticos ? 'disabled title="Diagnósticos vinculados impedem a exclusão"' : ""}>
                    Excluir plano
                </button>`
            }
            <a href="${voltar}" class="btn btn-light">Cancelar</a>
            <button type="button" class="btn btn-primary" id="salvar">${novo ? "Cadastrar" : "Salvar"}</button>`
            }
        </div>`;

        limparAoDigitar(document.getElementById("formulario"));
        ligar();
    }

    function ler() {
        const v = (campo) => document.getElementById(campo)?.value ?? "";
        return {
            ...p,
            nome: v("f-nome").trim(),
            primeiroAno: v("f-primeiroAno"),
            ultimoAno: v("f-ultimoAno"),
            descricao: v("f-descricao").trim(),
        };
    }

    function ligar() {
        // Ao trocar o primeiro ano, o último acompanha se ficou para trás. O ciclo
        // costuma ter quatro anos, mas pode ser menor — a sugestão não prende.
        const primeiro = document.getElementById("f-primeiroAno");
        const ultimo = document.getElementById("f-ultimoAno");
        primeiro?.addEventListener("change", () => {
            if (Number(ultimo.value) >= Number(primeiro.value)) return;
            const alvo = Number(primeiro.value) + 3;
            const existe = [...ultimo.options].some((o) => Number(o.value) === alvo);
            ultimo.value = String(existe ? alvo : primeiro.value);
        });

        document.getElementById("salvar")?.addEventListener("click", () => {
            const dados = ler();
            const escopo = document.getElementById("formulario");
            document.getElementById("f-vigencia-erro").textContent = "";

            const colide = ppaQueColide(estado, dados);
            const ok = validar(escopo, [
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
                    valido: !colide,
                    mensagem: `Já existe um plano para esse período: ${esc(colide?.nome ?? "")}.`,
                },
                {
                    // O plano é construído no ano anterior à vigência. Criar antes
                    // é abrir um ciclo que ainda não começou a ser pensado; criar
                    // depois é atraso, e atraso a interface não impede.
                    campo: "f-vigencia",
                    valido: !novo || anoDeElaboracao(dados) <= new Date().getFullYear(),
                    mensagem: `Este plano só pode ser criado a partir de ${anoDeElaboracao(dados)}, seu ano de elaboração.`,
                },
            ]);
            if (!ok) return;

            if (novo) addPpa(dados);
            else updPpa(dados.id, dados);
            avisar(`Plano plurianual ${novo ? "criado" : "editado"} com sucesso.`);
            window.location.href = voltar;
        });

        document.getElementById("excluir")?.addEventListener("click", async () => {
            if (diagnosticos > 0) return;
            const confirmou = await confirmarExclusao({
                titulo: "Excluir plano plurianual",
                texto: "Tudo o que foi cadastrado dentro dele deixa de ter a que se vincular.",
                confirmar: "Excluir",
                digitar: p.nome,
            });
            if (!confirmou) return;
            removePpa(p.id);
            avisar("Plano plurianual excluído com sucesso.");
            window.location.href = voltar;
        });
    }

    render();
}
