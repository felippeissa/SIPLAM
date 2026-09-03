import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/ppa/shell";
import { Campo, Secao, StatusChip } from "@/components/ppa/ui";
import { PROGRAMAS } from "@/lib/ppa/seed";
import { usePpa } from "@/lib/ppa/store";
import { entregasDaIniciativa, iniciativasDoOrgao } from "@/lib/ppa/regras";

export const Route = createFileRoute("/programa/$id")({
  head: () => ({
    meta: [
      { title: "Programa do PPA 2028–2031 — dados estruturantes" },
      {
        name: "description",
        content:
          "Consulta somente leitura dos dados estruturantes do Programa: eixo, problema central, evidências, causas, consequências e indicadores.",
      },
      { property: "og:title", content: "Programa do PPA 2028–2031" },
      { property: "og:description", content: "Dados estruturantes definidos pela Área Central." },
    ],
  }),
  component: ProgramaPage,
});

function ProgramaPage() {
  const { id } = Route.useParams();
  const { state } = usePpa();
  const p = PROGRAMAS.find((x) => x.id === id);
  if (!p) throw notFound();
  const inis = iniciativasDoOrgao(state, p.id, state.orgaoAtual);

  return (
    <AppShell>
      <nav className="mb-3 text-xs text-muted-foreground">
        <Link to="/" className="hover:underline">
          Programas
        </Link>{" "}
        › {p.codigo}
      </nav>
      <header className="mb-5">
        <div className="text-xs text-muted-foreground">
          {p.eixo} · Programa {p.codigo} · coordenação: {p.orgaoCoordenador}
        </div>
        <h1 className="text-lg font-semibold tracking-tight">{p.nome}</h1>
        <p className="text-xs text-muted-foreground">Dados definidos pela Área Central — somente leitura.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Secao titulo="Problema central">
          <p>{p.problema}</p>
          <div className="mt-3">
            <Campo rotulo="População afetada">{p.populacaoAfetada}</Campo>
          </div>
          <div className="mt-3">
            <Campo rotulo="Evidências">
              <ul className="list-disc space-y-1 pl-4 text-sm">
                {p.evidencias.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </Campo>
          </div>
        </Secao>

        <Secao titulo="Objetivos e resultado">
          <div className="space-y-3">
            <Campo rotulo="Objetivo estratégico">{p.objetivoEstrategico}</Campo>
            <Campo rotulo="Objetivo do Programa">{p.objetivo}</Campo>
            <Campo rotulo="Resultado esperado">{p.resultadoEsperado}</Campo>
          </div>
        </Secao>

        <Secao titulo="Causas e subcausas">
          <ul className="space-y-2">
            {p.causas.map((c) => (
              <li key={c.id}>
                <div className="text-sm">{c.texto}</div>
                {c.subcausas.length > 0 && (
                  <ul className="ml-4 mt-1 list-disc space-y-0.5 pl-3 text-xs text-muted-foreground">
                    {c.subcausas.map((s) => (
                      <li key={s.id}>{s.texto}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </Secao>

        <Secao titulo="Consequências">
          <ul className="list-disc space-y-1 pl-4">
            {p.consequencias.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Secao>

        <div className="lg:col-span-2">
          <Secao titulo="Indicadores de resultado">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-1.5 font-medium">Indicador</th>
                  <th className="w-40 py-1.5 font-medium">Unidade</th>
                  <th className="w-32 py-1.5 font-medium">Linha de base</th>
                  <th className="w-32 py-1.5 font-medium">Meta 2031</th>
                </tr>
              </thead>
              <tbody>
                {p.indicadores.map((i) => (
                  <tr key={i.nome} className="border-b last:border-0">
                    <td className="py-2">{i.nome}</td>
                    <td className="py-2">{i.unidade}</td>
                    <td className="py-2 tabular-nums">{i.linhaBase}</td>
                    <td className="py-2 tabular-nums">{i.meta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Secao>
        </div>

        <div className="lg:col-span-2">
          <Secao titulo={`Iniciativas de ${state.orgaoAtual} neste Programa`}>
            {inis.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Seu órgão ainda não cadastrou Iniciativas neste Programa.
              </p>
            ) : (
              <table className="w-full border-collapse text-sm">
                <tbody>
                  {inis.map((i) => (
                    <tr key={i.id} className="border-b last:border-0">
                      <td className="py-2">
                        <Link to="/iniciativa/$id" params={{ id: i.id }} className="hover:underline">
                          {i.nome}
                        </Link>
                      </td>
                      <td className="w-56 py-2">
                        <StatusChip status={i.status} />
                      </td>
                      <td className="w-28 py-2 text-right tabular-nums">
                        {entregasDaIniciativa(state, i.id).length} Entregas
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Secao>
        </div>
      </div>
    </AppShell>
  );
}
