import { Fragment, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, MoreVertical, Plus, Search } from "lucide-react";
import { AppShell } from "@/components/ppa/shell";
import { Chip, StatusChip } from "@/components/ppa/ui";
import { NovaIniciativaDialog } from "@/components/ppa/nova-iniciativa";
import { BotaoDocumento } from "@/components/ppa/documento";
import { usePpa } from "@/lib/ppa/store";
import {
  STATUS_LABEL,
  comentariosDaIniciativa,
  entregasDaIniciativa,
  iniciativasDoOrgao,
  pendenciasIniciativa,
  resumoPendencias,
} from "@/lib/ppa/regras";
import {
  DISPONIBILIZACAO_LABEL,
  PARTICIPACAO_LABEL,
  eixos,
  financeiroProgramaOrgao,
  moeda,
  objetivos,
  participacaoOrgao,
  pct,
  prioridadePrograma,
} from "@/lib/ppa/regras";
import { BigNumbers } from "@/components/ppa/big-numbers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Programas do PPA 2028–2031 — contribuição do órgão" },
      {
        name: "description",
        content:
          "Relação dos Programas do PPA 2028–2031 de Goiás com as Iniciativas e Entregas cadastradas pelo órgão, em tabela expansível.",
      },
      { property: "og:title", content: "Programas do PPA 2028–2031" },
      { property: "og:description", content: "Consulte os Programas e as Iniciativas do seu órgão em uma única tabela." },
    ],
  }),
  component: ProgramasSetorial,
});

