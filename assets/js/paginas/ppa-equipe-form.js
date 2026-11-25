/**
 * Equipe do PPA — criar e editar um membro.
 *
 * Sem `membro` na URL é um membro novo: a pessoa se busca pelo nome e a função
 * se escolhe numa lista. Com `membro`, a pessoa fica fixa e só a função muda.
 */
import { montarShell, barraTitulo, somenteLeitura, url } from "../shell.js";
import { esc } from "../ui.js";
import { avisar, avisarDepois } from "../toast.js";
import { confirmarExclusao, confirmarSalvarEdicao } from "../confirmar.js";
import { nomeDoPerfil } from "../usuarios-decisao.js";
import { FUNCOES, funcoesDe, juntarFuncoes, vinculosDaEquipe, equipeDoPlano, livresParaEquipe, salvarEquipe } from "../ppa-equipe-dados.js";

const { estado } = montarShell();
const params = new URLSearchParams(location.search);
const ppa = (estado.ppas ?? []).find((p) => p.id === params.get("id"));
const membroId = params.get("membro");
const novo = !membroId;
const leitura = somenteLeitura();
const voltar = url(`ppa-equipe.html?id=${encodeURIComponent(params.get("id") ?? "")}`);

const atual = ppa && !novo ? equipeDoPlano(estado, ppa).find((m) => m.id === membroId) : null;

if (!ppa || (!novo && !atual)) {
    document.getElementById("conteudo").innerHTML = `
    <div class="my-4"><div class="alert alert-warning py-3 px-3">${ppa ? "Este membro não está na equipe." : "Este PPA não existe."}
        <a href="${ppa ? voltar : url("ppa-detalhe.html")}" class="fw-semibold">Voltar</a>.</div></div>`;
} else {
    montar();
}

