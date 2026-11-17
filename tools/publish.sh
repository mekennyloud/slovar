#!/bin/zsh
# Публикует словарь в личный GitHub (mekennyloud/slovar) и включает GitHub Pages.
# В конце возвращает Терминал на рабочий аккаунт.
set -e
cd "${0:A:h}/.."

[[ -d .git ]] || git init -b main
git add -A
git diff --cached --quiet || git commit -m "Словарь: обновление $(date +%Y-%m-%d)"

gh auth switch --hostname github.com --user mekennyloud
trap 'gh auth switch --hostname github.com --user kpokas-adguard >/dev/null 2>&1 && echo "Терминал снова на рабочем аккаунте kpokas-adguard"' EXIT

if ! gh repo view mekennyloud/slovar >/dev/null 2>&1; then
  gh repo create mekennyloud/slovar --public \
    --description "Англо-русский словарь Мюллера для iPhone, работает без интернета" \
    --source . --remote origin --push
else
  git push -u origin main
fi

gh api -X POST repos/mekennyloud/slovar/pages -f "source[branch]=main" -f "source[path]=/" >/dev/null 2>&1 || true
echo
echo "Готово! Через 1–2 минуты словарь будет по адресу: https://mekennyloud.github.io/slovar/"
echo "На iPhone: открыть в Safari → Поделиться → На экран «Домой»."
