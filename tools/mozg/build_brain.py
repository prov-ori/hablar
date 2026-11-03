#!/usr/bin/env python3
"""Строит данные 3D-атласа мозга для платформы «Нейрон».

Источники (все — открытые данные, упакованы в pip-пакеты nilearn и atlasreader):
  * кортикальная поверхность fsaverage5 (FreeSurfer, усреднённая по МРТ-данным людей): pial, sulc;
  * атлас Desikan–Killiany + aseg (FreeSurfer) в пространстве MNI, 1 мм: кора, подкорка, мозжечок, ствол, желудочки;
  * шаблон MNI152 T1, 1 мм.

Результат:
  mozg/brain-mesh.js — сетки (gzip+base64) и таблица структур;
  mozg/brain-vol.js  — МРТ-том T1 и том меток атласа (gzip+base64) для срезов.

Запуск:  python3 tools/mozg/build_brain.py  (нужны nibabel, numpy, scipy, scikit-image, trimesh, fast-simplification)
"""
import base64, csv, glob, gzip, json, os, sys
import numpy as np, nibabel as nib
from scipy import ndimage as ndi
from scipy.spatial import cKDTree
from skimage import measure
import trimesh
from trimesh import remesh
import fast_simplification as fs
from nilearn.image import resample_to_img

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'mozg')
SP = next(p for p in sys.path if p.endswith('site-packages'))
NL = os.path.join(SP, 'nilearn/datasets/data/fsaverage5/')
AR = os.path.join(SP, 'atlasreader/data/')
os.makedirs(OUT, exist_ok=True)

# ——— Атлас в каноническую ориентацию: массив [z][y][x], x вправо, y вперёд, z вверх ———
dk = nib.load(AR + 'atlases/atlas_desikan_killiany.nii.gz')
raw = np.asarray(dk.dataobj).astype(np.int32)
aff = dk.affine
ax = np.argmax(np.abs(aff[:3, :3]), axis=0)          # какая ось массива отвечает x,y,z мира
sg = np.sign(aff[ax, np.arange(3)])
assert list(ax) == [0, 2, 1], ax                       # i->x, k->y, j->z (проверено выше)
lab = np.transpose(raw, (1, 2, 0))                    # (j, k, i) = (z', y, x')
# после transpose: axis0 = j (z убывает), axis1 = k (y растёт), axis2 = i (x убывает)
lab = lab[::-1, :, ::-1].copy()                       # z и x по возрастанию
nz, ny, nx = lab.shape
y0 = float(nib.affines.apply_affine(aff, [0, 0, 0])[1])
z0 = float(nib.affines.apply_affine(aff, [0, 154, 0])[2])
x0 = float(nib.affines.apply_affine(aff, [nx - 1, 0, 0])[0])
print('grid', lab.shape, 'origin', x0, y0, z0)

t1img = resample_to_img(nib.load(AR + 'templates/MNI152_T1_1mm_brain.nii.gz'), dk, interpolation='continuous', force_resample=True, copy_header=True)
t1 = np.asarray(t1img.dataobj).astype(np.float32)
t1 = np.transpose(t1, (1, 2, 0))[::-1, :, ::-1].copy()

def vox2mni(v):   # v: (N,3) в порядке (x_idx, y_idx, z_idx) -> мм
    return np.stack([v[:, 0] + x0, v[:, 1] + y0, v[:, 2] + z0], 1)

def mni2vox(p):
    return np.stack([p[:, 0] - x0, p[:, 1] - y0, p[:, 2] - z0], 1)

# ——— Таблица структур ———
names = {}
for f in ('labels_desikan_killiany.csv',):
    for r in csv.DictReader(open(AR + 'atlases/' + f)):
        names[int(r['index'])] = r['name']
dk_keys = [names[i][len('ctx-lh-'):] for i in sorted(names) if 1000 < i < 1036 and names[i].startswith('ctx-lh-')]
assert len(dk_keys) == 34, len(dk_keys)

labels = []      # [id, key, hemi]
newid = {}       # (ключ, полушарие) -> id
def reg(key, hemi):
    i = len(labels) + 1
    labels.append([i, key, hemi]); newid[(key, hemi)] = i
    return i

remap = np.zeros(max(raw.max(), 3000) + 1, np.uint8)
for h, base in (('L', 1000), ('R', 2000)):
    for idx in sorted(names):
        if base < idx < base + 100 and names[idx].startswith('ctx-'):
            key = names[idx].split('-', 2)[2]
            remap[idx] = reg(key, h)
