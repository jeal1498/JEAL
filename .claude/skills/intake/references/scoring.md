# Intake Scoring Reference

Scoring criteria for the `intake` skill and the `opportunity-mapper` agent. Every finding must be assigned a severity and contribute to an area score. Area scores combine into an overall site score.

---

## Overall Score Formula

```
Overall = (Code × 0.25) + (Design × 0.25) + (SEO × 0.35) + (Performance × 0.15)
```

Performance is factored into SEO score when assessed by seo-audit; the `seo-performance` agent provides the standalone performance score.

| Score Range | Label | Color |
|---|---|---|
| 85–100 | Excellent | 🟢 Green |
| 65–84 | Good — minor issues | 🟡 Yellow |
| 40–64 | Needs Work — significant issues | 🟠 Orange |
| 0–39 | Critical — major problems | 🔴 Red |

---

## Severity Classification

### CRÍTICO — Fix immediately

Affects security, indexation, or conversions. Every CRÍTICO finding costs real money or rankings.

**Examples:**
- HTTP (no HTTPS) — security risk + ranking penalty
- Site not indexed (`noindex` on production, blocked by robots.txt)
- No SSL certificate or expired certificate
- Exposed credentials or API keys in public repo
- SQL injection or XSS vulnerabilities in contact forms
- Zero conversion path — no CTA, no phone, no contact form
- Site completely inaccessible (500 errors, DNS failure)
- Broken checkout or booking flow
- GDPR/privacy law violations (no cookie consent, no privacy policy)
- Unpatched critical CVEs in CMS or dependencies

**Score impact:** -20 to -40 points per finding (capped at 0)

---

### IMPORTANTE — Fix within the sprint

Significantly affects performance, user experience, or search visibility. Won't crash the business today but is costing conversions or rankings.

**Examples:**
- Core Web Vitals failures (LCP >4s, INP >500ms, CLS >0.25)
- Missing or incorrect Schema.org markup for the business type
- No XML sitemap or sitemap not submitted
- Duplicate content (no canonicals, www/non-www, trailing slash inconsistency)
- Images without alt text (accessibility + SEO)
- No meta descriptions on key pages
- Missing H1 or multiple H1s per page
- No mobile viewport meta tag
- Dependencies with high-severity security vulnerabilities (npm audit)
- No error boundary / 404 handling
- Pages with 0 internal links (orphaned content)
- Contact form broken or unmonitored (emails going to spam)
- Google Business Profile missing or unclaimed

**Score impact:** -5 to -15 points per finding

---

### MEJORA — Backlog for next cycle

Good to have. These are optimizations that improve the experience but won't move the needle immediately.

**Examples:**
- Image compression opportunities (not failing CWV, just not optimal)
- Missing Open Graph or Twitter Card meta tags
- No favicon or low-resolution favicon
- Font loading not optimized (FOUT/FOIT)
- Outdated but functioning dependencies (no known CVEs)
- Inconsistent color tokens or spacing (design system debt)
- No `preconnect` for third-party origins
- README missing or outdated
- No linting or formatting config
- Partial TypeScript migration (mixed JS/TS)
- Long URLs with unnecessary subfolders
- No breadcrumb navigation

**Score impact:** -1 to -4 points per finding

---

## Area-Specific Scoring Rubrics

### Code Quality (0–100)

| Factor | Weight | Criteria |
|---|---|---|
| Security | 30% | No exposed secrets, patched CVEs, safe input handling |
| Dependency health | 20% | Up-to-date deps, no high/critical vulnerabilities |
| Folder structure | 15% | Scalable, follows framework conventions |
| Technical debt | 20% | No dead code, no code duplication >30%, types present |
| Maintainability | 15% | README present, env vars documented, CI/CD exists |

**Automatic deductions:**
- Exposed `.env` with real credentials in public repo: -50
- No version control: -30
- No package.json / dependency manifest: -20

---

### Design / UX (0–100)

| Factor | Weight | Criteria |
|---|---|---|
| Visual hierarchy | 25% | Clear primary CTA, logical reading order, scannable layout |
| Mobile rendering | 25% | Responsive, no horizontal scroll, touch targets ≥44px |
| Accessibility | 20% | Contrast ratios, alt text, keyboard navigation |
| Brand consistency | 15% | Consistent color palette, typography, spacing |
| Above-the-fold | 15% | Value prop visible without scrolling on mobile |

**Automatic deductions:**
- No mobile responsiveness: -40
- WCAG AA contrast failures on primary text: -20
- No discernible CTA above the fold: -15

---

### SEO (0–100)

Sourced from `seo-audit` output. Key sub-scores:

| Sub-area | Weight |
|---|---|
| Technical SEO (crawlability, indexability) | 30% |
| On-page SEO (titles, meta, H1, content) | 25% |
| Performance (CWV field data) | 20% |
| Schema / structured data | 15% |
| Local SEO (if applicable) | 10% |

**Automatic deductions:**
- Blocked from indexing: -60
- No HTTPS: -25
- No sitemap: -15

---

### Performance (0–100)

Based on Core Web Vitals field data (CrUX) or lab data (Lighthouse) when field data unavailable.

| Metric | Good | Needs Work | Poor |
|---|---|---|---|
| LCP | <2.5s (+0) | 2.5–4s (−15) | >4s (−30) |
| INP | <200ms (+0) | 200–500ms (−15) | >500ms (−30) |
| CLS | <0.1 (+0) | 0.1–0.25 (−15) | >0.25 (−30) |

Start at 100; subtract per metric. Minimum 10 if site loads at all.

---

## Effort Estimation Tiers

Use these when opportunity-mapper generates its plan:

| Tier | Label | Typical scope | Hours |
|---|---|---|---|
| XS | Quick fix | Single file, config change, text edit | 0.5–2h |
| S | Small task | Component-level fix, meta tag batch | 2–4h |
| M | Medium task | Feature or page, schema implementation | 4–16h |
| L | Large project | Redesign section, CMS migration, new feature | 16–80h |
| XL | Major project | Full redesign, framework migration, e-commerce | 80h+ |

---

## Risk Matrix — "Cost of doing nothing"

Include this in the report when urgency is HIGH or when CRÍTICO findings exist:

| Risk | Probability | Impact | Priority |
|---|---|---|---|
| Google deindex (noindex on prod, blocked robots) | HIGH | CRITICAL | Immediate |
| Security breach (exposed keys, outdated CMS) | MEDIUM | CRITICAL | This week |
| Lost conversions (broken CTA, no contact form) | HIGH | HIGH | This week |
| Rankings drop (CWV failure, thin content) | MEDIUM | HIGH | This month |
| Reputational damage (broken mobile, poor design) | MEDIUM | MEDIUM | This month |
| Tech debt accumulation (old deps, no types) | LOW | MEDIUM | Next quarter |
