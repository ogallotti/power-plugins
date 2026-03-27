---
name: finishing-a-development-branch
description: Use when implementation is complete, all tests pass, and you need to decide how to integrate the work - guides completion of development work by presenting structured options for merge, PR, or cleanup
---

# Finishing a Development Branch

## Overview

Guide completion of development work by presenting clear options and handling chosen workflow.

**Core principle:** Verify tests → Simplify → Security review (if applicable) → Present options → Execute choice → Clean up.

**Announce at start:** "I'm using the finishing-a-development-branch skill to complete this work."

## The Process

### Step 1: Verify Tests

**Before presenting options, verify tests pass:**

```bash
# Run project's test suite
npm test / cargo test / pytest / go test ./...
```

**If tests fail:**
```
Tests failing (<N> failures). Must fix before completing:

[Show failures]

Cannot proceed with merge/PR until tests pass.
```

Stop. Don't proceed to Step 2.

**If tests pass:** Continue to Step 2.

### Step 2: Simplify

**REQUIRED:** Run `/simplify` to review all changed code for reuse, quality, and efficiency. This launches 3 parallel review agents on the full diff. Fix any issues found and commit.

**Skip if:** The calling skill (executing-plans or team-driven-development) already ran simplify in a previous step.

### Step 3: Security Review (automatic)

Scan the diff for security-sensitive changes. Look for:
- Authentication or authorization logic
- API endpoints, route handlers, middleware
- Database queries, ORM usage, raw SQL
- Cryptography, token generation, secrets handling
- User input processing, file uploads, redirects
- Environment variables, config with credentials
- Dependency additions (new packages)

**If any of the above are present:** run `/security-review` silently. Fix any findings and commit. Only escalate to the user if a finding requires a product decision (e.g., "this endpoint exposes user data — is that intentional?").

**If none detected:** skip silently.

### Step 4: Determine Base Branch

```bash
# Try common base branches
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null
```

Or ask: "This branch split from main - is that correct?"

### Step 5: Present Options or Auto-Finish

**First, check for a configured default** in the project's CLAUDE.md:

```bash
grep -i "worktree-finish" CLAUDE.md 2>/dev/null
```

**If a default is configured** (e.g., `worktree-finish: merge` or `worktree-finish: pr`):
- Execute the configured option automatically (Step 6)
- Report what was done: "Merge no main concluído. Worktree limpa."
- Do NOT ask the user

**If no default is configured (first time setup):**

Use `AskUserQuestion` with descriptive labels and descriptions so the user understands each option:

- **label:** "Merge locally" / **description:** "Merge the branch into main on your machine and clean up. Best for solo developers who want changes applied immediately."
- **label:** "Create PR" / **description:** "Push the branch to GitHub and open a Pull Request for review. Best when you want to review the diff before merging, or work in a team."
- **label:** "Always ask" / **description:** "Show these options every time a feature is completed. Best when it depends on the situation."

**question:** "How should I finish completed work? I can save your choice so future agents don't ask again."

After the user chooses, use `AskUserQuestion` again to offer saving the preference:

- **question:** "Want me to save this as the project default? All future agents will use it automatically."
- **label:** "Yes, save to CLAUDE.md" / **description:** "Adds worktree-finish setting to the project's CLAUDE.md. You won't be asked again."
- **label:** "No, just this time" / **description:** "Use this option now but keep asking in the future."

If yes: append `worktree-finish: <value>` to the project's CLAUDE.md and commit. If no: proceed with the chosen option for this time only.

**Supported values for `worktree-finish` in CLAUDE.md:**
- `merge` — merge locally + cleanup worktree (Option 1)
- `pr` — push + create PR + cleanup worktree (Option 2)
- `ask` — always ask (current behavior, also the default when not configured)

### Step 6: Execute Choice

#### Option 1: Merge Locally

```bash
# Switch to base branch
git checkout <base-branch>

# Pull latest
git pull

# Merge feature branch
git merge <feature-branch>

# Verify tests on merged result
<test command>

# If tests pass
git branch -d <feature-branch>
```

Then: Cleanup worktree (Step 7)

#### Option 2: Push and Create PR

```bash
# Push branch
git push -u origin <feature-branch>

# Create PR
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary
<2-3 bullets of what changed>

## Test Plan
- [ ] <verification steps>
EOF
)"
```

Then: Cleanup worktree (Step 7)

#### Option 3: Keep As-Is

Report: "Keeping branch <name>. Worktree preserved at <path>."

**Don't cleanup worktree.**

#### Option 4: Discard

**Confirm first:**
```
This will permanently delete:
- Branch <name>
- All commits: <commit-list>
- Worktree at <path>

Type 'discard' to confirm.
```

Wait for exact confirmation.

If confirmed:
```bash
git checkout <base-branch>
git branch -D <feature-branch>
```

Then: Cleanup worktree (Step 7)

### Step 7: Cleanup Worktree

**For Options 1, 2, 4:**

Check if in worktree:
```bash
git worktree list | grep $(git branch --show-current)
```

If yes:
```bash
git worktree remove <worktree-path>
```

**For Option 3:** Keep worktree.

## Quick Reference

| Option | Merge | Push | Keep Worktree | Cleanup Branch |
|--------|-------|------|---------------|----------------|
| 1. Merge locally | ✓ | - | - | ✓ |
| 2. Create PR | - | ✓ | ✓ | - |
| 3. Keep as-is | - | - | ✓ | - |
| 4. Discard | - | - | - | ✓ (force) |

## Common Mistakes

**Skipping test verification**
- **Problem:** Merge broken code, create failing PR
- **Fix:** Always verify tests before offering options

**Open-ended questions**
- **Problem:** "What should I do next?" → ambiguous
- **Fix:** Present exactly 4 structured options

**Automatic worktree cleanup**
- **Problem:** Remove worktree when might need it (Option 2, 3)
- **Fix:** Only cleanup for Options 1 and 4

**No confirmation for discard**
- **Problem:** Accidentally delete work
- **Fix:** Require typed "discard" confirmation

## Red Flags

**Never:**
- Proceed with failing tests
- Merge without verifying tests on result
- Delete work without confirmation
- Force-push without explicit request

**Always:**
- Verify tests before offering options
- Present exactly 4 options
- Get typed confirmation for Option 4
- Clean up worktree for Options 1 & 4 only

## Integration

**Called by:**
- **team-driven-development** (Step 8) - After all tasks complete
- **executing-plans** (Step 4) - After all tasks complete

**Pairs with:**
- **using-git-worktrees** - Cleans up worktree created by that skill
