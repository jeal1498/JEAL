# Page Types Reference

Standard page lists and section blueprints per business type. Used by web-scaffold and impeccable to know what to build without asking the user for every detail.

---

## Local Service — Medical / Dental

**Pages (core)**: index, services, team, contact
**Pages (full)**: + blog, faq, insurance, emergencies

### index (homepage) sections
1. **Hero** — headline: key patient benefit + CTA button ("Book Appointment")
2. **Trust bar** — years in practice, patients served, awards, certifications
3. **Services overview** — 3–6 cards with icon + title + 1-line description
4. **Why us** — 3 differentiators (gentle approach, modern equipment, convenient hours)
5. **Team preview** — 2–3 doctor cards with photo + name + specialty
6. **Reviews** — 3 Google reviews with star rating + name
7. **Location + hours** — embedded map + hours table + phone CTA
8. **Footer** — logo, nav, contact info, social links, legal

### services page sections
1. Hero (page title + brief intro)
2. Service grid — full list with longer descriptions
3. Procedures accordion (per specialty)
4. Insurance section — accepted insurances list
5. FAQ — top 5 patient questions
6. CTA — schedule appointment

### team page sections
1. Hero — "Meet our team"
2. Doctor cards — photo, name, specialty, education, bio
3. Support staff overview
4. CTA — book with your preferred doctor

---

## Local Service — Restaurant / Café

**Pages (core)**: index, menu, contact
**Pages (full)**: + reservations, gallery, about, events

### index sections
1. Hero — atmospheric photo + tagline + "Reserve a Table" CTA
2. Highlight reel — 3 signature dishes with photo + name
3. About snippet — 2–3 sentences on story/concept + "Learn more" link
4. Menu preview — top categories with 2–3 items each
5. Hours + location — table + map + address
6. Gallery strip — 4–6 photos horizontal scroll
7. Reviews — 3 Google reviews
8. Footer

### menu page sections
1. Category tabs or anchor links
2. Item grid — photo (optional), name, description, price, dietary tags
3. Specials callout — daily specials or seasonal menu
4. Allergen note
5. Order CTA (delivery/takeaway link if applicable)

---

## Hotel / Lodging

**Pages (core)**: index, rooms, amenities, contact
**Pages (full)**: + gallery, dining, events, blog

### index sections
1. Hero — full-width atmospheric video or image + headline + "Check Availability" CTA
2. Room preview — 3 room types with photo, name, capacity, price from
3. Amenities highlights — pool, spa, restaurant, parking, WiFi icons
4. Location callout — "In the heart of [city]" + proximity to attractions
5. Guest reviews — 3 testimonials + rating summary
6. Special offers — seasonal promotions or packages
7. Footer with booking widget area

### rooms page sections
1. Room filter bar — by type, capacity, view, amenities
2. Room cards — large photo, name, size, beds, amenities list, price, Book button
3. Room detail modal or dedicated room pages
4. Comparison table (optional for 4+ room types)

---

## Portfolio / Personal Brand

**Pages (core)**: index, work, contact
**Pages (full)**: + about, case-study/[slug], blog, uses

### index sections
1. Hero — name, title/discipline, brief positioning statement + CTA
2. Featured work — 3–4 best projects with thumbnail + title + brief
3. About snippet — 2–3 sentences + photo + "More about me" link
4. Skills or services — what you offer, how you work
5. Client logos or testimonials (if available)
6. Latest blog post (if blog in scope)
7. Footer — social links, email CTA

### work page sections
1. Filter bar — by type (web, branding, illustration...)
2. Project grid — thumbnail, title, client, year, discipline tags
3. Case study template (per project): overview, challenge, process, outcome, results

---

## SaaS / Digital Product

**Pages (core)**: index, features, pricing, contact
**Pages (full)**: + docs, changelog, blog, about, legal (privacy, terms)

### index sections
1. Hero — product tagline + subhead + primary CTA ("Start Free Trial") + secondary ("See demo")
2. Social proof bar — logos of companies using it, or user count
3. Problem statement — the pain this solves (3-step before/after)
4. Features overview — 3–4 key capabilities with icon + title + description
5. How it works — 3-step numbered flow
6. Testimonials — 3 customer quotes with photo + name + company + role
7. Pricing preview — "Plans from $X/mo" + link to pricing page
8. FAQ — top 5 objections
9. Final CTA — full-width banner + email capture or trial button
10. Footer

### pricing page sections
1. Toggle (monthly / annual) with annual savings callout
2. 3-column pricing cards — Starter, Pro, Enterprise
3. Feature comparison table
4. FAQ specific to pricing/billing
5. CTA — most popular plan highlighted

---

## Agency / Corporate

**Pages (core)**: index, services, work, contact
**Pages (full)**: + about, team, blog, case-studies

### index sections
1. Hero — value proposition headline + subhead + dual CTA (primary: contact, secondary: see work)
2. Services overview — 4–6 service cards
3. Selected work — 3–4 case study thumbnails
4. Client logos
5. About snippet — mission/approach + team photo
6. Testimonials
7. Process / how we work — 3–4 step flow
8. Final CTA — "Let's talk about your project"
9. Footer

---

## Section component naming conventions

Use these names consistently across scaffold, impeccable, and SEO agents:

| Section | Component name |
|---|---|
| Top hero area | `HeroSection` |
| Trust/stats bar | `TrustBar` |
| Services/features grid | `ServicesGrid` or `FeaturesGrid` |
| About / story | `AboutSection` |
| Team grid | `TeamGrid` |
| Testimonials/reviews | `TestimonialsSection` |
| Map + hours | `LocationSection` |
| Pricing cards | `PricingSection` |
| FAQ accordion | `FAQSection` |
| Gallery/portfolio grid | `GalleryGrid` |
| Call to action banner | `CTASection` |
| Email capture | `NewsletterSection` |
| Blog post preview | `BlogPreview` |
| Site header/nav | `Header` / `Nav` |
| Site footer | `Footer` |