function ProgramasSetorial() {
  const { state, marcarSemContribuicao, reconsiderarParticipacao } = usePpa();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [ordem, setOrdem] = useState("prioridade");
  const [eixo, setEixo] = useState("todos");
  const [objetivo, setObjetivo] = useState("todos");
  const [abertos, setAbertos] = useState<string[]>(["pg-fome"]);
  const [novaEm, setNovaEm] = useState<string | null>(null);

  const linhas = useMemo(() => {
    const base = state.programas.map((p) => {
      const inis = iniciativasDoOrgao(state, p.id, state.orgaoAtual);
      const entregas = inis.reduce((s, i) => s + entregasDaIniciativa(state, i.id).length, 0);
      return {
        programa: p,
        inis,
        entregas,
        participacao: participacaoOrgao(state, p.id, state.orgaoAtual),
        financeiro: financeiroProgramaOrgao(state, p.id, state.orgaoAtual),
      };
    });
    const q = busca.trim().toLowerCase();
    let out = base.filter(
      (l) => !q || l.programa.nome.toLowerCase().includes(q) || l.programa.codigo.includes(q),
    );
    if (eixo !== "todos") out = out.filter((l) => l.programa.eixo === eixo);
    if (objetivo !== "todos") out = out.filter((l) => l.programa.objetivoEstrategico === objetivo);
    if (filtro === "com") out = out.filter((l) => l.inis.length > 0);
    if (filtro === "sem") out = out.filter((l) => l.inis.length === 0);
    if (filtro === "sem_contribuicao") out = out.filter((l) => l.participacao === "sem_contribuicao");
    if (filtro === "nao_avaliado") out = out.filter((l) => l.participacao === "nao_avaliado");
    if (filtro === "devolvida") out = out.filter((l) => l.inis.some((i) => i.status === "devolvida"));
    if (filtro === "em_preenchimento") out = out.filter((l) => l.inis.some((i) => i.status === "em_preenchimento"));
    out = [...out].sort((a, b) =>
      ordem === "nome"
        ? a.programa.nome.localeCompare(b.programa.nome)
        : ordem === "iniciativas"
          ? b.inis.length - a.inis.length
          : ordem === "codigo"
            ? a.programa.codigo.localeCompare(b.programa.codigo)
            : prioridadePrograma(state, a.programa.id, state.orgaoAtual) -
                prioridadePrograma(state, b.programa.id, state.orgaoAtual) ||
              a.programa.codigo.localeCompare(b.programa.codigo),
    );
    return out;
  }, [state, busca, filtro, ordem, eixo, objetivo]);

  const totais = useMemo(() => {
    const inis = state.iniciativas.filter((i) => i.orgao === state.orgaoAtual);
    const ents = inis.reduce((s, i) => s + entregasDaIniciativa(state, i.id).length, 0);
    const previsto = state.programas.reduce((s, p) => s + financeiroProgramaOrgao(state, p.id, state.orgaoAtual).previsto, 0);
    const executado = state.programas.reduce((s, p) => s + financeiroProgramaOrgao(state, p.id, state.orgaoAtual).executado, 0);
    const comContribuicao = state.programas.filter((p) => iniciativasDoOrgao(state, p.id, state.orgaoAtual).length > 0).length;
    return { inis: inis.length, ents, previsto, executado, comContribuicao };
  }, [state]);

  const toggle = (id: string) => setAbertos((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  return (
    <AppShell>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Programas do PPA 2028–2031</h1>
          <p className="text-xs text-muted-foreground">
            Iniciativas e Entregas cadastradas por {state.orgaoAtual}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por código ou nome"
              className="h-8 w-64 pl-8 text-xs"
            />
          </div>
          <Select value={filtro} onValueChange={setFiltro}>
            <SelectTrigger className="h-8 w-56 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Programas</SelectItem>
              <SelectItem value="com">Com Iniciativas do meu órgão</SelectItem>
              <SelectItem value="sem">Sem Iniciativas do meu órgão</SelectItem>
              <SelectItem value="sem_contribuicao">Marcados como sem contribuição</SelectItem>
              <SelectItem value="nao_avaliado">Ainda não avaliados pelo órgão</SelectItem>
              <SelectItem value="em_preenchimento">Com Iniciativa em preenchimento</SelectItem>
              <SelectItem value="devolvida">Com Iniciativa devolvida</SelectItem>
            </SelectContent>
          </Select>
          <Select value={eixo} onValueChange={(v) => { setEixo(v); setObjetivo("todos"); }}>
            <SelectTrigger className="h-8 w-48 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Eixos</SelectItem>
              {eixos(state.programas).map((e) => (
                <SelectItem key={e} value={e}>{e}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={objetivo} onValueChange={setObjetivo}>
            <SelectTrigger className="h-8 w-60 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Objetivos Estratégicos</SelectItem>
              {objetivos(state.programas, eixo).map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={ordem} onValueChange={setOrdem}>
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="prioridade">Ordenar por prioridade</SelectItem>
              <SelectItem value="codigo">Ordenar por código</SelectItem>
              <SelectItem value="nome">Ordenar por nome</SelectItem>
              <SelectItem value="iniciativas">Ordenar por nº de Iniciativas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <BigNumbers
        itens={[
          { valor: state.programas.length, rotulo: "Programas do PPA" },
          { valor: totais.comContribuicao, rotulo: "Com contribuição do órgão" },
          { valor: totais.inis, rotulo: "Iniciativas" },
          { valor: totais.ents, rotulo: "Entregas" },
          { valor: moeda(totais.previsto), rotulo: "Previsto no PPA" },
          { valor: pct(totais.previsto > 0 ? (totais.executado / totais.previsto) * 100 : null), rotulo: "% execução financeira" },
        ]}
        rodape="Os valores derivam das Ações Orçamentárias vinculadas às Entregas do órgão. A execução é financeira (SIAFIC) e não indica desempenho físico."
      />

      <div className="overflow-x-auto rounded-md border bg-card">
        <table className="w-full min-w-[1180px] border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="w-8" />
              <th className="w-20 px-3 py-2 font-medium">Código</th>
              <th className="px-3 py-2 font-medium">Programa</th>
              <th className="w-44 px-3 py-2 font-medium">Participação</th>
              <th className="w-32 px-3 py-2 text-right font-medium">Iniciativas</th>
              <th className="w-28 px-3 py-2 text-right font-medium">Entregas</th>
              <th className="w-32 px-3 py-2 text-right font-medium">Previsto</th>
              <th className="w-64 px-3 py-2 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map(({ programa, inis, entregas, participacao, financeiro }) => {
              const aberto = abertos.includes(programa.id);
              return (
                <Fragment key={programa.id}>
                  <tr key={programa.id} className="border-b hover:bg-muted/30">
                    <td className="pl-2">
                      <button
                        onClick={() => toggle(programa.id)}
                        aria-label={aberto ? "Recolher" : "Expandir"}
                        className="flex h-6 w-6 items-center justify-center rounded hover:bg-accent"
                      >
                        <ChevronRight className={cn("h-4 w-4 transition-transform", aberto && "rotate-90")} />
                      </button>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{programa.codigo}</td>
                    <td className="px-3 py-2">
                      <div className="font-medium">{programa.nome}</div>
                      <div className="text-xs text-muted-foreground">
                        {programa.eixo} · coordenação: {programa.orgaoCoordenador}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Chip
                          tom={
                            participacao === "com_contribuicao" ? "ok" : participacao === "sem_contribuicao" ? "neutro" : "alerta"
                          }
                        >
                          {PARTICIPACAO_LABEL[participacao]}
                        </Chip>
                        {(programa.disponibilizacao ?? "disponivel") !== "disponivel" && (
                          <Chip tom="info">{DISPONIBILIZACAO_LABEL[programa.disponibilizacao ?? "disponivel"]}</Chip>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{inis.length}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{entregas}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{financeiro.previsto > 0 ? moeda(financeiro.previsto) : "—"}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                          <Link to="/programa/$id" params={{ id: programa.id }}>
                            Visualizar Programa
                          </Link>
                        </Button>
                        <Button size="sm" className="h-7 text-xs" onClick={() => setNovaEm(programa.id)}>
                          <Plus className="mr-1 h-3 w-3" /> Nova Iniciativa
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Mais ações">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs">
                            <DropdownMenuItem onSelect={() => !aberto && toggle(programa.id)}>
                              Visualizar todas as Iniciativas
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to="/programa/$id" params={{ id: programa.id }}>
                                Consultar dados do Programa
                              </Link>
                            </DropdownMenuItem>
                            {participacao === "sem_contribuicao" ? (
                              <DropdownMenuItem onSelect={() => reconsiderarParticipacao(programa.id, state.orgaoAtual)}>
                                Reconsiderar participação do órgão
                              </DropdownMenuItem>
                            ) : (
                              inis.length === 0 && (
                                <DropdownMenuItem onSelect={() => marcarSemContribuicao(programa.id, state.orgaoAtual)}>
                                  Declarar sem contribuição do órgão
                                </DropdownMenuItem>
                              )
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                  {aberto && (
                    <tr key={`${programa.id}-exp`} className="border-b bg-muted/20">
                      <td />
                      <td colSpan={7} className="px-3 py-3">
                        {inis.length === 0 ? (
                          participacao === "sem_contribuicao" ? (
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-xs text-muted-foreground">
                                Órgão declarou não haver contribuição neste Programa.
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() => reconsiderarParticipacao(programa.id, state.orgaoAtual)}
                              >
                                Reconsiderar participação
                              </Button>
                            </div>
                          ) : (
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-xs text-muted-foreground">
                              Seu órgão ainda não cadastrou Iniciativas neste Programa.
                            </span>
                            <Button size="sm" className="h-7 text-xs" onClick={() => setNovaEm(programa.id)}>
                              <Plus className="mr-1 h-3 w-3" /> Incluir Iniciativa
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => marcarSemContribuicao(programa.id, state.orgaoAtual)}
                            >
                              Sem contribuição do órgão
                            </Button>
                          </div>
                          )
                        ) : (
                          <table className="w-full border-collapse text-sm">
                            <thead>
                              <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                                <th className="py-1 font-medium">Iniciativa</th>
                                <th className="w-64 py-1 font-medium">Status</th>
                                <th className="w-24 py-1 pr-3 text-right font-medium">Entregas</th>
                                <th className="w-32 py-1 font-medium">Atualização</th>
                                <th className="w-56 py-1 font-medium">Ações</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inis.map((i) => {
                                const ents = entregasDaIniciativa(state, i.id);
                                const r = resumoPendencias(pendenciasIniciativa(state, i));
                                const aps = comentariosDaIniciativa(state, i.id).filter((c) => !c.resolvido).length;
                                return (
                                  <tr key={i.id} className="border-t border-border/60">
                                    <td className="py-2 pr-3">
                                      <Link
                                        to="/iniciativa/$id"
                                        params={{ id: i.id }}
                                        className="font-medium hover:underline"
                                      >
                                        ↳ {i.nome}
                                      </Link>
                                    </td>
                                    <td className="py-2 pr-3">
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        <StatusChip status={i.status} />
                                        {i.status === "devolvida" && aps > 0 && (
                                          <Chip tom="alerta">{aps} apontamento{aps > 1 ? "s" : ""}</Chip>
                                        )}
                                        {i.status === "em_preenchimento" && r.impeditivos > 0 && (
                                          <Chip tom="impeditivo">
                                            {r.impeditivos} pendência{r.impeditivos > 1 ? "s" : ""}
                                          </Chip>
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-2 pr-3 text-right tabular-nums">{ents.length}</td>
                                    <td className="py-2 pr-3 text-xs text-muted-foreground">{i.atualizadoEm}</td>
                                    <td className="py-2">
                                      <AcoesIniciativa iniciativaId={i.id} status={i.status} />
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {linhas.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-xs text-muted-foreground">
                  Nenhum Programa encontrado para os filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {novaEm && (
        <NovaIniciativaDialog programaId={novaEm} open onOpenChange={(v) => !v && setNovaEm(null)} />
      )}
    </AppShell>
  );
}

function AcoesIniciativa({ iniciativaId, status }: { iniciativaId: string; status: string }) {
  const { state, removeIniciativa } = usePpa();
  const ini = state.iniciativas.find((i) => i.id === iniciativaId)!;
  const ents = entregasDaIniciativa(state, iniciativaId);
  const principal =
    status === "devolvida" ? "Ver ajustes" : status === "em_preenchimento" ? "Editar" : "Visualizar";

  return (
    <div className="flex items-center gap-1.5">
      <Button asChild size="sm" variant="outline" className="h-7 text-xs">
        <Link to="/iniciativa/$id" params={{ id: iniciativaId }}>
          {principal}
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Mais ações da Iniciativa">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="text-xs">
          <DropdownMenuItem asChild>
            <Link to="/iniciativa/$id" params={{ id: iniciativaId }}>
              Abrir Iniciativa
            </Link>
          </DropdownMenuItem>
          {status === "em_preenchimento" && ents.length === 0 && (
            <DropdownMenuItem
              onSelect={() => {
                if (confirm("Excluir esta Iniciativa?")) removeIniciativa(iniciativaId);
              }}
            >
              Excluir Iniciativa
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <BotaoDocumento rotulo="PDF" titulo={`Iniciativa — ${ini.nome}`}>
        <p className="text-xs text-muted-foreground">Status: {STATUS_LABEL[ini.status]} · Órgão: {ini.orgao}</p>
        <p>{ini.descricao}</p>
        <ul className="list-disc pl-5">
          {ents.map((e) => (
            <li key={e.id}>{e.nome}</li>
          ))}
        </ul>
      </BotaoDocumento>
    </div>
  );
}
