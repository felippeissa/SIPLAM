/**
 * Telas de criar e editar dos Cadastros Estratégicos.
 *
 * Antes tudo acontecia num modal sobre a listagem. Modal serve para uma decisão
 * curta; para preencher um cadastro ele atrapalha — não tem endereço próprio,
 * não sobrevive a um recarregamento, não cabe num formulário que cresce, e
 * fechar por engano perde o que foi digitado.
 *
 * Agora cada cadastro tem `criar.html` e `editar.html` na sua pasta, no layout
 * de formulário do Inspinia: título com trilha, cartão principal à esquerda,
 * cartão de apoio à direita e as ações embaixo.
 *
 * A configuração é a mesma que a listagem usa, para os dois lados nunca
 * discordarem sobre o que o cadastro tem.
 */
import { obterEstado, addItem, updItem, removeItem } from "./dados/store.js";
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

    /** Quantos registros de outras coleções dependem deste. */
    const dependentes = (item) =>
        (cfg.filhos ?? []).reduce(
            (total, filho) => total + (estado[filho.colecao] ?? []).filter((f) => f[filho.campo] === item.id).length,
            0
        );

    const usos = novo ? 0 : dependentes(edicao);
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

            ${cfg.extra ? `<div class="col-12"><div class="mb-3">${cfg.extra.html(edicao, estado)}</div></div>` : ""}

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
        </div>`;
    }

    /** O cartão lateral: o que a pessoa precisa saber, não mais campos. */
    function apoio() {
        const linhas = [];

        if (cfg.ajuda) linhas.push(`<p class="fs-13 mb-3">${cfg.ajuda}</p>`);

        // O que o sistema preenche sozinho e a pessoa só confere.
        for (const linha of cfg.apoio?.(edicao, estado) ?? []) {
            linhas.push(`
            <div class="mb-3">
                <div class="rotulo-secao mb-1">${esc(linha.rotulo)}</div>
                <p class="fs-13 mb-0">${esc(linha.valor || "\u2014")}</p>
            </div>`);
        }

        if (!novo) {
            if (cfg.codigo) {
                linhas.push(`
                <div class="mb-3">
                    <div class="rotulo-secao mb-1">Número</div>
                    <div class="codigo fs-15">${esc(cfg.codigo(edicao, estado))}</div>
                </div>`);
            }
            if (edicao.criadoEm) {
                linhas.push(`
                <div class="mb-3">
                    <div class="rotulo-secao mb-1">Cadastrado em</div>
                    <p class="fs-13 mb-0">${esc(edicao.criadoEm)}</p>
                </div>`);
            }
            if (cfg.filhos?.length) {
                const filho = cfg.filhos[0];
                // Nomear quem depende, e não só contar: "1 registro depende deste"
                // obriga a pessoa a sair da tela para descobrir qual é.
                const quais = (estado[filho.colecao] ?? []).filter((f) => f[filho.campo] === edicao.id);
                linhas.push(`
                <div class="mb-0">
                    <div class="rotulo-secao mb-1">${esc(filho.rotulo)}</div>
                    ${
                        quais.length === 0
                            ? `<p class="fs-13 mb-0">Nenhum registro depende deste.</p>`
                            : `<ul class="list-unstyled fs-13 mb-0">
                        ${quais
                            .slice(0, 8)
                            .map((f) => `<li class="mb-1"><i class="ti ti-corner-down-right me-1 text-muted"></i>${esc(f.nome)}</li>`)
                            .join("")}
                        ${quais.length > 8 ? `<li class="text-muted">e mais ${quais.length - 8}.</li>` : ""}
                    </ul>`
                    }
                </div>`);
            }
        }

        if (!linhas.length) return "";

        return `
        <div class="col-xxl-4">
            <div class="card">
                <div class="card-header d-block p-3">
                    <h4 class="card-title mb-1">Sobre este registro</h4>
                </div>
                <div class="card-body">${linhas.join("")}</div>
            </div>
        </div>`;
    }

    function acoes() {
        if (leitura) {
            return `<a href="${voltar}" class="btn btn-light">Voltar</a>`;
        }
        const excluir =
            novo || !cfg.podeExcluir
                ? ""
                : `<button type="button" class="btn btn-outline-danger me-auto" id="excluir"
                    ${usos ? `disabled title="${esc(cfg.filhos[0].rotulo)} vinculados impedem a exclusão"` : ""}>
                    Excluir
                </button>`;
        return `
        ${excluir}
        <a href="${voltar}" class="btn btn-light">Cancelar</a>
        <button type="button" class="btn btn-primary" id="salvar">${novo ? "Cadastrar" : "Salvar"}</button>`;
    }

    function render() {
        const lateral = apoio();
        document.getElementById("conteudo").innerHTML = `
        ${barraTitulo(novo ? esc(cfg.novoRotulo) : `Editar ${esc(cfg.singular.toLowerCase())}`, [novo ? "Novo" : "Editar"])}

        <div class="row">
            <div class="${lateral ? "col-xxl-8" : "col-xxl-12"}">
                <div class="card">
                    <div class="card-header d-block p-3">
                        <h4 class="card-title mb-1">${esc(cfg.titulo)}</h4>
                        <p class="text-muted mb-0 fs-13">${esc(cfg.subtitulo)}</p>
                    </div>
                    <div class="card-body" id="formulario">${camposPrincipais()}</div>
                </div>
            </div>
            ${lateral}
        </div>

        <div class="mt-1 mb-4 d-flex gap-2 align-items-center">${acoes()}</div>`;

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
            const confirmou = await confirmarExclusao({
                titulo: `Excluir ${cfg.singular.toLowerCase()}`,
                texto: `“${esc(edicao.nome)}” será removid${fim} do cadastro. Não dá para desfazer.`,
                confirmar: "Excluir",
            });
            if (!confirmou) return;
            // O cadastro pode ter vínculos a desfazer antes de sumir.
            cfg.aoExcluir?.(edicao, estado);
            removeItem(cfg.colecao, edicao.id);
            avisar(`${cfg.singular} excluíd${fim} com sucesso.`);
            window.location.href = voltar;
        });
    }

    render();
}
