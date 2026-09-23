/**
 * Solicitação de acesso ao SIPLAM.
 *
 * Tela pública: não exige sessão, porque quem chega aqui ainda não tem acesso.
 *
 * Quem se registra informa o CPF, e o vínculo funcional responde pelo resto:
 * nome, e-mail e login vêm da base, não do teclado — digitados à mão, cada
 * solicitação chegaria à Área Central com um login que ninguém reconhece.
 *
 * **No protótipo, qualquer CPF passa.** Quando a base funcional não conhece o
 * número, a tela não barra: os campos abrem em branco para serem preenchidos à
 * mão, e o aviso diz que o dado não foi conferido. Sem isso não haveria como
 * testar a tela sem decorar os oito CPFs de demonstração. Com a integração
 * ligada, este caminho manual deixa de existir.
 *
 * O órgão é livre, e nem vem sugerido: a lotação da base de pessoal não é a
 * mesma coisa que o órgão para o qual se preenche o plano — quem está lotado
 * em um e trabalha o plano de outro é caso comum, e a base demora a acompanhar
 * remanejamento. Sugerir o da base faria passar batido no lugar de ser
 * decidido.
 *
 * O perfil é o único campo de escolha, e é **pedido**, não concedido. Quem
 * aprova é o Administrador central, que recebe o pedido já marcado e decide se
 * confirma ou troca.
 */
import { obterEstado, addItem, buscarNaBaseFuncional, formatarCpf } from "../dados/store.js";
import { ORGAOS } from "../dados/seed.js";
import { esc } from "../ui.js";
import { campoErro, validar, limparAoDigitar, acusar } from "../validacao.js";

/** Espelha `assets/js/acesso.js`. */
const PERFIS = [
    { id: "setorial", nome: "Planejamento setorial", descricao: "Preenche e envia a contribuição do órgão" },
    { id: "gestao-setorial", nome: "Alta gestão setorial", descricao: "Faz o mesmo e aprova a proposta do órgão" },
    { id: "admin-central", nome: "Administrador central", descricao: "Analisa, valida e administra os Programas" },
    { id: "gestao-central", nome: "Alta gestão central", descricao: "Faz o mesmo e aprova a consolidação" },
    { id: "controle", nome: "Consulta", descricao: "Consulta o plano, sem escrever" },
];

const estado = obterEstado();
const alvo = document.getElementById("conteudo");

const usuarios = () => estado.usuarios ?? [];
const digitos = (v) => String(v ?? "").replace(/\D/g, "");
const igual = (a, b) => (a ?? "").trim().toLocaleLowerCase("pt-BR") === (b ?? "").trim().toLocaleLowerCase("pt-BR");

/** Quem a base funcional achou, ou o que está sendo digitado à mão. */
let pessoa = null;

/** True quando o CPF não estava na base e os dados são preenchidos na tela. */
let manual = false;

/* ---------- desenho ---------- */

function campoLido(id, rotulo, valor, ajuda = "") {
    // No modo manual o mesmo campo vira editável: é o único jeito de testar a
    // tela com um CPF que a base de demonstração não tem.
    return `
    <div class="mb-3">
        <label class="form-label" for="${id}">${esc(rotulo)}${manual ? ' <span class="text-danger">*</span>' : ""}</label>
        <input type="text" class="form-control" id="${id}" value="${esc(valor ?? "")}" ${manual ? "" : "disabled"} />
        ${ajuda ? `<div class="form-text fs-12">${esc(ajuda)}</div>` : ""}
        ${manual ? campoErro(id) : ""}
    </div>`;
}

/**
 * Os órgãos oferecidos.
 *
 * Se o vínculo funcional apontar um órgão que a lista não tem, ele entra: a
 * alternativa seria a pessoa abrir a tela e não encontrar o próprio órgão.
 */
