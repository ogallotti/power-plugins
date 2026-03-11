---
name: requesting-team-review
description: Use when a task is complete and needs review within an agent team - coordinates spec compliance and code quality reviews via teammate messaging instead of dispatching subagents
---

# Requesting Team Review

## Overview

Coordinate code reviews within an agent team using inter-teammate messaging. Reviews stay in-context because reviewer teammates persist across tasks.

**Core principle:** Two-stage review via messaging. Spec first, quality second. Never skip either.

## When to Use

**Within Agent Teams:** Use this skill (reviews via SendMessage to reviewer teammate)
**Without Agent Teams:** Dispatch a reviewer subagent with the code-reviewer.md template

## The Two-Stage Process

### Stage 1: Spec Compliance Review

**Implementer sends to spec reviewer:**

```
Task [N]: [name] — ready for spec review.

Changes: [list of files]
Plan reference: [task description from plan]
Commits: [SHAs]
```

**Spec reviewer checks:**
- All requirements from plan addressed (nothing missing)
- No extra features added (YAGNI)
- API contracts match spec
- Edge cases covered

Outcomes: Approved → Stage 2. Issues → implementer fixes → re-review.

### Stage 2: Code Quality Review

**Code quality reviewer checks:**
- Clean, readable code
- Tests are meaningful (not testing mocks)
- No duplication or over-engineering
- Error handling appropriate
- No security vulnerabilities

Outcomes: Approved → mark complete. Issues (Critical/Important/Minor) → fix by severity.

### Review Severity Response

| Severity | Action |
|-|-|
| Critical | Fix immediately. Re-review. |
| Important | Fix before next task. Re-review. |
| Minor | Note for later. |

## For Small Teams (Single Reviewer)

One reviewer handles both stages sequentially. Order still matters: spec first, quality second.

## When to Push Back

Push back when feedback breaks existing functionality, violates YAGNI, or conflicts with architectural decisions. Use technical reasoning, reference tests/code.

Follow `team-powers:receiving-code-review` for detailed guidance.

## Red Flags

**Never:**
- Skip spec review
- Start code quality before spec compliance passes
- Proceed with unfixed Critical or Important issues
- Let implementer self-review replace teammate review

**If review loops exceed 3 iterations:** escalate to team lead or user.

## Integration

**Used by:** `team-powers:team-driven-development`
**References:** `team-powers:receiving-code-review`, `team-powers:verification-before-completion`
