# PR ready to open: feature/WEB-AUTO-response-parser

Branch `shubhamkumar9199:feature/WEB-AUTO-response-parser` is pushed and all checks are green.
Open against `openMF/web-app` base `dev`.

---

## Title

`feat(copilot): implement ResponseParser with graceful degradation`

---

## Body

## Summary

Implements `ResponseParser` in `src/app/copilot/core/response-parser.ts` (roadmap item 1), the first pure-logic layer that converts accumulated MCP/LLM token-stream text into structured UI data.

### What changed

- **`response-parser.ts`** — three methods fully implemented:
  - `parseCards(raw)` — scans for ` ```action_card … ``` ` fenced blocks, JSON-parses each, validates `type` (enum guard) + `title` (string) + `data` (non-null object), silently skips malformed entries.
  - `parseSuggestions(raw)` — scans for ` ```suggest … ``` ` fenced blocks, returns trimmed non-empty lines.
  - `parse(raw)` — composes both, strips the fences from the prose, collapses excess blank lines, returns a fully-typed `McpResponse`.
  - Never throws under any input — all error paths return safe empty values.

- **`response-parser.spec.ts`** — 22 Jest tests across all three methods covering valid inputs, multi-card/multi-block responses, optional fields, malformed JSON, missing required fields, invalid type discriminants, and explicit no-throw guarantees.

### Roadmap note

This is roadmap item **1 of 5** for the Mifos Copilot feature. Jira/WEB number needs assigning.

### Verification

```
npx prettier --write   # clean
npx eslint             # 0 errors/warnings
npx jest --config jest.config.ts src/app/copilot/core/response-parser.spec.ts --no-coverage
# 22 passed, 22 total
npx ng build --configuration development
# Application bundle generation complete.
```
