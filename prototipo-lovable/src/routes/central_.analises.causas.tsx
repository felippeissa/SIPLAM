import { Fragment, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { AppShell } from "@/components/ppa/shell";
import { Chip } from "@/components/ppa/ui";
import { usePpa } from "@/lib/ppa/store";
import { COBERTURA_LABEL, coberturaCausa, entregasDaIniciativa } from "@/lib/ppa/regras";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/central_/analises/causas")({
  head: () => ({
    meta: [
      { title: "Cobertura das Causas — Área Central PPA 2028–2031" },
      {
        name: "description",
        content:
          "Quais causas e subcausas do Programa possuem atuação governamental proposta, com órgãos, Iniciativas e Entregas relacionadas.",
      },
      { property: "og:title", content: "Cobertura das Causas — PPA 2028–2031" },
      { property: "og:description", content: "Causas com e sem atuação cadastrada, por Programa." },
    ],
  }),
  component: AnaliseCausas,
});

function AnaliseCausas() {
  const { state } = usePpa();
  const [programaId, setProgramaId] = useState(state.programas[0]?.id ?? "");
  const [abertas, setAbertas] = useState<string[]>([]);
  const programa = state.programas.find((p) => p.id === programaId);

  return (
    <AppShell>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Cobertura das Causas</h1>
          <p className="text-xs text-muted-foreground">
            Causas do diagnóstico do Programa e a atuação proposta pelos órgãos. Abra qualquer Iniciativa ou Entrega
            diretamente.
          </p>
        </div>
        <Select value={programaId} onValueChange={setProgramaId}>
          <SelectTrigger className="h-8 w-96 text-xs">
            <SelectValue placeholder="Selecione o Programa" />
          </SelectTrigger>
          <SelectContent>
            {state.programas.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.codigo} — {p.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-md border bg-card">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="w-8" />
              <th className="px-3 py-2 font-medium">Causa / Subcausa</th>
              <th className="w-56 px-3 py-2 font-medium">Cobertura</th>
              <th className="w-24 px-3 py-2 text-right font-medium">Órgãos</th>
              <th className="w-28 px-3 py-2 text-right font-medium">Iniciativas</th>
              <th className="w-28 px-3 py-2 text-right font-medium">Entregas</th>
            </tr>
          </thead>
          <tbody>
            {(programa?.causas ?? []).map((c) => {
              const subIds = c.subcausas.map((s) => s.id);
              const r = coberturaCausa(state, programa!.id, c.id, subIds);
              const aberta = abertas.includes(c.id);
              return (
                <Fragment key={c.id}>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="pl-2">
                      <button
                        onClick={() => setAbertas((a) => (a.includes(c.id) ? a.filter((x) => x !== c.id) : [...a, c.id]))}
                        aria-label={aberta ? "Recolher causa" : "Expandir causa"}
                        className="flex h-6 w-6 items-center justify-center rounded hover:bg-accent"
                      >
                        <ChevronRight className={cn("h-4 w-4 transition-transform", aberta && "rotate-90")} />
                      </button>
                    </td>
                    <td className="px-3 py-2 font-medium">{c.texto}</td>
                    <td className="px-3 py-2">
                      <Chip tom={r.cobertura === "direta" ? "ok" : r.cobertura === "indireta" ? "info" : "alerta"}>
                        {COBERTURA_LABEL[r.cobertura]}
                      </Chip>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.orgaos.length}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.iniciativas.length}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.entregas.length}</td>
                  </tr>
                  {aberta && (
                    <tr className="border-b bg-muted/20">
                      <td />
                      <td colSpan={5} className="px-3 py-3">
                        <div className="grid gap-4 md:grid-cols-3">
                          <div>
                            <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                              Órgãos que atuam
                            </div>
                            {r.orgaos.length === 0 ? (
                              <p className="text-xs text-muted-foreground">Nenhum órgão relacionado a esta causa.</p>
                            ) : (
                              <ul className="space-y-0.5 text-xs">
                                {r.orgaos.map((o) => (
                                  <li key={o}>{o}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div>
                            <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                              Iniciativas relacionadas
                            </div>
                            {r.iniciativas.length === 0 ? (
                              <p className="text-xs text-muted-foreground">Nenhuma Iniciativa cadastrada.</p>
                            ) : (
                              <ul className="space-y-0.5 text-xs">
                                {r.iniciativas.map((i) => (
                                  <li key={i.id}>
                                    <Link
                                      to="/central/iniciativa/$id"
                                      params={{ id: i.id }}
                                      className="hover:underline"
                                    >
                                      {i.nome}
                                    </Link>
                                    <span className="text-muted-foreground">
                                      {" "}
                                      — {i.orgao}
                                      {r.diretas.some((d) => d.id === i.id) ? " · direta" : " · por subcausa"}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div>
                            <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                              Entregas relacionadas
                            </div>
                            {r.entregas.length === 0 ? (
                              <p className="text-xs text-muted-foreground">Nenhuma Entrega relacionada.</p>
                            ) : (
                              <ul className="space-y-0.5 text-xs">
                                {r.entregas.map((e) => (
                                  <li key={e.id}>
                                    <Link to="/entrega/$id" params={{ id: e.id }} className="hover:underline">
                                      {e.nome}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>

                        {c.subcausas.length > 0 && (
                          <div className="mt-3 border-t pt-2">
                            <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                              Subcausas
                            </div>
                            <ul className="space-y-1 text-xs">
                              {c.subcausas.map((s) => {
                                const rs = coberturaCausa(state, programa!.id, s.id, []);
                                return (
                                  <li key={s.id} className="flex items-center justify-between gap-3 border-b pb-1">
                                    <span>{s.texto}</span>
                                    <span className="shrink-0 text-muted-foreground">
                                      {rs.iniciativas.length === 0
                                        ? "sem atuação cadastrada"
                                        : `${rs.orgaos.length} órgão(s) · ${rs.iniciativas.length} Iniciativa(s) · ${rs.entregas.reduce(
                                            (t, e) => t + (entregasDaIniciativa(state, e.iniciativaId).length ? 1 : 0),
                                            0,
                                          )} Entrega(s)`}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
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
