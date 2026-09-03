import { useMemo, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Lightbulb, Send } from "lucide-react";
import atenaAvatar from "@/assets/atena.png";
import { usePpa } from "@/lib/ppa/store";
import {
  STATUS_LABEL,
  pendenciasEntrega,
  pendenciasIniciativa,
  programaPorId,
  resumoPendencias,
} from "@/lib/ppa/regras";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Chip } from "./ui";
import { responderAtena, sugestoesAtena } from "@/lib/ppa/atena";

interface Mensagem {
  autor: "atena" | "usuario";
  texto: string;
}

/** Camada contextual de apoio. Nesta versão, respostas simuladas para teste de experiência. */
export function Atena() {
  const [aberta, setAberta] = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [entrada, setEntrada] = useState("");
  const { state } = usePpa();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const contexto = useMemo(() => descreverContexto(state, pathname), [state, pathname]);
  const sugestoes = useMemo(() => sugestoesAtena(state, pathname), [state, pathname]);
  const relevantes = sugestoes.filter((s) => s.nivel >= 2).length;

  const enviar = (texto: string) => {
    const t = texto.trim();
    if (!t) return;
    setMensagens((m) => [
      ...m,
      { autor: "usuario", texto: t },
      { autor: "atena", texto: responderAtena(state, t) ?? responder(t, contexto.titulo) },
    ]);
    setEntrada("");
  };

  return (
    <>
      <button
        onClick={() => setAberta(true)}
        aria-label="Abrir apoio da Atena"
        className="no-print fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border bg-card py-1.5 pl-1.5 pr-4 shadow-lg transition-shadow hover:shadow-xl"
      >
        <img src={atenaAvatar} alt="Atena, assistente do PPA" width={36} height={36} className="h-9 w-9 rounded-full bg-muted object-cover" loading="lazy" />
        <span className="text-xs font-medium">
          {relevantes > 0 ? `${relevantes} observaç${relevantes > 1 ? "ões" : "ão"} da Atena` : "Precisa de ajuda?"}
        </span>
        {relevantes > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-warn px-1 text-[10px] font-semibold text-background">
            {relevantes}
          </span>
        )}
      </button>

      <Sheet open={aberta} onOpenChange={setAberta}>
        <SheetContent side="right" className="flex w-[380px] flex-col gap-0 p-0 sm:max-w-[380px]">
          <SheetHeader className="flex-row items-center gap-3 border-b px-4 py-3">
            <img src={atenaAvatar} alt="" width={40} height={40} className="h-10 w-10 rounded-full bg-muted object-cover" loading="lazy" />
            <div className="min-w-0">
              <SheetTitle className="text-sm">Atena</SheetTitle>
              <p className="truncate text-[11px] text-muted-foreground">Apoio metodológico do PPA 2028–2031</p>
            </div>
          </SheetHeader>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm">
            <div className="rounded-md border bg-muted/40 p-3">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Onde você está</div>
              <div className="mt-1 font-medium">{contexto.titulo}</div>
              {contexto.detalhe && <p className="mt-1 text-xs text-muted-foreground">{contexto.detalhe}</p>}
              {contexto.chips.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {contexto.chips.map((c) => (
                    <Chip key={c.texto} tom={c.tom}>
                      {c.texto}
                    </Chip>
                  ))}
                </div>
              )}
            </div>

            {sugestoes.length > 0 && (
              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                  <Lightbulb className="h-3.5 w-3.5" /> O que eu observei
                </div>
                <ul className="space-y-1.5">
                  {sugestoes.map((s) => (
                    <li
                      key={s.id}
                      className={
                        s.nivel >= 2
                          ? "rounded-md border border-warn/40 bg-warn-soft px-3 py-2 text-xs"
                          : "rounded-md border px-3 py-2 text-xs text-muted-foreground"
                      }
                    >
                      <p className="whitespace-pre-line">{s.texto}</p>
                      {s.to && (
                        <Link
                          to={s.to as never}
                          onClick={() => setAberta(false)}
                          className="mt-1 inline-block font-medium underline underline-offset-2"
                        >
                          {s.rotuloAcao ?? "Abrir"}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  Sugestões da Atena não alteram nada: a decisão continua sendo do órgão.
                </p>
              </div>
            )}

            {contexto.dicas.length > 0 && (
              <div>
                <div className="mb-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                  O que costuma ajudar aqui
                </div>
                <ul className="space-y-1.5">
                  {contexto.dicas.map((d) => (
                    <li key={d} className="rounded-md border px-3 py-2 text-xs">
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {mensagens.map((m, i) => (
              <div key={i} className={m.autor === "usuario" ? "flex justify-end" : "flex gap-2"}>
                {m.autor === "atena" && (
                  <img src={atenaAvatar} alt="" width={24} height={24} className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-muted object-cover" loading="lazy" />
                )}
                <div
                  className={
                    m.autor === "usuario"
                      ? "max-w-[80%] rounded-lg bg-primary px-3 py-2 text-xs text-primary-foreground"
                      : "max-w-[85%] text-xs leading-relaxed"
                  }
                >
                  {m.texto}
                </div>
              </div>
            ))}

            {mensagens.length === 0 && (
              <div className="flex flex-wrap gap-1.5">
                {PERGUNTAS.map((p) => (
                  <button
                    key={p}
                    onClick={() => enviar(p)}
                    className="rounded-full border px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-accent"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              enviar(entrada);
            }}
            className="flex items-center gap-2 border-t p-3"
          >
            <Input
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              placeholder="Pergunte à Atena sobre esta tela"
              className="h-8 text-xs"
            />
            <Button type="submit" size="icon" className="h-8 w-8" aria-label="Enviar">
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="border-t px-3 py-2 text-[10px] text-muted-foreground">
            Protótipo: respostas simuladas, apenas para avaliar o papel da Atena na experiência.
          </p>
        </SheetContent>
      </Sheet>
    </>
  );
}

const PERGUNTAS = [
  "O que é uma Entrega?",
  "O que falta para eu enviar?",
  "Quais causas ainda não têm atuação?",
  "Quais Entregas usam recursos de convênio?",
  "Como está a previsão por fonte de recursos?",
];

const RESPOSTAS: { chave: RegExp; texto: string }[] = [
  {
    chave: /entrega/i,
    texto:
      "Entrega é o produto ou serviço concreto que o órgão coloca à disposição da sociedade. Ela tem unidade de medida, metas anuais e comportamento — e é nela que as Ações Orçamentárias são vinculadas.",
  },
  {
    chave: /gomap|projeto/i,
    texto:
      "Associar Projeto GOMAP é opcional. O Projeto descreve como a Entrega será executada, mas a apropriação financeira é feita por IPOF, que pode existir com ou sem Projeto — inclusive em atividades continuadas.",
  },
  {
    chave: /ipof|recurso|financeir/i,
    texto:
      "O IPOF é a unidade de controle financeiro. Você informa quanto dele será apropriado nesta Entrega; o saldo remanescente é neutro e pode ser usado em outras Entregas, sem dupla contagem.",
  },
  {
    chave: /enviar|pend/i,
    texto:
      "O envio é liberado quando não houver pendências impeditivas na Iniciativa. Alertas não bloqueiam o envio, mas costumam gerar apontamentos da Área Central.",
  },
  {
    chave: /comportamento|meta/i,
    texto:
      "O comportamento diz como ler a série anual: acumulativa soma, fluxo trata cada ano isoladamente, estoque indica a situação ao final do ano, percentual é proporção e marco ocorre uma única vez.",
  },
  {
    chave: /causa|programa/i,
    texto:
      "O Programa traz o diagnóstico do problema com suas causas. A Iniciativa do órgão deve indicar quais causas enfrenta — é isso que conecta a contribuição setorial ao resultado do Programa.",
  },
];

function responder(pergunta: string, tela: string) {
  const r = RESPOSTAS.find((x) => x.chave.test(pergunta));
  if (r) return r.texto;
  return `Ainda não sei responder isso no protótipo. Nesta tela (${tela}), posso explicar Entregas, metas, causas, Projetos GOMAP e apropriação de IPOF.`;
}

function descreverContexto(state: ReturnType<typeof usePpa>["state"], pathname: string) {
  const chips: { texto: string; tom: "ok" | "alerta" | "impeditivo" | "info" | "neutro" }[] = [];
  const dicas: string[] = [];

  const entregaId = pathname.startsWith("/entrega/") ? pathname.split("/")[2] : null;
  const iniId = /^\/(central\/)?iniciativa\//.test(pathname) ? pathname.split("/").pop() ?? null : null;
  const programaId = pathname.startsWith("/programa/") ? pathname.split("/")[2] : null;

  if (entregaId) {
    const e = state.entregas.find((x) => x.id === entregaId);
    if (e) {
      const r = resumoPendencias(pendenciasEntrega(state, e));
      if (r.impeditivos > 0) chips.push({ texto: `${r.impeditivos} impeditivas`, tom: "impeditivo" });
      if (r.alertas > 0) chips.push({ texto: `${r.alertas} alertas`, tom: "alerta" });
      if (r.impeditivos === 0 && r.alertas === 0) chips.push({ texto: "Entrega completa", tom: "ok" });
      dicas.push(
        "As metas anuais vazias significam “não informado”. Se não houver execução no ano, registre 0.",
        "Projetos GOMAP e recursos (IPOF) são blocos independentes: dá para informar recursos sem Projeto.",
      );
      return { titulo: `Entrega — ${e.nome || "sem nome"}`, detalhe: e.descricao, chips, dicas };
    }
  }

  if (iniId) {
    const i = state.iniciativas.find((x) => x.id === iniId);
    if (i) {
      const r = resumoPendencias(pendenciasIniciativa(state, i));
      chips.push({ texto: STATUS_LABEL[i.status], tom: "info" });
      if (r.impeditivos > 0) chips.push({ texto: `${r.impeditivos} impeditivas`, tom: "impeditivo" });
      dicas.push(
        "Relacione a Iniciativa às causas do Programa que ela efetivamente enfrenta.",
        "O envio para análise ocorre por Iniciativa, com todas as suas Entregas.",
      );
      return { titulo: `Iniciativa — ${i.nome}`, detalhe: i.orgao, chips, dicas };
    }
  }

  if (programaId) {
    const p = programaPorId(state, programaId);
    if (p)
      return {
        titulo: `Programa ${p.codigo}`,
        detalhe: p.nome,
        chips: [{ texto: p.eixo, tom: "neutro" as const }],
        dicas: [
          "O Programa é transversal: vários órgãos podem contribuir com Iniciativas diferentes.",
          "Se o órgão não tem contribuição, registre isso explicitamente na lista de Programas.",
        ],
      };
  }

  const mapa: Record<string, { titulo: string; detalhe: string; dicas: string[] }> = {
    "/": {
      titulo: "Programas do PPA",
      detalhe: "Estrutura completa do plano e a contribuição do seu órgão.",
      dicas: [
        "Expanda o Programa para ver as Iniciativas do seu órgão.",
        "Programas sem contribuição podem ser marcados como tal, sem deixar pendência aberta.",
      ],
    },
    "/iniciativas": { titulo: "Iniciativas do órgão", detalhe: "Lista direta, sem passar pelo Programa.", dicas: [] },
    "/entregas": { titulo: "Entregas do órgão", detalhe: "Todas as Entregas com metas e situação.", dicas: [] },
    "/indicadores": { titulo: "Indicadores", detalhe: "Indicadores de Programa e de Iniciativa.", dicas: [] },
    "/central": { titulo: "Área Central — Programas", detalhe: "Participação dos órgãos por Programa.", dicas: [] },
    "/central/orgaos": {
      titulo: "Área Central — Órgãos",
      detalhe: "Mesma estrutura, organizada a partir do órgão.",
      dicas: [],
    },
    "/central/programas": {
      titulo: "Administração de Programas",
      detalhe: "Cadastro e disponibilização dos Programas.",
      dicas: [],
    },
  };
  const m = mapa[pathname];
  return {
    titulo: m?.titulo ?? "PPA 2028–2031",
    detalhe: m?.detalhe ?? "",
    chips,
    dicas: m?.dicas ?? dicas,
  };
}
