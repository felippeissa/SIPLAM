/**
 * Solicitação de acesso ao SIPLAM.
 *
 * Tela pública: não exige sessão, porque quem chega aqui ainda não tem acesso.
 *
 * Uma coluna, e **o formulário inteiro à vista desde o começo**. Esconder os
 * campos até o CPF ser buscado economizava tela e cobrava o preço errado: quem
 * chega não vê o que vai ter de informar, e descobre a cada passo.
 *
 * Quem se registra informa o CPF, e o vínculo funcional responde pelo resto:
 * nome, e-mail e login vêm da base, não do teclado — digitados à mão, cada
 * solicitação chegaria à Área Central com um login que ninguém reconhece. Por
 * isso os três chegam travados: são consulta, não digitação.
 *
 * **No protótipo a base é fingida.** Os oito CPFs de demonstração respondem de
 * verdade; qualquer outro produz um servidor plausível, montado a partir dos
 * próprios dígitos do CPF — o mesmo CPF devolve sempre a mesma pessoa, que é
 * como uma base se comporta. Sem isso não haveria como demonstrar a tela sem
 * decorar oito números. Com a integração ligada, `inventar()` sai e só a
 * consulta real fica.
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
 *
 * No fim vêm dois campos opcionais, e os dois existem pelo mesmo motivo: a
 * solicitação chega à análise sem ninguém para perguntar nada. A **observação**
 * é onde se explica o que a ficha não mostra — órgão diferente da lotação,
 * perfil pedido por causa de uma função nova — e o **documento** é onde se prova
 * isso: portaria, ofício, designação.
 *
 * O arquivo não sai do navegador. Sem servidor não há para onde enviar, então o
 * que a solicitação guarda é a ficha do anexo — nome, tipo e tamanho —, que é o
 * que a tela de análise precisa mostrar.
 */
import { obterEstado, addItem, buscarNaBaseFuncional, formatarCpf } from "../dados/store.js";
import { ORGAOS } from "../dados/seed.js";
import { esc } from "../ui.js";
import { campoErro, validar, limparAoDigitar, acusar } from "../validacao.js";

/** Espelha `assets/js/acesso.js`. */
const PERFIS = [
    { id: "setorial", nome: "Planejamento setorial" },
    { id: "gestao-setorial", nome: "Alta gestão setorial" },
    { id: "admin-central", nome: "Administrador central" },
    { id: "gestao-central", nome: "Alta gestão central" },
    { id: "controle", nome: "Consulta" },
];

const estado = obterEstado();
const alvo = document.getElementById("conteudo");

const usuarios = () => estado.usuarios ?? [];
const digitos = (v) => String(v ?? "").replace(/\D/g, "");
const igual = (a, b) => (a ?? "").trim().toLocaleLowerCase("pt-BR") === (b ?? "").trim().toLocaleLowerCase("pt-BR");

/** O que a base — real ou fingida — respondeu para o CPF digitado. */
let pessoa = null;

/** Os documentos escolhidos, como fichas: o arquivo em si não vai a lugar nenhum. */
let anexos = [];

/** Um anexo por vez tem limite; a soma também, para a solicitação não virar mala. */
const LIMITE_ARQUIVO = 5 * 1024 * 1024;
const LIMITE_TOTAL = 15 * 1024 * 1024;
const TIPOS = ".pdf,.jpg,.jpeg,.png";

const tamanhoLegivel = (bytes) =>
    bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/* ---------- a base fingida ---------- */

const PRIMEIROS = [
    "Ana", "Bruno", "Carla", "Daniel", "Eduarda", "Felipe", "Gabriela", "Henrique",
    "Isabela", "João", "Karina", "Lucas", "Mariana", "Nelson", "Olívia", "Paulo",
    "Renata", "Sérgio", "Tatiana", "Vinícius",
];

const SOBRENOMES = [
    "Almeida", "Barbosa", "Carvalho", "Dias", "Esteves", "Ferreira", "Gomes", "Henriques",
    "Iglesias", "Jardim", "Lima", "Machado", "Nogueira", "Oliveira", "Pereira", "Queiroz",
    "Ribeiro", "Santana", "Teixeira", "Vasconcelos",
];

/** Tira os acentos: login e e-mail institucionais não os têm. */
const semAcento = (t) =>
    t.normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLocaleLowerCase("pt-BR");

/**
 * Inventa um servidor a partir do CPF.
 *
 * Determinístico de propósito: o índice de cada nome sai dos dígitos do próprio
 * CPF, então o mesmo número devolve sempre a mesma pessoa. Um sorteio de
 * verdade mudaria o nome a cada tecla apagada e recolocada, e a demonstração
 * pareceria quebrada.
 */
