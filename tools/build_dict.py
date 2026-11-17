#!/usr/bin/env python3
"""Собирает data/mueller.json из англо-русского словаря Мюллера (7-е издание, GPL-2.0+).

Источник — пакеты Debian mueller7-dict и mueller7accent-dict (формат dictd).
Из обычной версии берём текст с правильными заглавными буквами, из версии с ударениями —
ударения: там ударная гласная написана заглавной (раздОра), мы ставим знак ударения (разд́ора).

Запуск: python3 tools/build_dict.py            — скачает пакеты сам
        python3 tools/build_dict.py <папка>    — возьмёт уже скачанные .deb из папки
"""
import gzip, io, json, re, sys, tarfile, urllib.request
from pathlib import Path

POOL = 'https://deb.debian.org/debian/pool/main/m/mueller/'
DEBS = {'plain': 'mueller7-dict_2002.02.27-16_all.deb',
        'accent': 'mueller7accent-dict_2002.02.27-16_all.deb'}
OUT = Path(__file__).resolve().parent.parent / 'data' / 'mueller.json'
B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
ACUTE = '́'
VOWELS = set('аеиоуыэюяАЕИОУЫЭЮЯ')


def b64(s):
    n = 0
    for c in s:
        n = n * 64 + B64.index(c)
    return n


def deb_files(raw):
    """Достаёт словарь (.dict.dz) и оглавление (.index) из .deb (ar-архив с data.tar.*)."""
    assert raw[:8] == b'!<arch>\n'
    pos, data_tar = 8, None
    while pos < len(raw):
        name = raw[pos:pos + 16].decode().strip().rstrip('/')
        size = int(raw[pos + 48:pos + 58].decode().strip())
        body = raw[pos + 60:pos + 60 + size]
        if name.startswith('data.tar'):
            data_tar = body
        pos += 60 + size + (size & 1)
    tar = tarfile.open(fileobj=io.BytesIO(data_tar))
    dict_dz = index = None
    for m in tar.getmembers():
        if m.name.endswith('.dict.dz') and '/dictd/' in m.name:
            dict_dz = tar.extractfile(m).read()
        elif m.name.endswith('.index') and '/dictd/' in m.name:
            index = tar.extractfile(m).read().decode('utf-8')
    return gzip.decompress(dict_dz), index


def articles(raw):
    data, index = deb_files(raw)
    out = {}
    for line in index.splitlines():
        head, off, ln = line.split('\t')
        off, ln = b64(off), b64(ln)
        out.setdefault(head, []).append(data[off:off + ln].decode('utf-8'))
    return out


def add_stress(plain, accent):
    """Ударная гласная в версии с ударениями — заглавная там, где в обычной строчная."""
    res = []
    for p, a in zip(plain, accent):
        res.append(p)
        if p != a and a in VOWELS and p.islower():
            res.append(ACUTE)
    return ''.join(res)


def fix_ipa(m):
    t = m.group(0)
    t = t.replace('↗', 'ˈ').replace('↘', 'ˌ')
    t = t.replace('ɜ:', 'ɜː').replace(':', 'ː')
    t = re.sub('ɜ(?!ː)', 'ə', t)          # у Мюллера ɜ — это и ə, и ɜː (bird)
    t = t.replace('ɘ', 'ɔ').replace('ɛ', 'e').replace('ʊː', 'uː')
    return t


MARK = re.compile(r'^(_[IV]+\b|\d+\.(?!\d)|\d+\)|[а-я]\))')


def reflow(text):
    """Склеивает строки, разбитые по ширине, в пункты; каждый пункт — с новой строки."""
    lines = text.split('\n')[1:]                      # первая строка — само слово
    items = []
    for ln in lines:
        s = ln.strip()
        if not s:
            continue
        s = re.sub(r'^(\d+\)|_[IVX]+)(?=\S)', r'\1 ', s)   # «10)обременять», «_III[bæŋ]»
        if not items or MARK.match(s) or s.startswith('['):
            items.append(s)
        else:
            items[-1] += ' ' + s
    body = '\n'.join(items)
    return re.sub(r'\[[^\]\n]*\]', fix_ipa, body)


def key(head):
    return head.lower().lstrip("'-")


def main():
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    raws = {}
    for kind, name in DEBS.items():
        if src:
            raws[kind] = (src / name).read_bytes()
        else:
            print('Скачиваю', name)
            raws[kind] = urllib.request.urlopen(POOL + name).read()
    plain, accent = articles(raws['plain']), articles(raws['accent'])

    entries, abbr = [], {}
    for head, texts in plain.items():
        if head.startswith('00-database'):
            continue
        accs = accent.get(head, texts)
        texts = [add_stress(p, a) if len(p) == len(a) else p for p, a in zip(texts, accs)]
        if head.startswith('_') or re.search('[а-яё]', head):   # расшифровки помет (_разг.) и сокращений (тж.)
            abbr[head.lstrip('_')] = ' '.join(texts[0].split()[len(head.split()):])
            continue
        entries.append((key(head), head, '\n'.join(reflow(t) for t in texts)))

    entries.sort(key=lambda e: (e[0], e[1]))
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(json.dumps({
        'source': 'В. К. Мюллер. Англо-русский словарь, 7-е изд. (1961); электронная версия '
                  'С. Старостин, Е. Цымбалюк. Лицензия GPL-2.0+.',
        'h': [e[1] for e in entries],
        'b': [e[2] for e in entries],
        'abbr': abbr,
    }, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print(f'{len(entries)} статей → {OUT} ({OUT.stat().st_size / 1e6:.1f} МБ)')


if __name__ == '__main__':
    main()
