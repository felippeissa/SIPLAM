export type StatusIniciativa =
  | "em_preenchimento"
  | "enviada"
  | "em_analise"
  | "devolvida"
  | "validada";

export interface SubCausa {
  id: string;
  texto: string;
}

export interface Causa {
  id: string;
  texto: string;
  subcausas: SubCausa[];
}

export interface IndicadorResultado {
  nome: string;
  unidade: string;
  linhaBase: string;
  meta: string;
  descricao?: string;
  formula?: string;
  fonte?: string;
  periodicidade?: string;
  valorReferencia?: string;
  anoReferencia?: string;
  polaridade?: "maior_melhor" | "menor_melhor";
  metas?: Record<string, string>;
}

export type AptidaoPrograma = "incompleto" | "apto";
export type DisponibilizacaoPrograma =
  | "em_estruturacao"
  | "pronto"
  | "disponivel"
  | "encerrado";

export interface Programa {
  id: string;
  codigo: string;
  nome: string;
  eixo: string;
  objetivoEstrategico: string;
  descricao?: string;
  problema: string;
  evidencias: string[];
  causas: Causa[];
  consequencias: string[];
  populacaoAfetada: string;
  objetivo: string;
  resultadoEsperado: string;
  indicadores: IndicadorResultado[];
  orgaoCoordenador: string;
  governanca?: string;
  aptidao?: AptidaoPrograma;
  disponibilizacao?: DisponibilizacaoPrograma;
}

export type Comportamento = "acumulativa" | "fluxo" | "estoque" | "percentual" | "marco";

export type TipoTerritorio = "estadual" | "territorializavel" | "nao_territorializavel";

export interface Territorio {
  tipo: TipoTerritorio | null;
  regioes: string[];
}

export type RespostaGomap = "sim" | "nao" | "depois";

/** Ação Orçamentária da LOA. Financia no máximo uma Entrega do PPA (N:1). */
export interface AcaoOrcamentaria {
  id: string;
  codigo: string;
  nome: string;
  orgao: string;
  situacao: string;
}

/**
 * Parcela de programação financeira de um IPOF no SIAFIC.
 * A fonte de recursos, a Ação e a classificação pertencem à parcela — nunca ao IPOF.
 */
export interface ParcelaIpof {
  id: string;
  acaoId: string;
  fonte: string;
  classificacao: string;
  ano: string;
  mes: number;
  valor: number;
  /** Execução informada pelo SIAFIC (preparada para o monitoramento). */
  empenhado?: number;
  liquidado?: number;
  pago?: number;
}

export interface Ipof {
  id: string;
  codigo: string;
  nome: string;
  orgao: string;
  situacao: string;
  /** Quando relacionado a Projeto, cada IPOF possui no máximo um Projeto GOMAP. */
  projetoId: string | null;
  parcelas: ParcelaIpof[];
}

export interface ProjetoGomap {
  id: string;
  codigo: string;
  nome: string;
  orgao: string;
  situacao: string;
  fase: string;
  execucao: number;
  cronograma: string;
  conclusaoPrevista: string;
  ultimaAtualizacao: string;
  /** Valor global do Projeto no GOMAP — nunca é o valor financeiro da Entrega. */
  valorGlobal: number;
}

export interface Iniciativa {
  id: string;
  programaId: string;
  orgao: string;
  nome: string;
  descricao: string;
  publicoAlvo: string;
  causas: string[];
  status: StatusIniciativa;
  atualizadoEm: string;
  enviadoEm?: string | undefined;
  analista?: string | undefined;
  versao: number;
  unidadeResponsavel?: string | undefined;
  resultadoEsperado?: string | undefined;
  indicadores?: IndicadorIniciativa[] | undefined;
}

export interface IndicadorIniciativa {
  id: string;
  nome: string;
  descricao: string;
  unidade: string;
  formula: string;
  fonte: string;
  periodicidade: string;
  valorReferencia: string;
  anoReferencia: string;
  polaridade: "maior_melhor" | "menor_melhor";
  metas: Record<string, string>;
}

export interface Entrega {
  id: string;
  iniciativaId: string;
  nome: string;
  descricao: string;
  unidadeMedida: string;
  metodoComprovacao: string;
  comportamentoSugerido?: Comportamento | undefined;
  comportamento?: Comportamento | undefined;
  comportamentoValidado: boolean;
  metas: Record<string, number | null>;
  territorio: Territorio;
  gomap: RespostaGomap | null;
}

export interface Vinculo {
  id: string;
  entregaId: string;
  projetoId: string;
}

/** Vinculação orçamentária: uma Ação da LOA financia uma única Entrega do PPA. */
export interface VinculoAcao {
  id: string;
  entregaId: string;
  acaoId: string;
}

export interface Comentario {
  id: string;
  alvoTipo: "iniciativa" | "entrega";
  alvoId: string;
  campo?: string | undefined;
  texto: string;
  autor: string;
  criadoEm: string;
  resolvido: boolean;
}

export interface Evento {
  id: string;
  iniciativaId: string;
  quando: string;
  autor: string;
  texto: string;
}

export interface PpaState {
  orgaoAtual: string;
  usuario: string;
  analista: string;
  programas: Programa[];
  semContribuicao: { programaId: string; orgao: string }[];
  iniciativas: Iniciativa[];
  entregas: Entrega[];
  vinculos: Vinculo[];
  vinculosAcao: VinculoAcao[];
  comentarios: Comentario[];
  eventos: Evento[];
}
