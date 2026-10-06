/**
 * Recuperação de senha.
 *
 * Tela pública, como o registro: quem chega aqui não tem sessão — e, no caso,
 * nem consegue abrir uma.
 *
 * Os campos são os da matriz de mapeamento: **CPF**, **nova senha** e **repita
 * nova senha**. A chave é o CPF, e só ele: o e-mail com o link vai para o
 * endereço do vínculo funcional daquele CPF, que é o único dado que o sistema
 * sabe ser da pessoa.
 *
 * São dois passos, e no meio deles falta o e-mail:
 *
 *   informar o CPF  →  [o link chega por e-mail]  →  nova senha  →  pronto
 *
 * **No protótipo a tela salta o e-mail** e vai direto à nova senha, com o CPF
 * travado no alto para deixar claro de quem é a senha que está sendo trocada.
 * Sem servidor não há e-mail para enviar, e parar a demonstração numa caixa
 * postal que não existe seria pará-la em nada.
 *
 * A tela **não diz se o CPF existe**. Dizer "não encontrado" faria dela um
 * conferidor de CPF: bastaria digitar números até a mensagem mudar para
 * descobrir quem trabalha no plano.
 *
 * Ponto aberto com o negócio: o documento de requisitos (RN1) diz que a troca
 * de senha é do ID Goiás e fica fora do escopo do SIPLAM, mas a matriz prevê
 * esta tela. Vale a matriz, por decisão de 06/10/2026 — e, se o negócio confirmar
 * o ID Goiás, esta página vira um aviso que manda a pessoa para lá.
 */
import { obterEstado, buscarNaBaseFuncional, formatarCpf } from "../dados/store.js";
import { esc } from "../ui.js";
import { campoErro, validar, limparAoDigitar } from "../validacao.js";

const alvo = document.getElementById("conteudo");
const estado = obterEstado();

const digitos = (v) => String(v ?? "").replace(/\D/g, "");
const valor = (id) => document.getElementById(id)?.value ?? "";

/** Quem é o dono do CPF, quando o sistema o conhece. Só para mostrar o nome. */
function procurar(cpf) {
    const d = digitos(cpf);
    return (estado.usuarios ?? []).find((u) => digitos(u.cpf) === d) ?? buscarNaBaseFuncional(d);
}

/* ---------- passo 1: o CPF ---------- */

function pedir() {
    alvo.innerHTML = `
    <div class="text-center mb-3">
        <h4 class="fw-bold mb-1 fs-18">Esqueceu sua senha?</h4>
        <p class="text-muted fs-13 mb-0">
            Informe seu CPF. Enviaremos ao e-mail do seu vínculo funcional um link
            para você definir uma nova senha.
        </p>
    </div>

    <form id="form-recuperar" novalidate>
        <div class="mb-3">
            <label class="form-label" for="cpf">CPF <span class="text-danger">*</span></label>
            <input type="text" class="form-control" id="cpf" inputmode="numeric" autocomplete="username"
                   placeholder="000.000.000-00" maxlength="14" />
            ${campoErro("cpf")}
        </div>

        <div class="d-grid">
            <button type="submit" class="btn btn-primary fw-semibold py-2">Enviar link de recuperação</button>
        </div>
    </form>

    <p class="text-muted text-center mt-4 mb-0 fs-13">
        Lembrou a senha?
        <a href="index.html" class="text-decoration-underline link-offset-3 fw-semibold">Voltar para o acesso</a>
    </p>`;

    const form = document.getElementById("form-recuperar");
    limparAoDigitar(form);

    document.getElementById("cpf").addEventListener("input", (e) => {
        e.target.value = formatarCpf(digitos(e.target.value).slice(0, 11));
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const cpf = valor("cpf").trim();

        const ok = validar(form, [
            { campo: "cpf", valido: !!cpf, mensagem: "Informe seu CPF." },
            { campo: "cpf", valido: digitos(cpf).length === 11, mensagem: "O CPF precisa ter 11 dígitos." },
        ]);
        if (!ok) return;

        // Aqui sairia o e-mail. Sem servidor, a tela segue direto para onde o
        // link levaria.
        novaSenha(formatarCpf(digitos(cpf)));
    });
}

/* ---------- passo 2: a nova senha ---------- */

/** As regras da senha, cada uma com o seu próprio aviso — e não um texto só. */
const REGRAS = [
    { id: "tamanho", texto: "Pelo menos 8 caracteres", vale: (s) => s.length >= 8 },
    { id: "letra", texto: "Uma letra maiúscula e uma minúscula", vale: (s) => /[a-zà-ú]/.test(s) && /[A-ZÀ-Ú]/.test(s) },
    { id: "numero", texto: "Pelo menos um número", vale: (s) => /\d/.test(s) },
    { id: "simbolo", texto: "Pelo menos um símbolo", vale: (s) => /[^\w\s]/.test(s) },
];

