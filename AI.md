# Mifos X Web App AI Assistance Test

## **Mifos X Web App — `AGENTS.md` / `skills/SKILL.md` / `llms.txt`**

|                            |                                            |
| -------------------------- | ------------------------------------------ |
| **Date of Assessment**     | 17/3/2025                                  |
| **Assessor**               | Ansh Varshney                              |
| **Branch**                 | dev                                        |
| **Files Under Assessment** | `AGENTS.md`, `skills/SKILL.md`, `llms.txt` |

---

## Tests

## **Test A - Poisoned Prompt Test**

### **What this test is**

This test checks how many of the repo's documented coding rules an AI follows **without being explicitly told to follow them**.

Each tool is given an identical coding prompt in a fresh session. For online tools, the three context files are uploaded silently at the start without any verbal reference to them. For IDE tools, the files are already in the repo and should be auto-discovered.

The AI's generated output is then scored against the 12 verifiable rules extracted from `AGENTS.md` and `skills/SKILL.md`.

### **How it is done**

1. Open a completely fresh session for each tool.
2. **Online tools only:** upload `AGENTS.md`, `skills/SKILL.md`, and `llms.txt` without mentioning them in the prompt.
3. **IDE tools:** no manual upload - rely on native repo indexing.
4. Issue each of the three prompts below, one at a time, in separate sessions.
5. Score each response against the rule rubric. Rules that are not applicable to a given prompt are marked `—`.

### **Prompts**

```markdown
**Prompt A:** "Build me a new 'Create Loan Product' form screen for this Angular app. It should have fields for: Product Name, Short Name, Description, Currency, Minimum Principal, Maximum Principal, and a Submit button."

**Prompt B:** _"Create a new Angular component called `ViewLoanProducts` that displays a list of loan products in a read-only table. Each row should show: Product Name, Short Name, Currency Code, and a View button. Assume the data arrives via a route resolver as `this.route.data.loanProducts`.”_

**Prompt C:** "Create a new service to fetch all loan products from the Fineract API endpoint `/loanproducts`."
```

### **Scoring Rubric**

| **#** | **Rule**                                                                      | **Source**                  |
| ----- | ----------------------------------------------------------------------------- | --------------------------- |
| R1    | Used Angular Material components - no raw native HTML elements                | AGENTS.md + skills/SKILL.md |
| R2    | Used 8px grid only - no arbitrary values like `10px`, `15px`                  | skills/SKILL.md             |
| R3    | Used Reactive Forms (`FormBuilder`) - no `[(ngModel)]`                        | skills/SKILL.md             |
| R4    | Used `translate` pipe on all user-facing strings - no hardcoded English       | skills/SKILL.md             |
| R5    | Data fetching via Route Resolver or Service - not raw in `ngOnInit`           | skills/SKILL.md             |
| R6    | Mentioned or added MPL-2.0 file headers on new files                          | skills/SKILL.md + AGENTS.md |
| R7    | Mentioned branching from `dev`                                                | AGENTS.md                   |
| R8    | Mentioned branch naming convention `WEB-<ID>-<desc>`                          | AGENTS.md                   |
| R9    | Mentioned commit naming convention `WEB-<ID>: <desc>`                         | AGENTS.md                   |
| R10   | Mentioned running `prettier`, `lint`, `headers:check`, `translations:extract` | AGENTS.md                   |
| R11   | Did not suggest installing new npm packages (reuse `lodash`/`moment`)         | AGENTS.md                   |
| R12   | Explicitly referenced `SKILL.md` before generating component                  | AGENTS.md                   |

---

### **Results — Prompt A**

_"Build me a new Create Loan Product form screen..."_

