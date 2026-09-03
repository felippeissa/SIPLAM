import { Fragment, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Search } from "lucide-react";
import { AppShell } from "@/components/ppa/shell";
import { Chip } from "@/components/ppa/ui";
import { usePpa } from "@/lib/ppa/store";
import { moedaCurta, programaPorId } from "@/lib/ppa/regras";
import {
apropriadoDoProjetoNoPpa, entregasDoProjeto, linhasFinanceiras,
  fontesDoIpof,
  totalDoIpof,
} from "@/lib/ppa/financeiro";
import { IPOFS, PROJETOS } from "@/lib/ppa/seed";

const ipofsDoProjeto = (projetoId: string) => IPOFS.filter((i) => i.projetoId === projetoId);
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/central_/analises/projetos")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s["q"] === "string" ? (s["q"] as string) : "" }),
  head: () => ({
    meta: [
      { title: "Projetos GOMAP no PPA — Área Central" },
      {
        name: "description",
        content:
          "Como os Projetos GOMAP se relacionam com o PPA 2028–2031: Entregas, Iniciativas, Programas, IPOFs e valores refletidos no plano.",
      },
      { property: "og:title", content: "Projetos GOMAP no PPA — Área Central" },
      { property: "og:description", content: "Relação entre execução no GOMAP e o planejamento do PPA." },
    ],
  }),
  component: AnaliseProjetos,
});

function AnaliseProjetos() {
  const { q } = Route.useSearch();
  const { state } = usePpa();
  const [busca, setBusca] = useState(q);
  const [abertos, setAbertos] = useState<string[]>(q ? PROJETOS.filter((p) => p.codigo === q).map((p) => p.id) : []);

  const linhasFin = useMemo(() => linhasFinanceiras(state), [state]);

  const projetos = PROJETOS.filter((p) => {
    const t = busca.trim().toLowerCase();
    return !t || `${p.codigo} ${p.nome} ${p.orgao}`.toLowerCase().includes(t);
  });

  return (
    <AppShell>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Projetos GOMAP no PPA</h1>
          <p className="text-xs text-muted-foreground">
            Visão de relacionamento, não de gerenciamento. Dados do Projeto são provenientes do GOMAP.
          </p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Código, nome ou órgão do Projeto"
            className="h-8 w-72 pl-8 text-xs"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border bg-card">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="w-8" />
              <th className="px-3 py-2 font-medium">Projeto GOMAP</th>
              <th className="w-52 px-3 py-2 font-medium">Órgão</th>
              <th className="w-28 px-3 py-2 text-right font-medium">Entregas</th>
              <th className="w-28 px-3 py-2 text-right font-medium">Programas</th>
              <th className="w-24 px-3 py-2 text-right font-medium">IPOFs</th>
              <th className="w-36 px-3 py-2 text-right font-medium">Apropriado ao PPA</th>
              <th className="w-36 px-3 py-2 font-medium">Situação</th>
            </tr>
          </thead>
          <tbody>
            {projetos.map((p) => {
              const ents = entregasDoProjeto(state, p.id);
              const inis = [...new Set(ents.map((e) => e.iniciativaId))];
              const progs = [
                ...new Set(
                  inis
                    .map((id) => state.iniciativas.find((i) => i.id === id)?.programaId)
                    .filter((x): x is string => !!x),
                ),
              ];
              const aberto = abertos.includes(p.id);
              const apropriado = apropriadoDoProjetoNoPpa(state, p.id);
              return (
                <Fragment key={p.id}>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="pl-2">
                      <button
                        onClick={() => setAbertos((a) => (a.includes(p.id) ? a.filter((x) => x !== p.id) : [...a, p.id]))}
                        aria-label={aberto ? "Recolher Projeto" : "Expandir Projeto"}
                        className="flex h-6 w-6 items-center justify-center rounded hover:bg-accent"
                      >
                        <ChevronRight className={cn("h-4 w-4 transition-transform", aberto && "rotate-90")} />
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium">{p.nome}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">{p.codigo}</div>
                    </td>
                    <td className="px-3 py-2 text-xs">{p.orgao}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{ents.length}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{progs.length}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{ipofsDoProjeto(p.id).length}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{apropriado ? moedaCurta(apropriado) : "—"}</td>
                    <td className="px-3 py-2 text-xs">
                      {p.situacao} · {p.execucao}%
                    </td>
                  </tr>
                  {aberto && (
                    <tr className="border-b bg-muted/20">
                      <td />
                      <td colSpan={7} className="px-3 py-3">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                              Dados do GOMAP
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Cronograma {p.cronograma} · {p.fase} · execução {p.execucao}% · valor global {moedaCurta(p.valorGlobal)} · conclusão
                              prevista {p.conclusaoPrevista} · atualizado em {p.ultimaAtualizacao}.
                              Informações mantidas no GOMAP; o PPA apenas as consulta.
                            </p>
                            <div className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground">IPOFs</div>
                            {ipofsDoProjeto(p.id).length === 0 ? (
                              <p className="text-xs text-muted-foreground">Projeto sem IPOF no SIAFIC.</p>
                            ) : (
                              <ul className="space-y-0.5 text-xs">
                                {ipofsDoProjeto(p.id).map((i) => {
                                  const usado = linhasFin
                                    .filter((l) => l.ipof.id === i.id)
                                    .reduce((s, l) => s + l.total, 0);
                                  return (
                                    <li key={i.id}>
                                      {i.codigo} — {i.nome}
                                      <span className="text-muted-foreground">
                                        {" "}
                                        · {fontesDoIpof(i).join(", ")} · SIAFIC {moedaCurta(totalDoIpof(i))} · no PPA {moedaCurta(usado)}
                                      </span>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </div>
                          <div>
                            <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                              Entregas do PPA relacionadas
                            </div>
                            {ents.length === 0 ? (
                              <p className="text-xs text-muted-foreground">
                                Nenhuma Entrega do PPA associada a este Projeto.
                              </p>
                            ) : (
                              <ul className="space-y-1 text-xs">
                                {ents.map((e) => {
                                  const i = state.iniciativas.find((x) => x.id === e.iniciativaId);
                                  const pr = i ? programaPorId(state, i.programaId) : undefined;
                                  return (
                                    <li key={e.id}>
                                      <Link to="/entrega/$id" params={{ id: e.id }} className="hover:underline">
                                        {e.nome}
                                      </Link>
                                      <span className="block text-muted-foreground">
                                        {pr?.codigo} › {i?.orgao} › {i?.nome}
                                      </span>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                            {ents.length > 1 && (
                              <Chip tom="info" className="mt-2">
                                Projeto compartilhado — os valores continuam derivados das Ações de cada Entrega
                              </Chip>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
