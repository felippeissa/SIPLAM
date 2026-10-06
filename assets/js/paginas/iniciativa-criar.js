/**
 * Nova Iniciativa — tela própria de criação.
 *
 * Os campos são os da matriz de mapeamento, os mesmos da ficha (módulo
 * `iniciativa-campos.js`): nome, status, descrição, programa, problema, causa e
 * subcausa e, quando o status é "reportar divergência", o motivo.
 *
 * Antes isto era uma janela dentro da lista de Programas, com público-alvo e
 * sem status. Criar pede os mesmos campos que editar pede — e a mesma tela.
 *
 * **Uma Iniciativa não nasce "enviada".** Enviar exige Entregas e causas, e na
 * criação não há Entrega alguma: a opção aparece, porque a matriz a lista, mas
 * escolhê-la aqui é recusado com o motivo.
 */
import { addIniciativa } from "../dados/store.js";
import { montarShell, barraTitulo, url } from "../shell.js";
import { esc } from "../ui.js";
import { avisar } from "../toast.js";
import { camposDaIniciativa, blocoDeCausas, problemaDaIniciativa, idDoStatus } from "../iniciativa-campos.js";
import { limparAoDigitar } from "../validacao.js";

const { estado } = montarShell();
const voltar = url("programas.html");

// O Programa de onde se veio, quando se veio de um.
const doEndereco = new URLSearchParams(location.search).get("programa") ?? "";

const rascunho = {
    nome: "",
    descricao: "",
    motivo: "",
    status: "em_preenchimento",
    programaId: estado.programas.some((p) => p.id === doEndereco) ? doEndereco : "",
    problemaId: "",
    causas: [],
};
rascunho.problemaId = problemaDaIniciativa(estado, rascunho);

function render() {
    document.getElementById("conteudo").innerHTML = `
    ${barraTitulo("Nova Iniciativa", ["Nova"])}

    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header d-block p-3">
                    <h4 class="card-title mb-1">Iniciativa</h4>
                    <p class="text-muted mb-0 fs-13">A contribuição do órgão para um Programa.</p>
                </div>
                <div class="card-body" id="formulario">
                    ${// A Iniciativa nasce no fluxo do órgão, seja quem for que a cadastre: os
                    // status de análise só existem depois de ela ser enviada.
                    camposDaIniciativa({ ini: rascunho, estado, visao: "setorial", travado: false })}
                </div>
            </div>
        </div>
    </div>

    <div class="mt-1 mb-4 d-flex gap-2 align-items-center justify-content-end">
        <a href="${voltar}" class="btn btn-light">Cancelar</a>
        <button type="button" class="btn btn-primary" id="criar">Cadastrar</button>
    </div>`;

    limparAoDigitar(document.getElementById("formulario"));
}

/** Guarda o que está digitado: trocar de Programa redesenha a lista de causas, e o resto não pode se perder. */
function ler() {
    const v = (campo) => document.getElementById(campo)?.value ?? "";
    Object.assign(rascunho, {
        nome: v("f-nome").trim(),
        // O que está escrito, ainda sem saber se é um status: quem valida é o salvar.
        statusTexto: v("f-status").trim(),
        status: idDoStatus(v("f-status"), "setorial"),
        motivo: v("f-motivo").trim(),
        descricao: v("f-descricao").trim(),
        programaId: v("f-programa"),
        problemaId: v("f-problema"),
        causas: [...document.querySelectorAll("[data-causa]:checked")].map((c) => c.value),
    });
}

function erro(campo, mensagem) {
    const caixa = document.getElementById(campo);
    caixa?.classList.add("is-invalid");
    const texto = document.getElementById(`${campo}-erro`);
    if (texto) texto.textContent = mensagem;
    caixa?.focus();
}

document.addEventListener("change", (e) => {
    if (e.target.id === "f-status") {
        // O motivo só existe quando há divergência a explicar.
        document.getElementById("bloco-motivo").hidden = idDoStatus(e.target.value, "setorial") !== "divergencia";
        return;
    }

    if (e.target.id === "f-programa") {
        ler();
        const programa = estado.programas.find((p) => p.id === rascunho.programaId);
        // As causas são do Programa: trocar de Programa as deixa sem a que se ligar.
        rascunho.causas = [];
        rascunho.problemaId = problemaDaIniciativa(estado, rascunho);
        document.getElementById("f-problema").value = rascunho.problemaId;
        document.getElementById("bloco-causas").innerHTML = blocoDeCausas(programa, [], false);
    }
});

document.addEventListener("click", (e) => {
    if (!e.target.closest("#criar")) return;

    ler();
    document.querySelectorAll("#formulario .is-invalid").forEach((c) => c.classList.remove("is-invalid"));

    if (!rascunho.nome) return erro("f-nome", "Informe o nome da iniciativa.");
    if (!rascunho.status) return erro("f-status", "Escolha um status: Em preenchimento, Enviada ou Reportar divergência.");
    if (rascunho.status === "enviada") {
        return erro("f-status", "Uma Iniciativa só pode ser enviada depois de ter Entregas. Crie-a em preenchimento e envie pela ficha.");
    }

    const id = addIniciativa({
        programaId: rascunho.programaId,
        nome: rascunho.nome,
        descricao: rascunho.descricao,
        causas: rascunho.causas,
        problemaId: rascunho.problemaId,
        status: rascunho.status,
        motivo: rascunho.status === "divergencia" ? rascunho.motivo : "",
    });

    avisar("Iniciativa criada com sucesso.");
    window.location.href = url(`iniciativa.html?id=${encodeURIComponent(id)}`);
});

render();
