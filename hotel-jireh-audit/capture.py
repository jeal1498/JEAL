"""
Visual capture script for Hotel Jireh Bacalar
https://hotel-jireh.vercel.app/
"""

import asyncio
import json
import time
from pathlib import Path
from playwright.async_api import async_playwright

URL = "https://hotel-jireh.vercel.app/"
OUTPUT_DIR = Path("/home/user/JEAL/hotel-jireh-audit/screenshots")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

VIEWPORTS = [
    {"name": "desktop",  "width": 1920, "height": 1080, "device_scale_factor": 1},
    {"name": "laptop",   "width": 1280, "height": 800,  "device_scale_factor": 1},
    {"name": "tablet",   "width": 768,  "height": 1024, "device_scale_factor": 2},
    {"name": "mobile",   "width": 375,  "height": 812,  "device_scale_factor": 3},
]

async def capture_page(page, viewport, screenshots_dir):
    name = viewport["name"]
    w, h = viewport["width"], viewport["height"]
    dpr = viewport["device_scale_factor"]

    await page.set_viewport_size({"width": w, "height": h})

    await page.goto(URL, wait_until="networkidle", timeout=60000)
    # Extra wait for fonts / lazy images
    await page.wait_for_timeout(3000)

    # Full-page screenshot
    full_path = screenshots_dir / f"{name}_full.png"
    await page.screenshot(path=str(full_path), full_page=True)

    # Above-the-fold screenshot (viewport only)
    atf_path = screenshots_dir / f"{name}_atf.png"
    await page.screenshot(path=str(atf_path), full_page=False)

    print(f"[{name}] Screenshots saved: {full_path.name}, {atf_path.name}")
    return full_path, atf_path


async def gather_metrics(page):
    """Collect DOM/layout metrics from the page."""
    metrics = {}

    # Basic page info
    metrics["title"] = await page.title()
    metrics["url"] = page.url

    # H1 visibility check
    h1 = await page.query_selector("h1")
    if h1:
        h1_text = await h1.inner_text()
        h1_box = await h1.bounding_box()
        metrics["h1_text"] = h1_text.strip()
        metrics["h1_bounding_box"] = h1_box
    else:
        metrics["h1_text"] = None
        metrics["h1_bounding_box"] = None

    # CTA WhatsApp link visibility
    cta_links = await page.query_selector_all('a[href*="wa.me"]')
    cta_info = []
    for link in cta_links:
        text = await link.inner_text()
        box = await link.bounding_box()
        visible = await link.is_visible()
        cta_info.append({"text": text.strip(), "box": box, "visible": visible})
    metrics["cta_whatsapp_links"] = cta_info
    metrics["cta_count"] = len(cta_links)

    # Hero section
    hero = await page.query_selector("section#inicio, section.hero, header, [class*='hero']")
    if hero:
        hero_box = await hero.bounding_box()
        metrics["hero_bounding_box"] = hero_box
    else:
        metrics["hero_bounding_box"] = None

    # Navigation
    nav = await page.query_selector("nav")
    if nav:
        nav_box = await nav.bounding_box()
        nav_visible = await nav.is_visible()
        metrics["nav_visible"] = nav_visible
        metrics["nav_bounding_box"] = nav_box
    else:
        metrics["nav_visible"] = False
        metrics["nav_bounding_box"] = None

    # Images count
    images = await page.query_selector_all("img")
    broken_images = []
    for img in images:
        src = await img.get_attribute("src")
        natural_width = await img.evaluate("el => el.naturalWidth")
        if natural_width == 0:
            broken_images.append(src)
    metrics["total_images"] = len(images)
    metrics["broken_images"] = broken_images

    # Horizontal overflow check
    has_horiz_scroll = await page.evaluate("""
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    """)
    metrics["has_horizontal_scroll"] = has_horiz_scroll

    # Font loading
    fonts_loaded = await page.evaluate("""
        async () => {
            await document.fonts.ready;
            const fonts = [];
            document.fonts.forEach(f => fonts.push(f.family + ' ' + f.status));
            return fonts;
        }
    """)
    metrics["fonts"] = fonts_loaded

    # Sections present
    sections = await page.query_selector_all("section")
    section_ids = []
    for s in sections:
        sid = await s.get_attribute("id")
        cls = await s.get_attribute("class")
        section_ids.append({"id": sid, "class": cls})
    metrics["sections"] = section_ids

    # Touch targets (mobile: check CTAs are >= 44px)
    touch_issues = []
    buttons_and_links = await page.query_selector_all("a, button")
    for el in buttons_and_links:
        box = await el.bounding_box()
        if box and (box["width"] < 44 or box["height"] < 44):
            text = await el.inner_text()
            href = await el.get_attribute("href") or ""
            touch_issues.append({
                "text": text.strip()[:40],
                "href": href[:60],
                "width": round(box["width"], 1),
                "height": round(box["height"], 1),
            })
    metrics["small_touch_targets"] = touch_issues[:20]  # cap at 20

    # Background color of body
    bg_color = await page.evaluate("""
        () => getComputedStyle(document.body).backgroundColor
    """)
    metrics["body_bg_color"] = bg_color

    # Check for FAQ section
    faq = await page.query_selector("#faq, [class*='faq'], [id*='faq']")
    metrics["has_faq"] = faq is not None

    # Check for gallery
    gallery = await page.query_selector("#galeria, [class*='galeria'], [class*='gallery']")
    metrics["has_gallery"] = gallery is not None

    return metrics


