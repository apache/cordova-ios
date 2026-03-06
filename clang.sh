clang.sh#!/usr/bin/env zsh

FILES=()
while IFS= read -r -d '' file; do
  FILES+=("$file")
done < <(find . \( -name "*.m" -o -name "*.h" \) -print0)

if (( ${#FILES[@]} )); then
  xcrun clang-format -i "${FILES[@]}"
fi
