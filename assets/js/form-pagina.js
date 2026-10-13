/**
 * Telas de criar e editar dos Cadastros Estratégicos.
 *
 * Antes tudo acontecia num modal sobre a listagem. Modal serve para uma decisão
 * curta; para preencher um cadastro ele atrapalha — não tem endereço próprio,
 * não sobrevive a um recarregamento, não cabe num formulário que cresce, e
 * fechar por engano perde o que foi digitado.
 *
 * Agora cada cadastro tem `criar.html` e `editar.html` na sua pasta, no layout
 * de formulário do Inspinia: título com trilha, um cartão único de largura
 * inteira e as ações embaixo.
 *
 * O que o sistema preenche sozinho — número, data de cadastro, quem depende
 * deste registro — fica no mesmo formulário, em campos desabilitados. Ficava num
 * cartão ao lado, e a segunda coluna saiu a pedido da área: uma coluna só.
 *
 * A configuração é a mesma que a listagem usa, para os dois lados nunca
 * discordarem sobre o que o cadastro tem.
 */
import { obterEstado, addItem, updItem, removeItem, vinculosDe, descreverVinculos } from "./dados/store.js";
import { montarShell, barraTitulo, somenteLeitura, url } from "./shell.js";
import { esc } from "./ui.js";
import { confirmarExclusao } from "./confirmar.js";
import { avisar } from "./toast.js";
import { campoErro, validar, limparAoDigitar } from "./validacao.js";

/**
 * @param {object} cfg          a mesma configuração da listagem
 * @param {boolean} cfg.novo    true em `criar.html`, false em `editar.html`
 */