function inventar(cpf) {
    const d = digitos(cpf).split("").map(Number);
    const soma = (de, ate) => d.slice(de, ate).reduce((s, n) => s + n, 0);

    const primeiro = PRIMEIROS[soma(0, 4) % PRIMEIROS.length];
    const meio = SOBRENOMES[soma(3, 7) % SOBRENOMES.length];
    const ultimo = SOBRENOMES[soma(6, 11) % SOBRENOMES.length];
    const sobrenome = meio === ultimo ? ultimo : `${meio} ${ultimo}`;

    const login = `${semAcento(primeiro)}.${semAcento(ultimo)}`;
    return {
        cpf: formatarCpf(cpf),
        nome: `${primeiro} ${sobrenome}`,
        email: `${login}@goias.gov.br`,
        login,
    };
}

/** A base de demonstração primeiro; o resto, inventado. */
const consultar = (cpf) => buscarNaBaseFuncional(cpf) ?? inventar(cpf);

/* ---------- desenho ---------- */

/** Campo de leitura: vem da base, e por isso não se digita. */
const campoLido = (id, rotulo, valor) => `
    <div class="mb-3">
        <label class="form-label" for="${id}">${esc(rotulo)} <span class="text-danger">*</span></label>
        <input type="text" class="form-control" id="${id}" value="${esc(valor ?? "")}"
               placeholder="Preenchido pelo vínculo funcional" disabled />
    </div>`;

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
            <input type="text" class="form-control codigo" id="r-cpf" inputmode="numeric"
                   placeholder="000.000.000-00" maxlength="14" autocomplete="off" value="${esc(pessoa?.cpf ?? "")}" />
            ${campoErro("r-cpf")}
        </div>

        ${campoLido("r-nome", "Nome completo", pessoa?.nome)}
        ${campoLido("r-email", "E-mail institucional", pessoa?.email)}
        ${campoLido("r-login", "Login", pessoa?.login)}

        <div class="mb-3">
            <label class="form-label" for="r-orgao">Órgão<span class="text-danger">*</span></label>
            <select class="form-select" id="r-orgao">
                <option value="">Selecione seu órgão</option>
                ${orgaos().map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join("")}
            </select>
            ${campoErro("r-orgao")}
        </div>

        <div class="mb-3">
            <label class="form-label" for="r-perfil">Perfil<span class="text-danger">*</span></label>
            <select class="form-select" id="r-perfil">
                <option value="">Selecione o perfil</option>
                ${PERFIS.map((p) => `<option value="${p.id}">${esc(p.nome)}</option>`).join("")}
            </select>
            ${campoErro("r-perfil")}
        </div>

        <div class="mb-3">
            <label class="form-label" for="r-observacao">Observação</label>
            <textarea class="form-control" id="r-observacao" rows="3" maxlength="600"
                      placeholder="Algo que ajude na análise: a função que você exerce, por que precisa deste perfil…"></textarea>
        </div>

        <div class="mb-3">
            <label class="form-label" for="r-arquivo">Documento</label>
            <input type="file" class="form-control" id="r-arquivo" accept="${TIPOS}" multiple />
            <div class="invalid-feedback d-block" id="r-arquivo-erro"></div>
            <div id="r-anexos" class="mt-2"></div>
        </div>

        <div class="d-grid">
            <button type="button" class="btn btn-primary fw-semibold py-2" id="enviar">Enviar solicitação</button>
        </div>
    </div>

    <p class="text-center mt-3 mb-0 fs-13">
        Já tem acesso? <a href="index.html" class="fw-semibold">Entrar</a>
    </p>`;

    limparAoDigitar(document.getElementById("form-registro"));
    ligar();
}

/** Os documentos já escolhidos, com o botão de tirar cada um. */
function listaDeAnexos() {
    if (!anexos.length) return "";
    return `
    <ul class="list-group">
        ${anexos
            .map(
                (a, n) => `
        <li class="list-group-item d-flex align-items-center gap-2 py-2">
            <i class="ti ti-paperclip text-muted"></i>
            <span class="fs-13 text-truncate">${esc(a.nome)}</span>
            <span class="fs-12 text-muted ms-auto">${esc(tamanhoLegivel(a.tamanho))}</span>
            <button type="button" class="btn btn-sm btn-light" data-tirar="${n}" aria-label="Remover ${esc(a.nome)}">
                <i class="ti ti-x"></i>
            </button>
        </li>`
            )
            .join("")}
    </ul>`;
}

/** Redesenha só a lista: refazer o formulário perderia o que já foi digitado. */
function redesenharAnexos() {
    const caixa = document.getElementById("r-anexos");
    if (caixa) caixa.innerHTML = listaDeAnexos();
}

/* ---------- ações ---------- */

function ligar() {
    const cpf = document.getElementById("r-cpf");

    // A consulta acontece enquanto se digita, ao fechar os onze dígitos: não há
    // botão de buscar porque não há decisão a tomar entre digitar e consultar.
    cpf.addEventListener("input", () => {
        cpf.value = formatarCpf(cpf.value);
        preencher(cpf.value);
    });

    document.getElementById("r-arquivo").addEventListener("change", (e) => {
        const erro = document.getElementById("r-arquivo-erro");
        erro.textContent = "";

        for (const arquivo of e.target.files) {
            if (arquivo.size > LIMITE_ARQUIVO) {
                erro.textContent = `${arquivo.name} tem ${tamanhoLegivel(arquivo.size)} e o limite é ${tamanhoLegivel(LIMITE_ARQUIVO)}.`;
                continue;
            }
            const total = anexos.reduce((s, a) => s + a.tamanho, 0) + arquivo.size;
            if (total > LIMITE_TOTAL) {
                erro.textContent = `Os documentos somados passam de ${tamanhoLegivel(LIMITE_TOTAL)}. Tire algum antes de acrescentar outro.`;
                break;
            }
            if (anexos.some((a) => a.nome === arquivo.name && a.tamanho === arquivo.size)) continue;
            anexos.push({ nome: arquivo.name, tipo: arquivo.type, tamanho: arquivo.size });
        }

        // O campo se esvazia para que escolher de novo acrescente, em vez de
        // substituir o que já está na lista.
        e.target.value = "";
        redesenharAnexos();
    });

    document.getElementById("r-anexos").addEventListener("click", (e) => {
        const botao = e.target.closest("[data-tirar]");
        if (!botao) return;
        anexos.splice(Number(botao.dataset.tirar), 1);
        redesenharAnexos();
    });

    document.getElementById("enviar").addEventListener("click", enviar);
}

/**
 * Responde ao CPF digitado.
 *
 * Só os três campos de identificação mudam — o formulário não se redesenha, ou
 * o órgão, o perfil, a observação e os anexos já escolhidos se perderiam a cada
 * tecla.
 */
function preencher(valor) {
    const completo = digitos(valor).length === 11;
    pessoa = completo ? { ...consultar(valor), cpf: formatarCpf(valor) } : null;

    document.getElementById("r-nome").value = pessoa?.nome ?? "";
    document.getElementById("r-email").value = pessoa?.email ?? "";
    document.getElementById("r-login").value = pessoa?.login ?? "";
}

function enviar() {
    const escopo = document.getElementById("form-registro");
    const cpf = document.getElementById("r-cpf").value;
    const perfil = document.getElementById("r-perfil").value;
    const orgao = document.getElementById("r-orgao").value;

    // Pedir acesso duas vezes não adianta: a primeira solicitação continua na
    // fila, e duas fichas do mesmo servidor confundem quem analisa.
    const jaExiste = usuarios().find((u) => digitos(u.cpf) === digitos(cpf));

    const ok = validar(escopo, [
        // Só o formato é exigido. O dígito verificador não barra: no protótipo é
        // preciso poder testar com qualquer número.
        { campo: "r-cpf", valido: digitos(cpf).length === 11, mensagem: "O CPF tem 11 dígitos." },
        {
            campo: "r-cpf",
            valido: !jaExiste,
            mensagem:
                jaExiste?.situacao === "aguardando"
                    ? "Já existe uma solicitação para esse CPF, aguardando análise."
                    : "Esse CPF já tem cadastro no SIPLAM. Use “Entrar”.",
        },
        { campo: "r-orgao", valido: orgao !== "", mensagem: "Escolha o seu órgão." },
        { campo: "r-perfil", valido: perfil !== "", mensagem: "Escolha o perfil de que você precisa." },
        {
            campo: "r-perfil",
            valido: !usuarios().some((u) => igual(u.login, pessoa?.login)),
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
        perfis: [],
        situacao: "aguardando",
        observacao: document.getElementById("r-observacao").value.trim(),
        // Fichas dos documentos: nome, tipo e tamanho. O conteúdo ficaria no
        // servidor, que ainda não existe.
        anexos: [...anexos],
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
