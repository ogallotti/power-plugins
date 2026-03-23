# Upstream Sync Implementation Plan

> **For agentic workers:** REQUIRED: Use team-powers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking. This is a single-domain sequential plan (all changes are in the same plugin directory).

**Goal:** Port all relevant upstream changes from obra/superpowers (post March 11, 2026) into team-powers fork

**Architecture:** Direct file replacements and targeted edits across hooks, brainstorm server scripts, reviewer prompts, and skill markdown files. All changes are independent — each task can be verified in isolation.

**Tech Stack:** Bash, Node.js, Markdown

---

## Task 1: Replace brainstorm server with zero-dep version

**Files:**
- Create: `plugins/team-powers/skills/brainstorming/scripts/server.cjs`
- Delete: `plugins/team-powers/skills/brainstorming/scripts/index.js`
- Delete: `plugins/team-powers/skills/brainstorming/scripts/package.json`
- Delete: `plugins/team-powers/skills/brainstorming/scripts/package-lock.json`

- [ ] **Step 1: Create server.cjs**

Copy the upstream zero-dep server (RFC 6455 WebSocket, fs.watch, http.createServer, 30-min idle timeout, owner PID monitoring). File is self-contained — no npm dependencies.

- [ ] **Step 2: Delete old files**

Remove `index.js`, `package.json`, `package-lock.json`. The new `server.cjs` replaces all of them.

- [ ] **Step 3: Verify server.cjs references are consistent**

Ensure `server.cjs` reads `frame-template.html` and `helper.js` from `__dirname` (same as old `index.js`). Verify no `superpowers` references — should be harness-agnostic.

- [ ] **Step 4: Commit**

```bash
git add plugins/team-powers/skills/brainstorming/scripts/server.cjs
git rm plugins/team-powers/skills/brainstorming/scripts/index.js
git rm plugins/team-powers/skills/brainstorming/scripts/package.json
git rm plugins/team-powers/skills/brainstorming/scripts/package-lock.json
git commit -m "feat: replace Express brainstorm server with zero-dep server.cjs"
```

---

## Task 2: Update start-server.sh with upstream improvements

**Files:**
- Modify: `plugins/team-powers/skills/brainstorming/scripts/start-server.sh`

Changes:
1. Fix shebang: `#!/bin/bash` → `#!/usr/bin/env bash`
2. Change `node index.js` → `node server.cjs` (2 occurrences: foreground and background)
3. Add owner PID resolution (grandparent PID for harness tracking)
4. Add MSYS2/Windows PID namespace skip
5. Add Windows/Git Bash auto-foreground detection
6. Pass `BRAINSTORM_OWNER_PID` env var to server

- [ ] **Step 1: Replace start-server.sh with upstream version**

Use the upstream version, adapting `.superpowers/` → `.team-powers/` paths.

- [ ] **Step 2: Verify `.team-powers/` paths are correct**

Check that `--project-dir` stores in `.team-powers/brainstorm/`, not `.superpowers/brainstorm/`.

- [ ] **Step 3: Commit**

```bash
git add plugins/team-powers/skills/brainstorming/scripts/start-server.sh
git commit -m "feat: update start-server.sh with owner PID tracking and Windows support"
```

---

## Task 3: Update stop-server.sh with graceful shutdown

**Files:**
- Modify: `plugins/team-powers/skills/brainstorming/scripts/stop-server.sh`

Changes:
1. Fix shebang: `#!/bin/bash` → `#!/usr/bin/env bash`
2. Add graceful shutdown: SIGTERM → wait 2s → SIGKILL escalation
3. Add verification that process actually stopped
4. Keep `.team-powers/` path convention (not `.superpowers/`)

- [ ] **Step 1: Replace stop-server.sh with upstream version**

Use upstream version, adapting `.superpowers/` → `.team-powers/` references in comments.

- [ ] **Step 2: Commit**

```bash
git add plugins/team-powers/skills/brainstorming/scripts/stop-server.sh
git commit -m "fix: add graceful shutdown with SIGKILL fallback to stop-server.sh"
```