function orgaos() {
    const lista = [...ORGAOS];
    if (pessoa?.orgao && !lista.includes(pessoa.orgao)) lista.push(pessoa.orgao);
    return lista.sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function formulario() {
    alvo.innerHTML = `
    <h4 class="fw-bold fs-16 mb-1">Solicitar acesso</h4>
    <p class="text-muted fs-13 mb-3">
        Informe seu CPF. Seus dados vêm do vínculo funcional; a você cabe dizer que
        perfil precisa, e um administrador central analisa o pedido.
    </p>

    <div id="form-registro">
        <div class="mb-3">
            <label class="form-label" for="r-cpf">CPF<span class="text-danger">*</span></label>
            <div class="input-group">
                <input type="text" class="form-control codigo" id="r-cpf" inputmode="numeric"
                       placeholder="000.000.000-00" maxlength="14" autocomplete="off"
                       value="${esc(pessoa?.cpf ?? "")}" ${pessoa ? "disabled" : ""} />
                ${
                    pessoa
                        ? `<button type="button" class="btn btn-light" id="trocar">Trocar</button>`
                        : `<button type="button" class="btn btn-outline-primary" id="buscar">Buscar</button>`
                }
            </div>
            <!-- Dentro de um input-group o campo deixa de ser irmão do slot, e a
                 regra do Bootstrap que revela o erro não alcança. Daí o d-block. -->
            <div class="invalid-feedback d-block" id="r-cpf-erro"></div>
        </div>

        ${
            pessoa
                ? `
        ${
            manual
                ? `<div class="alert alert-warning py-2 px-3 fs-12 mb-3">
            <i class="ti ti-alert-triangle me-1"></i>
            Este CPF não está no vínculo funcional. Preencha os dados à mão — o administrador
            central vai conferi-los na análise.
        </div>`
                : `<div class="alert alert-light border py-2 px-3 fs-12 mb-3">
            <i class="ti ti-id-badge me-1"></i>Dados do vínculo funcional.
        </div>`
        }

        ${campoLido("r-nome", "Nome completo", pessoa.nome)}
        ${campoLido("r-email", "E-mail institucional", pessoa.email)}
        ${campoLido("r-login", "Login", pessoa.login, "É o nome que você vai usar para entrar.")}
        <div class="mb-3">
            <label class="form-label" for="r-orgao">Órgão<span class="text-danger">*</span></label>
            <select class="form-select" id="r-orgao">
                <option value="">Selecione seu órgão</option>
                ${orgaos().map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join("")}
            </select>
            <div class="form-text fs-12">Aquele para o qual você vai preencher o plano.</div>
            ${campoErro("r-orgao")}
        </div>

        <div class="mb-3">
            <label class="form-label" for="r-perfil">Perfil<span class="text-danger">*</span></label>
            <select class="form-select" id="r-perfil">
                <option value="">Selecione o perfil</option>
                ${PERFIS.map((p) => `<option value="${p.id}">${esc(p.nome)}</option>`).join("")}
            </select>
            <div class="form-text fs-12" id="r-perfil-ajuda">
                O administrador central confirma ou ajusta na análise.
            </div>
            ${campoErro("r-perfil")}
        </div>

        <div class="d-grid">
            <button type="button" class="btn btn-primary fw-semibold py-2" id="enviar">Enviar solicitação</button>
        </div>`
                : ""
        }
    </div>

    <p class="text-center mt-3 mb-0 fs-13">
        Já tem acesso? <a href="index.html" class="fw-semibold">Entrar</a>
    </p>`;

    const escopo = document.getElementById("form-registro");
    limparAoDigitar(escopo);
    ligar();
}

/* ---------- ações ---------- */

function ligar() {
    const cpf = document.getElementById("r-cpf");

    cpf?.addEventListener("input", () => {
        cpf.value = formatarCpf(cpf.value);
    });
    // Enter no CPF busca, em vez de não fazer nada.
    cpf?.addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        e.preventDefault();
        buscar();
    });

    document.getElementById("buscar")?.addEventListener("click", buscar);

    document.getElementById("trocar")?.addEventListener("click", () => {
        pessoa = null;
        manual = false;
        formulario();
        document.getElementById("r-cpf").focus();
    });

    // A ajuda embaixo do perfil diz o que o perfil escolhido faz: a lista de
    // nomes sozinha não distingue “Alta gestão setorial” de “Planejamento
    // setorial” para quem está pedindo acesso pela primeira vez.
    const perfil = document.getElementById("r-perfil");
    perfil?.addEventListener("change", () => {
        const escolhido = PERFIS.find((p) => p.id === perfil.value);
        document.getElementById("r-perfil-ajuda").textContent = escolhido
            ? `${escolhido.descricao}. O administrador central confirma ou ajusta na análise.`
            : "O administrador central confirma ou ajusta na análise.";
    });

    document.getElementById("enviar")?.addEventListener("click", enviar);
}

