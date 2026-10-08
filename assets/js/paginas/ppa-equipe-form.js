/**
 * Equipe do PPA — criar e editar um membro.
 *
 * Sem `membro` na URL é um membro novo: a pessoa se busca pelo nome e a função
 * se escolhe numa lista. Com `membro`, a pessoa fica fixa e só a função muda.
 */
import { montarShell, barraTitulo, somenteLeitura, url } from "../shell.js";
import { esc } from "../ui.js";
import { avisar } from "../toast.js";
import { confirmarExclusao } from "../confirmar.js";
import { nomeDoPerfil } from "../usuarios-decisao.js";
import { FUNCOES, vinculosDaEquipe, equipeDoPlano, livresParaEquipe, salvarEquipe } from "../ppa-equipe-dados.js";

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
        ? `<a href="${voltar}" class="btn btn-light">Voltar</a>`
        : `${novo ? "" : '<button type="button" class="btn btn-danger" id="excluir">Excluir</button>'}
           <a href="${voltar}" class="btn btn-light">Cancelar</a>
           <button type="button" class="btn btn-primary" id="salvar">${novo ? "Cadastrar" : "Salvar"}</button>`;

    const campoNome = novo
        ? `<label class="form-label" for="f-nome">Nome <span class="text-danger">*</span></label>
           <div class="position-relative">
               <input type="text" class="form-control" id="f-nome" autocomplete="off" placeholder="Busque uma pessoa…" />
               <div class="list-group position-absolute w-100 shadow-sm d-none" id="f-sugestoes" style="z-index:5; max-height:16rem; overflow:auto"></div>
           </div>`
        : `<label class="form-label" for="f-nome">Nome</label>
           <input type="text" class="form-control" id="f-nome" value="${esc(atual.nome)}" disabled />`;

    document.getElementById("conteudo").innerHTML = `
    ${barraTitulo(novo ? "Novo membro" : `Editar ${esc(atual.nome)}`, [novo ? "Novo" : "Editar"])}
    <div class="row"><div class="col-12"><div class="card">
        <div class="card-header d-flex flex-wrap justify-content-between align-items-start gap-2 p-3">
            <div>
                <h4 class="card-title mb-1">Equipe do plano</h4>
                <p class="text-muted mb-0 fs-13">${novo ? "Quem entra na equipe e com que função." : "A função desta pessoa no plano."}</p>
            </div>
            <div class="d-flex gap-2 align-items-center">${acoes}</div>
        </div>
        <div class="card-body">
            <div class="mb-3">${campoNome}<div class="invalid-feedback d-block" id="f-nome-erro"></div></div>
            <div class="mb-3">
                <label class="form-label" for="f-funcao">Função <span class="text-danger">*</span></label>
                <select class="form-select" id="f-funcao" ${leitura ? "disabled" : ""}>
                    <option value="">Escolha uma função</option>
                    ${FUNCOES.map((f) => `<option value="${esc(f)}">${esc(f)}</option>`).join("")}
                    ${atual && !FUNCOES.includes(atual.funcao) ? `<option value="${esc(atual.funcao)}">${esc(atual.funcao)}</option>` : ""}
                </select>
                <div class="invalid-feedback d-block" id="f-funcao-erro"></div>
            </div>
        </div>
    </div></div></div>`;

    if (atual) document.getElementById("f-funcao").value = atual.funcao;
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

    document.getElementById("salvar")?.addEventListener("click", () => {
        const funcao = document.getElementById("f-funcao").value;
        document.getElementById("f-nome-erro").textContent = novo && !escolhida ? "Escolha uma pessoa da lista." : "";
        document.getElementById("f-funcao-erro").textContent = !funcao ? "Escolha a função." : "";
        if ((novo && !escolhida) || !funcao) return;

        const vinculos = vinculosDaEquipe(estado, ppa);
        if (novo) vinculos.push({ id: escolhida.id, funcao });
        else vinculos.find((m) => m.id === membroId).funcao = funcao;
        salvarEquipe(ppa, vinculos);
        avisar(novo ? "Membro adicionado à equipe." : "Membro atualizado.");
        window.location.href = voltar;
    });

    document.getElementById("excluir")?.addEventListener("click", async () => {
        const ok = await confirmarExclusao({
            titulo: "Remover da equipe",
            texto: `“${atual.nome}” será removido da equipe deste plano. A pessoa continua com acesso ao sistema.`,
            confirmar: "Remover",
        });
        if (!ok) return;
        salvarEquipe(ppa, vinculosDaEquipe(estado, ppa).filter((m) => m.id !== membroId));
        avisar("Membro removido da equipe.");
        window.location.href = voltar;
    });
}
