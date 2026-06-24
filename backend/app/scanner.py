import os
import json
import time
from collections import defaultdict

CATEGORIES = {
    "images": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg", ".ico", ".heic", ".raw", ".tiff"],
    "documents": [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv", ".rtf", ".odt", ".md", ".epub"],
    "videos": [".mp4", ".avi", ".mkv", ".mov", ".wmv", ".flv", ".webm", ".m4v"],
    "music": [".mp3", ".wav", ".flac", ".aac", ".ogg", ".wma", ".m4a"],
    "compressed": [".zip", ".rar", ".7z", ".tar", ".gz", ".bz2", ".xz"],
    "executables": [".exe", ".msi", ".dmg", ".deb", ".rpm", ".appimage"],
    "code": [".py", ".js", ".ts", ".jsx", ".tsx", ".html", ".css", ".json", ".xml", ".yaml", ".yml", ".sh", ".go", ".rs", ".java", ".cpp", ".c", ".h"],
    "torrents": [".torrent"],
    "others": []
}

LARGE_FILE_THRESHOLD = 100 * 1024 * 1024
OLD_FILE_DAYS = 365
MAX_FILES = 5000
MAX_DEPTH = 10
SCAN_TIMEOUT = 30

EXCLUDED_DIRS = {
    "/proc", "/sys", "/dev", "/run", "/boot", "/lost+found",
    "/etc", "/usr/share", "/usr/lib", "/var/lib", "/var/cache",
    "/snap", "/flatpak", "/.steam", "/AppData/Local",
    "node_modules", ".git", ".cache", "venv", "__pycache__",
    ".npm", ".m2", ".gradle", ".cargo", ".local/share/Trash",
}


def get_category(ext):
    ext = ext.lower()
    for cat, exts in CATEGORIES.items():
        if ext in exts:
            return cat
    return "others"


def should_exclude(dirname, full_path):
    if dirname.startswith(".") and dirname not in [".config", ".ssh", ".local"]:
        return True
    if full_path in EXCLUDED_DIRS:
        return True
    for excluded in EXCLUDED_DIRS:
        if excluded in full_path.split(os.sep):
            return True
    return False


def scan_directory(path):
    start_time = time.time()
    total_files = 0
    total_folders = 0
    total_size = 0
    files_info = []
    size_groups = defaultdict(list)

    for root, dirs, files in os.walk(path, topdown=True):
        elapsed = time.time() - start_time
        if elapsed > SCAN_TIMEOUT or total_files >= MAX_FILES:
            break

        rel = os.path.relpath(root, path) if root != path else "."
        if rel != "." and should_exclude(os.path.basename(root), root):
            dirs.clear()
            continue

        dirs[:] = [d for d in dirs if not d.startswith(".") or d in [".config", ".ssh", ".local"]]

        depth = rel.count(os.sep) + 1 if rel != "." else 0
        if depth > MAX_DEPTH:
            dirs.clear()
            continue

        for d in dirs:
            total_folders += 1

        for f in files:
            if total_files >= MAX_FILES:
                break
            filepath = os.path.join(root, f)
            try:
                stat = os.stat(filepath)
                ext = os.path.splitext(f)[1]
                size = stat.st_size
                total_files += 1
                total_size += size
                cat = get_category(ext)

                file_info = {
                    "name": f,
                    "path": filepath,
                    "size": size,
                    "extension": ext,
                    "category": cat,
                    "last_modified": str(stat.st_mtime),
                    "is_duplicate": False
                }
                files_info.append(file_info)
                size_groups[size].append(file_info)
            except (OSError, PermissionError):
                pass

    now = time.time()
    large_files = [f for f in files_info if f["size"] > LARGE_FILE_THRESHOLD]
    old_files = [f for f in files_info if f["last_modified"] and (float(f["last_modified"]) < (now - OLD_FILE_DAYS * 86400))]

    duplicates = find_duplicates_by_size_name(size_groups)

    cat_count = defaultdict(int)
    cat_size = defaultdict(int)
    for f in files_info:
        cat_count[f["category"]] += 1
        cat_size[f["category"]] += f["size"]

    categories = json.dumps({"counts": dict(cat_count), "sizes": dict(cat_size)})

    return {
        "total_files": total_files,
        "total_folders": total_folders,
        "total_size": total_size,
        "files": files_info,
        "duplicates": duplicates,
        "duplicates_count": len(duplicates),
        "duplicates_size": sum(d["total_size"] for d in duplicates) if duplicates else 0,
        "large_files_count": len(large_files),
        "old_files_count": len(old_files),
        "categories": categories,
    }


def find_duplicates_by_size_name(size_groups):
    duplicates = []
    for size, files in size_groups.items():
        if len(files) < 2 or size == 0:
            continue
        name_groups = defaultdict(list)
        for f in files:
            name_groups[f["name"]].append(f)
        for name, same_name_files in name_groups.items():
            if len(same_name_files) < 2:
                continue
            total_dup_size = sum(f["size"] for f in same_name_files)
            duplicates.append({
                "hash": f"size_{size}_name_{name}",
                "file_count": len(same_name_files),
                "total_size": total_dup_size,
                "files": [f["path"] for f in same_name_files]
            })
    return duplicates
