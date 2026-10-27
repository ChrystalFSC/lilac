"""Capture every README screenshot with fictional sample data.

Usage (with the local server running):
    python -m http.server 5178 --directory public
    python tools/screenshots.py

Needs Playwright for Python with Chromium installed:
    pip install playwright && python -m playwright install chromium

The sample cycles are dated relative to today, so the latest period started
14 days ago and "today" lands in the estimated ovulation window.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = "http://localhost:5178/"
OUT = Path(__file__).resolve().parent.parent / "docs" / "screenshots"
OUT.mkdir(parents=True, exist_ok=True)

SEED = """
(() => {
  const pad = (n) => String(n).padStart(2, '0');
  const key = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const e = (flow, extra = {}) => ({ flow, pain: 'none', clots: false, soaked: false, leaked: false,
    painkillersFailed: false, symptoms: [], note: '', ...extra });
  const flows = ['medium', 'heavy', 'medium', 'light', 'light'];
  const lengths = [29, 28, 30, 29];             // fictional cycle lengths, oldest first
  const days = {};
  const start = new Date(); start.setHours(12, 0, 0, 0); start.setDate(start.getDate() - 14);
  let s = new Date(start);
  const starts = [new Date(s)];
  for (const len of lengths.slice().reverse()) { s = new Date(s); s.setDate(s.getDate() - len); starts.unshift(new Date(s)); }
  for (const st of starts) {
    flows.forEach((f, i) => { const d = new Date(st); d.setDate(d.getDate() + i);
      days[key(d)] = e(f, i === 0 ? { pain: 'moderate', symptoms: ['tiredness', 'bloating'] } : i === 1 ? { pain: 'mild' } : {}); });
  }
  if (!localStorage.getItem('lilac.v1')) {
    localStorage.setItem('lilac.v1', JSON.stringify({ days, stamps: Object.fromEntries(Object.keys(days).map(k => [k, 1])) }));
  }
  localStorage.setItem('lilac.lang', '__LANG__');
  __PREFS__
})();
"""


def open_page(browser, lang="en", w=1280, h=800, scheme="light", theme=None):
    ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=2,
                              color_scheme=scheme, locale="zh-CN" if lang == "zh" else "en-GB")
    prefs = (f"localStorage.setItem('lilac.prefs', JSON.stringify({{theme: '{theme}', mode: '{scheme}', stamp: 1}}));"
             if theme else "")
    ctx.add_init_script(SEED.replace("__LANG__", lang).replace("__PREFS__", prefs))
    page = ctx.new_page()
    page.goto(URL, wait_until="networkidle")
    page.evaluate("document.fonts.ready")
    page.wait_for_timeout(2600)  # entrance + dial animations
    return page


def shot(target, name, **kw):
    path = OUT / name
    target.screenshot(path=str(path), type="jpeg", quality=88, **kw)
    print(f"{name:28} {path.stat().st_size // 1024} KB")


with sync_playwright() as p:
    b = p.chromium.launch()

    pg = open_page(b)
    shot(pg, "desktop-home.jpg")
    top = pg.evaluate("document.getElementById('stats').getBoundingClientRect().top + scrollY - 24")
    bottom = pg.evaluate("document.querySelector('.grid').getBoundingClientRect().bottom + scrollY + 24")
    shot(pg, "desktop-calendar.jpg", clip={"x": 0, "y": top, "width": 1280, "height": bottom - top}, full_page=True)
    shot(pg.locator(".phases"), "phases.jpg")

    shot(open_page(b, scheme="dark"), "desktop-dark.jpg")

    pg = open_page(b, "zh", 390, 844)
    shot(pg, "phone-chinese.jpg")
    shot(pg.locator(".phases"), "phases-phone-chinese.jpg")

    pg = open_page(b, "en", 390, 844)
    pg.evaluate("document.querySelector('.checkin').scrollIntoView({block: 'center'})")
    pg.wait_for_timeout(300)
    pg.click('.flow-btn[data-flow="light"]')
    pg.wait_for_timeout(450)
    shot(pg, "phone-checkin.jpg")

    pg = open_page(b, "en", 390, 844)
    pg.click("#checkin-more")
    pg.wait_for_timeout(500)
    shot(pg, "phone-day-details.jpg")

    pg = open_page(b, "en", 390, 760)
    pg.click("#theme-open")
    pg.wait_for_timeout(500)
    shot(pg, "phone-appearance.jpg")

    for theme, scheme in [("lilac", "light"), ("rose", "light"), ("peach", "light"), ("mint", "dark"), ("ocean", "light")]:
        shot(open_page(b, "en", 390, 760, scheme=scheme, theme=theme), f"theme-{theme}.jpg")

    b.close()
