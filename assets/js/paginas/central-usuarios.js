/**
 * Gestão de usuários — Área Central.
 *
 * A pessoa se registra sozinha em `registrar.html` e cai aqui como
 * **aguardando aprovação**, sem perfil. O Administrador central lê os dados,
 * aprova ou reprova, e **é na aprovação que o perfil é escolhido** — o papel é
 * concedido, não pedido.
 *
 * Por isso a tela não edita cadastro: quem aprova confere o que a pessoa
 * declarou e decide. Mudar o nome ou o órgão dela aqui seria decidir sobre um
 * dado que não é nosso.
 *
 * Depois de aprovado, as ações são de acesso, não de cadastro: revogar e
 * reativar. Senha não passa por aqui — quem autentica é o Aplicações Expresso.
 *
 * Há um segundo caminho: o Administrador central pode cadastrar alguém sem
 * esperar a pessoa se registrar. Nesse caso o CPF é consultado na base
 * funcional, e os dados vêm de lá — ninguém digita o nome de outra pessoa.
 */
import {
    obterEstado,
    updItem,
    addItem,
    SITUACOES_USUARIO,
    situacaoUsuario,
    buscarNaBaseFuncional,
    cpfValido,
    formatarCpf,
} from "../dados/store.js";
import { montarShell, barraTitulo, somenteLeitura } from "../shell.js";
import { criarFiltros, opcoesDe } from "../filtros.js";
import { chip, esc, faixaIndicadores } from "../ui.js";
import { avisar } from "../toast.js";
import { campoErro, validar, limparAoDigitar } from "../validacao.js";

const { estado } = montarShell();
const leitura = somenteLeitura();

/** Espelha `assets/js/acesso.js`. Setorial exige órgão; central, não. */
const PERFIS = [
    { id: "setorial", nome: "Planejamento setorial", visao: "setorial" },
    { id: "gestao-setorial", nome: "Alta gestão setorial", visao: "setorial" },
    { id: "admin-central", nome: "Administrador central", visao: "central" },
    { id: "gestao-central", nome: "Alta gestão central", visao: "central" },
    { id: "controle", nome: "Consulta", visao: "central" },
];

const nomeDoPerfil = (id) => PERFIS.find((p) => p.id === id)?.nome ?? id;

let analisando = null;

const usuarios = () => estado.usuarios ?? [];

/**
 * A ordem é por urgência, não por cadastro: quem aguarda decisão vem primeiro.
 * Uma solicitação nova entra no fim da lista e, com dezenas de aprovados na
 * frente, some da tela — justamente a linha que exige ação.
 */
const URGENCIA = { aguardando: 0, aprovado: 1, revogado: 2, reprovado: 3 };

function visiveis() {
    return usuarios()
        .filter((u) => filtros.passa(u))
        .sort(
            (a, b) =>
                (URGENCIA[a.situacao] ?? 9) - (URGENCIA[b.situacao] ?? 9) ||
                a.nome.localeCompare(b.nome, "pt-BR")
        );
}

/**
 * O filtro espelha a tabela: Usuário no campo livre — que alcança e-mail e
 * login — e Órgão, Perfil e Situação em escolha múltipla.
 */
const filtros = criarFiltros({
    livre: { rotulo: "Usuário", texto: (u) => `${u.nome} ${u.email} ${u.login} ${u.orgao ?? ""}` },
    campos: [
        {
            id: "orgao",
            rotulo: "Órgão",
            icone: "ti-building",
            opcoes: () => opcoesDe(usuarios(), (u) => u.orgao),
            valorDe: (u) => (u.orgao ? [u.orgao] : []),
        },
        {
            id: "perfil",
            rotulo: "Perfil",
            icone: "ti-user-shield",
            opcoes: () =>
                PERFIS.filter((p) => usuarios().some((u) => (u.perfis ?? []).includes(p.id))).map((p) => ({
                    valor: p.id,
                    rotulo: p.nome,
                })),
            valorDe: (u) => u.perfis ?? [],
        },
        {
            id: "situacao",
            rotulo: "Situação",
            icone: "ti-progress",
            opcoes: () =>
                SITUACOES_USUARIO.filter((s) => usuarios().some((u) => u.situacao === s.id)).map((s) => ({
                    valor: s.id,
                    rotulo: s.rotulo,
                })),
            valorDe: (u) => [u.situacao],
        },
    ],
    exportar: "usuarios",
    acao: () => (leitura ? "" : `<button class="btn btn-primary" id="novo"><i class="ti ti-plus me-1"></i>Novo usuário</button>`),
});