function montar() {
    let escolhida = null;
    const livres = livresParaEquipe(estado, ppa);
    const norm = (v) => String(v ?? "").toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
    const detalhe = (u) => `${(u.perfis ?? []).map(nomeDoPerfil).join(", ") || "Sem perfil"}${u.orgao ? ` · ${u.orgao}` : ""}`;

    const acoes = leitura
        ? `<a href="${voltar}" class="btn btn-primary">Voltar</a>`
        : `${novo ? "" : '<button type="button" class="btn btn-danger" id="excluir">Excluir</button>'}
           <a href="${voltar}" class="btn btn-outline-primary" data-cancelar="${novo ? "cadastro" : "edicao"}">Cancelar</a>
           <button type="button" class="btn btn-primary" id="salvar">Salvar</button>`;

    const campoNome = novo
        ? `<label class="form-label" for="f-nome">Nome <span class="text-danger">*</span></label>
           <div class="position-relative">
               <input type="text" class="form-control" id="f-nome" autocomplete="off" placeholder="Digite e selecione" />
               <div class="list-group position-absolute w-100 shadow-sm d-none" id="f-sugestoes" style="z-index:5; max-height:16rem; overflow:auto"></div>
           </div>`
        : `<label class="form-label" for="f-nome">Nome</label>
           <input type="text" class="form-control" id="f-nome" value="${esc(atual.nome)}" disabled />`;

    document.getElementById("conteudo").innerHTML = `
    ${barraTitulo(novo ? "Novo membro" : `${leitura ? "Visualizar" : "Editar"} ${esc(atual.nome)}`, [novo ? "Novo" : leitura ? "Visualizar" : "Editar"])}
    <div class="row"><div class="col-12"><div class="card">
        <div class="card-header d-flex flex-wrap justify-content-between align-items-center gap-2 p-3">
            <div>
                <h4 class="card-title mb-1">Equipe do plano</h4>
                <p class="text-muted mb-0 fs-13">${novo ? "Quem entra na equipe e com que função." : "A função desta pessoa no plano."}</p>
            </div>
            <div class="d-flex gap-2 align-items-center">${acoes}</div>
        </div>
        <div class="card-body">
            <div class="mb-3">${campoNome}<div class="invalid-feedback d-block" id="f-nome-erro"></div></div>
            <div class="mb-3">
                <label class="form-label" for="f-funcao">Funções ${leitura ? "" : '<span class="text-danger">*</span>'}</label>
                ${
                    leitura
                        ? `<div class="form-control-plaintext campo-estatico">${esc(funcoesDe(atual?.funcao).join(", ") || "—")}</div>`
                        : `<select class="form-control" id="f-funcao" multiple data-placeholder="Selecione">
                    ${[...new Set([...FUNCOES, ...funcoesDe(atual?.funcao)])].map((f) => `<option value="${esc(f)}">${esc(f)}</option>`).join("")}
                </select>`
                }
                <div class="invalid-feedback d-block" id="f-funcao-erro"></div>
            </div>
        </div>
    </div></div></div>`;

    // Mais de uma função: seleção múltipla, como os demais campos de escolha do sistema.
    let escolhasFuncao = null;
    const campoFuncao = document.getElementById("f-funcao");
    if (campoFuncao) {
        const marcadas = new Set(funcoesDe(atual?.funcao));
        for (const o of campoFuncao.options) o.selected = marcadas.has(o.value);
        if (typeof Choices !== "undefined") {
            escolhasFuncao = new Choices(campoFuncao, {
                removeItemButton: true,
                shouldSort: false,
                searchEnabled: true,
                placeholderValue: "Selecione",
                searchPlaceholderValue: "Digite e selecione",
                noResultsText: "Nada encontrado",
                noChoicesText: "Nada a escolher",
                itemSelectText: "",
            });
            // As funções que o membro já tem entram como escolhidas.
            escolhasFuncao.setChoiceByValue([...marcadas]);
        }
    }
    const funcoesEscolhidas = () => [...(campoFuncao?.selectedOptions ?? [])].map((o) => o.value);
    if (novo) ligarBusca();

    function ligarBusca() {
        const busca = document.getElementById("f-nome");
        const lista = document.getElementById("f-sugestoes");
        const mostrar = () => {
            const achados = livres.filter((u) => !busca.value.trim() || norm(u.nome).includes(norm(busca.value)));
            lista.innerHTML = achados.length
                ? achados
                      .map(
                          (u) => `<button type="button" class="list-group-item list-group-item-action" data-por="${esc(u.id)}">
                    <span class="d-block fs-13">${esc(u.nome)}</span><span class="d-block fs-12 text-muted">${esc(detalhe(u))}</span></button>`
                      )
                      .join("")
                : '<div class="list-group-item text-muted fs-12">Ninguém encontrado.</div>';
            lista.classList.remove("d-none");
        };
        busca.addEventListener("input", () => {
            escolhida = null;
            mostrar();
        });
        busca.addEventListener("focus", mostrar);
        lista.addEventListener("mousedown", (e) => e.preventDefault());
        lista.addEventListener("click", (e) => {
            const b = e.target.closest("[data-por]");
            if (!b) return;
            escolhida = livres.find((u) => u.id === b.dataset.por);
            busca.value = escolhida.nome;
            lista.classList.add("d-none");
        });
        busca.addEventListener("blur", () => lista.classList.add("d-none"));
    }

    document.getElementById("salvar")?.addEventListener("click", async () => {
        const funcao = juntarFuncoes(funcoesEscolhidas());
        document.getElementById("f-nome-erro").textContent = novo && !escolhida ? "Escolha uma pessoa da lista." : "";
        document.getElementById("f-funcao-erro").textContent = !funcao ? "Escolha ao menos uma função." : "";
        if ((novo && !escolhida) || !funcao) return;
        if (!novo && !(await confirmarSalvarEdicao())) return;

        const vinculos = vinculosDaEquipe(estado, ppa);
        if (novo) vinculos.push({ id: escolhida.id, funcao });
        else vinculos.find((m) => m.id === membroId).funcao = funcao;
        salvarEquipe(ppa, vinculos);
        avisarDepois(novo ? "Membro adicionado à equipe." : "Membro atualizado.");
        window.location.href = voltar;
    });

    document.getElementById("excluir")?.addEventListener("click", async () => {
        const ok = await confirmarExclusao({
            titulo: "Remover da equipe",
            texto: `“${atual.nome}” será removido da equipe deste plano. A pessoa continua com acesso ao sistema.`,
            confirmar: "Remover",
        });
        if (!ok) return;
        salvarEquipe(ppa, vinculosDaEquipe(estado, ppa).filter((m) => m.id !== membroId), ok);
        avisarDepois("Membro removido da equipe.");
        window.location.href = voltar;
    });
}