export function montarFormulario(cfg) {
    const { estado } = montarShell();
    const leitura = somenteLeitura() || cfg.somenteAdminCentral === true;
    const novo = cfg.novo === true;
    const voltar = url(cfg.listagem);

    const id = new URLSearchParams(location.search).get("id");
    const itens = () => estado[cfg.colecao] ?? [];
    const original = novo ? null : itens().find((i) => i.id === id);

    if (!novo && !original) {
        document.getElementById("conteudo").innerHTML = `
        <div class="my-4">
            <div class="alert alert-warning py-3 px-3">
                Este registro não existe mais. Ele pode ter sido excluído em outra aba.
                <a href="${voltar}" class="fw-semibold">Voltar para ${esc(cfg.titulo)}</a>.
            </div>
        </div>`;
        return;
    }

    const edicao = novo ? vazio() : structuredClone(original);

    function vazio() {
        const base = { id: "", nome: "", descricao: "" };
        if (cfg.pai) base[cfg.pai.campo] = cfg.pai.opcional ? "" : (opcoesPai()[0]?.id ?? "");
        return base;
    }

    const opcoesPai = () => (cfg.pai ? (estado[cfg.pai.colecao] ?? []) : []);

    /** Quem aponta para este registro: enquanto houver, ele não se exclui. */
    const vinculos = novo ? [] : vinculosDe(cfg.colecao, edicao.id);
    const usos = vinculos.length;
    // O campo do nome chama-se como o cadastro — "Eixo", "Causa" — porque ali o
    // nome *é* o registro. Onde o cadastro tem muitos campos, e o nome é só mais
    // um deles, a configuração troca o rótulo por "Nome".
    const rotuloNome = cfg.rotuloNome ?? cfg.singular;
    const fim = cfg.genero === "f" ? "a" : "o";
    const artigo = cfg.genero === "f" ? "a" : "o";

    /* ---------- desenho ---------- */

    function camposPrincipais() {
        return `
        <div class="row">
            ${
                usos
                    ? `<div class="col-12"><div class="alert alert-light border fs-13"><i class="ti ti-lock me-1"></i>Não pode ser excluíd${fim}: está vinculad${fim} a <strong>${esc(descreverVinculos(vinculos))}</strong>. Desfaça esses vínculos antes.</div></div>`
                    : ""
            }
            ${cfg.antes ? `<div class="col-12">${cfg.antes(edicao, estado)}</div>` : ""}
            <div class="col-12">
                <div class="mb-3">
                    <label class="form-label" for="f-nome">${esc(rotuloNome)} <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="f-nome" value="${esc(edicao.nome ?? "")}"
                           placeholder="${esc(cfg.exemplo ?? "")}" ${leitura ? "disabled" : ""} />
                    ${campoErro("f-nome")}
                </div>
            </div>

            ${
                cfg.pai
                    ? `<div class="col-12">
                <div class="mb-3">
                    <label class="form-label" for="f-pai">${esc(cfg.pai.rotulo)}${cfg.pai.opcional ? "" : ' <span class="text-danger">*</span>'}</label>
                    <select class="form-select" id="f-pai" ${leitura ? "disabled" : ""}>
                        ${cfg.pai.opcional ? `<option value="">Sem ${esc(cfg.pai.rotulo.toLowerCase())}</option>` : ""}
                        ${opcoesPai()
                            .map(
                                (p) =>
                                    `<option value="${p.id}"${edicao[cfg.pai.campo] === p.id ? " selected" : ""}>${esc(p.nome)}</option>`
                            )
                            .join("")}
                    </select>
                    ${campoErro("f-pai")}
                </div>
            </div>`
                    : ""
            }

            ${cfg.extra?.html ? `<div class="col-12"><div class="mb-3">${cfg.extra.html(edicao, estado)}</div></div>` : ""}

            ${
                // Alguns cadastros põem a descrição no meio do formulário, e não no
                // fim: quando ela explica o registro, vem logo após o nome.
                cfg.semDescricao
                    ? ""
                    : `<div class="col-12">
                <label class="form-label" for="f-descricao">Descrição</label>
                <textarea class="form-control" id="f-descricao" rows="4" ${leitura ? "disabled" : ""}>${esc(edicao.descricao ?? "")}</textarea>
            </div>`
            }

            ${camposDoSistema()}
        </div>`;
    }

    /**
     * O que o sistema preenche e a pessoa só confere.
     *
     * São campos do formulário, desabilitados — e não um cartão ao lado. Quem
     * está editando lê na mesma coluna em que escreve, e o que não se altera
     * mostra-se desabilitado em vez de sumir.
     */
    function camposDoSistema() {
        const campos = [];

        const campo = (rotulo, valor, largura = "col-md-6") => `
        <div class="${largura}">
            <div class="mb-3">
                <label class="form-label">${esc(rotulo)}</label>
                <input type="text" class="form-control" value="${esc(valor)}" disabled />
            </div>
        </div>`;

        for (const linha of cfg.apoio?.(edicao, estado) ?? []) {
            campos.push(campo(linha.rotulo, linha.valor || "—", "col-12"));
        }

        return campos.join("");
    }

    function acoes() {
        if (leitura) {
            return `<a href="${voltar}" class="btn btn-light">Voltar</a>`;
        }
        const excluir =
            novo || !cfg.podeExcluir
                ? ""
                : `<button type="button" class="btn btn-danger" id="excluir"
                    ${usos ? `disabled title="Não pode ser excluído: está vinculado a ${esc(descreverVinculos(vinculos))}"` : ""}>
                    Excluir
                </button>`;
        return `
        ${excluir}
        <a href="${voltar}" class="btn btn-light">Cancelar</a>
        <button type="button" class="btn btn-primary" id="salvar">${novo ? "Cadastrar" : "Salvar"}</button>`;
    }

    function render() {
        document.getElementById("conteudo").innerHTML = `
        ${barraTitulo(novo ? esc(cfg.novoRotulo) : `Editar ${esc(cfg.singular.toLowerCase())}`, [novo ? "Novo" : "Editar"])}
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header d-flex flex-wrap justify-content-between align-items-start gap-2 p-3">
                        <div>
                        <h4 class="card-title mb-1">${esc(cfg.titulo)}</h4>
                        <p class="text-muted mb-0 fs-13">${esc(cfg.subtitulo)}</p></div>
                        <div class="d-flex gap-2 align-items-center">${acoes()}</div>
                    </div>
                    <div class="card-body" id="formulario">${camposPrincipais()}</div>
                </div>
            </div>
        </div>`;

        const escopo = document.getElementById("formulario");
        limparAoDigitar(escopo);
        if (!leitura) cfg.extra?.ligar?.(escopo, estado);
        ligar();
    }

    /* ---------- ações ---------- */

    function ler() {
        const v = (campo) => document.getElementById(campo)?.value ?? "";
        const dados = { ...edicao, nome: v("f-nome").trim(), descricao: v("f-descricao").trim() };
        if (cfg.pai) dados[cfg.pai.campo] = v("f-pai");
        Object.assign(dados, cfg.extra?.ler?.() ?? {});
        return dados;
    }

    function ligar() {
        document.getElementById("salvar")?.addEventListener("click", () => {
            const dados = ler();
            const escopo = document.getElementById("formulario");

            const ok = validar(escopo, [
                {
                    campo: "f-nome",
                    valido: !!dados.nome,
                    mensagem:
                        rotuloNome === cfg.singular
                            ? `Informe ${artigo} ${cfg.singular.toLowerCase()}.`
                            : `Informe o ${rotuloNome.toLowerCase()} do ${cfg.singular.toLowerCase()}.`,
                },
                {
                    campo: "f-pai",
                    valido: !cfg.pai || cfg.pai.opcional || !!dados[cfg.pai.campo],
                    mensagem: cfg.pai ? `Escolha ${cfg.pai.artigo} ${cfg.pai.rotulo.toLowerCase()}.` : "",
                },
                ...(cfg.extra?.regras?.(dados) ?? []),
            ]);
            if (!ok) return;

            const salvo = novo ? addItem(cfg.colecao, dados) : (updItem(cfg.colecao, dados.id, dados), dados);
            cfg.extra?.aoSalvar?.(salvo, estado);
            avisar(`${cfg.singular} ${novo ? "criad" : "editad"}${fim} com sucesso.`);
            window.location.href = voltar;
        });

        document.getElementById("excluir")?.addEventListener("click", async () => {
            if (usos > 0) return;
            const justificativa = await confirmarExclusao({
                titulo: `Excluir ${cfg.singular.toLowerCase()}`,
                texto: `“${esc(edicao.nome)}” será removid${fim} do cadastro. A exclusão pode ser revertida depois, no Histórico, por quem administra.`,
                confirmar: "Excluir",
            });
            if (!justificativa) return;
            const r = removeItem(cfg.colecao, edicao.id, justificativa);
            if (!r.ok) {
                avisar(r.motivo, "erro");
                return;
            }
            // O cadastro pode ter vínculos seus a desfazer depois que sai.
            cfg.aoExcluir?.(edicao, estado);
            avisar(`${cfg.singular} excluíd${fim} com sucesso.`);
            window.location.href = voltar;
        });
    }

    render();
}