function indicadores() {
    const lista = usuarios();
    const conta = (s) => lista.filter((u) => u.situacao === s).length;
    return faixaIndicadores(
        [
            { valor: conta("aguardando"), rotulo: "Aguardando aprovação" },
            { valor: conta("aprovado"), rotulo: "Com acesso ativo" },
            { valor: conta("revogado"), rotulo: "Acesso revogado" },
            { valor: conta("reprovado"), rotulo: "Reprovados" },
        ],
        "O cadastro é feito pela própria pessoa. O perfil é definido aqui, no momento da aprovação."
    );
}

/**
 * As ações de uma linha, sempre no mesmo lugar: o menu de três pontos ao fim
 * dela. Botões diferentes em colunas diferentes fariam o olho procurar a ação a
 * cada linha.
 *
 * O que aparece depende da situação, porque só faz sentido revogar quem tem
 * acesso e reativar quem não tem. **Rever decisão** aparece em toda situação já
 * decidida — aprovar ou reprovar não é irreversível, e mudar de ideia sobre o
 * perfil de alguém é rotina, não exceção.
 */
function acoes(u) {
    if (leitura) return "";

    const aprovar = { rotulo: "Aprovar", atributo: `data-aprovar="${u.id}"`, tom: "" };
    const reprovar = { rotulo: "Reprovar", atributo: `data-reprovar="${u.id}"`, tom: "text-danger" };
    const rever = { rotulo: "Rever decisão", atributo: `data-rever="${u.id}"`, tom: "" };
    const revogar = { rotulo: "Revogar acesso", atributo: `data-acesso="${u.id}"`, tom: "text-danger" };
    const ativar = { rotulo: "Ativar acesso", atributo: `data-acesso="${u.id}"`, tom: "" };

    const itens = {
        aguardando: [aprovar, reprovar],
        aprovado: [rever, revogar],
        reprovado: [rever],
        revogado: [rever, ativar],
    }[u.situacao];

    if (!itens?.length) return "";

    return `
    <div class="dropdown">
        <button class="btn btn-sm btn-light" data-bs-toggle="dropdown" aria-label="Ações de ${esc(u.nome)}"><i class="ti ti-dots-vertical"></i></button>
        <ul class="dropdown-menu dropdown-menu-end">
            ${itens.map((i) => `<li><button class="dropdown-item ${i.tom}" ${i.atributo}>${i.rotulo}</button></li>`).join("")}
        </ul>
    </div>`;
}

function linha(u) {
    const s = situacaoUsuario(u.situacao);
    const semAcesso = u.situacao === "revogado" || u.situacao === "reprovado";
    return `
    <tr class="${semAcesso ? "text-muted" : ""}">
        <td>
            <span class="fw-medium">${esc(u.nome)}</span>
            <span class="fs-12 text-muted d-block">${esc(u.email)}</span>
        </td>
        <td class="codigo">${esc(u.login)}</td>
        <td>${u.orgao ? esc(u.orgao) : '<span class="text-muted">—</span>'}</td>
        <td>
            ${
                u.perfis.length
                    ? `<div class="d-flex flex-wrap gap-1">${u.perfis.map((id) => chip(nomeDoPerfil(id), "neutro")).join("")}</div>`
                    : '<span class="text-muted fs-12">definido na aprovação</span>'
            }
        </td>
        <td>${chip(s.rotulo, s.tom)}</td>
        <td class="text-end coluna-acoes">${acoes(u)}</td>
    </tr>`;
}

