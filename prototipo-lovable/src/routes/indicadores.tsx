import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AppShell } from "@/components/ppa/shell";
import { BigNumbers } from "@/components/ppa/big-numbers";
import { Chip } from "@/components/ppa/ui";
import { usePpa } from "@/lib/ppa/store";
import { eixos, objetivos, programaPorId } from "@/lib/ppa/regras";
import { ANOS } from "@/lib/ppa/seed";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/indicadores")({
  head: () => ({
    meta: [
      { title: "Indicadores do PPA 2028–2031 — Programa e Iniciativa" },
      { name: "description", content: "Consulta direta aos Indicadores de Programa e de Iniciativa do PPA 2028–2031, com linha de base, polaridade e metas anuais." },
      { property: "og:title", content: "Indicadores do PPA 2028–2031" },
      { property: "og:description", content: "Indicadores de Programa e de Iniciativa em uma única lista comparável." },
    ],
  }),
  component: ListaIndicadores,
});

interface Linha {
  chave: string;
  nivel: "Programa" | "Iniciativa";
  nome: string;
  contexto: string;
  unidade: string;
  referencia: string;
  polaridade: string;
  metas: Record<string, string>;
  to: string;
  id: string;
  eixo: string;
  objetivo: string;
}

function ListaIndicadores() {
  const { state } = usePpa();
  const [busca, setBusca] = useState("");
  const [eixo, setEixo] = useState("todos");
  const [objetivo, setObjetivo] = useState("todos");
  const [nivel, setNivel] = useState("todos");

  const todas = useMemo<Linha[]>(() => {
    const out: Linha[] = [];
    for (const p of state.programas) {
      p.indicadores.forEach((ind, k) =>
        out.push({
          chave: `p-${p.id}-${k}`,
          nivel: "Programa",
          nome: ind.nome,
          contexto: `${p.codigo} — ${p.nome}`,
          unidade: ind.unidade,
          referencia: `${ind.linhaBase}${ind.anoReferencia ? ` (${ind.anoReferencia})` : ""}`,
          polaridade: ind.polaridade === "menor_melhor" ? "Menor é melhor" : "Maior é melhor",
          metas: ind.metas ?? { [ANOS[ANOS.length - 1]!]: ind.meta },
          to: "/programa/$id",
          id: p.id,
          eixo: p.eixo,
          objetivo: p.objetivoEstrategico,
        }),
      );
    }
    for (const i of state.iniciativas.filter((x) => x.orgao === state.orgaoAtual)) {
      const p = programaPorId(state, i.programaId);
      for (const ind of i.indicadores ?? [])
        out.push({
          chave: `i-${ind.id}`,
          nivel: "Iniciativa",
          nome: ind.nome,
          contexto: `${i.nome}`,
          unidade: ind.unidade,
          referencia: `${ind.valorReferencia} (${ind.anoReferencia})`,
          polaridade: ind.polaridade === "menor_melhor" ? "Menor é melhor" : "Maior é melhor",
          metas: ind.metas,
          to: "/iniciativa/$id",
          id: i.id,
          eixo: p?.eixo ?? "",
          objetivo: p?.objetivoEstrategico ?? "",
        });
    }
    return out;
  }, [state]);

  const linhas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return todas.filter((l) => {
      if (q && !l.nome.toLowerCase().includes(q) && !l.contexto.toLowerCase().includes(q)) return false;
      if (eixo !== "todos" && l.eixo !== eixo) return false;
      if (objetivo !== "todos" && l.objetivo !== objetivo) return false;
      if (nivel !== "todos" && l.nivel !== nivel) return false;
      return true;
    });
  }, [todas, busca, eixo, objetivo, nivel]);

  return (
    <AppShell>
      <div className="mb-4">
        <h1 className="text-lg font-semibold tracking-tight">Indicadores</h1>
        <p className="text-xs text-muted-foreground">Indicadores de Programa (resultado) e de Iniciativa, em uma leitura única.</p>
      </div>

      <BigNumbers
        itens={[
          { valor: linhas.length, rotulo: "Indicadores listados" },
          { valor: linhas.filter((l) => l.nivel === "Programa").length, rotulo: "De Programa" },
          { valor: linhas.filter((l) => l.nivel === "Iniciativa").length, rotulo: "De Iniciativa" },
          { valor: linhas.filter((l) => Object.keys(l.metas).length < ANOS.length).length, rotulo: "Sem metas em todos os anos" },
        ]}
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar Indicador" className="h-8 w-64 pl-8 text-xs" />
        </div>
        <Select value={nivel} onValueChange={setNivel}>
          <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os níveis</SelectItem>
            <SelectItem value="Programa">Indicador de Programa</SelectItem>
            <SelectItem value="Iniciativa">Indicador de Iniciativa</SelectItem>
          </SelectContent>
        </Select>
        <Select value={eixo} onValueChange={(v) => { setEixo(v); setObjetivo("todos"); }}>
          <SelectTrigger className="h-8 w-56 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Eixos</SelectItem>
            {eixos(state.programas).map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={objetivo} onValueChange={setObjetivo}>
          <SelectTrigger className="h-8 w-72 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Objetivos Estratégicos</SelectItem>
            {objetivos(state.programas, eixo).map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-md border bg-card">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-2 font-medium">Indicador</th>
              <th className="w-28 px-3 py-2 font-medium">Nível</th>
              <th className="w-28 px-3 py-2 font-medium">Unidade</th>
              <th className="w-32 px-3 py-2 font-medium">Referência</th>
              {ANOS.map((a) => <th key={a} className="w-20 px-2 py-2 text-right font-medium">{a}</th>)}
              <th className="w-32 px-3 py-2 font-medium">Polaridade</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.chave} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2">
                  <Link to={l.to} params={{ id: l.id } as never} className="font-medium hover:underline">{l.nome}</Link>
                  <div className="text-xs text-muted-foreground">{l.contexto}</div>
                </td>
                <td className="px-3 py-2"><Chip tom={l.nivel === "Programa" ? "info" : "neutro"}>{l.nivel}</Chip></td>
                <td className="px-3 py-2 text-xs">{l.unidade}</td>
                <td className="px-3 py-2 text-xs tabular-nums">{l.referencia}</td>
                {ANOS.map((a) => (
                  <td key={a} className="px-2 py-2 text-right tabular-nums">
                    {l.metas[a] ?? <span className="text-muted-foreground">—</span>}
                  </td>
                ))}
                <td className="px-3 py-2 text-xs">{l.polaridade}</td>
              </tr>
            ))}
            {linhas.length === 0 && (
              <tr><td colSpan={5 + ANOS.length} className="px-3 py-8 text-center text-xs text-muted-foreground">Nenhum Indicador encontrado para os filtros aplicados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
