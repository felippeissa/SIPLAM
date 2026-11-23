/**
 * Campo desabilitado vira rótulo + texto (GESIS, seção 8: telas de visualização não usam campo desabilitado).
 *
 * Um só lugar para o sistema inteiro: toda tela que trava um campo — porque o perfil só consulta, porque o plano saiu
 * da elaboração, porque o dado é gerado — passa a mostrar o valor como texto simples (`form-control-plaintext` do
 * Inspinia), com o rótulo que já estava acima. Nenhuma tela precisa saber disso.
 *
 * O campo original continua no DOM, escondido: quem lê `#f-nome.value` ao salvar não percebe a troca. Se o campo
 * voltar a ser habilitado, o texto some e o campo reaparece.
 *
 * Fica de fora, de propósito: botões, caixas de marcação e rádios (não são campos de texto), seletores de
 * multisseleção (Choices.js), campos de `input-group` com botão ativo ao lado e o que levar `data-mantem-campo` — como um select que
 * só destrava depois de outro (Tipo, depois de Dimensão), que é um estado do preenchimento, não uma visualização.
 */

const ALVOS = "input.form-control, textarea.form-control, select.form-select";

const elegivel = (el) =>
    el.disabled &&
    !el.dataset.mantemCampo &&
    !["checkbox", "radio", "button", "submit", "file", "hidden", "color", "range"].includes(el.type) &&
    !el.closest(".choices, [data-mantem-campo]") &&
    (!el.closest(".input-group") || grupoSimples(el));

/** Grupo só com o campo e um adendo de texto/ícone (o calendário do ano): some inteiro. Com botão ativo ao lado (o Buscar do CPF), fica. */
function grupoSimples(el) {
    const g = el.closest(".input-group");
    return !!g && ![...g.querySelectorAll("button, .btn")].some((b) => !b.disabled) && g.querySelectorAll("input, select, textarea").length === 1;
}
const alvoDe = (el) => (el.closest(".input-group") && grupoSimples(el) ? el.closest(".input-group") : el);

function textoDe(el) {
    if (el.tagName === "SELECT") return el.selectedOptions[0]?.value ? el.selectedOptions[0].textContent.trim() : "";
    return el.value.trim();
}

function estatizar(el) {
    const valor = textoDe(el);
    const vazio = !valor;
    const texto = document.createElement("div");
    texto.className = "form-control-plaintext campo-estatico" + (vazio ? " text-muted" : "");
    texto.textContent = vazio ? el.getAttribute("placeholder") || "—" : valor;
    texto.dataset.campoEstatico = "1";
    alvoDe(el).after(texto);
    alvoDe(el).classList.add("d-none");
    el.dataset.estatizado = "1";
}

function restaurar(el) {
    const alvo = alvoDe(el);
    alvo.classList.remove("d-none");
    delete el.dataset.estatizado;
    const irmao = alvo.nextElementSibling;
    if (irmao?.dataset.campoEstatico) irmao.remove();
}

/** Percorre `raiz` e deixa cada campo no estado certo: travado vira texto, destravado volta a ser campo. */
export function aplicarCamposEstaticos(raiz = document) {
    raiz.querySelectorAll(ALVOS).forEach((el) => {
        if (el.dataset.estatizado) {
            if (!elegivel(el)) restaurar(el);
        } else if (elegivel(el)) estatizar(el);
    });
}

let agendado = false;
const agendar = () => {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(() => {
        agendado = false;
        aplicarCamposEstaticos();
    });
};

/** Liga uma vez por página: acompanha o que a tela desenha depois e os campos que ela trava ou destrava. */
export function ligarCamposEstaticos() {
    if (window.__camposEstaticos) return;
    window.__camposEstaticos = true;
    new MutationObserver(agendar).observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["disabled"],
    });
    aplicarCamposEstaticos();
}
