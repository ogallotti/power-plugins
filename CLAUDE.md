# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é

Plugin marketplace para Claude Code. O plugin principal é o **team-powers** — fork do [Superpowers](https://github.com/obra/superpowers) adaptado para o paradigma de Agent Teams.

## Arquitetura

### Skill lifecycle

1. **SessionStart hook** (`hooks/session-start`) lê `skills/using-team-powers/SKILL.md` e injeta o conteúdo no `additionalContext` da sessão — é assim que o agente "sabe" que tem skills disponíveis
2. O agente usa a **Skill tool** do Claude Code para invocar skills pelo nome (ex: `team-powers:brainstorming`)
3. `lib/skills-core.js` resolve o nome para o arquivo `SKILL.md` correto, com **shadowing**: skills pessoais em `~/.claude/skills/` têm prioridade, exceto quando prefixado com `team-powers:`
4. O conteúdo do SKILL.md (sem frontmatter) é carregado no contexto do agente, que segue as instruções

### Anatomia de uma skill

Cada skill vive em `plugins/team-powers/skills/<skill-name>/SKILL.md` com:
- **Frontmatter YAML**: `name` e `description` (usados para discovery e matching pela Skill tool)
- **Corpo markdown**: instruções que o agente segue quando a skill é invocada
- **Arquivos auxiliares**: scripts, prompts de review, exemplos (variam por skill)

### Hooks e exit codes

Hooks são bash scripts que controlam o comportamento do agente via exit codes:
- **Exit 0**: permite a ação (idle, completion, etc.)
- **Exit 2**: bloqueia a ação e envia feedback ao agente (via `hookSpecificOutput.feedback`)

| Hook | Trigger | Função |
|-|-|-|
| `session-start` | SessionStart | Injeta using-team-powers no contexto |
| `teammate-idle` | TeammateIdle | Verifica tasks pendentes em `~/.claude/tasks/$TEAM_NAME/` antes de permitir idle |
| `task-completed` | TaskCompleted | Advisory — a disciplina real vem da skill `verification-before-completion` |

### Cross-platform

`run-hook.cmd` é um **arquivo poliglota** (CMD + bash no mesmo arquivo). No Windows, executa como CMD e delega para Git Bash; no Unix, pula o bloco CMD e executa bash direto.

### skills-core.js

Runtime em ES modules que provê:
- `extractFrontmatter()` — parse de YAML frontmatter de SKILL.md
- `findSkillsInDir()` — discovery recursivo com profundidade máxima de 3
- `resolveSkillPath()` — resolução com cache e shadowing (personal > team-powers)
- `checkForUpdates()` — git fetch + status para detectar atualizações disponíveis

## Convenções

- **Idioma do código/skills**: Inglês (padrão do Superpowers original)
- **Idioma da documentação** (README, CHANGELOG, etc.): Português do Brasil
- **Cross-references entre skills**: usar prefixo `team-powers:` (nunca `superpowers:`)
- **Paths funcionais**: usar `.team-powers/` e `~/.config/team-powers/` (nunca `.superpowers/`)
- **Referências ao Superpowers**: apenas em créditos e contexto histórico
- **Naming de skills**: `kebab-case` com gerúndio quando é processo (ex: `writing-plans`, `composing-agent-teams`)
- **Naming de commands**: `kebab-case`, mesmo nome da skill que invocam (ex: `brainstorm.md`)
- **Naming de agents**: `kebab-case` descritivo do papel (ex: `code-reviewer.md`)
- **Naming de hooks**: scripts em `hooks/` sem extensão para Unix, `.cmd` para wrapper cross-platform
- **Agent Teams vs Subagents**: Agent Teams para trabalho paralelo que precisa de comunicação entre agents; subagents para tarefas focadas onde só o resultado importa (review, pesquisa, verificação)
- **Skill shadowing**: skills pessoais em `~/.claude/skills` sobrescrevem skills do team-powers (exceto com prefixo `team-powers:`)

## Publicação

- **Marketplace**: `ogallotti/power-plugins`
- **Instalação**: `/plugin marketplace add ogallotti/power-plugins` → `/plugin install team-powers@power-plugins`
- **Versão**: bumpar em **ambos** `plugins/team-powers/.claude-plugin/plugin.json` E `.claude-plugin/marketplace.json` (devem estar sincronizados)
- **Changelog**: atualizar `CHANGELOG.md` com a nova versão

## Workflow de desenvolvimento

1. Editar arquivos em `plugins/team-powers/`
2. Testar localmente: o plugin instalado puxa do cache — após push, rodar `/plugin` → update no marketplace
3. Commit e push para `main`
4. Usuários atualizam via `/plugin` → update

### Criando uma nova skill

1. Criar diretório `plugins/team-powers/skills/<skill-name>/`
2. Criar `SKILL.md` com frontmatter (`name`, `description`) e corpo markdown
3. O `description` do frontmatter é crítico — é o que a Skill tool usa para decidir quando ativar. Deve começar com "Use when..." e ser específico sobre os triggers
4. Se a skill precisa de um slash command, criar `plugins/team-powers/commands/<skill-name>.md`

### Editando hooks

Hooks são bash scripts. Ao editar:
- Manter `set -euo pipefail` no topo
- Testar com `echo '{}' | ./plugins/team-powers/hooks/<hook-name>` para verificar output JSON e exit code
- O input do hook vem via stdin como JSON (ex: TeammateIdle recebe `team_name`)
- O output deve ser JSON com `hookSpecificOutput` contendo o `hookEventName` correspondente
