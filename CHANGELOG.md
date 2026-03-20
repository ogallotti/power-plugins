# Changelog

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