function render() {
    const lista = visiveis();
    document.getElementById("conteudo").innerHTML = `
    ${barraTitulo("Gestão de usuários")}
    ${indicadores()}

    <div class="card">
        ${filtros.html()}
        <div class="table-responsive">
            <table class="table table-sm table-densa align-middle mb-0">
                <thead>
                    <tr>
                        <th>Usuário</th>
                        <th style="width:10rem">Login</th>
                        <th style="width:16rem">Órgão</th>
                        <th style="width:14rem">Perfil</th>
                        <th style="width:11rem">Situação</th>
                        <th class="text-end coluna-acoes" style="width:7rem">Ações</th>
                    </tr>
                </thead>
                <tbody id="corpo-lista">${lista.length ? lista.map(linha).join("") : vazio()}</tbody>
            </table>
        </div>
    </div>

    <div class="modal fade" id="modal-analise" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content" id="modal-conteudo"></div>
        </div>
    </div>

    <div class="modal fade" id="modal-novo" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content" id="modal-novo-conteudo"></div>
        </div>
    </div>`;

    ligar();
}

/** Os dados declarados por quem se registrou. Leitura, nunca edição. */
function ficha(u) {
    const campo = (rotulo, valor) => `
    <div class="col-6">
        <div class="rotulo-secao mb-1">${rotulo}</div>
        <p class="fs-13 mb-0">${valor ? esc(valor) : "—"}</p>
    </div>`;
    return `
    <div class="row g-3 mb-3">
        ${campo("Nome", u.nome)}
        ${campo("CPF", u.cpf)}
        ${campo("E-mail", u.email)}
        ${campo("Login", u.login)}
        ${campo("Órgão", u.orgao)}
        ${campo("Perfil pedido", u.perfilSolicitado ? nomeDoPerfil(u.perfilSolicitado) : "")}
    </div>
    ${
        u.foraDaBase
            ? `<div class="alert alert-warning py-2 px-3 fs-12">
        <i class="ti ti-alert-triangle me-1"></i>
        Este CPF não estava no vínculo funcional: nome, e-mail e login foram digitados pela
        própria pessoa e não foram conferidos por ninguém.
    </div>`
            : ""
    }`;
}

/** As caixas de perfil, marcadas conforme o que a pessoa ja tem ou pediu. */
function escolhaDePerfis(u, prefixo) {
    return `
    <label class="form-label" for="${prefixo}-perfis">Perfil a conceder<span class="text-danger">*</span></label>
    <div class="d-flex flex-column gap-1" id="${prefixo}-perfis">
        ${PERFIS.map(
            (p) => `
        <div class="form-check">
            <input class="form-check-input" type="checkbox" value="${p.id}" id="${prefixo}-${p.id}" data-perfil
                   ${u.perfis.includes(p.id) || (!u.perfis.length && u.perfilSolicitado === p.id) ? "checked" : ""} />
            <label class="form-check-label" for="${prefixo}-${p.id}">
                ${p.nome}
                <span class="fs-12 text-muted">· visão ${p.visao}</span>
            </label>
        </div>`
        ).join("")}
    </div>
    ${campoErro(`${prefixo}-perfis`)}`;
}

/** Grava a decisão e volta para a lista. */
function decidir(u, situacao, perfis, modal) {
    updItem("usuarios", u.id, {
        situacao,
        perfis,
        decididoEm: new Date().toLocaleDateString("pt-BR"),
        decididoPor: estado.analista,
    });
    avisar(
        {
            aprovado: "Acesso concedido com sucesso.",
            reprovado: "Solicitação reprovada.",
        }[situacao] ?? "Decisão registrada."
    );
    bootstrap.Modal.getInstance(modal).hide();
    render();
}

/**
 * Aprovar: só o perfil.
 *
 * Quem chega aqui já leu a solicitação na linha da tabela. Repetir a ficha
 * dentro da janela empurraria para baixo a única coisa que precisa ser
 * decidida.
 */
