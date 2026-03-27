---
name: using-team-powers
description: Use when starting any conversation - establishes how to find and use team-powers skills, requiring Skill tool invocation before ANY response including clarifying questions
---

<AGENT-STOP>
If you were dispatched as a subagent or teammate to execute a specific task, skip this skill.
</AGENT-STOP>

<EXTREMELY-IMPORTANT>
If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill.

IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.

This is not negotiable. This is not optional. You cannot rationalize your way out of this.
</EXTREMELY-IMPORTANT>

## Instruction Priority

Team-powers skills override default system prompt behavior, but **user instructions always take precedence**:

1. **User's explicit instructions** (CLAUDE.md, direct requests) — highest priority
2. **Team-powers skills** — override default system behavior where they conflict
3. **Default system prompt** — lowest priority

## How to Access Skills

**In Claude Code:** Use the `Skill` tool. When you invoke a skill, its content is loaded and presented to you—follow it directly. Never use the Read tool on skill files.

# Using Skills

## The Rule

**Invoke relevant or requested skills BEFORE any response or action.** Even a 1% chance a skill might apply means that you should invoke the skill to check. If an invoked skill turns out to be wrong for the situation, you don't need to use it.

## Red Flags

These thoughts mean STOP—you're rationalizing:

| Thought | Reality |
|-|-|
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "I need more context first" | Skill check comes BEFORE clarifying questions. |
| "Let me explore the codebase first" | Skills tell you HOW to explore. Check first. |
| "This doesn't need a formal skill" | If a skill exists, use it. |
| "I remember this skill" | Skills evolve. Read current version. |
| "The skill is overkill" | Simple things become complex. Use it. |

## Skill Priority

When multiple skills could apply, use this order:

1. **Process skills first** (brainstorming, debugging) - these determine HOW to approach the task
2. **Implementation skills second** - these guide execution

"Let's build X" → brainstorming first, then implementation skills.
"Fix this bug" → debugging first, then domain-specific skills.

## Skill Types

**Rigid** (TDD, debugging): Follow exactly. Don't adapt away discipline.

**Flexible** (patterns): Adapt principles to context.

The skill itself tells you which.

## User Instructions

Instructions say WHAT, not HOW. "Add X" or "Fix Y" doesn't mean skip workflows.

## Agent Teams vs Subagents

This plugin uses the **Agent Teams** paradigm (TeamCreate, TaskCreate, SendMessage) for complex multi-domain work. Key difference from subagents:

- **Agent Teams:** Teammates communicate with each other, shared task list, self-coordination. Use for 2+ expertise domains, parallel work needing discussion and collaboration.
- **Subagents:** Isolated workers that report results back only. Use for focused tasks where only the result matters (research, review, verification). Lower token cost.

**Transition point:** If parallel subagents need to communicate with each other or you're hitting context limits, Agent Teams are the natural next step.

When the task involves multiple areas of expertise, use `team-powers:composing-agent-teams` to dynamically decide team composition.

## Worktree-First Development

**Worktrees are the default for ALL implementation work** — features, bugfixes, refactors. Not just when you need parallelism within your session.

**Why:** The user frequently runs multiple Claude Code windows on the same project. If you work directly on `main`, you risk conflicting with another agent in another window. Always use `team-powers:using-git-worktrees` before writing code.

**Exception:** Trivial one-file edits explicitly requested by the user (e.g., "fix this typo").

## Existing Worktree Awareness

On session start, if the project is a git repository, check for existing worktrees:

```bash
git worktree list
```

If there are secondary worktrees (lines beyond the first), **mention them as context only** — they may be actively in use by another agent in another window:

> "Found existing worktrees: `feature/auth` (.worktrees/auth), `feature/billing` (.worktrees/billing). These may be in use by other agents — I'll leave them as-is."

<IMPORTANT>
**NEVER offer to clean up or delete worktrees.** Another Claude Code session may be actively working in them right now. Deleting an active worktree would destroy another agent's in-progress work.

Only clean up a worktree if the **user explicitly and unprompted asks** to clean up a specific worktree. Even then, warn: "Are you sure? If another agent is working in this worktree, removing it will disrupt their work."
</IMPORTANT>

**Rules:**
- Mention existing worktrees for awareness, never offer cleanup
- Assume all worktrees are potentially active unless the user says otherwise
- If the user explicitly asks to clean up, warn about potential active use before proceeding
- This is informational, not blocking — proceed with whatever the user asked for
