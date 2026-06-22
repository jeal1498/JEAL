---
name: create-page
description: "Orchestrates complete web page/site creation. Asks discovery questions first, then generates project structure, design (via impeccable), and SEO (via seo-*). Use when user says: 'create a page', 'build a website', 'make a landing page', 'create a site for [business]', or any variation of needing a web presence built from scratch or near-scratch."
user-invocable: true
argument-hint: "[business-type] [brief description]"
---

# Create Page — Orchestrator Skill

Full web creation pipeline: **Discovery → Scaffold → Design → SEO → Handoff**.

Never skip phases. Never start coding before Phase 1 is complete.

---

## Phase 1: Discovery (MANDATORY — runs before anything else)

If the user's message already provides some answers, pre-fill them and only ask what's missing. Never ask for information already given.

Use `AskUserQuestion` with these two rounds:

### Round 1 — Business & Goals (ask all at once, up to 4)

1. **What is this page/site for?**
   - Local service business (dentist, salon, clinic, gym, restaurant...)
   - Portfolio / personal brand
   - SaaS or digital product
   - E-commerce / online store
   - Blog / content site
   - Corporate / agency

2. **What is the #1 goal of this page?**
   - Generate appointments, calls, or leads
   - Sell products or services online
   - Showcase portfolio or past work
   - Establish credibility / brand presence
   - Capture emails / build an audience

3. **Visual style direction?**
   - Minimal & clean (white space, precision, professional)
   - Warm & welcoming (soft colors, approachable, friendly)
   - Bold & premium (dark backgrounds, luxury, high-end)
   - Playful & energetic (vivid color, expressive, youthful)

4. **Pages needed?**
   - Single landing page only
   - Core pages: Landing + Services + About + Contact
   - Full site: 6+ pages including blog or resources
   - Not sure yet — suggest based on business type

### Round 2 — Technical & Content (ask all at once, up to 4)

5. **Tech stack?**
   - Next.js (React, SSR/SSG, best for complex or SEO-heavy)
   - Astro (multi-framework, great for content/static sites)
   - HTML + CSS + Vanilla JS (simple, no build step)
   - Auto-detect from current project files

6. **Content & assets status?**
   - I have logo, brand colors, and copy ready
   - I have some assets but need help with copy
   - Starting from zero — generate placeholder everything
   - I have a reference site or brief

7. **Target audience** *(one of these or free text)*
   - Families and everyday consumers
   - Business professionals / B2B
   - Young adults (18–35)
   - Seniors or accessibility-focused
   - [specific niche based on business type]

8. **Must-have features?** (multi-select)
   - Appointment / booking form
   - Photo gallery or portfolio grid
   - Map / directions embed
   - Pricing table
   - Testimonials / reviews section
   - Newsletter signup
   - None beyond standard sections

---

## Phase 2: Pre-flight context check

Before spawning agents, scan the current directory:

```bash
ls -la
cat package.json 2>/dev/null || true
ls src/ 2>/dev/null || true
```

- If an existing project is found: **adapt to it**, do not overwrite
- If `PRODUCT.md` exists: read it first — impeccable requires it
- If no project exists: proceed to scaffold phase, web-scaffold creates everything

---

## Phase 3: Parallel Agent Execution

Once all discovery answers are collected, **spawn in parallel**:

### Agent 1 — web-scaffold
Always spawn. Creates the full folder structure, base config files, design tokens, and SEO-ready boilerplate.

Pass these parameters in the agent prompt:
- `business_type` from Round 1, Q1
- `tech_stack` from Round 2, Q5
- `pages_scope` from Round 1, Q4
- `visual_style` from Round 1, Q3
- `features` from Round 2, Q8
- `content_status` from Round 2, Q6

### Agent 2 — impeccable (design)
After web-scaffold completes (or in parallel if no scaffold needed), invoke impeccable.

Use `impeccable craft` on the main page. Provide:
- Visual style and business type as the design brief
- Tech stack so it uses the right component format
- Page list so it knows scope
- Content status (generate placeholder copy if starting from zero)

Impeccable should produce at minimum: Hero, a primary conversion section, and Footer.

### Agent 3 — SEO specialist (conditional routing)

Route to the right SEO agent based on business type:

| Business type | Primary SEO agent | Secondary |
|---|---|---|
| Local service (dentist, salon, gym...) | `seo-local` | `seo-schema` |
| Restaurant / café | `seo-local` | `seo-schema` |
| Hotel / lodging | `seo-local` | `seo-schema` |
| E-commerce | `seo-ecommerce` | `seo-schema` |
| Portfolio / personal | `seo-content` | none |
| SaaS / product | `seo-technical` | `seo-content` |
| Blog / content | `seo-content` | `seo-cluster` |
| Corporate | `seo-technical` | `seo-content` |

Always include `seo-schema` when the business type maps to a known Schema.org type.

---

## Phase 4: Synthesis & Handoff

After all agents finish, deliver a unified summary:

### What was built
- Folder structure overview (tree view, max 2 levels)
- Pages created and their purpose
- Design decisions made (palette direction, fonts, key sections)
- SEO elements applied (schema type, meta template, sitemap)

### What needs human input
Present as a checklist:
- [ ] Replace placeholder images with real photography
- [ ] Review and finalize all copy
- [ ] Add real phone number, address, business hours
- [ ] Connect contact/booking form to email or backend
- [ ] Verify brand colors match identity
- [ ] Set up domain and hosting
- [ ] Add Google Analytics / tracking

### Quick-start commands
Show the dev server command for their stack:
- Next.js: `npm run dev`
- Astro: `npm run dev`
- HTML: `npx serve src/` or `open src/index.html`

---

## Business-type intelligence table

Use this to pre-fill section lists and schema when the business type is known:

| Business | Schema.org type | Must-have sections | Local SEO priority |
|---|---|---|---|
| Dentist / dental clinic | `Dentist` | Hero, Services, Team, Insurance, Emergency CTA, Reviews, Location | CRITICAL |
| Medical / clinic | `MedicalBusiness` | Hero, Specialties, Team, Appointments, Location | CRITICAL |
| Restaurant / café | `Restaurant` | Hero, Menu, Hours, Gallery, Reservations, Location | CRITICAL |
| Salon / spa | `BeautySalon` | Hero, Services, Team, Booking, Gallery, Location | HIGH |
| Gym / fitness | `ExerciseGym` | Hero, Classes, Trainers, Pricing, Schedule, Location | HIGH |
| Law firm | `LegalService` | Hero, Practice Areas, Team, Consultation CTA, Reviews | HIGH |
| Hotel | `LodgingBusiness` | Hero, Rooms, Amenities, Booking, Gallery, Location | HIGH |
| Portfolio | `Person` | Hero, Work/Projects, About, Skills, Contact | LOW |
| SaaS | `SoftwareApplication` | Hero, Features, Pricing, Testimonials, CTA, FAQ | LOW |
| E-commerce | `Store` | Hero, Featured Products, Categories, Trust signals | MEDIUM |
| Agency | `ProfessionalService` | Hero, Services, Portfolio, Team, Process, Contact | MEDIUM |

---

## Rules

1. Never write a single line of code before Phase 1 is complete
2. Never assume the tech stack — always ask (or auto-detect from project files)
3. If the user already provided information in their message, do not re-ask it
4. Always invoke impeccable — design quality is non-negotiable
5. Always run at least one SEO agent — ship-ready means SEO-ready
6. When in doubt about pages, suggest the list from the business-type table and let the user confirm