sub = [  # (метка Left, метка Right, ключ)
    (10, 49, 'thalamus'), (11, 50, 'caudate'), (12, 51, 'putamen'), (13, 52, 'pallidum'),
    (17, 53, 'hippocampus'), (18, 54, 'amygdala'), (26, 58, 'accumbens'), (28, 60, 'ventraldc'),
    (8, 47, 'cerebellum'), (7, 46, 'cerebellum-wm'), (2, 41, 'cerebral-wm'), (4, 43, 'lateral-ventricle'),
    (5, 44, 'inf-lat-vent'), (31, 63, 'choroid-plexus')]
for l, r, key in sub:
    remap[l] = reg(key, 'L'); remap[r] = reg(key, 'R')
for idx, key in ((16, 'brainstem'), (14, 'ventricle3'), (15, 'ventricle4'), (85, 'optic-chiasm'),
                 (251, 'cc-posterior'), (252, 'cc-midposterior'), (253, 'cc-central'), (254, 'cc-midanterior'), (255, 'cc-anterior')):
    remap[idx] = reg(key, 'M')
remap[77] = newid[('cerebral-wm', 'L')]      # гипоинтенсивности белого вещества
vol = remap[np.clip(lab, 0, remap.size - 1)].astype(np.uint8)
print('меток в атласе:', len(labels), 'вокселей мозга:', (vol > 0).sum())

# ——— Сетки ———
Q = 200.0  # int16 единиц на мм
meshes = []   # {id, key, hemi, kind, nv, nf}
blobs = []
def add_mesh(mid, key, hemi, kind, v, f, extra=None):
    q = np.round(v * Q).astype(np.int16)
    assert np.abs(v).max() * Q < 32767
    idt = np.uint16 if len(v) < 65535 else np.uint32
    rec = {'id': int(mid), 'key': key, 'hemi': hemi, 'kind': kind, 'nv': int(len(v)), 'nf': int(len(f)), 'it': 2 if idt == np.uint16 else 4}
    blobs.append(q.astype('<i2').tobytes()); blobs.append(f.astype(idt).astype('<' + ('u2' if idt == np.uint16 else 'u4')).tobytes())
    if extra is not None:
        for name, arr in extra.items():
            blobs.append(arr.astype(np.uint8).tobytes()); rec.setdefault('attrs', []).append(name)
    meshes.append(rec)

# 1) кора: fsaverage5 pial + Loop-подразделение
cortical_ids = {'L': [newid[(k, 'L')] for k in dk_keys], 'R': [newid[(k, 'R')] for k in dk_keys]}
for hemi, side in (('L', 'left'), ('R', 'right')):
    g = nib.load(NL + f'pial_{side}.gii.gz'); v0 = g.darrays[0].data.astype(np.float64); f0 = g.darrays[1].data.astype(np.int64)
    sulc0 = nib.load(NL + f'sulc_{side}.gii.gz').darrays[0].data.astype(np.float64)
    thick0 = nib.load(NL + f'thick_{side}.gii.gz').darrays[0].data.astype(np.float64)
    v, f = remesh.subdivide_loop(v0, f0, iterations=1)
    if trimesh.Trimesh(v, f, process=False).volume < 0:
        f = f[:, ::-1]
    tree = cKDTree(v0)
    d, nn = tree.query(v, k=3)
    w = 1 / (d + 1e-6); w /= w.sum(1, keepdims=True)
    sulc = (sulc0[nn] * w).sum(1); thick = (thick0[nn] * w).sum(1)
    # регион каждой вершины: ближайший воксель коры этого полушария
    ids = cortical_ids[hemi]
    mask = np.isin(vol, ids)
    zi, yi, xi = np.nonzero(mask)
    pts = vox2mni(np.stack([xi, yi, zi], 1).astype(float))
    ctree = cKDTree(pts)
    dist, j = ctree.query(v)
    reg_v = vol[zi[j], yi[j], xi[j]].astype(np.int32)
    reg_v[dist > 3.0] = 0     # медиальная стенка: коры нет
    # мода по соседям, чтобы убрать «соль и перец»
    vf = trimesh.Trimesh(v, f, process=False)
    nbrs = vf.vertex_neighbors
    for _ in range(3):
        new = reg_v.copy()
        for i in range(len(v)):
            nb = np.append(nbrs[i], i)
            vals, cnt = np.unique(reg_v[nb], return_counts=True)
            new[i] = vals[np.argmax(cnt)]
        reg_v = new
    sulc8 = np.clip((sulc - sulc.min()) / (sulc.max() - sulc.min()) * 255, 0, 255)
    thick8 = np.clip(thick / 5.0 * 255, 0, 255)
    add_mesh(1000 + (0 if hemi == 'L' else 1), 'cortex', hemi, 'cortex', v, f, extra={'region': reg_v, 'sulc': sulc8, 'thick': thick8})
    print('кора', hemi, len(v), len(f))

