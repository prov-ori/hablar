#!/usr/bin/env python3
"""Генерирует логотип (буквица из настоящего шрифта → векторный контур), иконки и превью 1200×630.

Использование:  python3 make_brand.py spec.json SITE_DIR
Нужны: fontTools, Pillow, playwright (chromium). Цифры для превью берутся из контента
через validate.js — превью никогда не обещает больше, чем есть на сайте.
"""
import json, os, subprocess, sys, html

HERE = os.path.dirname(os.path.abspath(__file__))

def glyph_path(font_path, ch, weight=700, box=512, height=300):
    from fontTools.ttLib import TTFont
    from fontTools.pens.svgPathPen import SVGPathPen
    from fontTools.pens.boundsPen import BoundsPen
    f = TTFont(font_path)
    if 'fvar' in f:
        from fontTools.varLib.instancer import instantiateVariableFont
        axes = {a.axisTag for a in f['fvar'].axes}
        f = instantiateVariableFont(f, {'wght': weight} if 'wght' in axes else {})
    gs = f.getGlyphSet(); name = f.getBestCmap()[ord(ch)]
    bp = BoundsPen(gs); gs[name].draw(bp); x0, y0, x1, y1 = bp.bounds
    pen = SVGPathPen(gs); gs[name].draw(pen)
    s = height / (y1 - y0); w = (x1 - x0) * s
    tx = (box - w) / 2 - x0 * s; ty = box / 2 + (y1 + y0) / 2 * s
    return f'<path transform="translate({tx:.1f} {ty:.1f}) scale({s:.4f} {-s:.4f})" d="{pen.getCommands()}"/>'

def stats(site):
    r = subprocess.run(['node', os.path.join(HERE, 'validate.js'), site], capture_output=True, text=True)
    line = (r.stdout.strip().splitlines() or ['{}'])[0]
    try:
        return json.loads(line)
    except Exception:
        return {}

def main():
    spec = json.load(open(sys.argv[1], encoding='utf-8')); site = sys.argv[2]
    b = spec.get('brand', {})
    accent = spec.get('accent', '#a92a21'); gold = b.get('gold', '#e7c36a'); paper = b.get('paper', '#fbf7ee'); bg = b.get('og_bg', '#1b2231')
    font = b.get('font', '/usr/share/fonts/truetype/google-fonts/Lora-Variable.ttf')
    font_it = b.get('font_italic', font.replace('-Variable', '-Italic-Variable'))
    gfont = b.get('glyph_font', font)
    if not os.path.isabs(gfont): gfont = os.path.join(HERE, gfont)
    g = glyph_path(gfont, spec.get('monogram', spec['name'][0]))
    fdir = font if os.path.isabs(font) else os.path.join(HERE, font)
    if os.path.isdir(fdir):  # каталог с woff-файлами Lora (fontsource)
        faces = ''.join(f"@font-face{{font-family:Brand;font-style:{st};font-weight:{w};src:url(file://{fdir}/lora-{sub}-{w}-{st}.woff);unicode-range:{rng}}}" for sub, rng in (('latin', 'U+0000-024F,U+2000-206F'), ('cyrillic', 'U+0400-04FF')) for w in (400, 700) for st in ('normal', 'italic'))
    else:
        faces = f"@font-face{{font-family:Brand;src:url(file://{font});font-weight:400 700}}@font-face{{font-family:Brand;font-style:italic;src:url(file://{font_it});font-weight:400 700}}"
    logo = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<rect width="512" height="512" rx="112" fill="{accent}"/>
