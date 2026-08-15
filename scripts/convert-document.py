#!/usr/bin/env python3
"""
convert-document.py — Convierte un archivo (PDF, DOCX, imagen) a Markdown usando markitdown.
Uso: python3 convert-document.py <ruta_archivo>
Salida: stdout el markdown, stderr para logs.
Retorna: exit code 0 si éxito, 1 si falla (el error va a stderr).
"""

import sys
import traceback


def main():
    if len(sys.argv) < 2:
        print("Uso: convert-document.py <ruta_archivo>", file=sys.stderr)
        sys.exit(1)

    ruta = sys.argv[1]

    try:
        from markitdown import MarkItDown

        md = MarkItDown(enable_plugins=False)
        result = md.convert(ruta)
        print(result.text_content, end="")
        sys.exit(0)
    except ImportError:
        print("markitdown no instalado. Ejecutá: pip install markitdown[pdf]", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()