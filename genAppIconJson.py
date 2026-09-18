"""
Génère public/data/appicons.json à partir des fichiers .png
présents dans public/assets/appicons/.
"""

import json
from pathlib import Path

SOURCE_DIR = Path("public/assets/appicons")
OUTPUT_FILE = Path("public/data/appicons.json")


def main():
    if not SOURCE_DIR.is_dir():
        print(f"Erreur : le dossier {SOURCE_DIR} n'existe pas.")
        return

    png_files = sorted(
        f.name for f in SOURCE_DIR.iterdir()
        if f.is_file() and f.suffix.lower() == ".png"
    )

    if not png_files:
        print(f"Aucune image .png trouvée dans {SOURCE_DIR}.")
        return

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    data = {"APPICONS": png_files}

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"{len(png_files)} image(s) écrite(s) dans {OUTPUT_FILE}")


if __name__ == "__main__":
    main()