<rect x="40" y="40" width="432" height="432" rx="80" fill="none" stroke="{gold}" stroke-width="10"/>
<g fill="{paper}">{g}</g>
<path d="M118 418 H394" stroke="{gold}" stroke-width="10" stroke-linecap="round"/>
<circle cx="256" cy="418" r="15" fill="{gold}"/>
</svg>'''
    open(os.path.join(site, 'favicon.svg'), 'w', encoding='utf-8').write(logo)

    st = stats(site)
    fmt = lambda t: t.format(**{k: v for k, v in st.items() if not isinstance(v, list)}) if st else t
    lines = [fmt(x) for x in spec.get('og_stats', ['{lessons} уроков · {questions} вопросов'])]
    url = spec['base_url'].replace('https://', '').rstrip('/') if spec.get('base_url') else f"{spec['github_user']}.github.io/{spec['slug']}"
    heights = [250, 286, 270, 240, 262, 255, 275]
    spines = ''.join(f'<div class="sp" style="height:{heights[i % 7]}px;background:{c["color"]}"><i>{html.escape(c.get("roman", str(c["n"])))}</i></div>' for i, c in enumerate(spec['courses'][:8]))
    og = f'''<!doctype html><html><head><meta charset="utf-8"><style>
{faces}
html,body{{margin:0}}
.c{{width:1200px;height:630px;background:{bg};position:relative;overflow:hidden;font-family:Brand,serif;color:#f4efe4}}
.shelf{{position:absolute;right:58px;bottom:96px;display:flex;align-items:flex-end;gap:8px}}
.sp{{width:54px;border-radius:5px 5px 2px 2px;box-shadow:inset -6px 0 0 rgba(0,0,0,.18),inset 5px 0 0 rgba(255,255,255,.08);display:flex;justify-content:center;padding-top:12px;color:#fff;font-weight:700;font-size:19px}}
.sp i{{font-style:normal;border-top:2px solid rgba(255,255,255,.55);border-bottom:2px solid rgba(255,255,255,.55);padding:5px 2px;height:max-content}}
.plank{{position:absolute;right:40px;bottom:82px;height:14px;background:#3a4357;border-radius:3px}}
.logo{{position:absolute;left:72px;top:60px;width:132px;height:132px}}
h1{{position:absolute;left:72px;top:218px;margin:0;font-size:{b.get('og_title_size', 104)}px;line-height:1;font-weight:700;letter-spacing:-1px;max-width:680px}}
p{{position:absolute;left:76px;top:340px;margin:0;font-size:36px;line-height:1.3;color:{gold};font-style:italic;width:640px}}
.meta{{position:absolute;left:76px;bottom:54px;width:600px;font:500 24px/1.4 system-ui,sans-serif;color:#b9c0cf}}
.meta b{{color:#f4efe4}}
.url{{position:absolute;right:58px;top:66px;font:500 22px system-ui,sans-serif;color:#8a93a6}}
</style></head><body><div class="c">
<img class="logo" src="favicon.svg"><div class="url">{html.escape(url)}</div>
<h1>{html.escape(spec['name'])}</h1><p>{html.escape(spec.get('og_subtitle', spec.get('tagline', '')))}</p>
<div class="meta"><b>{html.escape(lines[0])}</b>{''.join('<br>' + html.escape(x) for x in lines[1:])}</div>
<div class="shelf">{spines}</div><div class="plank" style="width:{min(8, len(spec['courses'])) * 62 + 20}px"></div>
</div></body></html>'''
    og_path = os.path.join(site, '_og.html'); open(og_path, 'w', encoding='utf-8').write(og)
    icon_path = os.path.join(site, '_icon.html'); open(icon_path, 'w').write('<!doctype html><body style="margin:0"><img src="favicon.svg" style="width:100vw;height:100vh;display:block">')
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        br = pw.chromium.launch(executable_path=os.environ.get('PW_CHROME') or None)
        pg = br.new_page(viewport={'width': 1200, 'height': 630}); pg.goto('file://' + os.path.abspath(og_path)); pg.wait_for_timeout(400)
        pg.screenshot(path=os.path.join(site, 'og-image.png'))
        for size, name, opaque in [(512, 'icon-512.png', False), (192, 'icon-192.png', False), (180, 'apple-touch-icon.png', True), (32, 'favicon-32.png', False)]:
            pg = br.new_page(viewport={'width': size, 'height': size}); pg.goto('file://' + os.path.abspath(icon_path)); pg.wait_for_timeout(150)
            pg.screenshot(path=os.path.join(site, name), omit_background=not opaque)
        br.close()
    os.remove(og_path); os.remove(icon_path)
    print('Бренд готов. Статистика для превью:', lines)

if __name__ == '__main__':
    main()