function abrirAprovacao() {
    const u = analisando;
    const el = document.getElementById("modal-analise");
    document.getElementById("modal-conteudo").innerHTML = `
    <div class="modal-header">
        <h5 class="modal-title">Aprovar acesso</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
    </div>
    <div class="modal-body" id="form-analise">
        <p class="fs-13 mb-3">
            <span class="fw-medium">${esc(u.nome)}</span>
            <span class="text-muted">· ${esc(u.orgao || "sem órgão")}</span>
        </p>
        ${escolhaDePerfis(u, "a")}
        <div class="form-text fs-12">
            ${u.perfilSolicitado ? "O perfil pedido já vem marcado — confirme ou troque." : "Escolha ao menos um."}
        </div>
    </div>
    <div class="modal-footer">
        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-primary" id="conceder">Conceder</button>
    </div>`;

    const modal = new bootstrap.Modal(el);
    modal.show();

    const escopo = document.getElementById("form-analise");
    limparAoDigitar(escopo);

    document.getElementById("conceder").addEventListener("click", () => {
        const perfis = [...escopo.querySelectorAll("[data-perfil]:checked")].map((c) => c.value);
        const ok = validar(escopo, [
            { campo: "a-perfis", valido: perfis.length > 0, mensagem: "Escolha ao menos um perfil para conceder." },
        ]);
        if (!ok) return;
        decidir(u, "aprovado", perfis, el);
    });

    el.addEventListener("hidden.bs.modal", () => {
        analisando = null;
    });
}

/** Reprovar: nenhuma escolha, só a confirmação de quem está sendo reprovado. */
function abrirReprovacao() {
    const u = analisando;
    const el = document.getElementById("modal-analise");
    document.getElementById("modal-conteudo").innerHTML = `
    <div class="modal-header">
        <h5 class="modal-title">Reprovar solicitação</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
    </div>
    <div class="modal-body">
        <p class="mb-2">Confirma que está reprovando <span class="fw-semibold">${esc(u.nome)}</span>?</p>
        <p class="text-muted fs-13 mb-0">
            A pessoa fica sem acesso ao SIPLAM e nenhum perfil é concedido.
            A decisão pode ser revista depois, em “Rever decisão”.
        </p>
    </div>
    <div class="modal-footer">
        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-danger" id="confirmar-reprovacao">Reprovar</button>
    </div>`;

    const modal = new bootstrap.Modal(el);
    modal.show();

    // Reprovar nao concede papel nenhum.
    document.getElementById("confirmar-reprovacao").addEventListener("click", () => decidir(u, "reprovado", [], el));

    el.addEventListener("hidden.bs.modal", () => {
        analisando = null;
    });
}

/**
 * Rever decisão: a janela de quem muda de ideia.
 *
 * Aqui a ficha volta, porque rever é decidir de novo com o caso à vista — e os
 * dois caminhos ficam abertos: conceder outro perfil, acrescentar um, ou virar
 * a decisão para o outro lado.
 */
function abrirRevisao() {
    const u = analisando;
    const el = document.getElementById("modal-analise");
    const s = situacaoUsuario(u.situacao);
    document.getElementById("modal-conteudo").innerHTML = `
    <div class="modal-header">
        <h5 class="modal-title">Rever decisão</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
    </div>
    <div class="modal-body" id="form-analise">
        <p class="text-muted fs-12 mb-3">
            Solicitado em ${esc(u.criadoEm ?? "—")}${u.decididoEm ? ` · decidido em ${esc(u.decididoEm)}` : ""}.
            Hoje: ${esc(s.rotulo)}.
        </p>
        ${ficha(u)}
        <hr class="my-3" />
        ${escolhaDePerfis(u, "a")}
        <div class="form-text fs-12">
            Os perfis que a pessoa já tem vêm marcados. Marcar mais acrescenta; desmarcar retira.
        </div>
    </div>
    <div class="modal-footer">
        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
        ${u.situacao === "reprovado" ? "" : `<button type="button" class="btn btn-outline-danger" id="reprovar">Reprovar</button>`}
        <button type="button" class="btn btn-primary" id="aprovar">${u.situacao === "aprovado" ? "Salvar perfis" : "Conceder acesso"}</button>
    </div>`;

    const modal = new bootstrap.Modal(el);
    modal.show();

    const escopo = document.getElementById("form-analise");
    limparAoDigitar(escopo);

    document.getElementById("aprovar").addEventListener("click", () => {
        const perfis = [...escopo.querySelectorAll("[data-perfil]:checked")].map((c) => c.value);
        const ok = validar(escopo, [
            { campo: "a-perfis", valido: perfis.length > 0, mensagem: "Escolha ao menos um perfil." },
        ]);
        if (!ok) return;
        decidir(u, "aprovado", perfis, el);
    });

    document.getElementById("reprovar")?.addEventListener("click", () => decidir(u, "reprovado", [], el));

    el.addEventListener("hidden.bs.modal", () => {
        analisando = null;
    });
}

