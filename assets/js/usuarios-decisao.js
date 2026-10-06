/**
 * A decisão sobre um usuário: aprovar, com o perfil a conceder, ou reprovar.
 *
 * Moram aqui, e não na lista de usuários, porque a decisão deixou de ser feita
 * na lista: quem clica num usuário abre a tela dele (`central-usuarios/ver.html`)
 * e é lá que estão os botões. Os dois modais são os mesmos de antes; muda só de
 * onde se chega a eles.
 *
 * Decidir não é irreversível. De aprovado se reprova, e de reprovado se aprova —
 * e aí o perfil a conceder é escolhido de novo.
 */
import { obterEstado, updItem } from "./dados/store.js";
import { esc } from "./ui.js";
import { avisar } from "./toast.js";
import { campoErro, validar, limparAoDigitar } from "./validacao.js";

/** Espelha `assets/js/acesso.js`. Setorial exige órgão; central, não. */
export const PERFIS = [
    { id: "setorial", nome: "Planejamento setorial", visao: "setorial" },
    { id: "gestao-setorial", nome: "Alta gestão setorial", visao: "setorial" },
    { id: "admin-central", nome: "Administrador central", visao: "central" },
    { id: "gestao-central", nome: "Alta gestão central", visao: "central" },
    { id: "controle", nome: "Consulta", visao: "central" },
];

export const nomeDoPerfil = (id) => PERFIS.find((p) => p.id === id)?.nome ?? id;

export const tamanhoLegivel = (bytes) =>
    bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/** A janela é uma só, criada na primeira vez que se precisa dela. */
function modal() {
    let el = document.getElementById("modal-analise");
    if (!el) {
        document.body.insertAdjacentHTML(
            "beforeend",
            `<div class="modal fade" id="modal-analise" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content" id="modal-conteudo"></div>
                </div>
            </div>`
        );
        el = document.getElementById("modal-analise");
    }
    return el;
}

/** As caixas de perfil, marcadas conforme o que a pessoa já tem ou pediu. */
function escolhaDePerfis(u, prefixo) {
    return `
    <label class="form-label" for="${prefixo}-perfis">Perfil a conceder <span class="text-danger">*</span></label>
    <div class="d-flex flex-column gap-1" id="${prefixo}-perfis">
        ${PERFIS.map(
            (p) => `
        <div class="form-check">
            <input class="form-check-input" type="checkbox" value="${p.id}" id="${prefixo}-${p.id}" data-perfil
                   ${(u.perfis ?? []).includes(p.id) || (!(u.perfis ?? []).length && u.perfilSolicitado === p.id) ? "checked" : ""} />
            <label class="form-check-label" for="${prefixo}-${p.id}">
                ${p.nome}
                <span class="fs-12 text-muted">· visão ${p.visao}</span>
            </label>
        </div>`
        ).join("")}
    </div>
    ${campoErro(`${prefixo}-perfis`)}`;
}

/** Grava a decisão e avisa a tela que a pediu. */
function decidir(u, situacao, perfis, aoDecidir) {
    updItem("usuarios", u.id, {
        situacao,
        perfis,
        decididoEm: new Date().toLocaleDateString("pt-BR"),
        decididoPor: obterEstado().analista,
    });
    avisar(
        {
            aprovado: "Acesso concedido com sucesso.",
            reprovado: "Solicitação reprovada.",
        }[situacao] ?? "Decisão registrada."
    );
    bootstrap.Modal.getOrCreateInstance(modal()).hide();
    aoDecidir?.();
}

/**
 * Aprovar: só o perfil.
 *
 * Quem chega aqui já leu a ficha na tela do usuário. Repeti-la dentro da janela
 * empurraria para baixo a única coisa que precisa ser decidida.
 */
export function abrirAprovacao(u, aoDecidir) {
    const el = modal();
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
    </div>
    <div class="modal-footer">
        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-primary" id="conceder">Conceder</button>
    </div>`;

    bootstrap.Modal.getOrCreateInstance(el).show();

    const escopo = document.getElementById("form-analise");
    limparAoDigitar(escopo);

    document.getElementById("conceder").addEventListener("click", () => {
        const perfis = [...escopo.querySelectorAll("[data-perfil]:checked")].map((c) => c.value);
        const ok = validar(escopo, [
            { campo: "a-perfis", valido: perfis.length > 0, mensagem: "Escolha ao menos um perfil para conceder." },
        ]);
        if (!ok) return;
        decidir(u, "aprovado", perfis, aoDecidir);
    });
}

/** Reprovar: nenhuma escolha, só a confirmação de quem está sendo reprovado. */
export function abrirReprovacao(u, aoDecidir) {
    const el = modal();
    document.getElementById("modal-conteudo").innerHTML = `
    <div class="modal-header">
        <h5 class="modal-title">Reprovar solicitação</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
    </div>
    <div class="modal-body">
        <p class="mb-2">Confirma que está reprovando <span class="fw-semibold">${esc(u.nome)}</span>?</p>
        <p class="text-muted fs-13 mb-0">
            A pessoa fica sem acesso ao SIPLAM e nenhum perfil é concedido.
            A decisão pode ser revista depois, aprovando o usuário nesta mesma tela.
        </p>
    </div>
    <div class="modal-footer">
        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-danger" id="confirmar-reprovacao">Reprovar</button>
    </div>`;

    bootstrap.Modal.getOrCreateInstance(el).show();

    // Reprovar não concede papel nenhum.
    document.getElementById("confirmar-reprovacao").addEventListener("click", () => decidir(u, "reprovado", [], aoDecidir));
}