---

## Task 4: Add charset meta to frame-template.html

**Files:**
- Modify: `plugins/team-powers/skills/brainstorming/scripts/frame-template.html`

- [ ] **Step 1: Add `<meta charset="utf-8">` to head**

Add after `<head>` opening tag, before `<title>`.

- [ ] **Step 2: Commit**

```bash
git add plugins/team-powers/skills/brainstorming/scripts/frame-template.html
git commit -m "fix: add charset meta tag to brainstorm frame template"
```

---

## Task 5: Update visual-companion.md with server lifecycle docs

**Files:**
- Modify: `plugins/team-powers/skills/brainstorming/visual-companion.md`

Changes:
1. Add liveness check instruction to "The Loop" step 1 (check `.server-info` exists, restart if `.server-stopped` exists)
2. Add platform-specific launch instructions for Claude Code (macOS/Linux vs Windows) and other platforms
3. Mention 30-minute idle auto-exit behavior

- [ ] **Step 1: Replace visual-companion.md with upstream version**

Adapt all `.superpowers/` → `.team-powers/` paths and keep the existing team-powers branding.

- [ ] **Step 2: Commit**

```bash
git add plugins/team-powers/skills/brainstorming/visual-companion.md
git commit -m "docs: update visual-companion with server lifecycle and platform-specific launch docs"
```

---

## Task 6: Fix session-start hook — heredoc → printf (bash 5.3+ hang)

**Files:**
- Modify: `plugins/team-powers/hooks/session-start`

The current `cat <<EOF` blocks (lines 33-40 and 42-46) use unquoted heredocs with variable expansion. On bash 5.3+, this hangs when the expanded content exceeds ~512 bytes. Replace with `printf`.

- [ ] **Step 1: Replace heredoc blocks with printf**

Replace lines 32-47:
```bash
if [ -n "${CLAUDE_PLUGIN_ROOT:-}" ]; then
  printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}' "$session_context"
else
  printf '{"additional_context":"%s"}' "$session_context"
fi
```

- [ ] **Step 2: Fix BASH_SOURCE → $0**

Change line 6 from `${BASH_SOURCE[0]:-$0}` to just `$0`.

- [ ] **Step 3: Test hook output**

```bash
echo '{}' | CLAUDE_PLUGIN_ROOT=/tmp ./plugins/team-powers/hooks/session-start | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK' if 'hookSpecificOutput' in d else 'FAIL')"
```

- [ ] **Step 4: Commit**

```bash
git add plugins/team-powers/hooks/session-start
git commit -m "fix: replace heredoc with printf in session-start to prevent bash 5.3+ hang"
```

---

## Task 7: Remove `resume` from SessionStart matcher

**Files:**
- Modify: `plugins/team-powers/hooks/hooks.json`

- [ ] **Step 1: Change matcher**

Line 5: `"startup|resume|clear|compact"` → `"startup|clear|compact"`

- [ ] **Step 2: Commit**

```bash
git add plugins/team-powers/hooks/hooks.json
git commit -m "fix: stop re-firing SessionStart hook on --resume"
```

---

## Task 8: Update spec-document-reviewer-prompt.md (raise bar)

**Files:**
- Modify: `plugins/team-powers/skills/brainstorming/spec-document-reviewer-prompt.md`

Replace the old verbose reviewer prompt with the upstream calibrated version:
- Remove "Coverage" and "Architecture" categories
- Change "Clarity" to focus on ambiguity that causes building the wrong thing
- Replace "CRITICAL" section with "Calibration" section
- Add "[why it matters for planning]" to issue format
- Make recommendations explicitly "advisory, do not block approval"

- [ ] **Step 1: Replace file content with upstream version**

Adapt `docs/superpowers/specs/` → `docs/team-powers/specs/` in the dispatch-after line.

- [ ] **Step 2: Commit**

```bash
git add plugins/team-powers/skills/brainstorming/spec-document-reviewer-prompt.md
git commit -m "feat: calibrate spec reviewer — raise bar, reduce nitpick loops"
```

