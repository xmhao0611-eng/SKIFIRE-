from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
STYLE = ROOT / "apps" / "serial-control" / "styles.css"

REQUIRED_VARS = [
    "body-bg",
    "sidebar-bg",
    "sidebar-ink",
    "sidebar-muted",
    "panel-bg",
    "button-bg",
    "button-bg-soft",
    "row-bg",
    "note-bg",
    "prompt-bg",
    "field",
    "ink",
    "muted",
    "line",
    "brand",
    "brand-2",
    "brand-fill-ink",
    "primary-bg",
    "primary-ink",
    "button-ink",
    "button-hover-ink",
    "label-ink",
    "status-ink",
    "placeholder-ink",
    "disabled-bg",
    "disabled-ink",
    "accent-text",
    "success-ink",
    "danger-ink",
    "primary-border",
]

CONTRAST_PAIRS = [
    ("button", "button-ink", "button-bg", 4.5),
    ("soft button", "button-ink", "button-bg-soft", 4.5),
    ("input", "ink", "field", 4.5),
    ("label on panel", "label-ink", "panel", 4.5),
    ("label on row", "label-ink", "row-bg", 4.5),
    ("status on row", "status-ink", "row-bg", 4.5),
    ("placeholder", "placeholder-ink", "field", 4.5),
    ("disabled input", "disabled-ink", "disabled-bg", 4.5),
    ("active tab", "brand-fill-ink", "brand", 4.5),
    ("primary button", "primary-ink", "primary-bg", 4.5),
    ("accent on panel", "accent-text", "panel", 4.5),
    ("accent on row", "accent-text", "row-bg", 4.5),
    ("success on row", "success-ink", "row-bg", 4.5),
    ("danger on row", "danger-ink", "row-bg", 4.5),
    ("sidebar title", "sidebar-ink", "sidebar-bg", 4.5),
    ("sidebar muted", "sidebar-muted", "sidebar-bg", 4.5),
]


def parse_theme_vars(css: str) -> tuple[dict[str, str], dict[str, dict[str, str]], list[str]]:
    block_re = re.compile(r"([^{}]+)\{([^{}]*)\}", re.S)
    var_re = re.compile(r"--([A-Za-z0-9_-]+)\s*:\s*([^;]+);")
    root: dict[str, str] = {}
    themes: dict[str, dict[str, str]] = {}
    order: list[str] = []

    for selector_text, body in block_re.findall(css):
        variables = dict(var_re.findall(body))
        if not variables:
            continue
        selectors = [selector.strip() for selector in selector_text.split(",")]
        for selector in selectors:
            if selector == ":root":
                root.update(variables)
                continue
            match = re.fullmatch(r'html\[data-theme="([^"]+)"\]', selector)
            if not match:
                continue
            theme = match.group(1)
            if theme not in themes:
                themes[theme] = {}
                order.append(theme)
            themes[theme].update(variables)
    return root, themes, order


def resolve_var(value: str, variables: dict[str, str]) -> str:
    seen: set[str] = set()
    current = str(value).strip()
    for _ in range(20):
        match = re.fullmatch(r"var\(--([^)]+)\)", current)
        if not match:
            return current
        key = match.group(1)
        if key in seen or key not in variables:
            return current
        seen.add(key)
        current = variables[key].strip()
    return current


def colors_from_value(value: str) -> list[tuple[float, float, float]]:
    colors = []
    for match in re.finditer(r"#[0-9a-fA-F]{3,6}", value):
        raw = match.group(0)[1:]
        if len(raw) == 3:
            raw = "".join(char * 2 for char in raw)
        if len(raw) != 6:
            continue
        colors.append(tuple(int(raw[index : index + 2], 16) / 255 for index in (0, 2, 4)))
    return colors


def relative_luminance(color: tuple[float, float, float]) -> float:
    channels = []
    for channel in color:
        if channel <= 0.03928:
            channels.append(channel / 12.92)
        else:
            channels.append(((channel + 0.055) / 1.055) ** 2.4)
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]


def contrast_ratio(foreground: tuple[float, float, float], background: tuple[float, float, float]) -> float:
    first = relative_luminance(foreground)
    second = relative_luminance(background)
    light = max(first, second)
    dark = min(first, second)
    return (light + 0.05) / (dark + 0.05)


def check_theme(name: str, variables: dict[str, str]) -> list[str]:
    failures: list[str] = []
    missing = [key for key in REQUIRED_VARS if key not in variables]
    if missing:
        failures.append(f"{name}: missing variables: {', '.join(missing)}")

    for label, foreground_key, background_key, minimum in CONTRAST_PAIRS:
        foreground_value = resolve_var(variables.get(foreground_key, ""), variables)
        background_value = resolve_var(variables.get(background_key, ""), variables)
        foregrounds = colors_from_value(foreground_value)
        backgrounds = colors_from_value(background_value)
        if not foregrounds or not backgrounds:
            failures.append(
                f"{name}: cannot parse colors for {label}: {foreground_key}={foreground_value!r}, "
                f"{background_key}={background_value!r}"
            )
            continue
        worst = min(contrast_ratio(fg, bg) for fg in foregrounds for bg in backgrounds)
        if worst < minimum:
            failures.append(
                f"{name}: {label} contrast {worst:.2f} < {minimum:.1f} "
                f"({foreground_key}={foreground_value}, {background_key}={background_value})"
            )
    return failures


def main() -> int:
    css = STYLE.read_text(encoding="utf-8")
    root, themes, order = parse_theme_vars(css)
    failures = check_theme("root", root)
    for theme in order:
        effective = dict(root)
        effective.update(themes[theme])
        failures.extend(check_theme(theme, effective))

    if failures:
        print("FAIL theme contrast check")
        for failure in failures:
            print(f" - {failure}")
        return 1

    print(f"OK  theme variables and contrast pass for {len(order) + 1} theme states")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
