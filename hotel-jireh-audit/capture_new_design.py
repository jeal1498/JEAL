"""
Capture new design screenshots for Hotel Jireh redesign verification.
Target: https://hotel-jireh.vercel.app/
Output: /home/user/JEAL/hotel-jireh-audit/screenshots-new/
"""

import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright

URL = "https://hotel-jireh.vercel.app/"
OUTPUT_DIR = Path("/home/user/JEAL/hotel-jireh-audit/screenshots-new")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

CAPTURES = [
    {
        "name": "desktop",
        "width": 1440,
        "height": 900,
        "dpr": 1,
        "mobile": False,
        "ua": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/125.0.0.0 Safari/537.36"
        ),
        "atf_file": "desktop_atf_new.png",
        "full_file": "desktop_full_new.png",
    },
    {
        "name": "mobile",
        "width": 390,
        "height": 844,
        "dpr": 3,
        "mobile": True,
        "ua": (
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
            "AppleWebKit/605.1.15 (KHTML, like Gecko) "
            "Version/17.0 Mobile/15E148 Safari/604.1"
        ),
        "atf_file": "mobile_atf_new.png",
        "full_file": "mobile_full_new.png",
    },
]


async def probe_design(page, viewport_height: int) -> dict:
    """Collect design-specific signals from the rendered page."""
    info = {}

    # Page title
    info["title"] = await page.title()

    # H1 text and font
    h1 = await page.query_selector("h1")
    if h1:
        info["h1_text"] = (await h1.inner_text()).strip()
        info["h1_font_family"] = await h1.evaluate(
            "el => getComputedStyle(el).fontFamily"
        )
        box = await h1.bounding_box()
        info["h1_above_fold"] = box is not None and (box["y"] + box["height"]) <= viewport_height
    else:
        info["h1_text"] = None
        info["h1_font_family"] = None
        info["h1_above_fold"] = False

    # Hero section background color
    hero_selectors = [
        "section#inicio",
        "section.hero",
        "[class*='hero']",
        "header",
    ]
    hero_bg = None
    for sel in hero_selectors:
        hero = await page.query_selector(sel)
        if hero:
            hero_bg = await hero.evaluate(
                "el => getComputedStyle(el).backgroundColor"
            )
            info["hero_selector_matched"] = sel
            break
    info["hero_bg_color"] = hero_bg

    # Orange accent bar — look for a thin top bar
    accent_candidates = await page.query_selector_all(
        "[class*='accent'], [class*='bar'], [class*='stripe'], [class*='top-bar']"
    )
    accent_info = []
    for el in accent_candidates:
        bg = await el.evaluate("el => getComputedStyle(el).backgroundColor")
        box = await el.bounding_box()
        if box and box["height"] < 20:  # thin bars only
            accent_info.append({"bg": bg, "height": box["height"], "y": box["y"]})
    info["accent_bars"] = accent_info

    # Body background
    info["body_bg"] = await page.evaluate(
        "() => getComputedStyle(document.body).backgroundColor"
    )

    # Fonts loaded
    info["fonts"] = await page.evaluate(
        """async () => {
            await document.fonts.ready;
            const out = [];
            document.fonts.forEach(f => out.push(f.family + ' — ' + f.status));
            return out;
        }"""
    )

    # Section eyebrows — small label text above headings
    eyebrows = await page.query_selector_all(
        "[class*='eyebrow'], [class*='label'], [class*='tag'], [class*='overline'], [class*='kicker']"
    )
    eyebrow_texts = []
    for el in eyebrows:
        visible = await el.is_visible()
        if visible:
            text = (await el.inner_text()).strip()
            if text:
                eyebrow_texts.append(text)
    info["section_eyebrows_visible"] = eyebrow_texts

    # CTA WhatsApp links
    ctas = await page.query_selector_all('a[href*="wa.me"]')
    cta_data = []
    for cta in ctas:
        box = await cta.bounding_box()
        text = (await cta.inner_text()).strip()
        above = box is not None and (box["y"] + box["height"]) <= viewport_height
        cta_data.append({"text": text, "above_fold": above, "y": box["y"] if box else None})
    info["cta_whatsapp"] = cta_data
    info["cta_above_fold"] = any(c["above_fold"] for c in cta_data)

    # Horizontal scroll
    info["horizontal_scroll"] = await page.evaluate(
        "() => document.documentElement.scrollWidth > document.documentElement.clientWidth"
    )

    # Broken images
    images = await page.query_selector_all("img")
    broken = []
    for img in images:
        nw = await img.evaluate("el => el.naturalWidth")
        if nw == 0:
            src = await img.get_attribute("src")
            broken.append(src)
    info["broken_images"] = broken
    info["total_images"] = len(images)

    return info


async def main():
    all_results = {}

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=["--ignore-certificate-errors", "--disable-web-security"],
        )

        for cfg in CAPTURES:
            print(f"\n=== {cfg['name'].upper()} ({cfg['width']}x{cfg['height']}) ===")

            context = await browser.new_context(
                viewport={"width": cfg["width"], "height": cfg["height"]},
                device_scale_factor=cfg["dpr"],
                is_mobile=cfg["mobile"],
                has_touch=cfg["mobile"],
                user_agent=cfg["ua"],
                ignore_https_errors=True,
            )

            page = await context.new_page()

            # Load page and wait for network + fonts
            await page.goto(URL, wait_until="networkidle", timeout=90000)
            await page.wait_for_timeout(4000)  # extra settle for fonts/lazy images

            # --- Above-the-fold screenshot ---
            atf_path = OUTPUT_DIR / cfg["atf_file"]
            await page.screenshot(path=str(atf_path), full_page=False)
            print(f"  ATF saved: {atf_path}")

            # --- Full-page screenshot ---
            full_path = OUTPUT_DIR / cfg["full_file"]
            await page.screenshot(path=str(full_path), full_page=True)
            print(f"  Full saved: {full_path}")

            # --- Probe design signals ---
            info = await probe_design(page, cfg["height"])
            all_results[cfg["name"]] = info

            print(f"  Title: {info['title']}")
            print(f"  H1: {info['h1_text']!r}  |  font: {info['h1_font_family']}")
            print(f"  H1 above fold: {info['h1_above_fold']}")
            print(f"  Hero bg: {info['hero_bg_color']}")
            print(f"  Body bg: {info['body_bg']}")
            print(f"  Fonts: {info['fonts']}")
            print(f"  CTA above fold: {info['cta_above_fold']}")
            print(f"  Eyebrows visible: {info['section_eyebrows_visible']}")
            print(f"  Accent bars: {info['accent_bars']}")
            print(f"  Horiz scroll: {info['horizontal_scroll']}")
            print(f"  Broken images: {info['broken_images']} / {info['total_images']} total")

            await context.close()

        await browser.close()

    # Persist probe results
    probe_path = OUTPUT_DIR / "design_probe.json"
    with open(probe_path, "w", encoding="utf-8") as f:
        json.dump(all_results, f, indent=2, ensure_ascii=False, default=str)
    print(f"\nProbe data saved: {probe_path}")

    return all_results


if __name__ == "__main__":
    asyncio.run(main())
