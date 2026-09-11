/**
 * Validação dos formulários, no padrão do template.
 *
 * Campo em vermelho com `is-invalid` e a mensagem logo abaixo, em
 * `invalid-feedback` — o mesmo que a confirmação de exclusão usa. Substitui o
 * `alert()` do navegador, que interrompe a pessoa, não diz qual campo está
 * errado e tem a cara do sistema operacional, não a do sistema.
 */

/** O `invalid-feedback` que acompanha o campo. Vem vazio do markup. */
export function campoErro(id) {
    return `<div class="invalid-feedback" id="${id}-erro"></div>`;
}

/** Marca um campo como inválido e escreve o motivo. Retorna sempre `false`. */
export function acusar(id, mensagem) {
    const campo = document.getElementById(id);
    if (!campo) return false;
    campo.classList.add("is-invalid");
    const erro = document.getElementById(`${id}-erro`);
    if (erro) erro.textContent = mensagem;
    return false;
}

/** Tira o vermelho de todos os campos do escopo, antes de validar de novo. */
export function limpar(escopo) {
    escopo?.querySelectorAll(".is-invalid").forEach((c) => c.classList.remove("is-invalid"));
}

/**
 * Roda as regras na ordem e para na primeira que falhar, levando o foco ao
 * campo — apontar cinco erros de uma vez não ajuda a corrigir nenhum.
 *
 * @param {HTMLElement} escopo
 * @param {{campo: string, valido: boolean, mensagem: string}[]} regras
 * @returns {boolean}
 */
export function validar(escopo, regras) {
    limpar(escopo);
    const falha = regras.find((r) => !r.valido);
    if (!falha) return true;
    acusar(falha.campo, falha.mensagem);

    // Campo de calendário é readonly e abre o flatpickr ao receber foco, que
    // cobre justamente a mensagem de erro. Nesses, só trazemos o campo à vista.
    const campo = document.getElementById(falha.campo);
    if (campo && !campo.readOnly) campo.focus();
    else campo?.scrollIntoView({ block: "nearest" });
    return false;
}

/** O erro some assim que a pessoa mexe no campo. */
export function limparAoDigitar(escopo) {
    escopo?.addEventListener("input", (e) => e.target.classList?.remove("is-invalid"));
    escopo?.addEventListener("change", (e) => e.target.classList?.remove("is-invalid"));
}
