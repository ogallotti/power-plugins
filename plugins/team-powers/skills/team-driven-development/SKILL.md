---
name: team-driven-development
description: Use when executing implementation plans with independent tasks that benefit from parallel specialist work and inter-agent coordination
---

# Team-Driven Development

## Overview

Execute implementation plans by composing a dynamic agent team with specialist teammates, shared task list, and inter-teammate reviews.

**Core principle:** Dynamic specialists + shared task list + teammate reviews = high quality, parallel execution.

**Announce at start:** "I'm using team-driven-development to execute this plan."

<IMPORTANT>
This skill replaces subagent-driven-development for tasks that benefit from Agent Teams.
If tasks are tightly coupled or you only need results (no inter-agent discussion), use subagents instead.
</IMPORTANT>

## When to Use

Use when you have an implementation plan with mostly independent tasks spanning 2+ domains of expertise, or when teammates need to share findings and coordinate.

**vs. subagent-driven:** Team-driven when teammates need to communicate. Subagent-driven when only results matter.
**vs. executing-plans:** Team-driven when tasks are independent and parallelizable. Executing-plans when sequential.

## Prerequisites

1. **Workspace isolation:** Use `team-powers:using-git-worktrees` to create isolated workspace
2. **Tools:** Fetch TeamCreate, TaskCreate, SendMessage, TaskList, TaskUpdate via ToolSearch

## The Process

### Step 1: Read and Analyze Plan

1. Read plan file ONCE
2. Extract ALL tasks with full text
3. Identify expertise domains, parallelizable tasks, dependencies, file ownership

### Step 2: Compose the Team

**REQUIRED:** Invoke `team-powers:composing-agent-teams` skill.

This will analyze domains in the plan, decide specialist roles dynamically, determine team size, create team with TeamCreate, spawn specialists with contextual prompts, and include reviewer role(s).

**The lead (you) does NOT implement.** You coordinate. If you catch yourself writing code, stop — delegate it.

### Step 3: Create Shared Task List

```
FOR EACH task in the plan:
  TaskCreate with:
    - Description: full task text from plan
    - Dependencies: tasks that must complete first
    - Assignment: specialist best suited (or unassigned for self-claim)
```

### Step 4: Monitor and Coordinate

As team lead:
- Monitor task progress via TaskList
- Answer teammate questions via SendMessage
- Unblock stuck teammates
- Redirect specialists who go off-track
- Ensure reviewers review completed tasks promptly
- Reassign tasks if a teammate is overloaded

DO NOT implement tasks yourself. DO NOT micromanage.

### Step 5: Review Process

Reviews happen via inter-teammate messaging, NOT by dispatching separate subagents.

**Two-stage review for each task:**

**Stage 1 — Spec Compliance:**
Implementer messages reviewer when task complete. Reviewer reads diff, checks against plan requirements. Approved → Stage 2. Issues → implementer fixes → re-review.

**Stage 2 — Code Quality:**
Reviewer checks clean code, meaningful tests, no over-engineering, error handling, security. Approved → mark complete. Issues (Critical/Important/Minor) → fix by severity.

For small teams (3 teammates), one reviewer handles both stages sequentially.

### Step 6: Final Cross-Cutting Review

After all tasks complete, reviewer does final review across ALL changes focusing on integration between domains, consistency, and plan completeness.

### Step 7: Finish

**REQUIRED:** Use `team-powers:finishing-a-development-branch` to verify tests, present options, clean up.

## Handling Teammate Status

| Status | Action |
|-|-|
| Task complete | Trigger review process |
| Asking questions | Answer via SendMessage |
| Blocked | Provide context, split task, or escalate |
| Idle | Suggest next unclaimed task |
| Conflict with teammate | Mediate, clarify file ownership |

## Model Selection

| Role Type | Model |
|-|-|
| Mechanical implementation | haiku |
| Integration + judgment | sonnet |
| Architecture + review | opus |

Default: sonnet for specialists, opus for reviewers.

## Red Flags

**Never:**
- Implement tasks yourself (you're the lead)
- Skip reviews (spec compliance AND code quality)
- Let two teammates edit the same file simultaneously
- Ignore teammate questions
- Start without workspace isolation
- Start on main/master branch without user consent

## Team Cleanup

When all work is done:
1. Ask all teammates to shut down gracefully
2. Wait for confirmations
3. Clean up team resources (lead runs cleanup)
4. NEVER let teammates run cleanup

## Integration

**This skill invokes:**
- `team-powers:composing-agent-teams` — REQUIRED for team composition
- `team-powers:using-git-worktrees` — REQUIRED for workspace isolation
- `team-powers:finishing-a-development-branch` — REQUIRED after completion

**Teammates should follow:**
- `team-powers:test-driven-development` — TDD for each task
- `team-powers:systematic-debugging` — When hitting bugs
- `team-powers:verification-before-completion` — Before claiming task done
