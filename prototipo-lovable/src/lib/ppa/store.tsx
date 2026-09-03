import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { estadoInicial } from "./seed";
import type { Comentario, Entrega, Iniciativa, PpaState, Programa } from "./types";

const KEY = "ppa-2028-estrutura-v4";
const uid = () => Math.random().toString(36).slice(2, 9);

function hoje() {
  return new Date().toLocaleDateString("pt-BR");
}

interface Ctx {
  state: PpaState;
  hidratado: boolean;
  addIniciativa: (i: Pick<Iniciativa, "programaId" | "nome" | "descricao" | "publicoAlvo" | "causas">) => string;
  updIniciativa: (id: string, patch: Partial<Iniciativa>) => void;
  removeIniciativa: (id: string) => void;
  addPrograma: (p: Programa) => void;
  updPrograma: (id: string, patch: Partial<Programa>) => void;
  marcarSemContribuicao: (programaId: string, orgao: string) => void;
  reconsiderarParticipacao: (programaId: string, orgao: string) => void;
  addEntrega: (iniciativaId: string, nome: string) => string;
  updEntrega: (id: string, patch: Partial<Entrega>) => void;
  removeEntrega: (id: string) => void;
  toggleProjeto: (entregaId: string, projetoId: string) => void;
  /** Vincula/desvincula uma Ação Orçamentária à Entrega (uma Ação financia só uma Entrega). */
  toggleAcao: (entregaId: string, acaoId: string) => void;
  addComentario: (c: Omit<Comentario, "id" | "criadoEm" | "resolvido">) => void;
  resolverComentario: (id: string) => void;
  enviar: (id: string) => void;
  iniciarAnalise: (id: string) => void;
  devolver: (id: string) => void;
  validar: (id: string) => void;
  reset: () => void;
}

const PpaCtx = createContext<Ctx | null>(null);

