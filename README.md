# Team Powers

Fork do [Superpowers](https://github.com/obra/superpowers) adaptado para o paradigma de **Agent Teams** do Claude Code.

## Quick Start

### 1. Habilite Agent Teams

Adicione ao seu `~/.claude/settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

> **Nota:** Agent Teams é uma feature experimental do Claude Code. O plugin funciona sem ela (usando subagents e execução sequencial), mas as skills de composição dinâmica de equipes (`composing-agent-teams`, `team-driven-development`, `dispatching-parallel-teams`) requerem Agent Teams habilitado. Veja a [documentação oficial](https://code.claude.com/docs/en/agent-teams) para detalhes e limitações.

### 2. Adicione o marketplace

No Claude Code, execute:

```
/plugin marketplace add ogallotti/power-plugins
```

### 3. Instale o plugin

```
/plugin install team-powers@power-plugins
```

### 4. Reinicie o Claude Code

Feche e abra uma nova sessão. O plugin carrega automaticamente via hook de SessionStart.

### 5. Use normalmente

As skills ativam sozinhas. Peça para construir algo e o agente vai usar brainstorming, TDD, composição dinâmica de equipes — tudo automaticamente.

> **Nota:** Se você usa o Superpowers original, desabilite-o em `/plugins` para evitar conflitos de skills duplicadas.

---

## Por que este fork?

O Superpowers é um plugin excelente que revolucionou a forma como agentes de código trabalham — com skills de TDD, debugging sistemático, brainstorming colaborativo e execução de planos. Porém, ele foi criado quando o paradigma dominante era o de **subagents**: agentes efêmeros que executam uma tarefa e reportam o resultado ao agente principal.

O Claude Code introduziu o conceito de **Agent Teams** — um paradigma onde múltiplos agentes persistentes trabalham como uma equipe real:

- **Comunicação direta** entre teammates (não apenas reportar ao líder)
- **Task list compartilhada** com self-claim e dependências
- **Especialistas dinâmicos** que acumulam contexto ao longo de múltiplas tarefas
- **Reviews via messaging** entre teammates, mantendo contexto

O Team Powers adapta todas as skills do Superpowers para este novo paradigma, adicionando uma capacidade fundamental: **composição dinâmica de equipes**. Em vez de um template fixo de "implementador + revisor", o agente analisa cada plano e decide quais especialistas são necessários — se o projeto envolve frontend e backend, cria um especialista para cada; se tem aspecto jurídico, cria um Legal Specialist; e assim por diante.

## O que há dentro

### Skills novas (Agent Teams)

| Skill | Descrição |
|-|-|
| **composing-agent-teams** | Analisa o plano e decide dinamicamente quais especialistas criar (frontend, backend, legal, DevOps, etc.) |
| **team-driven-development** | Execução de planos com equipe paralela: composição → task list compartilhada → reviews via messaging |
| **dispatching-parallel-teams** | Investigação paralela onde especialistas debatem e desafiam hipóteses entre si |
| **requesting-team-review** | Reviews em 2 estágios (spec compliance + code quality) via SendMessage entre teammates |

### Skills herdadas do Superpowers

| Skill | Descrição |
|-|-|
| **brainstorming** | Refinamento socrático de ideias antes de implementar |
| **writing-plans** | Planos de implementação detalhados com TDD |
| **executing-plans** | Execução em lotes com checkpoints |
| **test-driven-development** | Ciclo RED-GREEN-REFACTOR rigoroso |
| **systematic-debugging** | Debugging em 4 fases com root cause analysis |
| **verification-before-completion** | Evidência antes de qualquer claim de sucesso |
| **receiving-code-review** | Avaliação técnica de feedback (sem concordância performática) |
| **using-git-worktrees** | Workspaces isolados para desenvolvimento paralelo |
| **finishing-a-development-branch** | Merge, PR ou cleanup após conclusão |
| **writing-skills** | Criação de novas skills seguindo TDD |

### Outros componentes

| Componente | Descrição |
|-|-|
| `agents/code-reviewer.md` | Agente de code review com revisão de segurança (OWASP top 10) e escalation protocol |
| `commands/` | Atalhos: `/brainstorm`, `/write-plan`, `/execute-plan` |
| `hooks/session-start` | Injeta skills no contexto da sessão |
| `hooks/teammate-idle` | Quality gate: lembra teammates de checar tasks antes de ficar idle |
| `lib/skills-core.js` | Runtime com descoberta dinâmica de skills, cache de resolução e skill shadowing |
| `skills/brainstorming/scripts/` | Brainstorm visual companion: servidor zero-dep (Node.js built-ins apenas) com WebSocket, auto-exit por inatividade e suporte cross-platform |
| `docs/` | Planos de exemplo e documentação técnica |

## Workflow básico

1. **Brainstorming** — Refina a ideia, explora alternativas, produz design doc
2. **Writing Plans** — Quebra em tarefas bite-sized com TDD
3. **Composing Agent Teams** — Analisa o plano e monta a equipe ideal de especialistas
4. **Team-Driven Development** — Equipe executa em paralelo com reviews entre teammates
5. **Finishing** — Verifica testes, apresenta opções de merge/PR

As skills ativam automaticamente. Você não precisa fazer nada especial — seu agente simplesmente tem Team Powers.

## Quando usar Agent Teams vs Subagents

Seguindo a [guidance oficial da Anthropic](https://code.claude.com/docs/en/agent-teams#when-to-use-agent-teams):

| Cenário | Abordagem |
|-|-|
| 2+ domínios de expertise (front + back, código + jurídico) | Agent Teams |
| Teammates precisam debater ou compartilhar findings | Agent Teams |
| Debugging com hipóteses concorrentes | Agent Teams |
| Tarefa focada, só o resultado importa (review, pesquisa, verificação) | Subagents |
| Domínio único, tarefas sequenciais | Solo / Subagents |
| Edições no mesmo arquivo por múltiplos agents | Solo (evitar conflitos) |

**Ponto de transição:** Se você está rodando subagents em paralelo e eles precisam comunicar entre si ou você está batendo limites de contexto, Agent Teams são o próximo passo natural.

> **Agent Teams usam significativamente mais tokens** que uma sessão única. Para tarefas sequenciais, edições no mesmo arquivo, ou trabalho com muitas dependências, uma sessão única ou subagents são mais eficazes.

## Créditos e agradecimentos

Este projeto é um fork do **[Superpowers](https://github.com/obra/superpowers)**, criado por **[Jesse Vincent](https://github.com/obra)** ([@obra](https://github.com/obra)).

O Superpowers estabeleceu o padrão de como agentes de código devem trabalhar — com disciplina, TDD, debugging sistemático e workflows reproduzíveis. Todo o mérito das skills originais, da filosofia e da arquitetura do plugin pertence a Jesse e aos contribuidores do projeto original.

Se o Superpowers ajudou você, considere [apoiar o trabalho open source do Jesse](https://github.com/sponsors/obra).

## Licença

MIT License — mesma licença do projeto original. Veja o arquivo [LICENSE](LICENSE) para detalhes.