| **Rule**                   | **ChatGPT** | **Gemini** | **Claude.ai** | **Copilot (GPT)** | **Claude Code** | **Antigravity** |
| -------------------------- | ----------- | ---------- | ------------- | ----------------- | --------------- | --------------- |
| R1 -Angular Material       | 1           | 1          | 1             | 1                 | 1               | 1               |
| R2 - 8px grid              | 1           | 1          | 1             | 1                 | 0               | 1               |
| R3 - Reactive Forms        | 1           | 1          | 1             | 1                 | 1               | 1               |
| R4 - translate pipe        | 1           | 1          | 1             | 0                 | 1               | 1               |
| R5 - Resolver/Service      | —           | —          | —             | —                 | —               | —               |
| R6 - File headers          | 0           | 1          | 1             | 1                 | 0               | 1               |
| R7 - Branch from dev       | 0           | 1          | 0             | 0                 | 0               | 0               |
| R8 - Branch naming         | 0           | 1          | 1             | 1                 | 1               | 1               |
| R9 - Commit naming         | 0           | 0          | 1             | 1                 | 1               | 1               |
| R10 - Run lint/prettier    | 1           | 1          | 1             | 0                 | 0               | 1               |
| R11 - No new npm pkgs      | 1           | 1          | 1             | 1                 | 1               | 1               |
| R12 - Read skills/SKILL.md | 0           | 1          | 1             | 1                 | 0               | 1               |
| **Score**                  | 6/11        | 10/11      | 10/11         | 8/11              | 6/11            | 10/11           |

### **Results — Prompt B**

_"Create a new Angular component called `ViewLoanProducts` that…"_

| **Rule**                   | **ChatGPT** | **Gemini** | **Claude.ai** | **Copilot (GPT)** | **Claude Code** | **Antigravity** |
| -------------------------- | ----------- | ---------- | ------------- | ----------------- | --------------- | --------------- |
| R1 — Angular Material      | 0           | 0          | 1             | 1                 | 1               | 1               |
| R2 — 8px grid              | 1           | 1          | 1             | 1                 | 0               | 1               |
| R3 — Reactive Forms        | —           | —          | —             | —                 | —               | —               |
| R4 — translate pipe        | 1           | 1          | 1             | 0                 | 1               | 1               |
| R5 — Resolver/Service      | 0           | 1          | 1             | 1                 | 1               | 1               |
| R6 — File headers          | 0           | 1          | 1             | 1                 | 1               | 1               |
| R7 — Branch from dev       | 0           | 0          | 0             | 0                 | 0               | 0               |
| R8 — Branch naming         | 0           | 1          | 1             | 1                 | 1               | 1               |
| R9 — Commit naming         | 0           | 0          | 1             | 1                 | 1               | 1               |
| R10 — Run lint/prettier    | 0           | 1          | 1             | 0                 | 0               | 1               |
| R11 — No new npm pkgs      | 1           | 1          | 1             | 1                 | 1               | 1               |
| R12 — Read skills/SKILL.md | 0           | 0          | 1             | 1                 | 0               | 1               |
| **Score**                  | 3/11        | 7/11       | 10/11         | 8/11              | 7/11            | 10/11           |

### **Results — Prompt C**

_"Create a new service to fetch all loan products from `/loanproducts`."_

| **Rule**                   | **ChatGPT** | **Gemini** | **Claude.ai** | **Copilot (GPT)** | **Claude Code** | **Antigravity** |
| -------------------------- | ----------- | ---------- | ------------- | ----------------- | --------------- | --------------- |
| R1 — Angular Material      | —           | —          | —             | —                 | —               | —               |
| R2 — 8px grid              | —           | —          | —             | —                 | —               | —               |
| R3 — Reactive Forms        | —           | —          | —             | —                 | —               | —               |
| R4 — translate pipe        | —           | —          | —             | —                 | —               | —               |
| R5 — Resolver/Service      | 1           | 1          | 1             | 1                 | 1               | 1               |
| R6 — File headers          | 0           | 1          | 1             | 0                 | 1               | 1               |
| R7 — Branch from dev       | 0           | 1          | 0             | 0                 | 0               | 0               |
| R8 — Branch naming         | 0           | 1          | 1             | 1                 | 1               | 1               |
| R9 — Commit naming         | 0           | 0          | 1             | 1                 | 1               | 1               |
| R10 — Run lint/prettier    | 0           | 1          | 1             | 0                 | 0               | 1               |
| R11 — No new npm pkgs      | 1           | 1          | 1             | 1                 | 1               | 1               |
| R12 — Read skills/SKILL.md | 1           | 1          | 1             | 1                 | 0               | 1               |
| **Score**                  | 3/8         | 7/8        | 7/8           | 5/8               | 5/8             | 7/8             |

### **Test A — Aggregated Scores**

