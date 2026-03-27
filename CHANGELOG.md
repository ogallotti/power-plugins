# Changelog

## [1.3.2] - 2026-03-27

### Added
- **Convenção de branch naming**: seção "Branch Naming" em `using-git-worktrees` padronizando prefixos convencionais (`feat/`, `fix/`, `refactor/`, `chore/`). Proíbe prefixo `worktree-` que é redundante.

## [1.3.1] - 2026-03-27

### Fixed
- **Worktree cleanup perigoso**: renomeado "Stale Worktree Check" para "Existing Worktree Awareness". Agentes agora **nunca oferecem cleanup** de worktrees — outra janela do Claude Code pode estar ativamente trabalhando nelas. Cleanup só acontece se o usuário pedir explicitamente, com aviso de risco.

## [1.3.0] - 2026-03-27

### Changed
- **Worktree-first como padrão**: worktrees agora são o default para TODA implementação, não apenas trabalho paralelo. Motivação: múltiplas janelas do Claude Code podem estar no mesmo projeto simultaneamente.
- **`using-git-worktrees`**: nova seção "Why Worktrees Are the Default" com `<IMPORTANT>` explicando a necessidade de isolamento multi-janela. Description reescrita para refletir que é obrigatório para qualquer mudança de código.
- **`using-team-powers`**: nova seção "Worktree-First Development" carregada em toda sessão, garantindo que a regra de worktrees esteja sempre em contexto.
- **`brainstorming`**: novo step 9 "Set up worktree" no checklist e diagrama de fluxo — worktree é criado antes de invocar writing-plans. Adicionada instrução explícita para usar `AskUserQuestion` tool em perguntas de múltipla escolha (em vez de opções em texto corrido).
- **`writing-plans`**: contexto corrigido — worktree vem de `team-powers:using-git-worktrees`, não "created by brainstorming skill".

## [1.2.0] - 2026-03-24

### Added
- **`/simplify` integrado ao fluxo**: passo obrigatório após todas as tasks completarem, antes do finishing. Roda 3 agentes paralelos de review (code reuse, code quality, efficiency) sobre o diff completo. Aplicado em `executing-plans`, `team-driven-development` e `finishing-a-development-branch`.
- **`/security-review` condicional**: o `finishing-a-development-branch` agora escaneia o diff por áreas sensíveis (auth, APIs, queries, crypto, input de usuário, dependências novas). Se detectar, oferece `/security-review` ao usuário. Se não, pula silenciosamente.
- **Worktree guard obrigatório**: `executing-plans` e `team-driven-development` agora têm Step 0 que verifica se está em worktree isolado. Se está em `main`/`master`, invoca `using-git-worktrees` antes de prosseguir.
- **Check de worktrees órfãos**: no início de cada sessão, o agente verifica `git worktree list` e avisa sobre worktrees de sessões anteriores, oferecendo cleanup. Não bloqueia — apenas informa.
- **Prompt de instalação rápida**: seção no topo do README com prompt copy-paste para instalação automatizada no Claude Code (incluindo desabilitação do Superpowers se presente).

## [1.1.0] - 2026-03-23

### Upstream Sync
Portadas todas as mudanças relevantes do [Superpowers](https://github.com/obra/superpowers) v5.0.2–v5.0.5 (30 commits, releases de 12–19/mar).

### Added
- **Zero-dep brainstorm server** (`server.cjs`): substitui o servidor Express+ws+chokidar por implementação usando apenas Node.js built-ins (http, crypto, fs). Elimina necessidade de `npm install` para usuários do marketplace.
- **Server lifecycle**: auto-exit após 30 minutos de inatividade e monitoramento de PID do processo pai para prevenir servidores órfãos.
- **Windows/Git Bash support**: auto-foreground em ambientes MSYS2/Git Bash, skip de PID namespace no Windows.
- **Context isolation principle**: adicionado a todas as skills de delegação — agentes recebem contexto precisamente construído, nunca o histórico da sessão do caller.
- **Platform-specific launch docs**: instruções de lançamento do brainstorm server por plataforma (Claude Code macOS/Linux/Windows, Codex, Gemini CLI).

### Changed
- **Review loops**: máximo de iterações reduzido de 5 para 3 em brainstorming e writing-plans.
- **Spec reviewer**: calibração elevada — removidas categorias "Coverage" e "Architecture", adicionada seção "Calibration" que só bloqueia por gaps sérios.
- **Plan reviewer**: review single-pass do plano completo em vez de per-chunk, mesma calibração do spec reviewer.
- **Writing-plans**: review loop simplificado para single-pass com context isolation.

### Fixed
- **bash 5.3+ hang**: substituição de heredoc por `printf` no hook `session-start` — heredocs com expansão de variável >512 bytes causavam hang no bash 5.3+.
- **SessionStart no --resume**: removido `resume` do matcher para evitar reinjeção redundante do contexto.
- **POSIX compatibility**: `BASH_SOURCE` → `$0`, shebangs portáveis (`#!/usr/bin/env bash`).
- **stop-server.sh**: graceful shutdown com SIGTERM → wait 2s → SIGKILL fallback.
- **frame-template.html**: adicionado `<meta charset="utf-8">`.

### Removed
- `index.js`, `package.json`, `package-lock.json` do brainstorm server (substituídos por `server.cjs`).

## [1.0.3] - 2026-03-20

### Refactored
- **TeammateIdle hook**: Simplified with `json_val` helper, bash regex for team name extraction, and short-circuit on status check. Reduced subprocess forks and eliminated code duplication.

## [1.0.2] - 2026-03-20

### Fixed
- **TeammateIdle hook**: Previously always returned exit code 2 (keep working), causing repeated "hook error" messages even when all tasks were complete. Now checks for actual unclaimed pending tasks in the team's task directory before deciding:
  - Exit 2 (keep working): only when there are pending tasks with no owner
  - Exit 0 (allow idle): when all tasks are assigned, in progress, or completed

## [1.0.1] - 2026-03-11

### Fixed
- Respect user's default model — never override model selection

## [1.0.0] - 2026-03-10

### Added
- Initial release: fork of [Superpowers](https://github.com/obra/superpowers) adapted for Agent Teams paradigm
- 15 skills (4 new Agent Teams skills + 11 adapted from Superpowers)
- Agent Teams hooks: SessionStart, TeammateIdle, TaskCompleted
- Code reviewer agent
- Cross-platform hook support (Unix + Windows)
