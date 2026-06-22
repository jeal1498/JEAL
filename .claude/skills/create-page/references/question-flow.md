# Question Flow Reference

Guidance for the Discovery phase of `create-page`. Use this to pre-fill answers when context signals are present in the user's initial message, and to adapt question wording per industry.

---

## Pre-fill signals — read before asking

Scan the user's message for these signals and skip the matching questions:

| Signal in message | Pre-fill |
|---|---|
| "dentist", "dental", "orthodontist" | business_type = local-medical, schema = Dentist |
| "restaurant", "café", "cafeteria", "food" | business_type = local-food |
| "hotel", "hostel", "lodge", "airbnb" | business_type = local-lodging |
| "portfolio", "my work", "designer", "photographer" | business_type = portfolio |
| "SaaS", "app", "software", "startup" | business_type = saas |
| "landing page" | pages_scope = single-page |
| "full site", "complete website" | pages_scope = full-site |
| "Next.js", "React", "Astro", "HTML" | tech_stack = [matched] |
| "minimal", "clean" | visual_style = minimal |
| "warm", "friendly", "welcoming" | visual_style = warm |
| "dark", "premium", "luxury" | visual_style = bold |
| "colorful", "playful", "fun" | visual_style = playful |

---

## Industry-specific question wording

Adapt question labels when the business type is known:

### Dentist / Medical
- Primary goal options: "Get new patient appointments" | "Showcase specialties" | "Build trust with reviews and team profiles"
- Audience options: "Families with children" | "Adults seeking cosmetic work" | "Seniors needing restorative care" | "Emergency patients"
- Must-have features: Always surface "Online appointment booking" and "Insurance info section"

### Restaurant / Café
- Primary goal options: "Drive dine-in reservations" | "Promote takeaway/delivery" | "Showcase menu and ambiance"
- Audience options: "Local neighborhood regulars" | "Date night / special occasions" | "Lunch business crowd" | "Tourists / visitors"
- Must-have features: Always surface "Menu display" and "Google Maps embed"

### Hotel / Lodging
- Primary goal options: "Drive direct bookings (bypass OTAs)" | "Showcase rooms and amenities" | "Target corporate travelers"
- Audience options: "Tourists / leisure travelers" | "Business travelers" | "Event/wedding groups" | "Local staycation"
- Must-have features: Always surface "Room gallery" and "Booking/reservation form"

### Portfolio / Personal Brand
- Primary goal options: "Get freelance clients" | "Job applications / recruiters" | "Personal branding / thought leadership"
- Audience options: "Potential clients (B2B or B2C)" | "Hiring managers / recruiters" | "Creative community peers"
- Must-have features: Always surface "Project case studies" and "Contact form"

### SaaS / Digital Product
- Primary goal options: "Trial/demo signups" | "Email capture for launch" | "Convert paid subscribers"
- Audience options: "Individual users (B2C)" | "Small business owners" | "Enterprise / teams" | "Developers"
- Must-have features: Always surface "Pricing table" and "Social proof / testimonials"

### Law Firm
- Primary goal options: "Book free consultations" | "Establish authority in practice area" | "Referrals from existing clients"
- Audience options: "Individuals (personal injury, family law)" | "Businesses (corporate, contracts)" | "Mixed"
- Must-have features: Always surface "Practice areas page" and "Consultation booking"

---

## Minimum viable question set

If you need to minimize interruptions (e.g., user seems impatient), reduce to these 3:

1. **What's this page for?** (free text or business type options)
2. **Visual style?** (minimal | warm | bold | playful)
3. **Tech stack?** (Next.js | Astro | HTML+CSS | auto)

Everything else can be inferred from the business type table in SKILL.md.

---

## When NOT to ask questions

Skip all questions and proceed directly to scaffold if:
- The user provides a detailed brief (3+ sentences covering business, style, and pages)
- The user explicitly says "just build it" or "don't ask questions"
- A `PRODUCT.md` with complete business context already exists in the project

In these cases, summarize your inferred answers at the top of your response so the user can correct anything before you commit to it.
