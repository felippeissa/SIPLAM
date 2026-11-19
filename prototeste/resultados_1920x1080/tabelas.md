## Contagens (planejadas × executadas)

| | Planejadas | Executadas | Concluídas | Falha | Bloqueadas |
|---|---:|---:|---:|---:|---:|
| **Total** | 100 | 100 | 100 | 0 | 0 |
| A-direita | 50 | 50 | 50 | 0 | 0 |
| B-esquerda | 50 | 50 | 50 | 0 | 0 |

## Por variante (todas as protopersonas)

Tempos e interações: mediana (p25–p75; mín, máx) **das execuções automatizadas bem-sucedidas**; não são tempos humanos.

| Variante | Sucesso técnico | Execuções com erro registrado | Tempo até identificar a linha (ms) | Tempo até acionar Editar (ms) | Tempo total (ms) | Interações |
|---|---:|---:|---|---|---|---|
| A-direita | 50/50 | 0 | 69 (6–102; mín 1, máx 474) | 2 (1–69; mín 1, máx 111) | 2990 (2812–3215; mín 2729, máx 3794) | 10 (10–12; mín 10, máx 84) |
| B-esquerda | 50/50 | 0 | 70 (7–104; mín 1, máx 483) | 2 (1–42; mín 1, máx 100) | 3000 (2820–3170; mín 2722, máx 3584) | 10 (10–12; mín 10, máx 75) |

## Por protopersona e variante

| Persona | Variante | Execuções | Sucesso técnico | Erros | Identificar linha, mediana (ms) | Acionar Editar, mediana (ms) | Total, mediana (ms) | Interações, mediana | Evidências |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| P1 · Operador experiente | A-direita | 10 | 10/10 | 0 | 465 | 1 | 3297 | 12 | [P1-A-01_lista](evidencias/P1-A-01_lista.png), [P1-A-01_depois](evidencias/P1-A-01_depois.png) |
| P1 · Operador experiente | B-esquerda | 10 | 10/10 | 0 | 463 | 1 | 3276 | 12 | [P1-B-01_lista](evidencias/P1-B-01_lista.png), [P1-B-01_depois](evidencias/P1-B-01_depois.png) |
| P2 · Gestor ocasional | A-direita | 10 | 10/10 | 0 | 1 | 2 | 2798 | 10 | [P2-A-01_lista](evidencias/P2-A-01_lista.png), [P2-A-01_depois](evidencias/P2-A-01_depois.png) |
| P2 · Gestor ocasional | B-esquerda | 10 | 10/10 | 0 | 1 | 2 | 2799 | 10 | [P2-B-01_lista](evidencias/P2-B-01_lista.png), [P2-B-01_depois](evidencias/P2-B-01_depois.png) |
| P3 · Usuário iniciante | A-direita | 10 | 10/10 | 0 | 69 | 1 | 2877 | 10 | [P3-A-01_lista](evidencias/P3-A-01_lista.png), [P3-A-01_depois](evidencias/P3-A-01_depois.png) |
| P3 · Usuário iniciante | B-esquerda | 10 | 10/10 | 0 | 70 | 1 | 2875 | 10 | [P3-B-01_lista](evidencias/P3-B-01_lista.png), [P3-B-01_depois](evidencias/P3-B-01_depois.png) |
| P4 · Analista cuidadoso | A-direita | 10 | 10/10 | 0 | 7 | 2 | 2826 | 10 | [P4-A-01_lista](evidencias/P4-A-01_lista.png), [P4-A-01_depois](evidencias/P4-A-01_depois.png) |
| P4 · Analista cuidadoso | B-esquerda | 10 | 10/10 | 0 | 8 | 1 | 2879 | 10 | [P4-B-01_lista](evidencias/P4-B-01_lista.png), [P4-B-01_depois](evidencias/P4-B-01_depois.png) |
| P5 · Teclado | A-direita | 10 | 10/10 | 0 | 98 | 75 | 3103 | 83 | [P5-A-01_lista](evidencias/P5-A-01_lista.png), [P5-A-01_depois](evidencias/P5-A-01_depois.png) |
| P5 · Teclado | B-esquerda | 10 | 10/10 | 0 | 96 | 52 | 3075 | 74 | [P5-B-01_lista](evidencias/P5-B-01_lista.png), [P5-B-01_depois](evidencias/P5-B-01_depois.png) |

## Efeito de ordem (apenas diagnóstico)

| Sequência | Execuções | Sucesso técnico | Tempo total, mediana (ms) |
|---|---:|---:|---:|
| A-B | 50 | 50/50 | 3018 |
| B-A | 50 | 50/50 | 2972 |

## P5 · navegação por teclado

| Variante | Execuções | Tab até o foco entrar na linha-alvo | Tab até o Editar | Foco visível no Editar | Tab até o campo Nome | Shift+Tab de volta até Salvar |
|---|---:|---|---|---|---|---|
| A-direita | 10 | 35 (34–35; mín 34, máx 36) | 45 (44–45; mín 44, máx 46) | 10/10 | 26 (26–26; mín 26, máx 26) | 1 (1–1; mín 1, máx 1) |
| B-esquerda | 10 | 35 (34–35; mín 34, máx 36) | 36 (35–36; mín 35, máx 37) | 10/10 | 26 (26–26; mín 26, máx 26) | 1 (1–1; mín 1, máx 1) |

Primeiro controle que recebe o foco dentro da linha-alvo: A-direita: span[Marcador Saúde] (10×); B-esquerda: button[Adicionar marcadores a Saúde Integral] (10×).

## Fatos de layout e acessibilidade observados (por variante)

| Variante | Posição da coluna Ações | Rolagem horizontal (na janela desta análise) | Candidatas ao nome exato / que contêm o texto |
|---|---|---|---|
| A-direita | 7 de 8 (0 = primeira) | não | 1 / 1 |
| B-esquerda | 0 de 8 (0 = primeira) | não | 1 / 1 |

Controles da coluna Ações da linha (P3, primeira rodada concluída): Controles de ação da linha: button[texto="", aria-label="Adicionar marcadores a Saúde Integral", nome acessível="Adicionar marcadores a Saúde Integral"]; a[texto="Editar", aria-label="", nome acessível="Editar"]. Contexto confirmado: 1043 · Saúde Integral.

Confirmação ao salvar (texto visível, nº de rodadas): "Programa editado com sucesso. (100×).

## Falhas e bloqueios registrados

Nenhuma.

Rodadas concluídas com mensagens de erro/aviso de console registradas: 0.

Estado restaurado e confirmado ao fim da rodada: 100/100.