function novaSenha(cpf) {
    const pessoa = procurar(cpf);

    alvo.innerHTML = `
    <div class="text-center mb-3">
        <h4 class="fw-bold mb-1 fs-18">Defina uma nova senha</h4>
        <p class="text-muted fs-13 mb-0">A senha anterior deixa de valer assim que esta for salva.</p>
    </div>

    <form id="form-senha" novalidate>
        <!-- O CPF fica à vista e travado: é ele que diz de quem é a senha que
             está sendo trocada, e poder alterá-lo aqui seria trocar de pessoa
             no meio do caminho. -->
        <div class="mb-3">
            <label class="form-label" for="cpf-lido">CPF</label>
            <input type="text" class="form-control" id="cpf-lido" value="${esc(cpf)}" disabled />
            ${pessoa?.nome ? `<div class="form-text fs-12">${esc(pessoa.nome)}</div>` : ""}
        </div>

        <div class="mb-3">
            <label class="form-label" for="senha">Nova senha <span class="text-danger">*</span></label>
            <div class="input-group">
                <input type="password" class="form-control" id="senha" autocomplete="new-password" placeholder="Digite a nova senha" />
                <div class="input-group-text" role="button" id="ver-senha" aria-label="Mostrar a senha">
                    <i class="ti ti-eye"></i>
                </div>
            </div>
            ${campoErro("senha")}
        </div>

        <ul class="list-unstyled fs-12 mb-3" id="regras">
            ${REGRAS.map(
                (r) => `
            <li class="mb-1 text-muted" data-regra="${r.id}">
                <i class="ti ti-circle me-1"></i>${esc(r.texto)}
            </li>`
            ).join("")}
        </ul>

        <div class="mb-3">
            <label class="form-label" for="repetir">Repita nova senha <span class="text-danger">*</span></label>
            <input type="password" class="form-control" id="repetir" autocomplete="new-password" placeholder="Digite de novo" />
            ${campoErro("repetir")}
        </div>

        <div class="d-grid">
            <button type="submit" class="btn btn-primary fw-semibold py-2">Salvar nova senha</button>
        </div>
    </form>

    <p class="text-muted text-center mt-4 mb-0 fs-13">
        <a href="index.html" class="text-decoration-underline link-offset-3 fw-semibold">Voltar para o acesso</a>
    </p>`;

    const form = document.getElementById("form-senha");
    limparAoDigitar(form);

    const campo = document.getElementById("senha");

    // As regras se marcam enquanto se digita: saber o que falta depois de
    // submeter é descobrir tarde.
    campo.addEventListener("input", () => {
        for (const r of REGRAS) {
            const item = form.querySelector(`[data-regra="${r.id}"]`);
            const ok = r.vale(campo.value);
            item.className = `mb-1 ${ok ? "text-success" : "text-muted"}`;
            item.querySelector("i").className = `ti ${ok ? "ti-circle-check" : "ti-circle"} me-1`;
        }
    });

    document.getElementById("ver-senha").addEventListener("click", (e) => {
        const mostrando = campo.type === "text";
        campo.type = mostrando ? "password" : "text";
        e.currentTarget.querySelector("i").className = `ti ${mostrando ? "ti-eye" : "ti-eye-off"}`;
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const senha = valor("senha");
        const repetir = valor("repetir");
        const faltando = REGRAS.filter((r) => !r.vale(senha));

        const ok = validar(form, [
            { campo: "senha", valido: !!senha, mensagem: "Informe a nova senha." },
            { campo: "senha", valido: faltando.length === 0, mensagem: "A senha ainda não cumpre as regras acima." },
            { campo: "repetir", valido: !!repetir, mensagem: "Repita a nova senha." },
            { campo: "repetir", valido: repetir === senha, mensagem: "As duas senhas não são iguais." },
        ]);
        if (!ok) return;

        pronto();
    });
}

/* ---------- passo 3: pronto ---------- */

function pronto() {
    alvo.innerHTML = `
    <div class="text-center">
        <div class="avatar-lg mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-light">
            <i class="ti ti-circle-check fs-24 text-success"></i>
        </div>
        <h4 class="fw-bold mb-1 fs-18">Senha alterada</h4>
        <p class="text-muted fs-13">
            Sua nova senha já está valendo. Use-a no próximo acesso — as sessões
            abertas em outros dispositivos foram encerradas.
        </p>
        <div class="d-grid">
            <a href="index.html" class="btn btn-primary fw-semibold py-2">Ir para o acesso</a>
        </div>
    </div>`;
}

pedir();
