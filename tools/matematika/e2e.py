#!/usr/bin/env python3
"""Браузерный тест: все маршруты, все уроки, игры, поиск; ловит JS-ошибки и горизонтальный скролл.
Использование: python3 e2e.py SITE_DIR [--shots OUT_DIR]"""
import sys, os, json
from playwright.sync_api import sync_playwright
site = os.path.abspath(sys.argv[1]); shots = sys.argv[sys.argv.index('--shots') + 1] if '--shots' in sys.argv else None
U = 'file://' + site + '/index.html'
errs = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=os.environ.get('PW_CHROME') or None)
    for vw, vh, tag in [(390, 844, 'mobile'), (1280, 800, 'desktop')]:
        pg = b.new_context(viewport={'width': vw, 'height': vh}).new_page()
        pg.route('**/fonts.g*/**', lambda r: r.abort())
        pg.on('pageerror', lambda e, t=tag: errs.append(f'[{t}] JS: {e}'))
        pg.goto(U); pg.wait_for_timeout(400)
        data = pg.evaluate("({ids: PLATFORM.lessons.map(l=>l.id), tests: Object.keys(PLATFORM.tests), places: PLATFORM.config.places.route, courses: PLATFORM.config.courses.map(c=>c.n)})")
        routes = ['#/', '#/train', '#/train/exam/all', '#/train/cards/all', '#/train/chrono', '#/train/pairs', '#/train/heroes', '#/train/blitz', '#/tests', '#/timeline', '#/' + data['places'], '#/glossary', '#/authors', '#/me', '#/about'] + \
                 ['#/c/%s' % c for c in data['courses']] + ['#/tests/' + t for t in data['tests']] + ['#/l/' + i for i in data['ids']]
        for r in routes:
            pg.goto(U + r); pg.wait_for_timeout(60)
            if not pg.locator('h1').count(): errs.append(f'[{tag}] нет заголовка: {r}')
            if 'не найдена' in (pg.locator('h1').first.inner_text() if pg.locator('h1').count() else ''): errs.append(f'[{tag}] 404: {r}')
            sw = pg.evaluate('document.documentElement.scrollWidth')
            if sw > vw + 2: errs.append(f'[{tag}] горизонтальный скролл {sw}px: {r}')
        # квиз первого урока до конца
        pg.goto(U + '#/l/' + data['ids'][0]); pg.wait_for_timeout(100)
        if pg.locator('[data-act=quiz]').count():
            pg.click('[data-act=quiz]')
            while pg.locator('.opt').count():
                pg.locator('.opt').first.click(); pg.locator('[data-n]').click()
            if not pg.locator('.result').count(): errs.append(f'[{tag}] квиз не дошёл до итога')
        if shots:
            os.makedirs(shots, exist_ok=True)
            for r, n in [('#/', 'home'), ('#/l/' + data['ids'][0], 'lesson'), ('#/train', 'train')]:
                pg.goto(U + r); pg.wait_for_timeout(250); pg.screenshot(path=f'{shots}/{tag}-{n}.png')
        print(f'[{tag}] маршрутов проверено: {len(routes)}')
    b.close()
print('ОШИБКИ:\n' + '\n'.join(errs) if errs else 'OK — ошибок нет'); sys.exit(1 if errs else 0)
