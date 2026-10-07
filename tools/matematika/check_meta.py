#!/usr/bin/env python3
"""Проверяет, что ссылка на сайт покажет превью в Telegram, VK, WhatsApp, Facebook, X.
Использование: python3 check_meta.py SITE_DIR"""
import re, sys, os
from PIL import Image
site = sys.argv[1]; h = open(os.path.join(site, 'index.html'), encoding='utf-8').read()
def meta(attr, name):
    m = re.search(rf'<meta {attr}="{re.escape(name)}" content="([^"]*)"', h); return m.group(1) if m else None
fails, ok = [], []
need = [('property', 'og:title'), ('property', 'og:description'), ('property', 'og:image'), ('property', 'og:url'), ('property', 'og:type'),
        ('property', 'og:image:width'), ('property', 'og:image:height'), ('name', 'twitter:card'), ('name', 'twitter:image'), ('name', 'description')]
for a, n in need:
    (ok if meta(a, n) else fails).append(n)
img = meta('property', 'og:image') or ''
if not img.startswith('https://'): fails.append('og:image должен быть абсолютным https-адресом (сейчас: %r)' % img)
if meta('name', 'twitter:card') != 'summary_large_image': fails.append('twitter:card ≠ summary_large_image')
url = meta('property', 'og:url') or ''
if url and not img.startswith(url): fails.append('og:image лежит не под og:url — проверьте имя пользователя/репозитория')
p = os.path.join(site, 'og-image.png')
if not os.path.exists(p): fails.append('нет файла og-image.png')
else:
    w, hh = Image.open(p).size; kb = os.path.getsize(p) // 1024
    if (w, hh) != (1200, 630): fails.append(f'og-image {w}×{hh}, нужно 1200×630')
    if kb > 600: fails.append(f'og-image {kb} КБ — WhatsApp может не показать (>600 КБ)')
for f in ['favicon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'manifest.webmanifest', '.nojekyll']:
    if not os.path.exists(os.path.join(site, f)): fails.append('нет файла ' + f)
for t in (meta('property', 'og:title') or '', meta('property', 'og:description') or ''):
    if len(t) > 200: fails.append('слишком длинный og-текст: ' + t[:40] + '…')
print('Превью:', img); print('Проверено тегов:', len(ok))
if fails: print('ОШИБКИ:\n- ' + '\n- '.join(fails)); sys.exit(1)
print('OK — после публикации сбросьте кэш: Telegram @WebpageBot, Facebook Sharing Debugger, VK pages.clearCache.')
