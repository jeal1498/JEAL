#!/usr/bin/env python3
"""Capture screenshots of the local Hotel Jireh redesign at localhost:9876."""

import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright

URL = "http://localhost:9876/"
OUTPUT_DIR = Path("/home/user/JEAL/hotel-jireh-audit/screenshots-new")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

async def capture():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        # ── Desktop 1440×900 ──────────────────────────────────────────────
        desktop_ctx = await browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=1,
        )
        desktop_page = await desktop_ctx.new_page()
        await desktop_page.goto(URL, wait_until="networkidle", timeout=30000)
        await desktop_page.wait_for_timeout(1500)   # let any JS / fonts settle

        # Above the fold (clip to viewport height)
        await desktop_page.screenshot(
            path=str(OUTPUT_DIR / "desktop_atf_local.png"),
            clip={"x": 0, "y": 0, "width": 1440, "height": 900},
        )
        print("Saved desktop_atf_local.png")

        # Full-page scroll
        await desktop_page.screenshot(
            path=str(OUTPUT_DIR / "desktop_full_local.png"),
            full_page=True,
        )
        print("Saved desktop_full_local.png")

        # Grab hero background color for analysis
        hero_bg = await desktop_page.evaluate("""() => {
            const hero = document.querySelector('.hero, [class*="hero"], header, #hero, section:first-of-type');
            if (!hero) return null;
            return window.getComputedStyle(hero).backgroundColor;
        }""")

        # Grab H1 font
        h1_font = await desktop_page.evaluate("""() => {
            const h1 = document.querySelector('h1');
            if (!h1) return null;
            const s = window.getComputedStyle(h1);
            return { fontFamily: s.fontFamily, fontSize: s.fontSize, color: s.color };
        }""")

        # Grab accent / orange color
        accent = await desktop_page.evaluate("""() => {
            const el = document.querySelector('[class*="accent"], [style*="orange"], .highlight, .cta, a.btn, button, .btn');
            if (!el) return null;
            const s = window.getComputedStyle(el);
            return { bg: s.backgroundColor, color: s.color, text: el.textContent.trim().slice(0,40) };
        }""")

        # Check for eyebrow labels
        eyebrows = await desktop_page.evaluate("""() => {
            const candidates = Array.from(document.querySelectorAll('*')).filter(el => {
                const t = el.textContent.trim().toUpperCase();
                return ['CONÓCENOS','LO QUE INCLUYE','PREGUNTAS','UBICACIÓN','SERVICIOS'].some(k => t === k);
            });
            return candidates.map(el => ({ tag: el.tagName, text: el.textContent.trim(), class: el.className }));
        }""")

        # Check for details/summary FAQ
        faq_details = await desktop_page.evaluate("""() => {
            const details = Array.from(document.querySelectorAll('details'));
            return details.map(d => ({
                summary: d.querySelector('summary')?.textContent.trim().slice(0,60),
                open: d.open
            }));
        }""")

        # Check hero background more broadly
        hero_bg_broad = await desktop_page.evaluate("""() => {
            // Try multiple selectors
            const selectors = ['section.hero','div.hero','.hero-section','[data-section="hero"]',
                               'header','section:first-of-type','body > section:first-child',
                               'main > section:first-child','main > div:first-child'];
            for (const sel of selectors) {
                const el = document.querySelector(sel);
                if (el) {
                    const bg = window.getComputedStyle(el).backgroundColor;
                    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
                        return { selector: sel, bg };
                    }
                }
            }
            // fallback: body bg
            return { selector: 'body', bg: window.getComputedStyle(document.body).backgroundColor };
        }""")

        # Grab page title
        title = await desktop_page.title()

        # CSS custom properties (design tokens)
        css_vars = await desktop_page.evaluate("""() => {
            const style = getComputedStyle(document.documentElement);
            const vars = ['--color-bg','--color-hero','--color-surface','--color-accent',
                          '--color-primary','--font-heading','--font-body',
                          '--clr-bg','--clr-accent','--clr-hero'];
            const result = {};
            for (const v of vars) {
                const val = style.getPropertyValue(v).trim();
                if (val) result[v] = val;
            }
            return result;
        }""")

        probe = {
            "title": title,
            "hero_bg": hero_bg,
            "hero_bg_broad": hero_bg_broad,
            "h1_font": h1_font,
            "accent": accent,
            "eyebrows_found": eyebrows,
            "faq_details_count": len(faq_details) if faq_details else 0,
            "faq_details_sample": faq_details[:3] if faq_details else [],
            "css_vars": css_vars,
        }

        probe_path = OUTPUT_DIR / "design_probe_local.json"
        probe_path.write_text(json.dumps(probe, indent=2, ensure_ascii=False))
        print(f"Saved design_probe_local.json")
        print(json.dumps(probe, indent=2, ensure_ascii=False))

        await desktop_ctx.close()

        # ── Mobile 390×844 ───────────────────────────────────────────────
        mobile_ctx = await browser.new_context(
            viewport={"width": 390, "height": 844},
            device_scale_factor=2,
            user_agent=(
                "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
                "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
            ),
        )
        mobile_page = await mobile_ctx.new_page()
        await mobile_page.goto(URL, wait_until="networkidle", timeout=30000)
        await mobile_page.wait_for_timeout(1500)

        # Above the fold
        await mobile_page.screenshot(
            path=str(OUTPUT_DIR / "mobile_atf_local.png"),
            clip={"x": 0, "y": 0, "width": 390, "height": 844},
        )
        print("Saved mobile_atf_local.png")

        # Full page
        await mobile_page.screenshot(
            path=str(OUTPUT_DIR / "mobile_full_local.png"),
            full_page=True,
        )
        print("Saved mobile_full_local.png")

        await mobile_ctx.close()
        await browser.close()
        print("Done.")

asyncio.run(capture())
