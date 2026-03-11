# Testing Team-Powers Skills

This document describes the conceptual framework for testing skills.

## Overview

Testing skills that involve subagents, workflows, and complex interactions requires understanding how skills work at a fundamental level. Skills are structured markdown files with frontmatter metadata and content that guides agent behavior.

## Skill Structure

Each skill consists of:

1. **SKILL.md** - The main skill file with YAML frontmatter (`name`, `description`) and markdown content
2. **Supporting files** - Scripts, templates, examples, and documentation in the skill directory
3. **Keywords** - In the frontmatter, used for discovery and matching

## How Skills Work

Skills are loaded into the agent's context when invoked. The agent then follows the instructions in the skill. Key aspects:

- **when_to_use** - Describes conditions that should trigger skill activation
- **Type** - Whether the skill is a technique (step-by-step process), a reference (lookup information), or a workflow (end-to-end process)
- **Gate functions** - Checkpoints that force the agent to verify conditions before proceeding
- **Anti-patterns** - Explicit descriptions of what NOT to do, creating cognitive friction against shortcuts

## Skill Validation Approaches

### Academic Tests
Present questions about the skill content to verify the agent can correctly extract and apply the information. No time pressure, no competing priorities.

### Pressure Tests
Present realistic scenarios where shortcuts are tempting. Verify the skill's anti-shortcut language is strong enough to resist rationalization under:
- Time pressure
- Sunk cost fallacy
- Authority/social pressure
- Exhaustion

### Integration Tests
Verify the skill works correctly in the context of a full workflow, with other skills and tools available.

## Skill Quality Indicators

A well-crafted skill should:
- Have concrete, actionable steps (not vague guidance)
- Include explicit anti-patterns (what NOT to do)
- Use strong language for critical rules ("ALWAYS", "NEVER", not "should", "try to")
- Include gate functions at critical decision points
- Be tested under pressure scenarios to verify resistance to shortcuts

## Session Transcript Analysis

Session transcripts are JSONL (JSON Lines) files where each line is a JSON object representing a message or tool result.

### Key Fields

```json
{
  "type": "assistant",
  "message": {
    "content": [...],
    "usage": {
      "input_tokens": 27,
      "output_tokens": 3996,
      "cache_read_input_tokens": 1213703
    }
  }
}
```

### Tool Results

```json
{
  "type": "user",
  "toolUseResult": {
    "agentId": "3380c209",
    "usage": {
      "input_tokens": 2,
      "output_tokens": 787,
      "cache_read_input_tokens": 24989
    },
    "prompt": "You are implementing Task 1...",
    "content": [{"type": "text", "text": "..."}]
  }
}
```

The `agentId` field links to subagent sessions, and the `usage` field contains token usage for that specific subagent invocation.

## Understanding Token Usage

- **High cache reads**: Good - means prompt caching is working
- **High input tokens on main**: Expected - coordinator has full context
- **Similar costs per subagent**: Expected - each gets similar task complexity
- **Cost per task**: Typical range is $0.05-$0.15 per subagent depending on task
