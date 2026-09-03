import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/ppa/shell";
import { Chip, Secao } from "@/components/ppa/ui";
import { OrcamentoPanel, ProjetosPanel } from "@/components/ppa/gomap";
import { QuadroFinanceiro } from "@/components/ppa/financeiro";
import { linhasDaEntrega } from "@/lib/ppa/financeiro";
import { ANOS, PROGRAMAS, REGIOES, UNIDADES } from "@/lib/ppa/seed";
import { usePpa } from "@/lib/ppa/store";
import {
  COMPORTAMENTOS,
  STATUS_LABEL,
  TERRITORIO_LABEL,
  pendenciasEntrega,
  podeEditar,
  situacaoEntrega,
} from "@/lib/ppa/regras";
import type { Comportamento, TipoTerritorio } from "@/lib/ppa/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/entrega/$id")({
  head: () => ({
    meta: [
      { title: "Entrega — PPA 2028–2031 Goiás" },
      {
        name: "description",
        content:
          "Edição da Entrega: informações, metas anuais, comportamento, territorialização, Projetos GOMAP e apropriação de IPOF.",
      },
      { property: "og:title", content: "Entrega — PPA 2028–2031" },
      { property: "og:description", content: "Todos os atributos da Entrega em uma tela única." },
    ],
  }),
  component: EntregaPage,
});

