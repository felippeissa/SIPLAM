/**
 * Criar e editar o PPA, em tela própria.
 *
 * O PPA não usa o construtor genérico: tem vigência com dois anos, situação e
 * regras que nenhum outro cadastro tem.
 *
 * Os campos são os da matriz de mapeamento, na ordem dela: nome, Processo SEI,
 * ano inicial, ano final, situação, descrição e janela de aprovações. Os anos são calendários que só
 * têm anos — o plano vai de 01/01 do primeiro a 31/12 do último —, e a
 * **situação é editável**: a matriz a marca assim, e é por ela que o plano anda
 * de elaboração até encerrado. O Processo SEI é automático: vem da integração.
 *
 * **Situação é campo de texto**, como a matriz o define (componente TEXTO), mas
 * de texto com cinco respostas válidas: o campo sugere as da matriz e a regra
 * recusa qualquer outra. Texto livre sem essa regra deixaria a pessoa escrever
 * "quase aprovado" num campo de que dependem as travas de elaboração e vigência.
 *
 * **Janela de aprovações** são os períodos em que o setorial pode incluir
 * Iniciativas e Entregas. A matriz só dá o nome do campo e manda validar o resto com
 * o negócio; cada janela tem, por ora, nome e período — o que o próprio texto da
 * matriz descreve.
 */
import {
    obterEstado,
    addPpa,
    updPpa,
    removePpa,
    SITUACOES_PPA,
    ppaVazio,
    situacaoPpa,
    anoDeElaboracao,
    ppaQueColide,
    vinculosDe,
    descreverVinculos,
} from "../dados/store.js";
import { montarShell, barraTitulo, somenteLeitura, perfilAtual, url } from "../shell.js";
import { esc, chip } from "../ui.js";
import { confirmarExclusao } from "../confirmar.js";
import { avisar } from "../toast.js";
import { campoErro, validar, limparAoDigitar } from "../validacao.js";
import { seletorDeAno, ligarSeletoresDeAno } from "../seletor-ano.js";

