import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil, Plus, Search } from "lucide-react";
import { AppShell } from "@/components/ppa/shell";
import { BigNumbers } from "@/components/ppa/big-numbers";
import { Chip } from "@/components/ppa/ui";
import { usePpa } from "@/lib/ppa/store";
import { APTIDAO_LABEL, DISPONIBILIZACAO_LABEL, eixos, objetivos } from "@/lib/ppa/regras";
import type { AptidaoPrograma, DisponibilizacaoPrograma, Programa } from "@/lib/ppa/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/central_/programas")({
  head: () => ({
    meta: [
      { title: "Administração de Programas — Área Central do PPA" },
      { name: "description", content: "Cadastro e manutenção dos Programas do PPA 2028–2031 pela Área Central, com controle de aptidão e disponibilização." },
      { property: "og:title", content: "Administração de Programas — Área Central" },
      { property: "og:description", content: "Crie, edite e libere Programas para contribuição dos órgãos setoriais." },
    ],
  }),
  component: AdminProgramas,
});

const VAZIO = (): Programa => ({
  id: `pg-${Date.now()}`,
  codigo: "",
  nome: "",
  eixo: "",
  objetivoEstrategico: "",
  descricao: "",
  problema: "",
  evidencias: [],
  causas: [],
  consequencias: [],
  populacaoAfetada: "",
  objetivo: "",
  resultadoEsperado: "",
  indicadores: [],
  orgaoCoordenador: "",
  governanca: "",
  aptidao: "incompleto",
  disponibilizacao: "em_estruturacao",
});