function buscar() {
    const valor = document.getElementById("r-cpf").value;
    const escopo = document.getElementById("form-registro");

    // Só o formato é exigido. O dígito verificador não barra: no protótipo é
    // preciso poder testar com qualquer número.
    const ok = validar(escopo, [
        { campo: "r-cpf", valido: digitos(valor).length === 11, mensagem: "O CPF tem 11 dígitos." },
    ]);
    if (!ok) return;

    // Pedir acesso duas vezes não adianta: a primeira solicitação continua na
    // fila, e duas fichas do mesmo servidor confundem quem analisa.
    const jaExiste = usuarios().find((u) => digitos(u.cpf) === digitos(valor));
    if (jaExiste) {
        acusar(
            "r-cpf",
            jaExiste.situacao === "aguardando"
                ? "Já existe uma solicitação para esse CPF, aguardando análise."
                : "Esse CPF já tem cadastro no SIPLAM. Use “Entrar”."
        );
        return;
    }

    const achado = buscarNaBaseFuncional(valor);
    manual = !achado;
    pessoa = achado ?? { cpf: formatarCpf(valor), nome: "", email: "", login: "", orgao: "" };

    formulario();
    document.getElementById(manual ? "r-nome" : "r-perfil")?.focus();
}

function enviar() {
    const escopo = document.getElementById("form-registro");
    const perfil = document.getElementById("r-perfil").value;
    const orgao = document.getElementById("r-orgao").value;

    // No modo manual os três campos de identificação vêm da tela, e não da base.
    if (manual) {
        pessoa = {
            ...pessoa,
            nome: document.getElementById("r-nome").value.trim(),
            email: document.getElementById("r-email").value.trim(),
            login: document.getElementById("r-login").value.trim(),
        };
    }

    const ok = validar(escopo, [
        { campo: "r-nome", valido: !manual || !!pessoa.nome, mensagem: "Informe o nome completo." },
        {
            campo: "r-email",
            valido: !manual || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pessoa.email),
            mensagem: "Informe um e-mail válido.",
        },
        { campo: "r-login", valido: !manual || pessoa.login.length >= 3, mensagem: "O login precisa de ao menos 3 caracteres." },
        {
            campo: "r-login",
            valido: !manual || /^[a-z0-9._-]+$/i.test(pessoa.login),
            mensagem: "Use apenas letras, números, ponto, hífen ou sublinhado.",
        },
        { campo: "r-orgao", valido: orgao !== "", mensagem: "Escolha o seu órgão." },
        { campo: "r-perfil", valido: perfil !== "", mensagem: "Escolha o perfil de que você precisa." },
        {
            campo: manual ? "r-login" : "r-perfil",
            valido: !usuarios().some((u) => igual(u.login, pessoa.login)),
            mensagem: "Esse login já está em uso. Procure o administrador central.",
        },
    ]);
    if (!ok) return;

    addItem("usuarios", {
        cpf: pessoa.cpf,
        nome: pessoa.nome,
        email: pessoa.email,
        login: pessoa.login,
        orgao,
        // Pedido, não concedido: `perfis` só é preenchido na aprovação.
        perfilSolicitado: perfil,
        // Marca quem se cadastrou fora do vínculo funcional, para a análise saber
        // que os dados não foram conferidos por ninguém.
        foraDaBase: manual,
        perfis: [],
        situacao: "aguardando",
    });
    confirmacao(pessoa.nome, perfil);
}

function confirmacao(nome, perfil) {
    const escolhido = PERFIS.find((p) => p.id === perfil);
    alvo.innerHTML = `
    <div class="text-center py-2">
        <i class="ti ti-circle-check fs-32 text-success d-block mb-2"></i>
        <h4 class="fw-bold fs-16 mb-2">Solicitação enviada</h4>
        <p class="text-muted fs-13 mb-3">
            Obrigado, ${esc(nome.split(" ")[0])}. Você pediu o perfil
            <strong>${esc(escolhido?.nome ?? perfil)}</strong>. Um administrador central vai analisar
            e confirmar o acesso. Você será avisado por e-mail quando houver resposta.
        </p>
        <a href="index.html" class="btn btn-light">Voltar para a entrada</a>
    </div>`;
}

formulario();
