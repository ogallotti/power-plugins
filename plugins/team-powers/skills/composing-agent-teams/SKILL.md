---
name: composing-agent-teams
description: Use when starting any multi-step implementation that could benefit from parallel work or requires multiple areas of expertise - analyzes the task and dynamically decides team composition with specialist teammates
---

# Composing Agent Teams

## Overview

Analyze the task and dynamically compose an agent team with the right specialists. Not every task needs a team — but when it does, the composition determines success.

**Core principle:** Let the work define the team, not the other way around.

**Announce at start:** "Analyzing the task to compose the right team."

<IMPORTANT>
Agent Teams require CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS enabled in settings.json or environment.
Tools needed: TeamCreate, TaskCreate, SendMessage — fetch via ToolSearch before first use.
</IMPORTANT>

## When to Use

Use when you have a plan or task with 2+ domains of expertise that could work in parallel.

**Agent Teams:** 2+ domains, need inter-agent discussion, complex review cycles
**Subagents:** Focused tasks, only result matters, no communication needed
**Solo:** Single domain, sequential, < 5 tool calls, same files

## The Composition Process

### Step 1: Analyze the Plan

Read the plan or requirements. Identify:

1. **Domains of expertise** — What distinct knowledge areas does this require?
2. **Independence** — Can domains work in parallel without editing same files?
3. **Interaction points** — Where do domains need to coordinate or review each other?

### Step 2: Map Domains to Specialist Roles

**DO NOT use a fixed template.** Analyze EACH plan uniquely. The specialist roles emerge from the work, not from a predefined list.

**Domain detection heuristic:**

```
FOR EACH task group in the plan:
  1. What knowledge is needed that differs from other groups?
  2. Would a human team hire a different person for this?
  3. Can this proceed independently of other groups?

  IF all three → separate specialist role
```

**Common mappings (examples, not prescriptions):**

| Domain Detected | Specialist Role |
|-|-|
| React/Vue/CSS/layout | Frontend Specialist |
| API/database/auth | Backend Specialist |
| iOS/Android/Flutter | Mobile Specialist |
| LGPD/GDPR/compliance | Legal/Compliance Specialist |
| SQL/migrations/schema | Database Specialist |
| CI/CD/deploy/infra | DevOps Specialist |
| Security/auth/crypto | Security Specialist |
| Performance/scaling | Performance Specialist |
| Tests/QA/coverage | QA Specialist |
| Design/UX/accessibility | Design Specialist |
| Data/ML/analytics | Data Specialist |

**Custom roles are encouraged.** If the plan involves a niche domain (e.g., audio processing, blockchain, hardware integration), create a specialist for it.

### Step 3: Add Standing Roles

Every team gets review capability:

**Small team (3 teammates):** 2 specialists + 1 reviewer (handles both spec and code quality)
**Medium team (4-5 teammates):** 2-3 specialists + 1 spec reviewer + 1 code quality reviewer

### Step 4: Create the Team

1. TeamCreate with descriptive team name
2. Spawn each teammate with clear role, domain context, and task assignments
3. Model selection: always use the user's default model unless the user explicitly specifies otherwise
4. Require plan approval for high-risk teammates

### Step 5: Create Shared Task List

```
FOR EACH task in the plan:
  TaskCreate with:
    - Clear description
    - Dependencies on other tasks (if any)
    - Assignment to specialist (or leave unassigned for self-claim)
```

### Step 6: Spawn Prompt Template

Each specialist gets a targeted spawn prompt:

```
You are the [ROLE] for this team. Your expertise: [DOMAIN].

PROJECT CONTEXT:
[Brief project description]

YOUR TASKS:
[List specific tasks this specialist owns]

WORKING AGREEMENTS:
- Claim tasks from the shared task list before starting
- Message the team when you complete a task or hit a blocker
- Message reviewers when implementation is ready for review
- DO NOT edit files owned by other specialists without coordination
- Follow TDD: test first, watch fail, implement, watch pass
- Commit after each completed task
```

## Team Size Guidelines

- 3 teammates: Most tasks. 2 specialists + 1 reviewer
- 4-5 teammates: Complex multi-domain work
- 5-6 tasks per teammate ideal
- More teammates does not equal better. Coordination overhead scales.

## File Ownership

Before creating the team, assign each file to exactly ONE specialist. If a file needs changes from 2+ specialists, split into dependent tasks or assign to one with review by the other.

## Integration

**This skill is invoked by:**
- **team-powers:team-driven-development** — REQUIRED before execution begins

**Works alongside:**
- `team-powers:test-driven-development` — Teammates follow TDD
- `team-powers:systematic-debugging` — Teammates debug systematically
- `team-powers:verification-before-completion` — Teammates verify before claiming done
- `team-powers:using-git-worktrees` — Isolated workspace before starting
- `team-powers:finishing-a-development-branch` — After all work complete