async def check_above_fold(page, viewport_height):
    """Check which key elements are visible above the fold."""
    atf = {}

    h1 = await page.query_selector("h1")
    if h1:
        box = await h1.bounding_box()
        atf["h1_above_fold"] = box is not None and box["y"] + box["height"] <= viewport_height
        atf["h1_y_top"] = box["y"] if box else None
    else:
        atf["h1_above_fold"] = False

    # Primary CTA above fold
    ctas = await page.query_selector_all('a[href*="wa.me"]')
    atf_ctas = []
    for cta in ctas:
        box = await cta.bounding_box()
        if box:
            above = box["y"] + box["height"] <= viewport_height
            atf_ctas.append({"y": box["y"], "above_fold": above})
    atf["cta_above_fold"] = any(c["above_fold"] for c in atf_ctas)
    atf["cta_positions"] = atf_ctas[:5]

    # Nav above fold
    nav = await page.query_selector("nav")
    if nav:
        box = await nav.bounding_box()
        atf["nav_above_fold"] = box is not None and box["y"] <= viewport_height
    else:
        atf["nav_above_fold"] = False

    return atf


async def main():
    results = {}

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        for vp in VIEWPORTS:
            name = vp["name"]
            print(f"\n--- Capturing {name} ({vp['width']}x{vp['height']}) ---")

            context = await browser.new_context(
                viewport={"width": vp["width"], "height": vp["height"]},
                device_scale_factor=vp["device_scale_factor"],
                user_agent=(
                    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) "
                    "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
                    if vp["name"] == "mobile" else
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                ),
            )

            page = await context.new_page()
            await page.goto(URL, wait_until="networkidle", timeout=60000)
            await page.wait_for_timeout(3000)

            # Screenshots
            full_path = OUTPUT_DIR / f"{name}_full.png"
            atf_path  = OUTPUT_DIR / f"{name}_atf.png"
            await page.screenshot(path=str(full_path), full_page=True)
            await page.screenshot(path=str(atf_path),  full_page=False)
            print(f"  Saved: {full_path.name}, {atf_path.name}")

            # Metrics
            metrics = await gather_metrics(page)
            atf_check = await check_above_fold(page, vp["height"])
            metrics["above_fold"] = atf_check
            metrics["viewport"] = vp

            results[name] = metrics
            await context.close()

        await browser.close()

    # Save raw metrics JSON
    metrics_path = Path("/home/user/JEAL/hotel-jireh-audit/metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False, default=str)
    print(f"\nMetrics saved to {metrics_path}")

    return results

if __name__ == "__main__":
    results = asyncio.run(main())

    # Print summary
    print("\n========== SUMMARY ==========")
    for vp_name, data in results.items():
        print(f"\n[{vp_name}]")
        print(f"  Title: {data.get('title')}")
        print(f"  H1: {data.get('h1_text', 'NOT FOUND')!r}")
        print(f"  H1 above fold: {data.get('above_fold', {}).get('h1_above_fold')}")
        print(f"  CTA above fold: {data.get('above_fold', {}).get('cta_above_fold')}")
        print(f"  Nav visible: {data.get('nav_visible')}")
        print(f"  Horiz scroll: {data.get('has_horizontal_scroll')}")
        print(f"  Broken images: {len(data.get('broken_images', []))}/{data.get('total_images', 0)}")
        print(f"  Small touch targets: {len(data.get('small_touch_targets', []))}")
        print(f"  Sections: {[s['id'] for s in data.get('sections', [])]}")
        print(f"  Fonts: {data.get('fonts', [])}")
        print(f"  CTA WhatsApp links: {data.get('cta_count', 0)}")