# 2) подкорка, мозжечок, ствол, желудочки, мозолистое тело: marching cubes по сглаженной маске
def surf(mask, sigma, target_faces, smooth_iter=8):
    pad = 4
    m = np.pad(mask.astype(np.float32), pad)
    m = ndi.gaussian_filter(m, sigma)
    vv, ff, _, _ = measure.marching_cubes(m, 0.5)
    vv = vv - pad  # индексы (z,y,x)
    p = vox2mni(np.stack([vv[:, 2], vv[:, 1], vv[:, 0]], 1))
    mesh = trimesh.Trimesh(p, ff, process=True)
    if len(mesh.faces) > target_faces:
        pv, pf = fs.simplify(mesh.vertices.astype(np.float32), mesh.faces.astype(np.int32), target_count=target_faces)
        mesh = trimesh.Trimesh(pv, pf, process=True)
    trimesh.smoothing.filter_taubin(mesh, iterations=smooth_iter)
    if mesh.volume < 0:          # проверка ориентации: нормали должны смотреть наружу
        mesh.invert()
    assert mesh.volume > 0
    return np.asarray(mesh.vertices), np.asarray(mesh.faces)

plan = {  # ключ: (sigma, целевое число граней)
    'thalamus': (0.8, 2500), 'caudate': (0.8, 2200), 'putamen': (0.8, 2200), 'pallidum': (0.8, 1400),
    'hippocampus': (0.7, 3500), 'amygdala': (0.7, 1500), 'accumbens': (0.7, 600), 'ventraldc': (0.9, 2200),
    'cerebellum': (1.0, 16000), 'lateral-ventricle': (0.7, 4000), 'choroid-plexus': (0.7, 1500)}
for key, (sg_, nf_) in plan.items():
    for hemi in 'LR':
        m = (vol == newid[(key, hemi)])
        if key == 'lateral-ventricle':
            m |= (vol == newid[('inf-lat-vent', hemi)])
        if key == 'cerebellum':
            m |= (vol == newid[('cerebellum-wm', hemi)])
        v, f = surf(m, sg_, nf_)
        add_mesh(newid[(key, hemi)], key, hemi, 'struct', v, f)
        print(key, hemi, len(v), len(f))
v, f = surf(vol == newid[('brainstem', 'M')], 1.0, 9000, 10); add_mesh(newid[('brainstem', 'M')], 'brainstem', 'M', 'struct', v, f)
for key, nf_, sg_ in (('ventricle3', 900, 0.8), ('ventricle4', 800, 0.8), ('optic-chiasm', 400, 0.6)):
    v, f = surf(vol == newid[(key, 'M')], sg_, nf_); add_mesh(newid[(key, 'M')], key, 'M', 'struct', v, f)
for key in ('cc-posterior', 'cc-midposterior', 'cc-central', 'cc-midanterior', 'cc-anterior'):
    v, f = surf(vol == newid[(key, 'M')], 0.7, 1200); add_mesh(newid[(key, 'M')], key, 'M', 'struct', v, f)

meta = {'Q': Q, 'grid': [nx, ny, nz], 'origin': [x0, y0, z0], 'labels': labels, 'meshes': meshes, 'cortexKeys': dk_keys}
head = json.dumps(meta, ensure_ascii=False).encode()
payload = len(head).to_bytes(4, 'little') + head + b''.join(blobs)
gz = gzip.compress(payload, 9)
open(os.path.join(OUT, 'brain-mesh.js'), 'w').write('window.BRAIN_MESH="' + base64.b64encode(gz).decode() + '";\n')
print('brain-mesh.js', len(payload) // 1024, 'КБ ->', len(gz) // 1024, 'КБ gzip')

# ——— Тома ———
nzv = t1[vol > 0]
lo, hi = np.percentile(nzv, 0.5), np.percentile(nzv, 99.7)
t8 = np.clip((t1 - lo) / (hi - lo), 0, 1)
t8 = (np.round(t8 * 63) * (255 / 63)).astype(np.uint8)   # 6 бит: заметно легче gzip, глазом неотличимо
t8[vol == 0] = (t8[vol == 0] * 1).astype(np.uint8)
vols = np.concatenate([t8.ravel(), vol.ravel()])
gz2 = gzip.compress(vols.tobytes(), 9)
open(os.path.join(OUT, 'brain-vol.js'), 'w').write('window.BRAIN_VOL={n:[%d,%d,%d],o:[%g,%g,%g],labels:%s,d:"%s"};\n' % (nx, ny, nz, x0, y0, z0, json.dumps(labels, ensure_ascii=False), base64.b64encode(gz2).decode()))
print('brain-vol.js', len(vols) // 1024, 'КБ ->', len(gz2) // 1024, 'КБ gzip')