export function montarFormularioPpa({ novo }) {
    const { estado } = montarShell();

    // O cadastro do PPA é exclusivo do Administrador central: abrir um ciclo é
    // ato da administração do plano, não de quem o preenche.
    // Sem perfil na sessão — tela aberta direto pelo endereço, como no protótipo —
    // não há a quem restringir: trancar tudo faria o sistema parecer quebrado.
    const doPerfil = somenteLeitura() || (!!perfilAtual() && !["admin-central", "gestao-central"].includes(perfilAtual()));
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

    // Nome, vigência e descrição travam com o plano fechado; a situação não, porque é
    // ela que o destrava ou o leva adiante. Só o perfil sem escrita trava tudo.
    const leitura = doPerfil || fechado;
    const situacaoTravada = doPerfil;

    /**
     * As situações oferecidas: as cinco da matriz. Plano que já está em outra —
     * "reprovado", que vem do fluxo — mantém a sua, para a tela não apagá-la.
     */
    const OFERECIDAS = ["elaboracao", "submetido", "aprovado", "vigente", "encerrado"];
    const opcoesDeSituacao = SITUACOES_PPA.filter((s) => OFERECIDAS.includes(s.id) || s.id === p.situacao);

    /** As janelas em edição. Moram aqui porque a tabela se redesenha a cada linha acrescentada. */
    let janelas = structuredClone(p.janelas ?? []);
    const janelaVazia = () => ({ id: `jn-${Math.random().toString(36).slice(2, 9)}`, nome: "", de: "", ate: "" });

    function tabelaDeJanelas() {
        return `
        <div class="table-responsive border rounded">
            <table class="table table-sm align-middle mb-0">
                <thead>
                    <tr>
                        <th>Nome da janela</th>
                        <th style="width:11rem">De</th>
                        <th style="width:11rem">Até</th>
                        <th style="width:3rem"></th>
                    </tr>
                </thead>
                <tbody>
                    ${
                        janelas.length
                            ? janelas
                                  .map(
                                      (j) => `
                    <tr>
                        <td><input type="text" class="form-control form-control-sm" data-janela="${j.id}:nome" value="${esc(j.nome)}" ${leitura ? "disabled" : ""} /></td>
                        <td><input type="date" class="form-control form-control-sm" data-janela="${j.id}:de" value="${esc(j.de)}" ${leitura ? "disabled" : ""} /></td>
                        <td><input type="date" class="form-control form-control-sm" data-janela="${j.id}:ate" value="${esc(j.ate)}" ${leitura ? "disabled" : ""} /></td>
                        <td class="text-end">
                            ${leitura ? "" : `<button type="button" class="btn btn-sm btn-light" data-janela-tirar="${j.id}" aria-label="Remover janela"><i class="ti ti-trash"></i></button>`}
                        </td>
                    </tr>`
                                  )
                                  .join("")
                            : '<tr><td colspan="4" class="text-center text-muted py-3 fs-12">Nenhuma janela de aprovação.</td></tr>'
                    }
                </tbody>
            </table>
        </div>`;
    }

    /** Guarda no módulo o que está digitado, antes de redesenhar a tabela. */
    function lerJanelasDaTela() {
        for (const el of document.querySelectorAll("[data-janela]")) {
            const [jid, campo] = el.dataset.janela.split(":");
            const janela = janelas.find((j) => j.id === jid);
            if (janela) janela[campo] = el.value;
        }
    }

    /** O texto digitado na situação → o identificador; vazio se não for uma das cinco. */
    const normaliza = (s) => String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
    function idDaSituacao(texto) {
        const n = normaliza(texto);
        return SITUACOES_PPA.find((s) => normaliza(s.rotulo) === n || normaliza(s.id) === n)?.id ?? "";
    }

    /** Quem aponta para este plano: enquanto houver, ele não se exclui. */
    const vinculos = novo ? [] : vinculosDe("ppas", p.id);

    function render() {
        document.getElementById("conteudo").innerHTML = `
        ${barraTitulo(novo ? "Novo PPA" : `Editar ${esc(p.nome)}`, [novo ? "Novo" : "Editar"])}
        ${
            fechado
                ? `<div class="alert alert-light border py-2 px-3 fs-13">
            <i class="ti ti-lock me-1"></i>
            Só um plano <strong>em elaboração</strong> se edita. Este está
            ${esc(situacao.rotulo.toLowerCase())}: os campos ficam travados, e a situação é o que se altera.
        </div>`
                : ""
        }

        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header d-flex flex-wrap justify-content-between align-items-start gap-2 p-3">
                        <div>
                        <h4 class="card-title mb-1">Plano Plurianual</h4>
                        <p class="text-muted mb-0 fs-13">A identidade do plano e o período que ele rege.</p></div>
                        <div class="d-flex gap-2 align-items-center">
            ${
                doPerfil
                    ? `<a href="${voltar}" class="btn btn-light">Voltar</a>`
                    : `
            ${
                novo || leitura
                    ? ""
                    : `<button type="button" class="btn btn-danger" id="excluir"
                    ${vinculos.length ? `disabled title="Não pode ser excluído: está vinculado a ${esc(descreverVinculos(vinculos))}"` : ""}>
                    Excluir plano
                </button>`
            }
            <a href="${voltar}" class="btn btn-light">Cancelar</a>
            <button type="button" class="btn btn-primary" id="salvar">${novo ? "Cadastrar" : "Salvar"}</button>`
            }</div>
                    </div>
                    <div class="card-body" id="formulario">
                    ${
                        vinculos.length
                            ? `<div class="alert alert-light border fs-13"><i class="ti ti-lock me-1"></i>Não pode ser excluído: está vinculado a <strong>${esc(descreverVinculos(vinculos))}</strong>. Desfaça esses vínculos antes.</div>`
                            : ""
                    }
                        <div class="row">
                            <div class="col-12">
                                <div class="mb-3">
                                    <label class="form-label" for="f-nome">Nome do PPA <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="f-nome" value="${esc(p.nome)}" ${leitura ? "disabled" : ""} />
                                    ${campoErro("f-nome")}
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label class="form-label" for="f-processoSei">Processo SEI</label>
                                    <input type="text" class="form-control codigo" id="f-processoSei"
                                           value="${esc(p.processoSei ?? "")}" placeholder="Gerado pela integração com o SEI" disabled />
                                </div>
                            </div>
                            <div class="col-md-8">
                                <div id="f-vigencia" class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="f-primeiroAno">Ano inicial (vigência) <span class="text-danger">*</span></label>
                                            ${seletorDeAno({ id: "f-primeiroAno", valor: p.primeiroAno, desabilitado: leitura, rotulo: "Ano inicial da vigência" })}
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" for="f-ultimoAno">Ano final (vigência) <span class="text-danger">*</span></label>
                                            ${seletorDeAno({ id: "f-ultimoAno", valor: p.ultimoAno, desabilitado: leitura, rotulo: "Ano final da vigência" })}
                                        </div>
                                    </div>
                                </div>
                                <div class="invalid-feedback d-block mb-2" id="f-vigencia-erro"></div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label class="form-label" for="f-situacao">Situação <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="f-situacao" list="lista-situacoes" autocomplete="off"
                                           value="${esc(situacaoPpa(p.situacao).rotulo)}" ${situacaoTravada ? "disabled" : ""} />
                                    <datalist id="lista-situacoes">
                                        ${opcoesDeSituacao.map((s) => `<option value="${esc(s.rotulo)}"></option>`).join("")}
                                    </datalist>
                                    ${campoErro("f-situacao")}
                                </div>
                            </div>
                            <div class="col-12">
                                <label class="form-label" for="f-descricao">Descrição</label>
                                <textarea class="form-control" id="f-descricao" rows="12" ${leitura ? "disabled" : ""}>${esc(p.descricao ?? "")}</textarea>
                            </div>
                            <div class="col-12 mt-3">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <label class="form-label mb-0">Janela de aprovações</label>
                                    ${leitura ? "" : '<button type="button" class="btn btn-sm btn-light" id="janela-nova"><i class="ti ti-plus me-1"></i>Adicionar janela</button>'}
                                </div>
                                <div id="f-janelas"><div id="janelas-tabela">${tabelaDeJanelas()}</div></div>
                                <div class="invalid-feedback d-block" id="f-janelas-erro"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

        limparAoDigitar(document.getElementById("formulario"));
        ligarSeletoresDeAno(document.getElementById("formulario"));
        ligar();
    }

    function ler() {
        const v = (campo) => document.getElementById(campo)?.value ?? "";
        return {
            ...p,
            nome: v("f-nome").trim(),
            primeiroAno: v("f-primeiroAno"),
            ultimoAno: v("f-ultimoAno"),
            // Desabilitado, o campo não muda nada: vale a situação que o plano tem.
            situacao: document.getElementById("f-situacao")?.disabled ? p.situacao : idDaSituacao(v("f-situacao")),
            descricao: v("f-descricao").trim(),
            janelas: (lerJanelasDaTela(), janelas.map((j) => ({ ...j, nome: j.nome.trim() }))),
        };
    }

    function ligar() {
        // Ao trocar o primeiro ano, o último acompanha se ficou para trás. O ciclo
        // costuma ter quatro anos, mas pode ser menor — a sugestão não prende.
        const primeiro = document.getElementById("f-primeiroAno");
        const ultimo = document.getElementById("f-ultimoAno");
        primeiro?.addEventListener("change", () => {
            if (Number(ultimo.value) >= Number(primeiro.value)) return;
            ultimo.value = String(Number(primeiro.value) + 3);
            ultimo.dispatchEvent(new Event("change", { bubbles: true }));
        });

        const tabela = document.getElementById("janelas-tabela");
        document.getElementById("janela-nova")?.addEventListener("click", () => {
            lerJanelasDaTela();
            janelas.push(janelaVazia());
            tabela.innerHTML = tabelaDeJanelas();
        });
        tabela?.addEventListener("click", (e) => {
            const tirar = e.target.closest("[data-janela-tirar]");
            if (!tirar) return;
            lerJanelasDaTela();
            janelas = janelas.filter((j) => j.id !== tirar.dataset.janelaTirar);
            tabela.innerHTML = tabelaDeJanelas();
        });

        document.getElementById("salvar")?.addEventListener("click", () => {
            const dados = ler();
            const escopo = document.getElementById("formulario");
            document.getElementById("f-vigencia-erro").textContent = "";

            const colide = ppaQueColide(estado, dados);
            document.getElementById("f-janelas-erro").textContent = "";
            const janelaIncompleta = dados.janelas.find((j) => !j.nome || !j.de || !j.ate);
            const janelaInvertida = dados.janelas.find((j) => j.de && j.ate && j.ate < j.de);
            const ok = validar(escopo, [
                { campo: "f-nome", valido: !!dados.nome, mensagem: "Informe o nome do plano." },
                {
                    campo: "f-situacao",
                    valido: !!dados.situacao,
                    mensagem: `Escolha uma das situações: ${opcoesDeSituacao.map((s) => s.rotulo).join(", ")}.`,
                },
                {
                    campo: "f-vigencia",
                    valido: !!dados.primeiroAno && !!dados.ultimoAno,
                    mensagem: "Escolha o ano inicial e o ano final da vigência.",
                },
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
                    // Só um plano fica em elaboração por vez: dois seriam duas
                    // frentes de construção para o mesmo sistema, e os órgãos não
                    // saberiam em qual contribuir.
                    campo: "f-nome",
                    valido:
                        dados.situacao !== "elaboracao" ||
                        !estado.ppas.some((outro) => outro.id !== dados.id && outro.situacao === "elaboracao"),
                    mensagem: `Já existe um plano em elaboração: ${esc(
                        estado.ppas.find((outro) => outro.id !== dados.id && outro.situacao === "elaboracao")?.nome ?? ""
                    )}.`,
                },
                {
                    campo: "f-janelas",
                    valido: !janelaIncompleta,
                    mensagem: "Cada janela precisa de nome, início e fim.",
                },
                {
                    campo: "f-janelas",
                    valido: !janelaInvertida,
                    mensagem: `O fim da janela “${janelaInvertida?.nome}” não pode ser anterior ao início.`,
                },
                {
                    // Dois planos vigentes seriam duas leis valendo para os mesmos
                    // anos.
                    campo: "f-situacao",
                    valido:
                        dados.situacao !== "vigente" ||
                        !estado.ppas.some((outro) => outro.id !== dados.id && outro.situacao === "vigente"),
                    mensagem: `Já existe um plano vigente: ${esc(
                        estado.ppas.find((outro) => outro.id !== dados.id && outro.situacao === "vigente")?.nome ?? ""
                    )}.`,
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
            if (vinculos.length) return;
            const justificativa = await confirmarExclusao({
                titulo: "Excluir plano plurianual",
                texto: "O plano não tem nada vinculado a ele.",
                confirmar: "Excluir",
                digitar: p.nome,
            });
            if (!justificativa) return;
            const r = removePpa(p.id, justificativa);
            if (!r.ok) {
                avisar(r.motivo, "erro");
                return;
            }
            avisar("Plano plurianual excluído com sucesso.");
            window.location.href = voltar;
        });
    }

    render();
}