---

## Task 9: Update plan-document-reviewer-prompt.md (single-pass, raise bar)

**Files:**
- Modify: `plugins/team-powers/skills/writing-plans/plan-document-reviewer-prompt.md`

Replace per-chunk review with single-pass whole-plan review:
- Remove chunk-related categories (File Structure, File Size, Task Syntax, Chunk Size)
- Add "Buildability" check
- Replace "CRITICAL" section with "Calibration" section
- Change output format from "Chunk N" to whole plan

- [ ] **Step 1: Replace file content with upstream version**

No path adaptations needed — the prompt template uses placeholders.

- [ ] **Step 2: Commit**

```bash
git add plugins/team-powers/skills/writing-plans/plan-document-reviewer-prompt.md
git commit -m "feat: simplify plan reviewer — single-pass review, raise approval bar"
```

---

## Task 10: Update brainstorming SKILL.md — max iterations 5 → 3

**Files:**
- Modify: `plugins/team-powers/skills/brainstorming/SKILL.md`

- [ ] **Step 1: Change max iterations in checklist (line 30)**

`max 5 iterations` → `max 3 iterations`

- [ ] **Step 2: Change max iterations in spec review loop (line 124)**

`5 iterations` → `3 iterations`

- [ ] **Step 3: Add context isolation language to checklist step 7 (line 30)**

Add "with precisely crafted review context (never your session history)" to the spec review loop dispatch instruction.

- [ ] **Step 4: Commit**

```bash
git add plugins/team-powers/skills/brainstorming/SKILL.md
git commit -m "feat: reduce review loops to 3 max, add context isolation to spec review"
```

---

## Task 11: Update writing-plans SKILL.md — single-pass review, context isolation

**Files:**
- Modify: `plugins/team-powers/skills/writing-plans/SKILL.md`

- [ ] **Step 1: Replace per-chunk review loop with single-pass**

Replace lines 113-130 with single-pass whole-plan review:
- Remove chunk boundaries, chunk size limits
- Dispatch single reviewer for complete plan
- Add "with precisely crafted review context — never your session history"
- Change max iterations from 5 to 3

- [ ] **Step 2: Commit**

```bash
git add plugins/team-powers/skills/writing-plans/SKILL.md
git commit -m "feat: simplify plan review to single-pass, add context isolation"
```

---

## Task 12: Add context isolation principle to delegation skills

**Files:**
- Modify: `plugins/team-powers/skills/dispatching-parallel-teams/SKILL.md`
- Modify: `plugins/team-powers/skills/composing-agent-teams/SKILL.md`
- Modify: `plugins/team-powers/skills/team-driven-development/SKILL.md`
- Modify: `plugins/team-powers/skills/requesting-team-review/SKILL.md`

- [ ] **Step 1: Add context isolation paragraph to dispatching-parallel-teams Overview**

After the existing "Core principle:" line, add:

> You delegate tasks to specialized agents with isolated context. By precisely crafting their instructions and context, you ensure they stay focused and succeed at their task. They should never inherit your session's context or history — you construct exactly what they need. This also preserves your own context for coordination work.

- [ ] **Step 2: Add context isolation to composing-agent-teams spawn prompt**

In the spawn prompt template section, add a note about crafting precise context for each specialist.

- [ ] **Step 3: Add context isolation to team-driven-development overview**

Add context isolation principle to the overview section.

- [ ] **Step 4: Add context isolation to requesting-team-review**

Add note about providing precisely crafted review context when dispatching reviewers.

- [ ] **Step 5: Commit**

```bash
git add plugins/team-powers/skills/dispatching-parallel-teams/SKILL.md
git add plugins/team-powers/skills/composing-agent-teams/SKILL.md
git add plugins/team-powers/skills/team-driven-development/SKILL.md
git add plugins/team-powers/skills/requesting-team-review/SKILL.md
git commit -m "feat: add context isolation principle to all delegation skills"
```
