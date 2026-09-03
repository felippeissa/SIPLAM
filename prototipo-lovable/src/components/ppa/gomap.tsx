import { Fragment, useState } from "react";
import { ChevronRight } from "lucide-react";
import { ANOS, PROJETOS } from "@/lib/ppa/seed";
import { usePpa } from "@/lib/ppa/store";
import { moeda, moedaCurta, projetosDaEntrega } from "@/lib/ppa/regras";
import {
  acoesDaEntrega,
  acoesDoOrgao,
  linhasDaEntrega,
  parcelasDaAcao,
  projetosFinanciadoresDaEntrega,
  quadro,
  totalDaAcao,
} from "@/lib/ppa/financeiro";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Chip } from "./ui";
import { QuadroFinanceiro } from "./financeiro";

/** Bloco — Projetos GOMAP associados à Entrega: como a Entrega é produzida. */
export function ProjetosPanel({ entregaId, editavel }: { entregaId: string; editavel: boolean }) {
  const { state, toggleProjeto } = usePpa();
  const entrega = state.entregas.find((e) => e.id === entregaId)!;
  const ini = state.iniciativas.find((i) => i.id === entrega.iniciativaId)!;
  const vinculados = projetosDaEntrega(state, entregaId);
  const financiadores = projetosFinanciadoresDaEntrega(state, entregaId);
  const [seletor, setSeletor] = useState(false);

  const disponiveis = PROJETOS.filter((p) => p.orgao === ini.orgao || vinculados.some((v) => v.id === p.id));
  const noPpa = (projetoId: string) =>
    linhasDaEntrega(state, entregaId)
      .filter((l) => l.projeto?.id === projetoId)
      .reduce((s, l) => s + l.total, 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          O Projeto GOMAP descreve <strong>como</strong> a Entrega é produzida. Ele não define o valor financeiro da
          Entrega — isso vem das Ações Orçamentárias.
        </span>
        {editavel && (
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSeletor((v) => !v)}>
            {seletor ? "Fechar seleção" : "Associar Projeto"}
          </Button>
        )}
      </div>

      {seletor && (
        <div className="rounded-md border p-3">
          <div className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">Projetos do órgão no GOMAP</div>
          <div className="space-y-1.5">
            {disponiveis.map((p) => (
              <label key={p.id} className="flex items-start gap-2 text-sm">
                <Checkbox
                  checked={vinculados.some((v) => v.id === p.id)}
                  onCheckedChange={() => toggleProjeto(entregaId, p.id)}
                  className="mt-0.5"
                />
                <span>
                  <span className="font-mono text-xs text-muted-foreground">{p.codigo}</span> {p.nome}
                  <span className="block text-[11px] text-muted-foreground">
                    {p.situacao} · {p.fase} · execução {p.execucao}% · valor global {moedaCurta(p.valorGlobal)}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {vinculados.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhum Projeto GOMAP associado a esta Entrega.</p>
      ) : (
        <div className="space-y-2">
          {vinculados.map((p) => {
            const refletido = noPpa(p.id);
            return (
              <div key={p.id} className="flex flex-wrap items-start justify-between gap-2 rounded-md border px-3 py-2">
                <div>
                  <div className="text-sm font-medium">
                    <span className="font-mono text-xs text-muted-foreground">{p.codigo}</span> {p.nome}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {p.orgao} · {p.situacao} · {p.fase} · execução {p.execucao}% · conclusão prevista {p.conclusaoPrevista} ·
                    atualizado em {p.ultimaAtualizacao}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Chip tom="neutro">valor global GOMAP {moedaCurta(p.valorGlobal)}</Chip>
                    <Chip tom={refletido > 0 ? "info" : "alerta"}>
                      {refletido > 0
                        ? `${moedaCurta(refletido)} refletidos nesta Entrega via Ações`
                        : "nenhuma Ação deste Projeto vinculada"}
                    </Chip>
                  </div>
                </div>
                {editavel && (
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toggleProjeto(entregaId, p.id)}>
                    Desvincular
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {financiadores.some((f) => !vinculados.some((v) => v.id === f.id)) && (
        <p className="text-[11px] text-muted-foreground">
          Projetos alcançados pelo financiamento, mas não associados:{" "}
          {financiadores
            .filter((f) => !vinculados.some((v) => v.id === f.id))
            .map((f) => f.codigo)
            .join(", ")}
          .
        </p>
      )}
    </div>
  );
}

/** Bloco — Vinculação orçamentária: quais Ações da LOA financiam esta Entrega. */
export function OrcamentoPanel({ entregaId, editavel }: { entregaId: string; editavel: boolean }) {
  const { state, toggleAcao } = usePpa();
  const entrega = state.entregas.find((e) => e.id === entregaId)!;
  const ini = state.iniciativas.find((i) => i.id === entrega.iniciativaId)!;
  const vinculadas = acoesDaEntrega(state, entregaId);
  const catalogo = acoesDoOrgao(state, ini.orgao);
  const linhas = linhasDaEntrega(state, entregaId);
  const [seletor, setSeletor] = useState(false);
  const [abertas, setAbertas] = useState<string[]>([]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          Uma Ação Orçamentária financia <strong>uma única Entrega</strong> do PPA. Todo o financeiro abaixo é derivado
          automaticamente do SIAFIC — nada é digitado.
        </span>
        {editavel && (
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSeletor((v) => !v)}>
            {seletor ? "Fechar seleção" : "Vincular Ação"}
          </Button>
        )}
      </div>

      {seletor && (
        <div className="rounded-md border p-3">
          <div className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">Ações da LOA do órgão</div>
          <ul className="space-y-1.5">
            {catalogo.map(({ acao, total, entregaId: usada }) => {
              const daEntrega = usada === entregaId;
              const bloqueada = !!usada && !daEntrega;
              const outra = bloqueada ? state.entregas.find((e) => e.id === usada) : null;
              return (
                <li key={acao.id} className="flex items-start gap-2 border-b pb-1.5 text-sm last:border-0">
                  <Checkbox
                    checked={daEntrega}
                    disabled={bloqueada}
                    onCheckedChange={() => toggleAcao(entregaId, acao.id)}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="font-mono text-xs text-muted-foreground">{acao.codigo}</span> {acao.nome}
                    <span className="block text-[11px] text-muted-foreground">
                      {moedaCurta(total)} programados no SIAFIC
                      {bloqueada ? ` · já financia a Entrega "${outra?.nome ?? "outra"}"` : ""}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {vinculadas.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Nenhuma Ação Orçamentária vinculada. Sem vínculo, esta Entrega não possui valor financeiro no PPA.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-1.5 font-medium">Ação Orçamentária</th>
                {ANOS.map((a) => (
                  <th key={a} className="w-28 px-3 py-1.5 text-right font-medium">
                    {a}
                  </th>
                ))}
                <th className="w-32 px-3 py-1.5 text-right font-medium">Total</th>
                {editavel && <th className="w-24 px-2 py-1.5" />}
              </tr>
            </thead>
            <tbody>
              {vinculadas.map((acao) => {
                const daAcao = linhas.filter((l) => l.acao.id === acao.id);
                const aberta = abertas.includes(acao.id);
                return (
                  <Fragment key={acao.id}>
                    <tr className="border-b last:border-0">
                      <td className="px-3 py-2">
                        <button
                          onClick={() =>
                            setAbertas((a) => (a.includes(acao.id) ? a.filter((x) => x !== acao.id) : [...a, acao.id]))
                          }
                          className="flex items-start gap-1.5 text-left hover:underline"
                        >
                          <ChevronRight className={cn("mt-0.5 h-3.5 w-3.5 shrink-0 transition-transform", aberta && "rotate-90")} />
                          <span>
                            <span className="font-mono text-xs text-muted-foreground">{acao.codigo}</span> {acao.nome}
                            <span className="block text-[11px] text-muted-foreground">
                              {parcelasDaAcao(acao.id).length} parcela(s) em{" "}
                              {new Set(parcelasDaAcao(acao.id).map((p) => p.ipof.id)).size} IPOF(s)
                            </span>
                          </span>
                        </button>
                      </td>
                      {ANOS.map((ano) => {
                        const v = daAcao.reduce((s, l) => s + (l.anos[ano] ?? 0), 0);
                        return (
                          <td key={ano} className="px-3 py-2 text-right tabular-nums">
                            {v ? moedaCurta(v) : <span className="text-muted-foreground">—</span>}
                          </td>
                        );
                      })}
                      <td className="px-3 py-2 text-right font-medium tabular-nums">{moedaCurta(totalDaAcao(acao.id))}</td>
                      {editavel && (
                        <td className="px-2 py-2 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-[11px]"
                            onClick={() => toggleAcao(entregaId, acao.id)}
                          >
                            desvincular
                          </Button>
                        </td>
                      )}
                    </tr>
                    {aberta &&
                      daAcao.map((l) => (
                        <tr key={l.id} className="border-b bg-muted/20 text-xs last:border-0">
                          <td className="py-1.5 pl-10 pr-3 text-muted-foreground">
                            {l.ipof.codigo} — {l.ipof.nome}
                            <span className="block">
                              {l.fonte} · {l.classificacao} · {l.projeto ? l.projeto.codigo : "sem Projeto"}
                            </span>
                          </td>
                          {ANOS.map((ano) => (
                            <td key={ano} className="px-3 py-1.5 text-right tabular-nums text-muted-foreground">
                              {l.anos[ano] ? moedaCurta(l.anos[ano]!) : "—"}
                            </td>
                          ))}
                          <td className="px-3 py-1.5 text-right tabular-nums text-muted-foreground">{moedaCurta(l.total)}</td>
                          {editavel && <td />}
                        </tr>
                      ))}
                  </Fragment>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t bg-muted/30 text-xs">
                <td className="px-3 py-2 font-medium">Total da Entrega</td>
                {ANOS.map((ano) => (
                  <td key={ano} className="px-3 py-2 text-right font-medium tabular-nums">
                    {moedaCurta(linhas.reduce((s, l) => s + (l.anos[ano] ?? 0), 0))}
                  </td>
                ))}
                <td className="px-3 py-2 text-right font-medium tabular-nums">
                  {moeda(linhas.reduce((s, l) => s + l.total, 0))}
                </td>
                {editavel && <td />}
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {linhas.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Financeiro por fonte de recursos</div>
          <QuadroFinanceiro linhas={linhas} dimensao="fonte" detalhe="ipof" />
          <p className="text-[11px] text-muted-foreground">
            Valores consolidados automaticamente a partir das parcelas dos IPOFs. Um IPOF pode conter mais de uma fonte e
            mais de uma Ação. {quadro(linhas, "ipof").linhas.length} IPOF(s) identificado(s).
          </p>
        </div>
      )}
    </div>
  );
}