/* ---------- cadastro pelo Administrador central ---------- */

/** O que a consulta ao CPF trouxe. Fica fora do formulário: não se digita. */
let encontrado = null;
let documento = null;

function corpoNovo(erro = "", cpfDigitado = "") {
    const campo = (rotulo, valor) => `
    <div class="col-6">
        <div class="rotulo-secao mb-1">${rotulo}</div>
        <p class="fs-13 mb-0">${valor ? esc(valor) : "—"}</p>
    </div>`;

    return `
    <div class="modal-header">
        <h5 class="modal-title">Novo usuário</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
    </div>
    <div class="modal-body" id="form-novo">
        <label class="form-label" for="n-cpf">CPF<span class="text-danger">*</span></label>
        <div class="input-group">
            <input type="text" class="form-control" id="n-cpf" inputmode="numeric" autocomplete="off"
                   placeholder="000.000.000-00" maxlength="14" value="${esc(cpfDigitado)}"
                   ${encontrado ? "disabled" : ""} />
            <button class="btn btn-outline-primary" type="button" id="buscar-cpf" ${encontrado ? "disabled" : ""}>
                Buscar
            </button>
        </div>
        <div class="form-text fs-12">Os dados vêm da base funcional do Estado.</div>
        <div class="invalid-feedback d-block" id="n-cpf-erro">${esc(erro)}</div>

        ${
            encontrado
                ? `
        <hr class="my-3" />
        <div class="row g-3 mb-2">
            ${campo("Nome", encontrado.nome)}
            ${campo("E-mail", encontrado.email)}
            ${campo("Login", encontrado.login)}
            ${campo("Órgão", encontrado.orgao)}
        </div>
        <button type="button" class="btn btn-sm btn-link px-0 fs-12" id="trocar-cpf">Consultar outro CPF</button>

        <hr class="my-3" />
        <label class="form-label" for="n-documento">Documento <span class="fs-12 text-muted">(opcional)</span></label>
        <input type="file" class="form-control" id="n-documento" />
        <div class="form-text fs-12" id="ajuda-documento">Portaria, ofício ou o que autoriza o acesso.</div>

        <label class="form-label mt-3" for="n-perfis">Perfil a conceder<span class="text-danger">*</span></label>
        <div class="d-flex flex-column gap-1" id="n-perfis">
            ${PERFIS.map(
                (p) => `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${p.id}" id="n-${p.id}" data-perfil-novo />
                <label class="form-check-label" for="n-${p.id}">
                    ${p.nome}
                    <span class="fs-12 text-muted">· visão ${p.visao}</span>
                </label>
            </div>`
            ).join("")}
        </div>
        ${campoErro("n-perfis")}`
                : ""
        }
    </div>
    <div class="modal-footer">
        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-primary" id="salvar-novo" ${encontrado ? "" : "disabled"}>
            Cadastrar
        </button>
    </div>`;
}

function desenharNovo(erro = "", cpfDigitado = "") {
    document.getElementById("modal-novo-conteudo").innerHTML = corpoNovo(erro, cpfDigitado);
    ligarNovo();
}

const soDigitos = (valor) => String(valor ?? "").replace(/[^0-9]/g, "");

