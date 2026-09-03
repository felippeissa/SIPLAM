import { useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/ppa/shell";
import { Campo, Chip, Secao, StatusChip } from "@/components/ppa/ui";
import { ANOS, PROGRAMAS } from "@/lib/ppa/seed";
import { usePpa } from "@/lib/ppa/store";
import {
  COMPORTAMENTOS,
  STATUS_LABEL,
  TERRITORIO_LABEL,
  entregasDaIniciativa,
  moeda,
  pendenciasIniciativa,
  projetosDaEntrega,
  recursosDaIniciativa,
  resumoPendencias,
  situacaoEntrega,
  recursosDaEntrega,
} from "@/lib/ppa/regras";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/central_/iniciativa/$id")({
  head: () => ({
    meta: [
      { title: "Análise da Iniciativa — Área Central PPA 2028–2031" },
      {
        name: "description",
        content:
          "Análise técnica de uma Iniciativa encaminhada por um órgão: apontamentos por campo, devolução para ajuste e validação.",
      },
      { property: "og:title", content: "Análise da Iniciativa — Área Central" },
      { property: "og:description", content: "Registre apontamentos, devolva ou valide a Iniciativa." },
    ],
  }),
  component: AnalisePage,
});

const CAMPOS_ENTREGA = [
  ["nome", "Nome"],
  ["unidade", "Unidade de medida"],
  ["metas", "Metas"],
  ["comportamento", "Comportamento da meta"],
  ["territorio", "Territorialização"],
  ["comprovacao", "Método de comprovação"],
  ["gomap", "Projetos GOMAP"],
  ["recursos", "Vinculação orçamentária"],
] as const;

function AnalisePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { state, addComentario, iniciarAnalise, devolver, validar } = usePpa();
  const ini = state.iniciativas.find((i) => i.id === id);
  if (!ini) throw notFound();
  const programa = PROGRAMAS.find((p) => p.id === ini.programaId)!;
  const entregas = entregasDaIniciativa(state, ini.id);
  const pend = pendenciasIniciativa(state, ini);
  const r = resumoPendencias(pend);
  const eventos = state.eventos.filter((e) => e.iniciativaId === ini.id);
  const abertos = state.comentarios.filter(
    (c) =>
      !c.resolvido &&
      ((c.alvoTipo === "iniciativa" && c.alvoId === ini.id) ||
        (c.alvoTipo === "entrega" && entregas.some((e) => e.id === c.alvoId))),
  );

  const [novo, setNovo] = useState<{ alvoTipo: "iniciativa" | "entrega"; alvoId: string; campo: string } | null>(null);
  const [texto, setTexto] = useState("");
  const [confirmar, setConfirmar] = useState<"devolver" | "validar" | null>(null);

  const emAnalise = ini.status === "em_analise";

  return (
    <AppShell>
      <nav className="mb-3 text-xs text-muted-foreground">
        <Link to="/central" className="hover:underline">
          Área Central
        </Link>{" "}
        › {programa.codigo} — {programa.nome} › {ini.orgao}
      </nav>

      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{ini.nome}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <StatusChip status={ini.status} />
            <span>{ini.orgao}</span>
            <span>· versão {ini.versao}</span>
            {ini.enviadoEm && <span>· enviada em {ini.enviadoEm}</span>}
            {ini.analista && <span>· analista {ini.analista}</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {ini.status === "enviada" && (
            <Button size="sm" className="h-8 text-xs" onClick={() => iniciarAnalise(ini.id)}>
              Iniciar análise
            </Button>
          )}
          {emAnalise && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={() => setConfirmar("devolver")}
              >
                Devolver para ajuste
              </Button>
              <Button size="sm" className="h-8 text-xs" onClick={() => setConfirmar("validar")}>
                Validar Iniciativa
              </Button>
            </>
          )}
        </div>
      </header>

      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        <Chip tom="impeditivo">{r.impeditivos} impeditivo(s)</Chip>
        <Chip tom="alerta">{r.alertas} alerta(s)</Chip>
        <Chip tom="info">{abertos.length} apontamento(s) em aberto</Chip>
        <Chip tom="neutro">{moeda(recursosDaIniciativa(state, ini.id))} no PPA</Chip>
      </div>

      <div className="space-y-4">
        <Secao
          titulo="Iniciativa"
          acao={
            emAnalise && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => setNovo({ alvoTipo: "iniciativa", alvoId: ini.id, campo: "descricao" })}
              >
                Registrar apontamento
              </Button>
            )
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Campo rotulo="Detalhamento">{ini.descricao || <Vazio />}</Campo>
            <Campo rotulo="Público-alvo">{ini.publicoAlvo || <Vazio />}</Campo>
            <div className="md:col-span-2">
              <Campo rotulo="Causas relacionadas">
                {ini.causas.length === 0 ? (
                  <Vazio />
                ) : (
                  <ul className="list-disc pl-5">
                    {programa.causas
                      .flatMap((c) => [c, ...c.subcausas])
                      .filter((c) => ini.causas.includes(c.id))
                      .map((c) => (
                        <li key={c.id}>{c.texto}</li>
                      ))}
                  </ul>
                )}
              </Campo>
            </div>
          </div>
        </Secao>

        {entregas.map((e) => {
          const s = situacaoEntrega(state, e);
          const comp = e.comportamento ?? e.comportamentoSugerido;
          const projs = projetosDaEntrega(state, e.id);
          return (
            <Secao
              key={e.id}
              titulo={`Entrega — ${e.nome || "sem nome"}`}
              acao={
                <div className="flex items-center gap-2">
                  <Chip tom={s.tom}>{s.texto}</Chip>
                  {emAnalise && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => setNovo({ alvoTipo: "entrega", alvoId: e.id, campo: "metas" })}
                    >
                      Registrar apontamento
                    </Button>
                  )}
                </div>
              }
            >
              <div className="grid gap-4 md:grid-cols-3">
                <Campo rotulo="Descrição">{e.descricao || <Vazio />}</Campo>
                <Campo rotulo="Unidade de medida">{e.unidadeMedida || <Vazio />}</Campo>
                <Campo rotulo="Comportamento">
                  {comp ? (
                    <>
                      {COMPORTAMENTOS.find((c) => c.id === comp)?.nome}
                      {!e.comportamentoValidado && (
                        <Chip tom="alerta" className="ml-2">
                          não validado
                        </Chip>
                      )}
                    </>
                  ) : (
                    <Vazio />
                  )}
                </Campo>
                <div className="md:col-span-2">
                  <Campo rotulo="Metas">
                    <div className="flex gap-4 tabular-nums">
                      {ANOS.map((a) => (
                        <span key={a}>
                          <span className="text-xs text-muted-foreground">{a} </span>
                          {e.metas[a] ?? "—"}
                        </span>
                      ))}
                    </div>
                  </Campo>
                </div>
                <Campo rotulo="Território">
                  {e.territorio.tipo ? (
                    <>
                      {TERRITORIO_LABEL[e.territorio.tipo]}
                      {e.territorio.regioes.length > 0 && (
                        <span className="block text-xs text-muted-foreground">
                          {e.territorio.regioes.join(", ")}
                        </span>
                      )}
                    </>
                  ) : (
                    <Vazio />
                  )}
                </Campo>
                <div className="md:col-span-3">
                  <Campo rotulo="Projetos GOMAP e recursos">
                    {projs.length === 0 ? (
                      <span className="text-muted-foreground">
                        {e.gomap === "nao" ? "Entrega não viabilizada por Projeto GOMAP" : "Nenhum Projeto associado"}
                      </span>
                    ) : (
                      <ul className="space-y-1">
                        {projs.map((p) => (
                          <li key={p.id} className="text-sm">
                            <span className="font-mono text-xs text-muted-foreground">{p.codigo}</span> {p.nome}
                            <span className="ml-2 text-xs text-muted-foreground">
                              {p.orgao} · {p.situacao}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-1 text-xs text-muted-foreground">
                      Financeiro derivado das Ações: {moeda(recursosDaEntrega(state, e.id))}
                    </div>
                  </Campo>
                </div>
              </div>
            </Secao>
          );
        })}

        <Secao titulo="Apontamentos registrados">
          {abertos.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhum apontamento em aberto.</p>
          ) : (
            <ul className="space-y-2">
              {abertos.map((c) => {
                const ent = entregas.find((e) => e.id === c.alvoId);
                return (
                  <li key={c.id} className="border-b pb-2 text-sm last:border-0">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {ent ? `Entrega “${ent.nome}”` : "Iniciativa"} · {c.campo} · {c.autor} · {c.criadoEm}
                    </div>
                    {c.texto}
                  </li>
                );
              })}
            </ul>
          )}
        </Secao>

        <Secao titulo="Histórico">
          <ul className="space-y-1.5 text-sm">
            {eventos.map((ev) => (
              <li key={ev.id} className="flex gap-3">
                <span className="w-24 shrink-0 text-xs text-muted-foreground">{ev.quando}</span>
                <span>
                  {ev.texto} <span className="text-xs text-muted-foreground">— {ev.autor}</span>
                </span>
              </li>
            ))}
          </ul>
        </Secao>
      </div>

      <Dialog open={!!novo} onOpenChange={(v) => !v && setNovo(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">Registrar apontamento</DialogTitle>
            <DialogDescription className="text-xs">
              O apontamento fica vinculado ao campo e será exibido ao órgão em caso de devolução.
            </DialogDescription>
          </DialogHeader>
          {novo?.alvoTipo === "entrega" && (
            <div>
              <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">Campo</div>
              <Select value={novo.campo} onValueChange={(v) => setNovo({ ...novo, campo: v })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CAMPOS_ENTREGA.map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {novo?.alvoTipo === "iniciativa" && (
            <div>
              <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">Campo</div>
              <Input
                value={novo.campo}
                onChange={(ev) => setNovo({ ...novo, campo: ev.target.value })}
                className="h-8 text-xs"
              />
            </div>
          )}
          <Textarea
            value={texto}
            onChange={(ev) => setTexto(ev.target.value)}
            rows={4}
            placeholder="Descreva o ajuste necessário."
            className="text-sm"
          />
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setNovo(null)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs"
              disabled={!texto.trim()}
              onClick={() => {
                if (!novo) return;
                addComentario({ ...novo, texto: texto.trim(), autor: state.analista });
                setTexto("");
                setNovo(null);
              }}
            >
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmar} onOpenChange={(v) => !v && setConfirmar(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {confirmar === "devolver" ? "Devolver Iniciativa para ajuste" : "Validar Iniciativa"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {confirmar === "devolver"
                ? `A Iniciativa volta a ser editável pelo órgão com ${abertos.length} apontamento(s) em aberto.`
                : `A Iniciativa passa a ${STATUS_LABEL.validada} e deixa de ser editável pelo órgão.`}
            </DialogDescription>
          </DialogHeader>
          {confirmar === "devolver" && abertos.length === 0 && (
            <p className="rounded-md bg-warn-soft p-2 text-xs text-warn">
              Nenhum apontamento registrado. Recomenda-se registrar ao menos um antes de devolver.
            </p>
          )}
          {confirmar === "validar" && r.impeditivos > 0 && (
            <p className="rounded-md bg-danger-soft p-2 text-xs text-danger">
              A Iniciativa ainda possui {r.impeditivos} pendência(s) impeditiva(s).
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setConfirmar(null)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                if (confirmar === "devolver") devolver(ini.id);
                else validar(ini.id);
                setConfirmar(null);
                void navigate({ to: "/central" });
              }}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Vazio() {
  return <span className="text-muted-foreground">não informado</span>;
}
