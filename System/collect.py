"""
collect.py — Combines a visual directory tree, a flat file index, and full
text-file aggregation into a single output file: all_files.txt.
Now includes total project line count.
"""

import os
import sys

# ── Configuration ─────────────────────────────────────────────────────────────

OUTPUT_FILE = "all_files.txt"
EXCLUDED_DIRS = {"node_modules", ".git", "__pycache__", ".venv", "venv", ".next", "dist", "build"}

BINARY_EXTENSIONS = {
    # Images, Video, Audio, Executables, Archives, Fonts, Docs, DBs
    ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp", ".bmp", ".tiff",
    ".mp4", ".avi", ".mov", ".mkv", ".flv", ".wmv", ".webm",
    ".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a",
    ".exe", ".dll", ".so", ".dylib", ".pyc", ".pyo", ".class", ".o", ".a",
    ".zip", ".tar", ".gz", ".bz2", ".xz", ".rar", ".7z", ".tgz",
    ".ttf", ".otf", ".woff", ".woff2", ".eot",
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
    ".db", ".sqlite", ".sqlite3", ".bin", ".dat", ".pickle", ".pkl",
}

DIVIDER  = "=" * 60
THIN_DIV = "-" * 60


# ── Directory Tree ─────────────────────────────────────────────────────────────

def build_tree(root: str) -> list[str]:
    lines: list[str] = []
    root_name = os.path.basename(os.path.abspath(root)) or "."
    lines.append(root_name + "/")

    def _recurse(directory: str, prefix: str) -> None:
        try:
            entries = sorted(
                os.scandir(directory),
                key=lambda e: (not e.is_dir(), e.name.lower()),
            )
        except PermissionError:
            lines.append(prefix + "└── [permission denied]")
            return

        entries = [e for e in entries if not (e.is_dir() and e.name in EXCLUDED_DIRS)]

        for i, entry in enumerate(entries):
            is_last   = i == len(entries) - 1
            connector = "└── " if is_last else "├── "
            lines.append(prefix + connector + entry.name + ("/" if entry.is_dir() else ""))
            if entry.is_dir():
                _recurse(entry.path, prefix + ("    " if is_last else "│   "))

    _recurse(root, "")
    return lines


# ── File Helpers ───────────────────────────────────────────────────────────────

def is_binary_by_extension(path: str) -> bool:
    _, ext = os.path.splitext(path)
    return ext.lower() in BINARY_EXTENSIONS


def is_binary_by_sniff(path: str, sample_size: int = 8192) -> bool:
    try:
        with open(path, "rb") as fh:
            return b"\x00" in fh.read(sample_size)
    except OSError:
        return True


def read_text_file(path: str) -> "str | None":
    for encoding in ("utf-8", "latin-1"):
        errors = "strict" if encoding == "utf-8" else "replace"
        try:
            with open(path, "r", encoding=encoding, errors=errors) as fh:
                return fh.read()
        except (UnicodeDecodeError, ValueError):
            continue
        except OSError:
            return None
    return None


def should_skip(path: str, output_path: str) -> bool:
    if os.path.abspath(path) == output_path:
        return True
    if os.path.abspath(path) == os.path.abspath(__file__):
        return True
    if is_binary_by_extension(path):
        return True
    if is_binary_by_sniff(path):
        return True
    return False


def iter_all_files(root: str):
    for dirpath, dirnames, filenames in os.walk(root, topdown=True):
        dirnames[:] = sorted(d for d in dirnames if d not in EXCLUDED_DIRS)
        for filename in sorted(filenames):
            abs_path = os.path.join(dirpath, filename)
            rel_path = os.path.relpath(abs_path, root)
            yield abs_path, rel_path


# ── Main ───────────────────────────────────────────────────────────────────────

def collect(root: str = ".") -> None:
    root        = os.path.abspath(root)
    output_path = os.path.abspath(os.path.join(root, OUTPUT_FILE))

    all_files  = list(iter_all_files(root))
    tree_lines = build_tree(root)
    text_files = [(a, r) for a, r in all_files if not should_skip(a, output_path)]

    try:
        with open(output_path, "w", encoding="utf-8") as out:
            def w(line: str = "") -> None:
                out.write(line + "\n")

            # 1. Directory Tree
            w(DIVIDER); w("  DIRECTORY TREE"); w(DIVIDER); w()
            for line in tree_lines: w(line)
            w()

            # 2. File Index
            w(DIVIDER); w(f"  FILE INDEX  ({len(all_files)} files total)"); w(DIVIDER); w()
            for _, rel_path in all_files: w(rel_path)
            w()

            # 3. File Contents
            w(DIVIDER); w(f"  FILE CONTENTS  ({len(text_files)} readable text files)"); w(DIVIDER); w()

            written = skipped = total_lines = 0

            for abs_path, rel_path in text_files:
                content = read_text_file(abs_path)
                if content is None:
                    skipped += 1
                    continue

                # Count lines in this file
                file_lines = content.count('\n') + (1 if content and not content.endswith('\n') else 0)
                total_lines += file_lines

                w(THIN_DIV)
                w(f"File: {os.path.basename(abs_path)} | Lines: {file_lines}")
                w(f"Path: {rel_path}")
                w(THIN_DIV)
                out.write(content)
                if not content.endswith("\n"): w()
                w()
                written += 1

        # ── stdout summary ─────────────────────────────────────────────────
        binary_count = len(all_files) - len(text_files)
        print(f"  Done -> {output_path}")
        print(f"   Total files    : {len(all_files)}")
        print(f"   Text written   : {written}")
        print(f"   Total lines    : {total_lines}") # New output
        print(f"   Binary/skipped : {binary_count + skipped}")

    except OSError as exc:
        print(f"Could not write output file: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    if not os.path.isdir(target):
        print(f"Not a directory: {target!r}", file=sys.stderr)
        sys.exit(1)
    collect(target)