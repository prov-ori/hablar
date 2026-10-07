#!/usr/bin/env python3
"""Собирает оболочку платформы из spec.json: index.html, manifest, config.js-заготовку, движок и стили.

Использование:  python3 scaffold.py spec.json OUT_DIR [--force-config]
Контент-файлы (c1.js…, extra.js, tests.js) скрипт не трогает — их пишет Claude.
"""
import json, os, shutil, sys, html

HERE = os.path.dirname(os.path.abspath(__file__))
TPL = os.path.join(HERE, 'template')

ICONS = {
    'home': '<path d="M4 4h4v16H4zM10 4h4v16h-4zM16.5 4.5l3.8 1-3.9 15-3.8-1z"/>',
    'train': '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    'tests': '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    'places': '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    'timeline': '<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>',
    'glossary': '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
    'drills': '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    'labs': '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><path d="M7 15h10"/>',
    'search': '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'
}

def e(s):
    return html.escape(str(s), quote=True)

def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    spec = json.load(open(sys.argv[1], encoding='utf-8'))
    out = sys.argv[2]
    force = '--force-config' in sys.argv
    os.makedirs(out, exist_ok=True)

    base = spec.get('base_url') or f"https://{spec['github_user']}.github.io/{spec['slug']}/"
    if not base.endswith('/'):
        base += '/'
    spec['base_url'] = base

    for f in ['engine.js', 'styles.css', '404.html', 'robots.txt', '.nojekyll']:
        shutil.copy(os.path.join(TPL, f), os.path.join(out, f))

    # Акцент проекта переопределяет киноварь в стилях
    acc = spec.get('accent')
    if acc:
        with open(os.path.join(out, 'styles.css'), 'a', encoding='utf-8') as fh:
            fh.write(f"\n/* Акцент проекта */\n:root {{ --cinnabar: {acc}; {'--cinnabar-soft: ' + spec['accent_soft'] + ';' if spec.get('accent_soft') else ''} }}\n")
            if spec.get('accent_dark'):
                dk = f"--cinnabar: {spec['accent_dark']}; " + (f"--cinnabar-soft: {spec['accent_dark_soft']};" if spec.get('accent_dark_soft') else '')
                fh.write(f"@media (prefers-color-scheme: dark) {{ :root:not([data-theme=\"light\"]) {{ {dk} }} }}\n:root[data-theme=\"dark\"] {{ {dk} }}\n")

    places_route = spec.get('places', {}).get('route', 'places')
    nav = spec.get('nav') or [['Курсы', '#/', 'home'], ['Тренажёры', '#/train', 'train'], ['Тесты', '#/tests', 'tests'], [spec.get('places', {}).get('nav', 'Карта'), '#/' + places_route, 'places'], ['Хронология', '#/timeline', 'timeline']]
    topnav = '<nav class="top-nav" aria-label="Разделы">\n    ' + ''.join(f'<a href="{h}" data-nav="{h}">{e(t)}</a>' for t, h, _ in nav) + '\n  </nav>'
    tabs = nav[:4] + [['Поиск', '#/search', 'search']]
    tabbar = '<nav class="tabbar" aria-label="Навигация">\n' + ''.join(
        (f'  <a href="#/search" id="tabSearch">' if i == 'search' else f'  <a href="{h}" data-nav="{h}">') +
        f'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">{ICONS.get(i, ICONS["home"])}</svg>{e(t)}</a>\n'
        for t, h, i in tabs) + '</nav>'

    scripts = spec.get('vendor_scripts', []) + ['config.js'] + spec.get('content_files', []) + ['engine.js']
    footer = f'{e(spec["name"])} · {e(spec.get("footer", "учебный ресурс"))}, © <span id="year"></span>. <a href="#/about">О платформе</a> · <a href="#/glossary">Словарь</a> · <a href="#/me">Прогресс</a>'
    font_css = spec.get('font_css', 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&display=swap')

    tokens = {
        'LANG': spec.get('lang', 'ru'), 'TITLE': e(spec['title']), 'DESCRIPTION': e(spec['description']), 'BASE_URL': base,
        'ACCENT': spec.get('accent', '#a92a21'), 'NAME': e(spec['name']), 'TAGLINE': e(spec.get('tagline', '')),
        'OG_LOCALE': spec.get('og_locale', 'ru_RU'), 'OG_TITLE': e(spec.get('og_title', spec['title'])),
        'OG_DESCRIPTION': e(spec.get('og_description', spec['description'])), 'OG_ALT': e(spec.get('og_alt', 'Логотип ' + spec['name'])),
        'FONT_CSS': font_css, 'TOPNAV': topnav, 'TABBAR': tabbar, 'FOOTER': footer,
        'SEARCH_PLACEHOLDER': e(spec.get('search_placeholder', 'Тема, термин, имя…')),
        'VENDOR_CSS': ''.join(f'<link rel="stylesheet" href="{c}">\n' for c in spec.get('vendor_css', [])),
        'SCRIPTS': '\n'.join(f'<script src="{s}"></script>' for s in scripts)
    }
    page = open(os.path.join(TPL, 'index.html'), encoding='utf-8').read()
    for k, v in tokens.items():
        page = page.replace('{{' + k + '}}', v)
    assert '{{' not in page, 'не все токены заменены'
    open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(page)

    manifest = {
        'name': spec['name'] + (' — ' + spec['tagline'] if spec.get('tagline') else ''), 'short_name': spec['name'],
        'lang': spec.get('lang', 'ru'), 'start_url': './', 'scope': './', 'display': 'standalone',
        'background_color': '#f5f6f8', 'theme_color': spec.get('accent', '#a92a21'),
        'icons': [{'src': 'icon-192.png', 'sizes': '192x192', 'type': 'image/png'},
                  {'src': 'icon-512.png', 'sizes': '512x512', 'type': 'image/png'},
                  {'src': 'icon-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'}]
    }
    json.dump(manifest, open(os.path.join(out, 'manifest.webmanifest'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)

    cfg_path = os.path.join(out, 'config.js')
    if force or not os.path.exists(cfg_path):
        cfg = {
            'name': spec['name'], 'tagline': spec.get('tagline', ''), 'storageKey': spec['slug'] + '.v1', 'baseUrl': base,
            'monogram': spec.get('monogram', spec['name'][0]),
            'hero': spec.get('hero', {'title': spec['title'], 'lead': spec['description']}),
            'searchHint': spec.get('search_hint', 'Введите слово для поиска'),
            'places': spec.get('places', {'route': 'places', 'title': 'Карта', 'lead': 'Нажмите точку на схеме.', 'teaser': ''}),
            'people': spec.get('people', {'title': 'Персоналии', 'one': 'Персона', 'teaser': 'имён с краткими справками.'}),
            'calloutLabels': spec.get('callout_labels', {'!': 'На экзамене: ', 'e': 'Важно: '}),
            'sourceLabels': spec.get('source_labels', {
                'teacher': ['По конспекту', 'Материал построен на исходном конспекте'],
                'mixed': ['Конспект + дополнения', 'Основа — исходный конспект; детали дополнены. Сверяйте.'],
                'extra': ['Дополнено', 'Исходного конспекта нет — материал составлен по учебной литературе. Сверьте.']}),
            'labels': spec.get('labels', {}),
            'courses': spec['courses'], 'ranks': spec.get('ranks', [[0, 'Новичок'], [120, 'Ученик'], [350, 'Знаток'], [700, 'Эксперт'], [1200, 'Мастер'], [2000, 'Магистр'], [3200, 'Академик']])
        }
        js = ('/* Конфигурация платформы (сгенерировано scaffold.py, можно править). */\nwindow.PLATFORM = {\n  config: ' +
              json.dumps(cfg, ensure_ascii=False, indent=2).replace('\n', '\n  ') +
              ",\n  lessons: [], glossary: [], works: [], heroes: [], authors: [], tests: {}, places: [], outline: null, about: '', drills: [], labs: [],\n"
              "  add(course, list) { list.forEach(l => { l.course = course; this.lessons.push(l); }); }\n};\n")
        open(cfg_path, 'w', encoding='utf-8').write(js)
    print('Готово:', out, '| base_url:', base)

if __name__ == '__main__':
    main()
