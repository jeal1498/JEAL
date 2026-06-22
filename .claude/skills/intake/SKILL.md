---
name: intake
description: "Client project intake and audit orchestrator. Analyzes an existing site or repository to produce a technical health diagnosis, UX/design audit, SEO report, and prioritized action plan. Use when user says: 'tengo un cliente con su sitio', 'necesito auditar este proyecto', 'qué me encuentro aquí', 'audit this project', 'diagnose this site', 'what's wrong with this site', 'evaluate this repo', or any variation of assessing an existing web project."
user-invocable: true
argument-hint: "[site-url] [repo-url]"
---

# Intake — Project Audit Orchestrator

Full client intake pipeline: **Discovery → Parallel Analysis → Unified Diagnosis → Action Plan**.

Never skip phases. Never start analysis before Phase 1 is complete.

---

## Phase 1: Discovery (MANDATORY — runs before anything else)

If the user's message already provides some answers, pre-fill them and only ask what's missing.

Use `AskUserQuestion` with these questions (up to 4 per round):

### Round 1 — Project Basics

1. **Site URL** (the live website to audit)
   - e.g., `https://ejemplo.com`
   - "No live site yet — only have the repo"

2. **Repository URL or local path** (if available)
   - GitHub/GitLab URL or local directory path
   - "No repo — only the live site"
   - "I'll share the code separately"

3. **Business type / industry**
   - Local service (dentist, salon, restaurant, clinic...)
   - E-commerce / online store
   - SaaS or digital product
   - Portfolio / personal brand
   - Corporate / agency
   - Blog / content site

4. **What does the client want to improve?** (multi-select)
   - Appears poorly on Google / low traffic
   - Looks outdated or unprofessional
   - Slow load times / poor performance
   - Hard to maintain / bad code quality
   - Wants to add new features
   - Full modernization / rebrand
   - Not sure — needs a general diagnosis

### Round 2 — Context & Constraints

5. **Approximate budget range** (helps calibrate recommendations)
   - Quick fixes only (under $500)
   - Small project ($500–$2,000)
   - Medium project ($2,000–$10,000)
   - Full modernization ($10,000+)
   - Budget not yet defined

6. **Urgency / timeline**
   - ASAP — something is broken or hurting the business now
   - This month — need a plan to start soon
   - Planning phase — exploring options
   - No rush — building a proposal for later

7. **Current tech stack** (if known)
   - WordPress / WooCommerce
   - Shopify
   - Custom HTML/CSS
   - React / Next.js
   - Other (describe)
   - Unknown — please detect from the code

8. **Access available?** (multi-select)
   - Google Search Console access
   - Google Analytics access
   - Hosting/server admin
   - CMS admin (WordPress, etc.)
   - Only the public site / repo — no dashboard access

---

## Phase 2: Pre-flight scan

Before spawning agents, run a quick environment check:

```bash
# If a local repo path was provided:
ls -la {repo_path}
cat {repo_path}/package.json 2>/dev/null || true
cat {repo_path}/composer.json 2>/dev/null || true
ls {repo_path}/src/ 2>/dev/null || true
```

- Determine if a live URL is available (required for SEO and visual agents)
- Determine if source code is available (required for code-audit agent)
- Note any obvious signals: WordPress wp-content dirs, package.json framework hints, etc.

Create an output directory for reports:

```bash
DOMAIN=$(echo "{site_url}" | sed 's|https\?://||' | sed 's|/.*||' | sed 's|www\.||')
OUTPUT_DIR="./${DOMAIN}-intake"
mkdir -p "$OUTPUT_DIR/findings"
```

---

## Phase 3: Parallel Agent Execution

Once discovery is complete, **spawn all applicable agents in parallel**.

Pass `output_dir`, `site_url`, `repo_path`, and all discovery answers to each agent.

### Agent 1 — code-audit (if repo is available)

Analyzes the repository: tech stack, dependency health, folder structure scalability, technical debt, migration complexity, and code quality score.

Pass:
- `repo_path` — local path or cloned repo location
- `tech_stack` (detected or user-provided)
- `business_type`
- `output_dir`

### Agent 2 — impeccable (mode: audit, if site URL is available)

Analyzes design and UX: visual antipatterns, accessibility issues, visual hierarchy, mobile rendering, above-the-fold effectiveness, and CTA clarity.

Pass:
- `site_url`
- `business_type` (to calibrate expectations — a dentist site vs. SaaS have different design standards)
- Instruction: run in **audit mode**, do not make changes, only report findings

### Agent 3 — seo-audit (if site URL is available)

Full SEO audit covering technical SEO, content quality, local SEO (if applicable), schema markup, performance, and backlinks.

Pass:
- `site_url`
- `business_type` (to trigger local SEO sub-agents if applicable)
- `output_dir`
- Any GSC/GA4 access hints from discovery

### Agent 4 — opportunity-mapper

Runs after the other three complete. Receives their findings and generates a prioritized action plan with effort estimates, quick wins, and risk assessment.

Pass:
- All findings from code-audit, impeccable, and seo-audit
- `budget_range` from discovery
- `urgency` from discovery
- `output_dir`

> **Note:** opportunity-mapper should be spawned last, after the other three agents have written their findings to `output_dir/findings/`.

---

## Phase 4: Synthesis & Report Delivery

After all agents finish:

1. Read `{output_dir}/findings/` and compile the unified report using the template in `references/report-template.md`
2. Write the final report to `{output_dir}/report.md`
3. Display a condensed summary to the user

### Condensed summary format:

```
## {domain} — Intake Diagnosis

**Overall Score: {score}/100**

| Area          | Score | Status |
|---------------|-------|--------|
| Code Quality  | /100  | 🔴/🟡/🟢 |
| Design / UX   | /100  | 🔴/🟡/🟢 |
| SEO           | /100  | 🔴/🟡/🟢 |
| Performance   | /100  | 🔴/🟡/🟢 |

### Critical Issues (fix now)
- {issue} — {impact}

### Quick Wins (this week, low effort)
- {task} — ~{hours}h

### Full report saved to: {output_dir}/report.md
```

---

## Routing rules

| Condition | Action |
|---|---|
| No site URL provided | Skip impeccable and seo-audit; run code-audit only |
| No repo provided | Skip code-audit; run impeccable and seo-audit only |
| Business type = local service | Ensure seo-audit triggers seo-local sub-agent |
| Business type = e-commerce | Ensure seo-audit triggers seo-ecommerce sub-agent |
| Budget = "quick fixes only" | Opportunity-mapper should weight quick wins heavily |
| Urgency = "ASAP" | Flag critical issues at the top of every output |

---

## Rules

1. Never start analysis before Phase 1 is complete
2. Never skip opportunity-mapper — it is the deliverable the client actually sees
3. Always save a report file — do not rely on chat output alone
4. If both site URL and repo are provided, run all four agents
5. Score each area 0–100 using the criteria in `references/scoring.md`
6. Never recommend a full rewrite without evidence from code-audit; always surface patch options first
7. Calibrate recommendations to the stated budget — a $500 budget should not return a $50,000 plan