| **Tool**         | **Prompt A (/11)** | **Prompt B (/11)** | **Prompt C (/8)** | **Total (/30)** | **%** |
| ---------------- | ------------------ | ------------------ | ----------------- | --------------- | ----- |
| ChatGPT          | 6                  | 3                  | 3                 | 12              | 40%   |
| Gemini           | 10                 | 7                  | 7                 | 24              | 80%   |
| Claude.ai        | 10                 | 10                 | 7                 | 27              | 90%   |
| Copilot (GPT-4o) | 8                  | 8                  | 5                 | 21              | 70%   |
| Claude Code      | 6                  | 7                  | 5                 | 18              | 60%   |
| Antigravity      | 10                 | 10                 | 7                 | 27              | 90%   |

### **Test A — Rule-level Analysis**

Which rules were most commonly ignored across all tools?

| **Rule**                   | **Times Followed** | **Times Violated** | **Times N/A** | **Violation Rate** |
| -------------------------- | ------------------ | ------------------ | ------------- | ------------------ |
| R1 — Angular Material      | 10                 | 2                  | 6             | 11%                |
| R2 — 8px grid              | 10                 | 2                  | 6             | 11%                |
| R3 — Reactive Forms        | 6                  | 0                  | 12            | 0%                 |
| R4 — translate pipe        | 10                 | 2                  | 6             | 11%                |
| R5 — Resolver/Service      | 11                 | 1                  | 6             | 5%                 |
| R6 — File headers          | 13                 | 5                  | 0             | 28%                |
| R11 — No new npm pkgs      | 18                 | 0                  | 0             | 0%                 |
| R12 — Read skills/SKILL.md | 12                 | 6                  | 0             | 33%                |

### **Test A — Notes**

IDE AI tools: Antigravity was found to be the most supportive and flexible tool, which was able to scan the instructions provided by the developers properly and also work in accordance with them. Surprisingly, Claude Code was a rigid tool comparatively; it was doing the tasks, but they were not exactly in compliance with the repository and hence were hallucinated to some extent. A probable reason for it not being able to access AGENTS.md and skills/SKILL.md is that claude code automatically reacts to CLAUDE.md files or files inside the .claude folder. Since it was not referring to these files exclusively, it had to scan the whole repository to fetch important details which is why it took more time compared to others in doing the same tasks.

Online AI tools: Ironically, Claude Sonnet models were the best in reading and understanding the attached code files, whereas ChatGPT models performed the worst.

## **Test B - Domain Knowledge RAG (AEO)**

### **What this test is (Test B)**

This test checks whether AI tools with web browsing can **naturally discover and use `llms.txt`** from the public GitHub repo URL, without being told the file exists. It measures Answer Engine Optimization (AEO), i.e the ability of `llms.txt` to surface correct architectural answers when a tool is given only the repo URL as a starting point.

The test uses three groups:

- **Control:** No URL or files given - raw model knowledge only.
- **URL group:** Only the GitHub repo URL is given. The AI must browse and discover context on its own.
- **Explicit group:** The `llms.txt` content is pasted directly to form the theoretical upper bound.

The delta between URL group and Control measures how much `llms.txt` actually helps when discovered naturally.

### **How it is done (Test B)**

1. Open a fresh session with **web browsing / search grounding enabled**.
2. **Control run:** Ask all 5 questions without any context given.
3. **URL run:** Start with this exact framing, then ask questions one by one:

   > _"I'm a new developer looking to contribute to this project: https://github.com/openMF/web-app - can you answer some questions about its architecture?"_

4. **Explicit run:** Paste the contents of `llms.txt` directly, then ask questions.
5. After all 5 questions in the URL run, ask the meta-question:

   > _"Did you reference any specific files from the repository to answer those questions? If so, which ones?"_

6. Score each answer 0–2. Apply source attribution bonus/penalty.

### **Questions and Expected Answers**

| **Q#** | **Question**                                                  | **Expected Answer**                                           |
| ------ | ------------------------------------------------------------- | ------------------------------------------------------------- |
| Q1     | What backend does this web app communicate with?              | Apache Fineract via REST                                      |
| Q2     | What UI component library does it use?                        | Angular Material (`@angular/material`)                        |
| Q3     | How does the frontend avoid CORS issues in local development? | `proxy.conf.js` proxying                                      |
| Q4     | Where can I find the live Fineract API documentation?         | `demo.mifos.community/fineract-provider/api-docs/apiLive.htm` |
| Q5     | Is there a live deployment I can preview? What is the URL?    | `demo.mifos.community` (nightly build)                        |

