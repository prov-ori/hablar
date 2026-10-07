#!/usr/bin/env python3
"""Склеивает сайт в один HTML (скрипты, стили, иконка — внутрь) для превью-артефакта или офлайна.
Использование: python3 bundle_single.py SITE_DIR OUT.html"""
import sys, os, re, base64
site, out = sys.argv[1], sys.argv[2]
h = open(os.path.join(site, 'index.html'), encoding='utf-8').read()
h = re.sub(r'<link rel="stylesheet" href="styles.css">', lambda m: '<style>' + open(os.path.join(site, 'styles.css'), encoding='utf-8').read() + '</style>', h)
h = re.sub(r'<script src="([^"]+)"></script>', lambda m: '<script>' + open(os.path.join(site, m.group(1)), encoding='utf-8').read().replace('</script', '<\\/script') + '</script>', h)
ico = 'data:image/png;base64,' + base64.b64encode(open(os.path.join(site, 'icon-192.png'), 'rb').read()).decode()
h = h.replace('src="icon-192.png"', f'src="{ico}"')
h = re.sub(r'<link rel="(icon|apple-touch-icon|manifest)"[^>]*>\n?', '', h)
open(out, 'w', encoding='utf-8').write(h); print(out, os.path.getsize(out) // 1024, 'КБ')
