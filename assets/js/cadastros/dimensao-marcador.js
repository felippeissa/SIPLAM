import { esc } from "../ui.js";
import { somenteLeitura } from "../shell.js";
import { addItem, updItem, obterEstado } from "../dados/store.js";
import { campoErro } from "../validacao.js";

/**
 * Cadastro de Dimensões dos marcadores (Gestão).
 *
 * Cada linha é um tipo e a dimensão a que pertence (a dimensão se repete). Os dois campos são de texto livre, porque
 * quem administra pode criar dimensões e tipos novos: ao salvar, a dimensão digitada é reaproveitada se já existe (sem
 * distinguir caixa nem acento) e cadastrada se não existe. Os tipos moram em `tiposMarcador`, ligados por `dimensaoId`.
 */
const norm = (v) =>
    String(v ?? "")
        .toLocaleLowerCase("pt-BR")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .trim();

const dimensaoPorNome = (estado, nome) => (estado.dimensoesMarcador ?? []).find((d) => norm(d.nome) === norm(nome));
const nomeDaDimensao = (estado, id) => (estado.dimensoesMarcador ?? []).find((d) => d.id === id)?.nome ?? "";

export const dimensaoMarcador = {
    colecao: "tiposMarcador",
    pasta: "central-dimensao",
    listagem: "central-dimensao.html",
    titulo: "Cadastro de Dimensões",
    subtitulo: "Os tipos de marcador e a dimensão de cada um.",
    novoRotulo: "Novo tipo",
    singular: "Tipo",
    rotuloNome: "Tipo",
    exemplo: "Mudanças climáticas",
    podeExcluir: true,
    semDescricao: true,

    // O filtro de Tipo é o campo livre da lista (singular "Tipo"); o de Dimensão escolhe entre as cadastradas.
    filtros: [
        {
            tipo: "texto",
            id: "dimensao",
            rotulo: "Dimensão",
            campo: "dimensaoId",
            opcoes: () => (obterEstado().dimensoesMarcador ?? []).map((d) => ({ valor: d.id, rotulo: d.nome })),
        },
    ],

    extra: {
        colunas: [{ rotulo: "Dimensão", valor: (item, estado) => esc(nomeDaDimensao(estado, item.dimensaoId) || "—") }],

        html: (edicao, estado) => `
            <label class="form-label" for="f-dimensao">Dimensão <span class="text-danger">*</span></label>
            <input type="text" class="form-control" id="f-dimensao" placeholder="Dimensão econômica" autocomplete="off"
                   value="${esc(nomeDaDimensao(estado, edicao.dimensaoId))}" ${somenteLeitura() ? "disabled" : ""} />
            ${campoErro("f-dimensao")}`,

        ler: () => ({ dimensaoNome: document.getElementById("f-dimensao")?.value.trim() ?? "" }),

        regras: (dados) => [
            { campo: "f-dimensao", valido: !!dados.dimensaoNome, mensagem: "Informe a dimensão." },
        ],

        // A dimensão digitada vira vínculo: reaproveita a que existe ou cadastra a nova.
        aoSalvar: (salvo, estado) => {
            const nome = salvo.dimensaoNome ?? "";
            if (!nome) return;
            const dimensao = dimensaoPorNome(estado, nome) ?? addItem("dimensoesMarcador", { nome, ppaId: "" });
            updItem("tiposMarcador", salvo.id, { dimensaoId: dimensao.id, dimensaoNome: undefined });
        },
    },
};
