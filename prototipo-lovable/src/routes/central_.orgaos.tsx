import { Fragment, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Search } from "lucide-react";
import { AppShell } from "@/components/ppa/shell";
import { BigNumbers } from "@/components/ppa/big-numbers";
import { Chip, StatusChip } from "@/components/ppa/ui";
import { usePpa } from "@/lib/ppa/store";
import {
  entregasDaIniciativa,
  moedaCurta,
  orgaosComContribuicao,
  pct,
  programaPorId,
  resumoOrgao,
  situacaoEntrega,
} from "@/lib/ppa/regras";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/central_/orgaos")({
  head: () => ({
    meta: [
      { title: "Órgãos participantes — PPA 2028–2031 Goiás" },
      {
        name: "description",
        content:
          "Visão da Área Central por órgão: Programas em que atua, Iniciativas, Entregas, situação e recursos apropriados.",
      },
      { property: "og:title", content: "Órgãos participantes — PPA 2028–2031" },
      { property: "og:description", content: "Consolidação da contribuição de cada órgão ao PPA." },
    ],
  }),
  component: OrgaosPage,
});

function OrgaosPage() {
  const { state } = usePpa();
  const [busca, setBusca] = useState("");
  const [abertos, setAbertos] = useState<string[]>([]);
  const [progAbertos, setProgAbertos] = useState<string[]>([]);
  const [iniAbertas, setIniAbertas] = useState<string[]>([]);

  const linhas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return orgaosComContribuicao(state)
      .filter((o) => !q || o.toLowerCase().includes(q))
      .map((o) => resumoOrgao(state, o));
  }, [state, busca]);

  const totalInis = linhas.reduce((s, l) => s + l.inis.length, 0);
  const totalEnt = linhas.reduce((s, l) => s + l.entregas, 0);
  const totalPrev = linhas.reduce((s, l) => s + l.previsto, 0);
  const pendentes = linhas.reduce((s, l) => s + l.enviadas + l.emAnalise, 0);

  const alterna = (arr: string[], set: (v: string[]) => void, k: string) =>
    set(arr.includes(k) ? arr.filter((x) => x !== k) : [...arr, k]);

  return (
    <AppShell>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Órgãos participantes</h1>
          <p className="text-xs text-muted-foreground">
            Mesma estrutura da visão setorial, organizada a partir do órgão: Programa › Iniciativa › Entrega.
          </p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar órgão"
            className="h-8 w-64 pl-8 text-xs"
          />
        </div>
      </div>

      <BigNumbers
        itens={[
          { valor: linhas.length, rotulo: "Órgãos com contribuição" },
          { valor: totalInis, rotulo: "Iniciativas" },
          { valor: totalEnt, rotulo: "Entregas" },
          { valor: pendentes, rotulo: "Aguardando análise" },
          { valor: moedaCurta(totalPrev), rotulo: "Previsto apropriado" },
        ]}
      />

      <div className="overflow-x-auto rounded-md border bg-card">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="w-8" />
              <th className="px-3 py-2 font-medium">Órgão</th>
              <th className="w-24 px-3 py-2 text-right font-medium">Programas</th>
              <th className="w-24 px-3 py-2 text-right font-medium">Iniciativas</th>
              <th className="w-24 px-3 py-2 text-right font-medium">Entregas</th>
              <th className="w-56 px-3 py-2 font-medium">Situação</th>
              <th className="w-32 px-3 py-2 text-right font-medium">Previsto</th>
              <th className="w-32 px-3 py-2 text-right font-medium">Executado</th>
              <th className="w-20 px-3 py-2 text-right font-medium">%</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => {
              const aberto = abertos.includes(l.orgao);
              return (
                <Fragment key={l.orgao}>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="pl-2">
                      <button
                        onClick={() => alterna(abertos, setAbertos, l.orgao)}
                        aria-label={aberto ? "Recolher órgão" : "Expandir órgão"}
                        className="flex h-6 w-6 items-center justify-center rounded hover:bg-accent"
                      >
                        <ChevronRight className={cn("h-4 w-4 transition-transform", aberto && "rotate-90")} />
                      </button>
                    </td>
                    <td className="px-3 py-2 font-medium">{l.orgao}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{l.programas.length}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{l.inis.length}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{l.entregas}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {l.emPreenchimento > 0 && <Chip tom="neutro">{l.emPreenchimento} em preenchimento</Chip>}
                        {l.enviadas + l.emAnalise > 0 && <Chip tom="info">{l.enviadas + l.emAnalise} em análise</Chip>}
                        {l.devolvidas > 0 && <Chip tom="alerta">{l.devolvidas} devolvidas</Chip>}
                        {l.validadas > 0 && <Chip tom="ok">{l.validadas} validadas</Chip>}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-xs">{moedaCurta(l.previsto)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-xs">{moedaCurta(l.executado)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-xs">
                      {pct(l.previsto > 0 ? (l.executado / l.previsto) * 100 : null)}
                    </td>
                  </tr>

                  {aberto &&
                    l.programas.map((pid) => {
                      const p = programaPorId(state, pid);
                      const k = `${l.orgao}|${pid}`;
                      const pAberto = progAbertos.includes(k);
                      const inis = l.inis.filter((i) => i.programaId === pid);
                      return (
                        <Fragment key={k}>
                          <tr className="border-b bg-muted/20">
                            <td />
                            <td className="py-2 pl-6 pr-3" colSpan={2}>
                              <button
                                onClick={() => alterna(progAbertos, setProgAbertos, k)}
                                className="flex items-center gap-1.5 text-left hover:underline"
                              >
                                <ChevronRight
                                  className={cn("h-3.5 w-3.5 transition-transform", pAberto && "rotate-90")}
                                />
                                <span className="font-mono text-xs text-muted-foreground">{p?.codigo}</span>
                                <span>{p?.nome}</span>
                              </button>
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums">{inis.length}</td>
                            <td className="px-3 py-2 text-right tabular-nums">
                              {inis.reduce((s, i) => s + entregasDaIniciativa(state, i.id).length, 0)}
                            </td>
                            <td className="px-3 py-2 text-xs text-muted-foreground">{p?.eixo}</td>
                            <td colSpan={3} />
                          </tr>

                          {pAberto &&
                            inis.map((i) => {
                              const ents = entregasDaIniciativa(state, i.id);
                              const iAberta = iniAbertas.includes(i.id);
                              return (
                                <Fragment key={i.id}>
                                  <tr className="border-b bg-muted/10">
                                    <td />
                                    <td className="py-2 pl-12 pr-3" colSpan={3}>
                                      <button
                                        onClick={() => alterna(iniAbertas, setIniAbertas, i.id)}
                                        className="flex items-center gap-1.5 text-left hover:underline"
                                      >
                                        <ChevronRight
                                          className={cn("h-3.5 w-3.5 transition-transform", iAberta && "rotate-90")}
                                        />
                                        {i.nome}
                                      </button>
                                    </td>
                                    <td className="px-3 py-2 text-right tabular-nums">{ents.length}</td>
                                    <td className="px-3 py-2">
                                      <StatusChip status={i.status} />
                                    </td>
                                    <td colSpan={2} className="px-3 py-2 text-xs text-muted-foreground">
                                      atualizada em {i.atualizadoEm}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                      <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                                        <Link to="/central/iniciativa/$id" params={{ id: i.id }}>
                                          Abrir
                                        </Link>
                                      </Button>
                                    </td>
                                  </tr>
                                  {iAberta &&
                                    ents.map((e) => {
                                      const s = situacaoEntrega(state, e);
                                      return (
                                        <tr key={e.id} className="border-b">
                                          <td />
                                          <td className="py-1.5 pl-[72px] pr-3 text-xs" colSpan={4}>
                                            ↳{" "}
                                            <Link
                                              to="/entrega/$id"
                                              params={{ id: e.id }}
                                              className="hover:underline"
                                            >
                                              {e.nome}
                                            </Link>
                                          </td>
                                          <td className="px-3 py-1.5">
                                            <Chip
                                              tom={s.tom === "ok" ? "ok" : s.tom === "alerta" ? "alerta" : "impeditivo"}
                                            >
                                              {s.texto}
                                            </Chip>
                                          </td>
                                          <td colSpan={3} className="px-3 py-1.5 text-xs text-muted-foreground">
                                            {e.unidadeMedida || "unidade não informada"}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                </Fragment>
                              );
                            })}
                        </Fragment>
                      );
                    })}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
