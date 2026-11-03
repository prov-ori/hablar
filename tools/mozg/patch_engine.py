#!/usr/bin/env python3
"""Обобщённые расширения движка (идемпотентно): лаборатории с флагом embed, расширенный объект K,
ссылки на словарь вида [[термин|как показать]]. Применяется к tools/matematika/template/engine.js;
затем scaffold.py копирует движок в платформу."""
import sys
p = sys.argv[1]
t = open(p, encoding='utf-8').read()
changed = False
def rep(old, new, marker):
    global t, changed
    if marker in t:
        return
    assert old in t, old[:70]
    t = t.replace(old, new); changed = True
rep("const labById = {}; P.labs.forEach(d => { labById[d.id] = d; });",
    "const labById = {}; P.labs.forEach(d => { labById[d.id] = d; });\n  const LABS = P.labs.filter(d => !d.embed); // embed: true — лаборатория только для вставки в урок (@lab id)", 'const LABS =')
for a, b in [("...(P.labs.length ? [['labs'", "...(LABS.length ? [['labs'"), ("Math.min(5, P.labs.length)", "Math.min(5, LABS.length)"),
             ("${P.labs.length ? `<h2>${esc(L.labs.title)}</h2>", "${LABS.length ? `<h2>${esc(L.labs.title)}</h2>"), ("P.labs.slice(0, 8).map(labTile)", "LABS.slice(0, 8).map(labTile)"),
             ("Все ${P.labs.length} ${plural(P.labs.length,", "Все ${LABS.length} ${plural(LABS.length,"), ("lb = P.labs.filter(x => x.course === n);", "lb = LABS.filter(x => x.course === n);"),
             ("const ls = P.labs.filter(x => x.course === c.n);", "const ls = LABS.filter(x => x.course === c.n);"), ("P.labs.forEach(d => IDX.push(", "LABS.forEach(d => IDX.push("),
             ("...(P.labs.length ? [[L.labs.title, '#/labs']] : [])", "...(LABS.length ? [[L.labs.title, '#/labs']] : [])")]:
    rep(a, b, b)
rep("const K = { tex, inline, md, esc, R, $, $$, toast };", "const K = { tex, inline, md, esc, R, $, $$, toast, addXP, S, save, byId, shuffle, pick, plural };", 'addXP, S, save')
rep("""(m, t) => '<a href="#/glossary?q=' + encodeURIComponent(t) + '">' + t + '</a>')""",
    """(m, t) => { const [k, s] = t.split('|'); return '<a href="#/glossary?q=' + encodeURIComponent(k) + '">' + (s || k) + '</a>'; })""", 'const [k, s] = t.split')
open(p, 'w', encoding='utf-8').write(t)
print('применено' if changed else 'уже применено')
