# Power Plugins

Plugin marketplace para Claude Code. O plugin principal é o **team-powers** — fork do [Superpowers](https://github.com/obra/superpowers) adaptado para o paradigma de Agent Teams.

## Estrutura do Repositório

```
power-plugins/
├── .claude-plugin/marketplace.json   # Definição do marketplace
├── plugins/team-powers/              # Plugin principal
│   ├── .claude-plugin/plugin.json
│   ├── skills/                       # 15 skills (4 novas + 11 adaptadas)
│   ├── agents/                       # code-reviewer
│   ├── commands/                     # brainstorm, write-plan, execute-plan
│   ├── hooks/                        # SessionStart hook
│   └── lib/                          # skills-core.js runtime
├── docs/                             # Planos de exemplo e documentação
├── README.md
└── LICENSE
```

## Convenções

- **Idioma do código/skills**: Inglês (padrão do Superpowers original)
- **Idioma da documentação** (README, etc.): Português do Brasil
- **Cross-references entre skills**: usar prefixo `team-powers:` (nunca `superpowers:`)
- **Paths funcionais**: usar `.team-powers/` e `~/.config/team-powers/` (nunca `.superpowers/`)
- **Referências ao Superpowers**: apenas em créditos e contexto histórico no README/LICENSE
- **Naming de skills**: `kebab-case` com gerúndio quando é processo (ex: `writing-plans`, `composing-agent-teams`)
- **Naming de commands**: `kebab-case`, mesmo nome da skill que invocam (ex: `brainstorm.md`)
- **Naming de agents**: `kebab-case` descritivo do papel (ex: `code-reviewer.md`)
- **Naming de hooks**: scripts em `hooks/` sem extensão para Unix, `.cmd` para wrapper cross-platform
- **Agent Teams vs Subagents**: Agent Teams para trabalho paralelo que precisa de comunicação entre agents; subagents para tarefas focadas onde só o resultado importa (review, pesquisa, verificação). Seguir guidance da [Anthropic](https://code.claude.com/docs/en/agent-teams#when-to-use-agent-teams)
- **Skill shadowing**: skills pessoais em `~/.claude/skills` sobrescrevem skills do team-powers (exceto com prefixo `team-powers:`)

## Publicação

- **Marketplace**: `ogallotti/power-plugins`
- **Instalação**: `/plugin marketplace add ogallotti/power-plugins` → `/plugin install team-powers@power-plugins`
- **Versão**: bumpar em `plugins/team-powers/.claude-plugin/plugin.json` E `.claude-plugin/marketplace.json`

## Workflow de desenvolvimento

1. Editar arquivos em `plugins/team-powers/`
2. Testar localmente: o plugin instalado puxa do cache — após push, rodar `/plugin` → update no marketplace
3. Commit e push para `main`
4. Usuários atualizam via `/plugin` → update