export function PpaProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PpaState>(() => estadoInicial());
  const [hidratado, setHidratado] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw) as PpaState);
    } catch {
      /* ignore */
    }
    setHidratado(true);
  }, []);

  useEffect(() => {
    if (!hidratado) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hidratado]);

  const value = useMemo<Ctx>(() => {
    const set = (fn: (s: PpaState) => PpaState) => setState(fn);
    const evento = (s: PpaState, iniciativaId: string, autor: string, texto: string): PpaState => ({
      ...s,
      eventos: [...s.eventos, { id: `ev-${uid()}`, iniciativaId, quando: hoje(), autor, texto }],
    });
    const toca = (s: PpaState, id: string): PpaState => ({
      ...s,
      iniciativas: s.iniciativas.map((i) => (i.id === id ? { ...i, atualizadoEm: hoje() } : i)),
    });

    return {
      state,
      hidratado,
      addIniciativa: (i) => {
        const id = `ini-${uid()}`;
        set((s) =>
          evento(
            {
              ...s,
              iniciativas: [
                ...s.iniciativas,
                { ...i, id, orgao: s.orgaoAtual, status: "em_preenchimento", atualizadoEm: hoje(), versao: 1 },
              ],
            },
            id,
            state.orgaoAtual,
            `Iniciativa criada`,
          ),
        );
        return id;
      },
      updIniciativa: (id, patch) =>
        set((s) => toca({ ...s, iniciativas: s.iniciativas.map((i) => (i.id === id ? { ...i, ...patch } : i)) }, id)),
      removeIniciativa: (id) =>
        set((s) => {
          const ents = s.entregas.filter((e) => e.iniciativaId === id).map((e) => e.id);
          return {
            ...s,
            iniciativas: s.iniciativas.filter((i) => i.id !== id),
            entregas: s.entregas.filter((e) => e.iniciativaId !== id),
            vinculos: s.vinculos.filter((v) => !ents.includes(v.entregaId)),
            vinculosAcao: s.vinculosAcao.filter((a) => !ents.includes(a.entregaId)),
          };
        }),
      addPrograma: (p) => set((s) => ({ ...s, programas: [...s.programas, p] })),
      updPrograma: (id, patch) =>
        set((s) => ({ ...s, programas: s.programas.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      marcarSemContribuicao: (programaId, orgao) =>
        set((s) =>
          s.semContribuicao.some((x) => x.programaId === programaId && x.orgao === orgao)
            ? s
            : { ...s, semContribuicao: [...s.semContribuicao, { programaId, orgao }] },
        ),
      reconsiderarParticipacao: (programaId, orgao) =>
        set((s) => ({
          ...s,
          semContribuicao: s.semContribuicao.filter((x) => !(x.programaId === programaId && x.orgao === orgao)),
        })),
      addEntrega: (iniciativaId, nome) => {
        const id = `ent-${uid()}`;
        set((s) =>
          toca(
            {
              ...s,
              entregas: [
                ...s.entregas,
                {
                  id,
                  iniciativaId,
                  nome,
                  descricao: "",
                  unidadeMedida: "",
                  metodoComprovacao: "",
                  comportamentoValidado: false,
                  metas: { "2028": null, "2029": null, "2030": null, "2031": null },
                  territorio: { tipo: null, regioes: [] },
                  gomap: null,
                },
              ],
            },
            iniciativaId,
          ),
        );
        return id;
      },
      updEntrega: (id, patch) =>
        set((s) => {
          const ent = s.entregas.find((e) => e.id === id);
          const ns = { ...s, entregas: s.entregas.map((e) => (e.id === id ? { ...e, ...patch } : e)) };
          return ent ? toca(ns, ent.iniciativaId) : ns;
        }),
      removeEntrega: (id) =>
        set((s) => ({
          ...s,
          entregas: s.entregas.filter((e) => e.id !== id),
          vinculos: s.vinculos.filter((v) => v.entregaId !== id),
          vinculosAcao: s.vinculosAcao.filter((a) => a.entregaId !== id),
        })),
      toggleProjeto: (entregaId, projetoId) =>
        set((s) => {
          const existe = s.vinculos.find((v) => v.entregaId === entregaId && v.projetoId === projetoId);
          if (existe) return { ...s, vinculos: s.vinculos.filter((v) => v.id !== existe.id) };
          return { ...s, vinculos: [...s.vinculos, { id: `v-${uid()}`, entregaId, projetoId }] };
        }),
      toggleAcao: (entregaId, acaoId) =>
        set((s) => {
          const existe = s.vinculosAcao.find((v) => v.entregaId === entregaId && v.acaoId === acaoId);
          if (existe) return { ...s, vinculosAcao: s.vinculosAcao.filter((v) => v.id !== existe.id) };
          // Exclusividade: a Ação não pode financiar outra Entrega.
          if (s.vinculosAcao.some((v) => v.acaoId === acaoId)) return s;
          return { ...s, vinculosAcao: [...s.vinculosAcao, { id: `va-${uid()}`, entregaId, acaoId }] };
        }),
      addComentario: (c) =>
        set((s) => ({
          ...s,
          comentarios: [...s.comentarios, { ...c, id: `cm-${uid()}`, criadoEm: hoje(), resolvido: false }],
        })),
      resolverComentario: (id) =>
        set((s) => ({ ...s, comentarios: s.comentarios.map((c) => (c.id === id ? { ...c, resolvido: true } : c)) })),
      enviar: (id) =>
        set((s) => {
          const ini = s.iniciativas.find((i) => i.id === id);
          const versao = (ini?.versao ?? 1) + (ini?.status === "devolvida" ? 1 : 0);
          return evento(
            {
              ...s,
              iniciativas: s.iniciativas.map((i) =>
                i.id === id ? { ...i, status: "enviada", enviadoEm: hoje(), atualizadoEm: hoje(), versao } : i,
              ),
            },
            id,
            s.orgaoAtual,
            `Iniciativa enviada para análise (versão ${versao})`,
          );
        }),
      iniciarAnalise: (id) =>
        set((s) =>
          evento(
            {
              ...s,
              iniciativas: s.iniciativas.map((i) =>
                i.id === id ? { ...i, status: "em_analise", analista: s.analista, atualizadoEm: hoje() } : i,
              ),
            },
            id,
            s.analista,
            "Análise iniciada pela Área Central",
          ),
        ),
      devolver: (id) =>
        set((s) => {
          const n = s.comentarios.filter(
            (c) =>
              !c.resolvido &&
              ((c.alvoTipo === "iniciativa" && c.alvoId === id) ||
                (c.alvoTipo === "entrega" && s.entregas.some((e) => e.id === c.alvoId && e.iniciativaId === id))),
          ).length;
          return evento(
            {
              ...s,
              iniciativas: s.iniciativas.map((i) =>
                i.id === id ? { ...i, status: "devolvida", analista: s.analista, atualizadoEm: hoje() } : i,
              ),
            },
            id,
            s.analista,
            `Iniciativa devolvida para ajuste com ${n} apontamento(s)`,
          );
        }),
      validar: (id) =>
        set((s) =>
          evento(
            {
              ...s,
              iniciativas: s.iniciativas.map((i) =>
                i.id === id ? { ...i, status: "validada", analista: s.analista, atualizadoEm: hoje() } : i,
              ),
            },
            id,
            s.analista,
            "Iniciativa validada",
          ),
        ),
      reset: () => setState(estadoInicial()),
    };
  }, [state, hidratado]);

  return <PpaCtx.Provider value={value}>{children}</PpaCtx.Provider>;
}

export function usePpa() {
  const ctx = useContext(PpaCtx);
  if (!ctx) throw new Error("usePpa deve ser usado dentro de PpaProvider");
  return ctx;
}
