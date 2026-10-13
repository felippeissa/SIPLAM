/**
 * A equipe de um PPA: quem trabalha no plano e com que função.
 *
 * Guardada no próprio plano, em `ppa.equipe` — uma lista de `{ id, funcao }`, em
 * que `id` é o usuário. Enquanto ninguém montou a equipe, ela é quem tem acesso
 * aprovado na Área Central, com o perfil como função.
 */
import { updPpa } from "./dados/store.js";
import { nomeDoPerfil } from "./usuarios-decisao.js";

/** As funções que alguém pode ter na equipe do plano. */
export const FUNCOES = ["Coordenação do plano", "Planejamento", "Análise técnica", "Consolidação", "Apoio setorial", "Aprovação", "Consulta"];

const aprovados = (estado) => (estado.usuarios ?? []).filter((u) => u.situacao === "aprovado");

/** Os vínculos da equipe: `{ id, funcao }`. */
export function vinculosDaEquipe(estado, ppa) {
    if (ppa.equipe) return ppa.equipe.filter((m) => aprovados(estado).some((u) => u.id === m.id)).map((m) => ({ ...m }));
    return aprovados(estado)
        .filter((u) => (u.perfis ?? []).some((f) => f === "admin-central" || f === "gestao-central"))
        .map((u) => ({ id: u.id, funcao: (u.perfis ?? []).map(nomeDoPerfil).join(", ") }));
}

/** A equipe pronta para listar: o vínculo com os dados da pessoa. */
export function equipeDoPlano(estado, ppa) {
    return vinculosDaEquipe(estado, ppa).map((m) => {
        const u = aprovados(estado).find((x) => x.id === m.id);
        return { ...m, nome: u.nome, orgao: u.orgao ?? "", perfil: (u.perfis ?? []).map(nomeDoPerfil).join(", ") || "Sem perfil" };
    });
}

/** Grava a equipe. Tirar alguém exige justificativa, que vai para o histórico do plano. */
export const salvarEquipe = (ppa, vinculos, justificativa = "") =>
    updPpa(ppa.id, { equipe: vinculos.map((m) => ({ id: m.id, funcao: m.funcao })) }, justificativa);

/** Quem ainda pode entrar: aprovado e fora da equipe. */
export function livresParaEquipe(estado, ppa) {
    const dentro = new Set(vinculosDaEquipe(estado, ppa).map((m) => m.id));
    return aprovados(estado).filter((u) => !dentro.has(u.id));
}