function EntregaPage() {
  const { id } = Route.useParams();
  const { state, updEntrega } = usePpa();
  const e = state.entregas.find((x) => x.id === id);
  if (!e) throw notFound();
  const ini = state.iniciativas.find((i) => i.id === e.iniciativaId)!;
  const programa = PROGRAMAS.find((p) => p.id === ini.programaId)!;
  const editavel = podeEditar(ini.status);
  const s = situacaoEntrega(state, e);
  const pend = pendenciasEntrega(state, e);
  const comentarios = state.comentarios.filter((c) => c.alvoTipo === "entrega" && c.alvoId === e.id && !c.resolvido);
  const comp = e.comportamento ?? e.comportamentoSugerido;

  const comentarioDe = (campo: string) => comentarios.filter((c) => c.campo === campo);

  const Apontamento = ({ campo }: { campo: string }) => {
    const cs = comentarioDe(campo);
    if (cs.length === 0) return null;
    return (
      <div className="mt-2 rounded-md border border-warn/40 bg-warn-soft p-2 text-xs text-warn">
        {cs.map((c) => (
          <div key={c.id}>
            <span className="font-medium">{c.autor}:</span> {c.texto}
          </div>
        ))}
      </div>
    );
  };

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
        ›{" "}
        <Link to="/iniciativa/$id" params={{ id: ini.id }} className="hover:underline">
          {ini.nome}
        </Link>{" "}
        › Entrega
      </nav>

      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{e.nome || "Nova Entrega"}</h1>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Chip tom={s.tom === "ok" ? "ok" : s.tom === "alerta" ? "alerta" : "impeditivo"}>{s.texto}</Chip>
            {!editavel && <span>Edição bloqueada — Iniciativa {STATUS_LABEL[ini.status]}</span>}
          </div>
        </div>
        <Button asChild size="sm" variant="outline" className="h-8 text-xs">
          <Link to="/iniciativa/$id" params={{ id: ini.id }}>
            Voltar à Iniciativa
          </Link>
        </Button>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <div id="nome" className="lg:col-span-2 scroll-mt-20">
          <Secao titulo="Informações da Entrega">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <Rot>Nome</Rot>
                <Input
                  value={e.nome}
                  disabled={!editavel}
                  onChange={(ev) => updEntrega(e.id, { nome: ev.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <Rot>Descrição</Rot>
                <Textarea
                  value={e.descricao}
                  rows={2}
                  disabled={!editavel}
                  onChange={(ev) => updEntrega(e.id, { descricao: ev.target.value })}
                  className="text-sm"
                />
              </div>
              <div id="unidade" className="scroll-mt-20">
                <Rot>Unidade de medida</Rot>
                <Select
                  value={e.unidadeMedida ? e.unidadeMedida : ""}
                  disabled={!editavel}
                  onValueChange={(v) => updEntrega(e.id, { unidadeMedida: v })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIDADES.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Apontamento campo="unidade" />
              </div>
              <div id="comprovacao" className="scroll-mt-20">
                <Rot>Método de comprovação</Rot>
                <Input
                  value={e.metodoComprovacao}
                  disabled={!editavel}
                  onChange={(ev) => updEntrega(e.id, { metodoComprovacao: ev.target.value })}
                  className="h-8 text-sm"
                />
                <Apontamento campo="comprovacao" />
              </div>
            </div>
          </Secao>
        </div>

        <div id="metas" className="scroll-mt-20">
          <Secao titulo="Metas">
            <div className="grid grid-cols-4 gap-2">
              {ANOS.map((a) => (
                <div key={a}>
                  <Rot>{a}</Rot>
                  <Input
                    type="number"
                    value={e.metas[a] ?? ""}
                    placeholder="não informado"
                    disabled={!editavel}
                    onChange={(ev) =>
                      updEntrega(e.id, {
                        metas: { ...e.metas, [a]: ev.target.value === "" ? null : Number(ev.target.value) },
                      })
                    }
                    className="h-8 text-right text-sm tabular-nums"
                  />
                  {e.metas[a] === 0 && <div className="mt-1 text-[11px] text-muted-foreground">zero intencional</div>}
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Campo vazio significa “não informado”. Para indicar ausência de execução no ano, registre 0.
            </p>
            <Apontamento campo="metas" />

            <div id="comportamento" className="mt-4 scroll-mt-20 border-t pt-3">
              <Rot>Comportamento da meta</Rot>
              <div className="space-y-1.5">
                {COMPORTAMENTOS.map((c) => (
                  <label key={c.id} className="flex items-start gap-2 text-sm">
                    <input
                      type="radio"
                      name="comportamento"
                      className="mt-1"
                      disabled={!editavel}
                      checked={comp === c.id}
                      onChange={() => updEntrega(e.id, { comportamento: c.id as Comportamento })}
                    />
                    <span>
                      {c.nome}
                      {e.comportamentoSugerido === c.id && !e.comportamentoValidado && (
                        <Chip tom="info" className="ml-2">
                          sugerido
                        </Chip>
                      )}
                      <span className="block text-[11px] text-muted-foreground">{c.ajuda}</span>
                    </span>
                  </label>
                ))}
              </div>
              <label className="mt-2 flex items-center gap-2 text-xs">
                <Checkbox
                  checked={e.comportamentoValidado}
                  disabled={!editavel || !comp}
                  onCheckedChange={(v) =>
                    updEntrega(e.id, { comportamentoValidado: !!v, comportamento: comp as Comportamento })
                  }
                />
                Classificação validada pelo órgão
              </label>
              <Apontamento campo="comportamento" />
            </div>
          </Secao>
        </div>

        <div id="territorio" className="scroll-mt-20">
          <Secao titulo="Territorialização">
            <Rot>Como esta Entrega se relaciona com o território?</Rot>
            <div className="space-y-1.5">
              {(["estadual", "territorializavel", "nao_territorializavel"] as TipoTerritorio[]).map((t) => (
                <label key={t} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="territorio"
                    disabled={!editavel}
                    checked={e.territorio.tipo === t}
                    onChange={() => updEntrega(e.id, { territorio: { tipo: t, regioes: t === "territorializavel" ? e.territorio.regioes : [] } })}
                  />
                  {TERRITORIO_LABEL[t]}
                </label>
              ))}
            </div>
            {e.territorio.tipo === "territorializavel" && (
              <div className="mt-3 border-t pt-3">
                <Rot>Regiões de planejamento</Rot>
                <div className="grid grid-cols-2 gap-1.5">
                  {REGIOES.map((r) => (
                    <label key={r} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={e.territorio.regioes.includes(r)}
                        disabled={!editavel}
                        onCheckedChange={() =>
                          updEntrega(e.id, {
                            territorio: {
                              tipo: "territorializavel",
                              regioes: e.territorio.regioes.includes(r)
                                ? e.territorio.regioes.filter((x) => x !== r)
                                : [...e.territorio.regioes, r],
                            },
                          })
                        }
                      />
                      {r}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <Apontamento campo="territorio" />
          </Secao>
        </div>

        <div id="projetos" className="lg:col-span-2 scroll-mt-20">
          <Secao titulo="Projetos GOMAP associados">
            <ProjetosPanel entregaId={e.id} editavel={editavel} />
            <Apontamento campo="projetos" />
          </Secao>
        </div>

        <div id="recursos" className="lg:col-span-2 scroll-mt-20">
          <Secao titulo="Vinculação orçamentária (Ações da LOA)">
            <OrcamentoPanel entregaId={e.id} editavel={editavel} />
            <Apontamento campo="orcamento" />
          </Secao>
        </div>

        <div id="previsao" className="lg:col-span-2 scroll-mt-20">
          <Secao titulo="Previsão financeira da Entrega">
            <p className="mb-2 text-xs text-muted-foreground">
              Quadro derivado automaticamente das Ações Orçamentárias vinculadas e das parcelas de IPOF do SIAFIC.
              Expanda a fonte para ver os IPOFs que a compõem.
            </p>
            <QuadroFinanceiro
              linhas={linhasDaEntrega(state, e.id)}
              dimensao="fonte"
              detalhe="ipof"
              vazio="Sem Ação Orçamentária vinculada, a Entrega não possui financeiro no PPA."
            />
          </Secao>
        </div>

        <div className="lg:col-span-2">
          <Secao titulo="Pendências desta Entrega">
            {pend.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhuma pendência.</p>
            ) : (
              <ul className="space-y-1.5">
                {pend.map((p, i) => (
                  <li key={i} className="flex items-center gap-2 border-b pb-1.5 text-sm last:border-0">
                    <Chip tom={p.nivel === "impeditivo" ? "impeditivo" : p.nivel === "alerta" ? "alerta" : "info"}>
                      {p.nivel}
                    </Chip>
                    <a href={`#${p.campo}`} className="hover:underline">
                      {p.texto}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Secao>
        </div>
      </div>
    </AppShell>
  );
}

function Rot({ children }: { children: React.ReactNode }) {
  return <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{children}</div>;
}