function AdminProgramas() {
  const { state, addPrograma, updPrograma } = usePpa();
  const [busca, setBusca] = useState("");
  const [eixo, setEixo] = useState("todos");
  const [objetivo, setObjetivo] = useState("todos");
  const [edicao, setEdicao] = useState<Programa | null>(null);
  const [novo, setNovo] = useState(false);

  const linhas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return state.programas.filter(
      (p) =>
        (!q || p.nome.toLowerCase().includes(q) || p.codigo.includes(q)) &&
        (eixo === "todos" || p.eixo === eixo) &&
        (objetivo === "todos" || p.objetivoEstrategico === objetivo),
    );
  }, [state.programas, busca, eixo, objetivo]);

  const disponiveis = state.programas.filter((p) => (p.disponibilizacao ?? "disponivel") === "disponivel").length;
  const aptos = state.programas.filter((p) => (p.aptidao ?? "apto") === "apto").length;

  const salvar = (p: Programa) => {
    if (state.programas.some((x) => x.id === p.id)) updPrograma(p.id, p);
    else addPrograma(p);
    setEdicao(null);
    setNovo(false);
  };

  return (
    <AppShell>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Administração de Programas</h1>
          <p className="text-xs text-muted-foreground">
            A Área Central cadastra e mantém os Programas; os órgãos só contribuem em Programas disponibilizados.
          </p>
        </div>
        <Button size="sm" className="h-8 text-xs" onClick={() => { setEdicao(VAZIO()); setNovo(true); }}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Novo Programa
        </Button>
      </div>

      <BigNumbers
        itens={[
          { valor: state.programas.length, rotulo: "Programas cadastrados" },
          { valor: aptos, rotulo: "Aptos" },
          { valor: state.programas.length - aptos, rotulo: "Diagnóstico incompleto" },
          { valor: disponiveis, rotulo: "Disponíveis para contribuição" },
          { valor: eixos(state.programas).length, rotulo: "Eixos" },
        ]}
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar Programa" className="h-8 w-64 pl-8 text-xs" />
        </div>
        <Select value={eixo} onValueChange={(v) => { setEixo(v); setObjetivo("todos"); }}>
          <SelectTrigger className="h-8 w-56 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Eixos</SelectItem>
            {eixos(state.programas).map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={objetivo} onValueChange={setObjetivo}>
          <SelectTrigger className="h-8 w-72 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Objetivos Estratégicos</SelectItem>
            {objetivos(state.programas, eixo).map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-md border bg-card">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="w-20 px-3 py-2 font-medium">Código</th>
              <th className="px-3 py-2 font-medium">Programa</th>
              <th className="w-44 px-3 py-2 font-medium">Aptidão</th>
              <th className="w-60 px-3 py-2 font-medium">Disponibilização</th>
              <th className="w-32 px-3 py-2 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((p) => (
              <tr key={p.id} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{p.codigo}</td>
                <td className="px-3 py-2">
                  <Link to="/programa/$id" params={{ id: p.id }} className="font-medium hover:underline">{p.nome}</Link>
                  <div className="text-xs text-muted-foreground">{p.eixo} · {p.objetivoEstrategico}</div>
                </td>
                <td className="px-3 py-2">
                  <Chip tom={(p.aptidao ?? "apto") === "apto" ? "ok" : "alerta"}>{APTIDAO_LABEL[p.aptidao ?? "apto"]}</Chip>
                </td>
                <td className="px-3 py-2">
                  <Chip tom={(p.disponibilizacao ?? "disponivel") === "disponivel" ? "ok" : "neutro"}>
                    {DISPONIBILIZACAO_LABEL[p.disponibilizacao ?? "disponivel"]}
                  </Chip>
                </td>
                <td className="px-3 py-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setEdicao({ ...p }); setNovo(false); }}>
                    <Pencil className="mr-1 h-3 w-3" /> Editar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {edicao && (
        <Dialog open onOpenChange={(v) => !v && setEdicao(null)}>
          <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-sm">{novo ? "Novo Programa" : `Editar Programa ${edicao.codigo}`}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 text-xs">
              <div className="grid grid-cols-[100px_1fr] gap-3">
                <Campo rotulo="Código">
                  <Input className="h-8 text-xs" value={edicao.codigo} onChange={(e) => setEdicao({ ...edicao, codigo: e.target.value })} />
                </Campo>
                <Campo rotulo="Nome do Programa">
                  <Input className="h-8 text-xs" value={edicao.nome} onChange={(e) => setEdicao({ ...edicao, nome: e.target.value })} />
                </Campo>
              </div>
              <Campo rotulo="Eixo">
                <Input className="h-8 text-xs" value={edicao.eixo} onChange={(e) => setEdicao({ ...edicao, eixo: e.target.value })} />
              </Campo>
              <Campo rotulo="Objetivo Estratégico">
                <Input className="h-8 text-xs" value={edicao.objetivoEstrategico} onChange={(e) => setEdicao({ ...edicao, objetivoEstrategico: e.target.value })} />
              </Campo>
              <Campo rotulo="Descrição do Programa">
                <Textarea className="min-h-16 text-xs" value={edicao.descricao ?? ""} onChange={(e) => setEdicao({ ...edicao, descricao: e.target.value })} />
              </Campo>
              <Campo rotulo="Problema">
                <Textarea className="min-h-16 text-xs" value={edicao.problema} onChange={(e) => setEdicao({ ...edicao, problema: e.target.value })} />
              </Campo>
              <Campo rotulo="Objetivo">
                <Textarea className="min-h-16 text-xs" value={edicao.objetivo} onChange={(e) => setEdicao({ ...edicao, objetivo: e.target.value })} />
              </Campo>
              <Campo rotulo="Público / população afetada">
                <Input className="h-8 text-xs" value={edicao.populacaoAfetada} onChange={(e) => setEdicao({ ...edicao, populacaoAfetada: e.target.value })} />
              </Campo>
              <Campo rotulo="Órgão coordenador">
                <Input className="h-8 text-xs" value={edicao.orgaoCoordenador} onChange={(e) => setEdicao({ ...edicao, orgaoCoordenador: e.target.value })} />
              </Campo>
              <Campo rotulo="Governança do Programa">
                <Textarea className="min-h-14 text-xs" value={edicao.governanca ?? ""} onChange={(e) => setEdicao({ ...edicao, governanca: e.target.value })} />
              </Campo>
              <div className="grid grid-cols-2 gap-3">
                <Campo rotulo="Aptidão">
                  <Select value={edicao.aptidao ?? "incompleto"} onValueChange={(v) => setEdicao({ ...edicao, aptidao: v as AptidaoPrograma })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="incompleto">Diagnóstico incompleto</SelectItem>
                      <SelectItem value="apto">Apto</SelectItem>
                    </SelectContent>
                  </Select>
                </Campo>
                <Campo rotulo="Disponibilização">
                  <Select value={edicao.disponibilizacao ?? "em_estruturacao"} onValueChange={(v) => setEdicao({ ...edicao, disponibilizacao: v as DisponibilizacaoPrograma })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="em_estruturacao">Em estruturação</SelectItem>
                      <SelectItem value="pronto">Pronto para disponibilização</SelectItem>
                      <SelectItem value="disponivel">Disponível para contribuições</SelectItem>
                      <SelectItem value="encerrado">Encerrado para novas contribuições</SelectItem>
                    </SelectContent>
                  </Select>
                </Campo>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setEdicao(null)}>Cancelar</Button>
              <Button size="sm" className="h-8 text-xs" disabled={!edicao.nome || !edicao.codigo} onClick={() => salvar(edicao)}>
                Salvar Programa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AppShell>
  );
}

function Campo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{rotulo}</div>
      {children}
    </div>
  );
}