function ligarNovo() {
    const escopo = document.getElementById("form-novo");
    const cpf = document.getElementById("n-cpf");

    // Formata enquanto digita: o CPF é lido em blocos, não como 11 dígitos seguidos.
    cpf?.addEventListener("input", () => {
        cpf.value = formatarCpf(cpf.value);
        document.getElementById("n-cpf-erro").textContent = "";
    });
    cpf?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") document.getElementById("buscar-cpf")?.click();
    });

    document.getElementById("buscar-cpf")?.addEventListener("click", () => {
        const valor = cpf.value.trim();

        if (!cpfValido(valor)) return desenharNovo("CPF inválido. Confira os números.", valor);

        const jaTem = usuarios().find((u) => soDigitos(u.cpf) === soDigitos(valor));
        if (jaTem) return desenharNovo(`${jaTem.nome} já está cadastrado.`, valor);

        const pessoa = buscarNaBaseFuncional(valor);
        if (!pessoa) return desenharNovo("Nenhum servidor encontrado com esse CPF na base funcional.", valor);

        encontrado = pessoa;
        documento = null;
        desenharNovo("", valor);
    });

    document.getElementById("trocar-cpf")?.addEventListener("click", () => {
        encontrado = null;
        documento = null;
        desenharNovo();
    });

    // Sem servidor, o arquivo não sobe: guardamos o nome para a tela mostrar o
    // que foi anexado. O anexo de verdade fica para quando houver back-end.
    document.getElementById("n-documento")?.addEventListener("change", (e) => {
        documento = e.target.files?.[0]?.name ?? null;
        const ajuda = document.getElementById("ajuda-documento");
        if (!ajuda) return;
        ajuda.innerHTML = documento
            ? `Anexado: <strong>${esc(documento)}</strong>.`
            : "Portaria, ofício ou o que autoriza o acesso.";
    });

    limparAoDigitar(escopo);

    document.getElementById("salvar-novo")?.addEventListener("click", () => {
        const perfis = [...escopo.querySelectorAll("[data-perfil-novo]:checked")].map((c) => c.value);
        const ok = validar(escopo, [
            { campo: "n-perfis", valido: perfis.length > 0, mensagem: "Escolha ao menos um perfil." },
        ]);
        if (!ok) return;

        addItem("usuarios", {
            nome: encontrado.nome,
            cpf: encontrado.cpf,
            email: encontrado.email,
            login: encontrado.login,
            orgao: encontrado.orgao,
            documento,
            perfis,
            situacao: "aprovado",
            decididoEm: new Date().toLocaleDateString("pt-BR"),
            decididoPor: estado.analista,
        });
        avisar("Usuário cadastrado com acesso ativo.");
        bootstrap.Modal.getInstance(document.getElementById("modal-novo")).hide();
        render();
    });
}

function abrirNovo() {
    encontrado = null;
    documento = null;
    const el = document.getElementById("modal-novo");
    desenharNovo();
    new bootstrap.Modal(el).show();
    el.addEventListener(
        "hidden.bs.modal",
        () => {
            encontrado = null;
            documento = null;
        },
        { once: true }
    );
}

function ligar() {
    document.getElementById("novo")?.addEventListener("click", abrirNovo);

    // Só o corpo da tabela se refaz a cada filtro; a barra fica de pé, com o
    // que foi escolhido, e as ações das linhas novas precisam ser religadas.
    filtros.ligar(() => {
        document.getElementById("corpo-lista").innerHTML = visiveis().map(linha).join("") || vazio();
        ligarAcoes();
    });

    ligarAcoes();
}

function vazio() {
    return `<tr><td colspan="6" class="text-center text-muted py-4 fs-12">
        ${usuarios().length ? "Nenhum usuário com esse recorte." : "Nenhuma solicitação de acesso."}
    </td></tr>`;
}

function ligarAcoes() {
    const aoClicar = (atributo, abrir) =>
        document.querySelectorAll(`[data-${atributo}]`).forEach((b) =>
            b.addEventListener("click", () => {
                analisando = usuarios().find((u) => u.id === b.dataset[atributo]);
                if (analisando) abrir();
            })
        );

    aoClicar("aprovar", abrirAprovacao);
    aoClicar("reprovar", abrirReprovacao);
    aoClicar("rever", abrirRevisao);

    document.querySelectorAll("[data-acesso]").forEach((b) =>
        b.addEventListener("click", () => {
            const u = usuarios().find((x) => x.id === b.dataset.acesso);
            if (!u) return;
            const revogando = u.situacao === "aprovado";
            updItem("usuarios", u.id, { situacao: revogando ? "revogado" : "aprovado" });
            avisar(revogando ? "Acesso revogado." : "Acesso reativado.");
            render();
        })
    );
}

render();
