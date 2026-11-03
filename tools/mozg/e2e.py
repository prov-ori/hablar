#!/usr/bin/env python3
"""Браузерный тест «Кортекса»: маршруты, уроки (в т. ч. со встроенным 3D), атласы, JS-ошибки, горизонтальный скролл.
Использование: PW_CHROME=/путь/к/chrome python3 e2e.py SITE_DIR [--shots OUT_DIR] [--quick]
(--quick: из всех уроков со встроенным 3D открывается только первый)"""
import sys, os
from playwright.sync_api import sync_playwright

site = os.path.abspath(sys.argv[1])
shots = sys.argv[sys.argv.index('--shots') + 1] if '--shots' in sys.argv else None
quick = '--quick' in sys.argv
U = 'file://' + site + '/index.html'
errs = []
ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=os.environ.get('PW_CHROME') or None, args=ARGS)
    for vw, vh, tag in [(390, 844, 'mobile'), (1280, 800, 'desktop')]:
        pg = b.new_context(viewport={'width': vw, 'height': vh}).new_page()
        pg.route('**/fonts.g*/**', lambda r: r.abort())
        pg.on('pageerror', lambda e, t=tag: errs.append(f'[{t}] JS: {e}'))
        pg.on('console', lambda m, t=tag: errs.append(f'[{t}] console: {m.text}') if m.type == 'error' and 'ERR_FILE_NOT_FOUND' not in m.text and 'ERR_FAILED' not in m.text else None)
        pg.goto(U); pg.wait_for_timeout(500)
        data = pg.evaluate("({ids: PLATFORM.lessons.map(l=>l.id), tests: Object.keys(PLATFORM.tests), courses: PLATFORM.config.courses.map(c=>c.n), withLab: PLATFORM.lessons.filter(l=>/^@lab /m.test(l.body)).map(l=>l.id)})")
        routes = ['#/', '#/train', '#/train/exam/all', '#/train/cards/all', '#/train/chrono', '#/train/pairs', '#/train/heroes', '#/train/blitz', '#/tests', '#/timeline',
                  '#/glossary', '#/authors', '#/me', '#/about', '#/labs'] + ['#/c/%s' % c for c in data['courses']] + ['#/tests/' + t for t in data['tests']] + \
                 ['#/l/' + i for i in data['ids'] if i not in data['withLab']]
        for r in routes:
            pg.goto(U + r); pg.wait_for_timeout(60)
            if not pg.locator('h1').count(): errs.append(f'[{tag}] нет заголовка: {r}')
            if 'не найдена' in (pg.locator('h1').first.inner_text() if pg.locator('h1').count() else ''): errs.append(f'[{tag}] 404: {r}')
            sw = pg.evaluate('document.documentElement.scrollWidth')
            if sw > vw + 2: errs.append(f'[{tag}] горизонтальный скролл {sw}px: {r}')
        # квиз урока до конца
        pg.goto(U + '#/l/' + data['ids'][1]); pg.wait_for_timeout(100)
        if pg.locator('[data-act=quiz]').count():
            pg.click('[data-act=quiz]')
            while pg.locator('.opt').count():
                pg.locator('.opt').first.click(); pg.locator('[data-n]').click()
            if not pg.locator('.result').count(): errs.append(f'[{tag}] квиз не дошёл до итога')
        else:
            errs.append(f'[{tag}] нет кнопки квиза')
        # атласы и уроки со встроенным 3D
        labs = ['#/lab/mri'] + ([] if quick else ['#/lab/brain3d'])
        for r in labs + ['#/l/' + i for i in (data['withLab'][:1] if quick else data['withLab'])]:
            pg.goto(U + r)
            try:
                pg.wait_for_selector('.b3d-stage canvas, .mri canvas, .b3d-err', timeout=90000)
            except Exception:
                errs.append(f'[{tag}] атлас не появился: {r}'); continue
            if pg.locator('.b3d-err').count(): errs.append(f'[{tag}] ошибка атласа {r}: ' + pg.locator('.b3d-err').first.inner_text()[:120])
            pg.wait_for_timeout(300)
            sw = pg.evaluate('document.documentElement.scrollWidth')
            if sw > vw + 2: errs.append(f'[{tag}] горизонтальный скролл {sw}px: {r}')
        if shots:
            os.makedirs(shots, exist_ok=True)
            for r, n in [('#/', 'home'), ('#/l/frontal', 'lesson'), ('#/c/2', 'course'), ('#/tests/2', 'test'), ('#/lab/mri', 'mri'), ('#/lab/brain3d', 'brain3d'), ('#/l/limbic', 'lesson-3d')]:
                pg.goto(U + r)
                if 'lab' in r or 'limbic' in r:
                    pg.wait_for_selector('.b3d-stage canvas, .mri canvas', timeout=90000); pg.wait_for_timeout(2500)
                else:
                    pg.wait_for_timeout(250)
                pg.screenshot(path=f'{shots}/{tag}-{n}.png', timeout=170000)
        print(f'[{tag}] проверено маршрутов: {len(routes) + len(labs)}', flush=True)
    b.close()
print('ОШИБКИ:\n' + '\n'.join(errs) if errs else 'OK — ошибок нет')
sys.exit(1 if errs else 0)
