import { useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { MoreVertical, Plus } from "lucide-react";
import { AppShell } from "@/components/ppa/shell";
import { Campo, Chip, Secao, StatusChip } from "@/components/ppa/ui";
import { BotaoDocumento } from "@/components/ppa/documento";
import { QuadroFinanceiro } from "@/components/ppa/financeiro";
import { linhasDaIniciativa } from "@/lib/ppa/financeiro";
import { PROGRAMAS, ANOS } from "@/lib/ppa/seed";
import { usePpa } from "@/lib/ppa/store";
import {
  STATUS_LABEL,
  TERRITORIO_LABEL,
  comentariosDaIniciativa,
  entregasDaIniciativa,
  moedaCurta,
  pendenciasIniciativa,
  podeEditar,
  projetosDaEntrega,
  recursosDaEntrega,
  resumoPendencias,
  situacaoEntrega,
} from "@/lib/ppa/regras";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/iniciativa/$id")({
  head: () => ({
    meta: [
      { title: "Iniciativa do órgão — PPA 2028–2031" },
      {
        name: "description",
        content:
          "Tela da Iniciativa: dados próprios, causas relacionadas, tabela de Entregas, pendências e envio para análise da Área Central.",
      },
      { property: "og:title", content: "Iniciativa — PPA 2028–2031" },
      { property: "og:description", content: "Trabalhe as Entregas da Iniciativa em uma tabela única." },
    ],
  }),
  component: IniciativaPage,
});

function IniciativaPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { state, updIniciativa, addEntrega, removeEntrega, enviar } = usePpa();
  const ini = state.iniciativas.find((i) => i.id === id);
  if (!ini) throw notFound();
  const programa = PROGRAMAS.find((p) => p.id === ini.programaId)!;
  const entregas = entregasDaIniciativa(state, ini.id);
  const editavel = podeEditar(ini.status);
  const pend = pendenciasIniciativa(state, ini);
  const r = resumoPendencias(pend);
  const apont = comentariosDaIniciativa(state, ini.id).filter((c) => !c.resolvido);
  const eventos = state.eventos.filter((e) => e.iniciativaId === ini.id);
  const [envio, setEnvio] = useState(false);
  const [novaEntrega, setNovaEntrega] = useState("");

  const toggleCausa = (cid: string) =>
    updIniciativa(ini.id, {
      causas: ini.causas.includes(cid) ? ini.causas.filter((x) => x !== cid) : [...ini.causas, cid],
    });

  return (
    <AppShell>
      <nav className="mb-3 text-xs text-muted-foreground">
        <Link to="/" className="hover:underline">
          Programas
        </Link>{" "}
        ›{" "}
        <Link to="/programa/$id" params={{ id: programa.id }} className="hover:underline">
          {programa.codigo} — {programa.nome}
        </Link>{" "}
        › Iniciativa
      </nav>

      <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{ini.nome}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{ini.orgao}</span>
            <span>·</span>
            <StatusChip status={ini.status} />
            {ini.analista && <span>analista: {ini.analista}</span>}
            <span>· versão {ini.versao}</span>
            <span>· atualizada em {ini.atualizadoEm}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <BotaoDocumento rotulo="Gerar PDF da Iniciativa" titulo={`Iniciativa — ${ini.nome}`}>
            <p className="text-xs text-muted-foreground">
              {programa.codigo} — {programa.nome} · {ini.orgao} · {STATUS_LABEL[ini.status]}
            </p>
            <p>{ini.descricao}</p>
            <h4 className="font-medium">Entregas</h4>
            <ul className="list-disc space-y-1 pl-5">
              {entregas.map((e) => (
                <li key={e.id}>
                  {e.nome} — {e.unidadeMedida || "unidade não informada"} · metas{" "}
                  {ANOS.map((a) => e.metas[a] ?? "—").join(" / ")}
                </li>
              ))}
            </ul>
          </BotaoDocumento>
          {editavel && (
            <Button size="sm" className="h-8 text-xs" onClick={() => setEnvio(true)}>
              Enviar para análise
            </Button>
          )}
        </div>
      </header>

      {ini.status === "devolvida" && apont.length > 0 && (
        <div className="mb-4 rounded-md border border-warn/40 bg-warn-soft p-4">
          <div className="mb-2 flex items-center gap-2">
            <Chip tom="alerta">Devolvida para ajuste</Chip>
            <span className="text-xs text-warn">
              {apont.length} apontamento{apont.length > 1 ? "s" : ""} da Área Central
            </span>
          </div>
          <ul className="space-y-2">
            {apont.map((c) => {
              const ent = state.entregas.find((e) => e.id === c.alvoId);
              return (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-warn/20 pt-2 text-sm">
                  <span>
                    <span className="text-xs text-muted-foreground">
                      {c.alvoTipo === "entrega" ? `Entrega “${ent?.nome}”` : "Iniciativa"}
                      {c.campo ? ` · ${c.campo}` : ""} · {c.autor}, {c.criadoEm}:{" "}
                    </span>
                    {c.texto}
                  </span>
                  {c.alvoTipo === "entrega" && ent && (
                    <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                      <Link to="/entrega/$id" params={{ id: ent.id }} hash={c.campo ?? ""}>
                        Ir ao ponto
                      </Link>
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Secao titulo="Dados da Iniciativa">
          <div className="space-y-3">
            <div>
              <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Nome</div>
              <Input
                value={ini.nome}
                disabled={!editavel}
                onChange={(e) => updIniciativa(ini.id, { nome: e.target.value })}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Detalhamento
              </div>
              <Textarea
                value={ini.descricao}
                disabled={!editavel}
                rows={3}
                onChange={(e) => updIniciativa(ini.id, { descricao: e.target.value })}
                className="text-sm"
              />
            </div>
            <div>
              <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Público-alvo
              </div>
              <Input
                value={ini.publicoAlvo}
                disabled={!editavel}
                onChange={(e) => updIniciativa(ini.id, { publicoAlvo: e.target.value })}
                className="h-8 text-sm"
              />
            </div>
          </div>
        </Secao>

        <Secao titulo="Causas do Programa enfrentadas" acao={<span className="text-[11px] text-muted-foreground">id: causas</span>}>
          <div className="space-y-2" id="causas">
            {programa.causas.map((c) => (
              <div key={c.id}>
                <label className="flex items-start gap-2 text-sm">
                  <Checkbox
                    checked={ini.causas.includes(c.id)}
                    disabled={!editavel}
                    onCheckedChange={() => toggleCausa(c.id)}
                    className="mt-0.5"
                  />
                  <span>{c.texto}</span>
                </label>
                {c.subcausas.length > 0 && (
                  <div className="ml-6 mt-1 space-y-1">
                    {c.subcausas.map((s) => (
                      <label key={s.id} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Checkbox
                          checked={ini.causas.includes(s.id)}
                          disabled={!editavel}
                          onCheckedChange={() => toggleCausa(s.id)}
                          className="mt-0.5"
                        />
                        <span>{s.texto}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Secao>
      </div>

      <div className="mt-4">
        <Secao
          titulo="Entregas"
          acao={
            editavel ? (
              <div className="flex items-center gap-2">
                <Input
                  value={novaEntrega}
                  onChange={(e) => setNovaEntrega(e.target.value)}
                  placeholder="Nome da nova Entrega"
                  className="h-7 w-72 text-xs"
                />
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  disabled={!novaEntrega.trim()}
                  onClick={() => {
                    const novoId = addEntrega(ini.id, novaEntrega.trim());
                    setNovaEntrega("");
                    navigate({ to: "/entrega/$id", params: { id: novoId } });
                  }}
                >
                  <Plus className="mr-1 h-3 w-3" /> Nova Entrega
                </Button>
              </div>
            ) : (
              <span className="text-[11px] text-muted-foreground">Edição bloqueada — {STATUS_LABEL[ini.status]}</span>
            )
          }
        >
          {entregas.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhuma Entrega cadastrada nesta Iniciativa.</p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-1.5 font-medium">Entrega</th>
                  <th className="w-36 py-1.5 font-medium">Unidade</th>
                  <th className="w-28 py-1.5 font-medium">Metas</th>
                  <th className="w-44 py-1.5 font-medium">Territorialização</th>
                  <th className="w-20 py-1.5 text-right font-medium">Projetos</th>
                  <th className="w-32 py-1.5 text-right font-medium">Recursos</th>
                  <th className="w-44 py-1.5 font-medium">Situação</th>
                  <th className="w-36 py-1.5 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {entregas.map((e) => {
                  const s = situacaoEntrega(state, e);
                  const metasOk = ANOS.every((a) => e.metas[a] !== null && e.metas[a] !== undefined);
                  const projs = projetosDaEntrega(state, e.id).length;
                  const rec = recursosDaEntrega(state, e.id);
                  return (
                    <tr key={e.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-2 pr-3">
                        <Link to="/entrega/$id" params={{ id: e.id }} className="font-medium hover:underline">
                          {e.nome}
                        </Link>
                      </td>
                      <td className="py-2 pr-3 text-xs">{e.unidadeMedida || <span className="text-muted-foreground">—</span>}</td>
                      <td className="py-2 pr-3 text-xs">{metasOk ? "Definidas" : "Pendente"}</td>
                      <td className="py-2 pr-3 text-xs">
                        {e.territorio.tipo
                          ? e.territorio.tipo === "territorializavel"
                            ? e.territorio.regioes.length > 0
                              ? `${e.territorio.regioes.length} regiões`
                              : "Regiões pendentes"
                            : TERRITORIO_LABEL[e.territorio.tipo]
                          : "Não informada"}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums">{projs}</td>
                      <td className="py-2 pr-3 text-right tabular-nums text-xs">
                        {rec > 0 ? moedaCurta(rec) : "—"}
                      </td>
                      <td className="py-2 pr-3">
                        <Chip tom={s.tom === "ok" ? "ok" : s.tom === "alerta" ? "alerta" : "impeditivo"}>{s.texto}</Chip>
                      </td>
                      <td className="py-2">
                        <div className="flex items-center gap-1.5">
                          <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                            <Link to="/entrega/$id" params={{ id: e.id }}>
                              {editavel ? "Editar" : "Visualizar"}
                            </Link>
                          </Button>
                          {editavel && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Ações da Entrega">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="text-xs">
                                <DropdownMenuItem
                                  onSelect={() => {
                                    if (confirm(`Excluir a Entrega “${e.nome}”?`)) removeEntrega(e.id);
                                  }}
                                >
                                  Excluir Entrega
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Secao>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <Secao titulo="Previsão financeira da Iniciativa">
            <p className="mb-2 text-xs text-muted-foreground">
              Consolidação automática do financeiro das Entregas desta Iniciativa, por fonte de recursos. Nunca soma o
              valor integral de Projetos GOMAP.
            </p>
            <QuadroFinanceiro
              linhas={linhasDaIniciativa(state, ini.id)}
              dimensao="fonte"
              detalhe="entrega"
              vazio="Nenhuma Ação Orçamentária vinculada às Entregas desta Iniciativa."
            />
          </Secao>
        </div>
        <Secao titulo="Pendências da Iniciativa">
          <div className="mb-3 flex gap-2">
            <Chip tom="impeditivo">{r.impeditivos} impeditivas</Chip>
            <Chip tom="alerta">{r.alertas} alertas</Chip>
            <Chip tom="info">{r.informacoes} informações</Chip>
          </div>
          {pend.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhuma pendência registrada.</p>
          ) : (
            <ul className="space-y-1.5">
              {pend.map((p, idx) => {
                const ent = p.entregaId ? state.entregas.find((e) => e.id === p.entregaId) : null;
                return (
                  <li key={idx} className="flex items-center justify-between gap-3 border-b pb-1.5 text-sm last:border-0">
                    <span>
                      <Chip tom={p.nivel === "impeditivo" ? "impeditivo" : p.nivel === "alerta" ? "alerta" : "info"}>
                        {p.nivel}
                      </Chip>{" "}
                      {ent && <span className="text-xs text-muted-foreground">{ent.nome} · </span>}
                      {p.texto}
                    </span>
                    {ent && (
                      <Link
                        to="/entrega/$id"
                        params={{ id: ent.id }}
                        hash={p.campo}
                        className="shrink-0 text-xs text-primary underline underline-offset-4"
                      >
                        ir ao campo
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Secao>

        <Secao titulo="Histórico">
          <ul className="space-y-2">
            {eventos.length === 0 && <li className="text-xs text-muted-foreground">Sem registros.</li>}
            {eventos.map((e) => (
              <li key={e.id} className="flex gap-3 text-sm">
                <span className="w-24 shrink-0 text-xs text-muted-foreground">{e.quando}</span>
                <span>
                  {e.texto} <span className="text-xs text-muted-foreground">— {e.autor}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 border-t pt-3">
            <Campo rotulo="Envio">
              {ini.enviadoEm ? `Último envio em ${ini.enviadoEm} (versão ${ini.versao})` : "Ainda não enviada"}
            </Campo>
          </div>
        </Secao>
      </div>

      <Dialog open={envio} onOpenChange={setEnvio}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Enviar Iniciativa para análise</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-xs text-muted-foreground">
              {programa.codigo} — {programa.nome} · {entregas.length} Entrega(s)
            </p>
            {r.impeditivos > 0 ? (
              <div className="rounded-md border border-danger/40 bg-danger-soft p-3">
                <div className="mb-1 font-medium text-danger">
                  {r.impeditivos} pendência(s) impeditiva(s) — o envio está bloqueado
                </div>
                <ul className="list-disc space-y-0.5 pl-5 text-xs text-danger">
                  {pend
                    .filter((p) => p.nivel === "impeditivo")
                    .map((p, i) => (
                      <li key={i}>{p.texto}</li>
                    ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-md border border-ok/40 bg-ok-soft p-3 text-xs text-ok">
                Nenhuma pendência impeditiva. A Iniciativa pode ser enviada.
              </div>
            )}
            {r.alertas > 0 && (
              <div className="rounded-md border border-warn/40 bg-warn-soft p-3">
                <div className="mb-1 text-xs font-medium text-warn">{r.alertas} alerta(s) — não bloqueiam o envio</div>
                <ul className="list-disc space-y-0.5 pl-5 text-xs text-warn">
                  {pend
                    .filter((p) => p.nivel === "alerta")
                    .map((p, i) => (
                      <li key={i}>{p.texto}</li>
                    ))}
                </ul>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Ao confirmar, a versão atual é registrada, o status passa a “Enviada” e a edição pelo órgão fica bloqueada.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setEnvio(false)}>
              Revisar antes
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs"
              disabled={r.impeditivos > 0}
              onClick={() => {
                enviar(ini.id);
                setEnvio(false);
              }}
            >
              Confirmar envio
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
