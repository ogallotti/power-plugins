---
name: dispatching-parallel-teams
description: Use when facing 2+ independent investigation or implementation tasks that can be worked on without shared state or sequential dependencies
---

# Dispatching Parallel Teams

## Overview

You delegate tasks to specialized agents with isolated context. By precisely crafting their instructions and context, you ensure they stay focused and succeed at their task. They should never inherit your session's context or history — you construct exactly what they need. This also preserves your own context for coordination work.

When you have multiple unrelated problems (different test files, different subsystems, different bugs), investigating them sequentially wastes time. Agent Teams let specialists work concurrently and share findings.

**Core principle:** One specialist per independent problem domain. Let them work concurrently and communicate.

## When to Use

**Use when:**
- 3+ independent problem domains
- Each problem can be understood without context from others
- Problems benefit from specialists challenging each other's findings
- No shared state between investigations

**Don't use when:**
- Failures are related (fix one might fix others)
- Need to understand full system state first
- Agents would edit the same files

## The Pattern

### 1. Identify Independent Domains

Group failures/tasks by what's broken or needed. Each domain should be independently solvable.

### 2. Compose Team via composing-agent-teams

**REQUIRED:** Use `team-powers:composing-agent-teams` to analyze and create the team.

Each specialist gets:
- **Specific scope:** One subsystem or problem
- **Clear goal:** Investigate/fix/implement this specific thing
- **Constraints:** Don't change code outside your scope
- **Communication:** Share findings with team, challenge each other

### 3. Create Tasks and Let Team Work

Create tasks via shared task list. Specialists self-claim and work in parallel. They message each other to share findings and challenge hypotheses.

### 4. Review and Integrate

When specialists finish:
- Read each summary
- Verify fixes don't conflict
- Run full test suite
- Integrate all changes

## Example: Debugging with Competing Hypotheses

```
Task: Users report the app exits after one message.

Team composition (via composing-agent-teams):
- Hypothesis A Investigator: WebSocket lifecycle
- Hypothesis B Investigator: Session management
- Hypothesis C Investigator: Event loop / signal handling

Working agreement: Each investigator tests their theory AND tries to disprove the others.

The debate structure produces more reliable root cause identification than sequential investigation.
```

## vs. parallel subagents

| Aspect | Agent Teams | Subagents |
|-|-|-|
| Communication | Teammates message each other directly | Only report results to caller |
| Knowledge sharing | Real-time via messaging | After completion only |
| Challenging findings | Adversarial debate possible | No inter-agent discussion |
| Cost | Higher (each teammate is a separate instance) | Lower (results summarized back) |
| Best for | Complex investigation, competing hypotheses | Focused tasks where only the result matters |

**Transition point:** If parallel subagents need to communicate with each other, Agent Teams are the natural next step.

## Integration

**This skill invokes:**
- `team-powers:composing-agent-teams` — REQUIRED for team setup

**Related:**
- `team-powers:systematic-debugging` — Each specialist follows this
- `team-powers:verification-before-completion` — Verify findings before claiming
