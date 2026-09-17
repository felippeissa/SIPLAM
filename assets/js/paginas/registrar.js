/**
 * Solicitação de acesso ao SIPLAM.
 *
 * Tela pública: não exige sessão, porque quem chega aqui ainda não tem acesso.
 *
 * Quem se registra informa **quem é** — nome, e-mail, login e órgão. Não escolhe
 * perfil: o papel é decidido pelo Administrador central na aprovação. Deixar a
 * pessoa pedir o próprio perfil seria pedir que ela declare a própria permissão.
 */
import { obterEstado, addItem } from "../dados/store.js";
import { ORGAOS } from "../dados/seed.js";
import { esc } from "../ui.js";
import { campoErro, validar, limparAoDigitar } from "../validacao.js";

const estado = obterEstado();
const alvo = document.getElementById("conteudo");

const usuarios = () => estado.usuarios ?? [];
const igual = (a, b) => (a ?? "").trim().toLocaleLowerCase("pt-BR") === (b ?? "").trim().toLocaleLowerCase("pt-BR");

function formulario() {
    alvo.innerHTML = `
    <h4 class="fw-bold fs-16 mb-1">Solicitar acesso</h4>
    <p class="text-muted fs-13 mb-3">
        Preencha seus dados. Um administrador central analisa a solicitação e define seu perfil.
    </p>

    <div id="form-registro">
        <div class="mb-3">
            <label class="form-label" for="r-nome">Nome completo<span class="text-danger">*</span></label>
            <input type="text" class="form-control" id="r-nome" autocomplete="name" />
            ${campoErro("r-nome")}
        </div>
        <div class="mb-3">
            <label class="form-label" for="r-email">E-mail institucional<span class="text-danger">*</span></label>
            <input type="email" class="form-control" id="r-email" autocomplete="email" />
            ${campoErro("r-email")}
        </div>
        <div class="mb-3">
            <label class="form-label" for="r-login">Login<span class="text-danger">*</span></label>
            <input type="text" class="form-control" id="r-login" autocomplete="username" />
            <div class="form-text fs-12">É o nome que você vai usar para entrar.</div>
            ${campoErro("r-login")}
        </div>
        <div class="mb-3">
            <label class="form-label" for="r-orgao">Órgão<span class="text-danger">*</span></label>
            <select class="form-select" id="r-orgao">
                <option value="">Selecione seu órgão</option>
                ${ORGAOS.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join("")}
            </select>
            ${campoErro("r-orgao")}
        </div>

        <div class="d-grid">
            <button type="button" class="btn btn-primary fw-semibold py-2" id="enviar">Enviar solicitação</button>
        </div>
    </div>

    <p class="text-center mt-3 mb-0 fs-13">
        Já tem acesso? <a href="index.html" class="fw-semibold">Entrar</a>
    </p>`;

    const escopo = document.getElementById("form-registro");
    limparAoDigitar(escopo);
    document.getElementById("enviar").addEventListener("click", enviar);
}

function enviar() {
    const escopo = document.getElementById("form-registro");
    const v = (id) => document.getElementById(id).value.trim();
    const nome = v("r-nome");
    const email = v("r-email");
    const login = v("r-login");
    const orgao = v("r-orgao");

    const ok = validar(escopo, [
        { campo: "r-nome", valido: nome.length > 0, mensagem: "Informe seu nome completo." },
        { campo: "r-email", valido: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), mensagem: "Informe um e-mail válido." },
        {
            campo: "r-email",
            valido: !usuarios().some((u) => igual(u.email, email)),
            mensagem: "Já existe uma solicitação com esse e-mail.",
        },
        { campo: "r-login", valido: login.length >= 3, mensagem: "O login precisa de ao menos 3 caracteres." },
        {
            campo: "r-login",
            valido: /^[a-z0-9._-]+$/i.test(login),
            mensagem: "Use apenas letras, números, ponto, hífen ou sublinhado.",
        },
        {
            campo: "r-login",
            valido: !usuarios().some((u) => igual(u.login, login)),
            mensagem: "Esse login já está em uso.",
        },
        { campo: "r-orgao", valido: orgao !== "", mensagem: "Escolha o seu órgão." },
    ]);
    if (!ok) return;

    // Sem perfil: quem aprova é que define o papel.
    addItem("usuarios", { nome, email, login, orgao, perfis: [], situacao: "aguardando" });
    confirmacao(nome);
}

function confirmacao(nome) {
    alvo.innerHTML = `
    <div class="text-center py-2">
        <i class="ti ti-circle-check fs-32 text-success d-block mb-2"></i>
        <h4 class="fw-bold fs-16 mb-2">Solicitação enviada</h4>
        <p class="text-muted fs-13 mb-3">
            Obrigado, ${esc(nome.split(" ")[0])}. Um administrador central vai analisar seu cadastro
            e definir seu perfil de acesso. Você será avisado por e-mail quando houver resposta.
        </p>
        <a href="index.html" class="btn btn-light">Voltar para a entrada</a>
    </div>`;
}

formulario();