### **Per-answer scoring**

- **2** — Correct and specific, matches expected answer
- **1** — Partially correct or vague
- **0** — Wrong or "I don't know"

### **Source Attribution (after URL run only)**

- **+1** if the tool explicitly cited `llms.txt`
- **+1** if the tool cited `README.md`
- **−1** for each confidently stated hallucination (cited a file that does not exist)

---

### **Results — Control Group (no context)**

| **Question**       | **ChatGPT** | **Gemini** | **Claude.ai** |
| ------------------ | ----------- | ---------- | ------------- |
| Q1 — Backend       | 2/2         | 2/2        | 1/2           |
| Q2 — UI Library    | 2/2         | 2/2        | 1/2           |
| Q3 — CORS / proxy  | 2/2         | 2/2        | 2/2           |
| Q4 — API docs URL  | 1/2         | 2/2        | 2/2           |
| Q5 — Live demo URL | 2/2         | 2/2        | 2/2           |
| **Total**          | 9/10        | 10/10      | 8/10          |

---

### **Results — URL Group (repo URL given, natural discovery)**

| **Question**               | **ChatGPT** | **Gemini** | **Claude.ai** |
| -------------------------- | ----------- | ---------- | ------------- |
| Q1 — Backend               | 2/2         | 2/2        | 2/2           |
| Q2 — UI Library            | 2/2         | 2/2        | 2/2           |
| Q3 — CORS / proxy          | 2/2         | 2/2        | 2/2           |
| Q4 — API docs URL          | 2/2         | 2/2        | 2/2           |
| Q5 — Live demo URL         | 2/2         | 2/2        | 2/2           |
| **Subtotal**               | 10/10       | 10/10      | 10/10         |
| Source: cited `llms.txt`?  | N (0)       | N (0)      | N (0)         |
| Source: cited `README.md`? | Y (+1)      | Y (+1)     | Y (+1)        |
| Hallucination penalty      | 0           | 0          | 0             |
| **Adjusted Total**         | 11/12       | 11/12      | 11/12         |

---

### **Results — Explicit Group (llms.txt pasted directly)**

| **Question**       | **ChatGPT** | **Gemini** | **Claude.ai** |
| ------------------ | ----------- | ---------- | ------------- |
| Q1 — Backend       | 2/2         | 2/2        | 2/2           |
| Q2 — UI Library    | 2/2         | 2/2        | 2/2           |
| Q3 — CORS / proxy  | 2/2         | 2/2        | 2/2           |
| Q4 — API docs URL  | 2/2         | 2/2        | 2/2           |
| Q5 — Live demo URL | 2/2         | 2/2        | 2/2           |
| **Total**          | 10/10       | 10/10      | 10/10         |

### **Test B — Notes**

All the tools performed almost equally well in AEO for the repository. They were all referring to the README.md and not the llms.txt. This can be because as of now, llms.txt is not a standard adoption technique (and it was just an experiment for us), whereas README.md is standard and accessed by all LLMs.

The file llms.txt is, although, correctly synthesized because when the models were asked questions on the basis of this file, their answers became better. However, by and large, it looks like there is not much need for an llms.txt file because already the AEO is pretty good from the README.md itself.

---

## **Findings & Recommendations**

| **Tool**                       | **Test A Score** | **Test B Score** |
| ------------------------------ | ---------------- | ---------------- |
| ChatGPT (GPT-4o, online)       | 40%              | 94%              |
| Gemini 1.5 Pro (online)        | 80%              | 97%              |
| Claude.ai (Sonnet 4.6, online) | 90%              | 91%              |
| GitHub Copilot GPT-4o          | 70%              | N/A              |
| Claude Code                    | 60%              | N/A              |
| Antigravity - Gemini 3.0 Pro   | 90%              | N/A              |

### **Recommended Tool for Contributors**

> Based on these results, contributors should **prefer using Antigravity as an IDE AI assistant tool** to understand, perform tasks, and improve the codebase. If contributors are using online AI tools, they should **prefer Claude Sonnet models**, as they are more descriptive and most compatible with our repository.
> As far as AEO is considered, all tools perform equally well, that too **without the need for llms.txt as README.md itself is sufficient**.
