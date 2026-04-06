# ⚡ Ink File Manager

A terminal-based file manager built with **React Ink**. Browse, add, remove, and rename files/folders in any directory — all from your CLI.

## Setup

```bash
npm install
```

## Usage

```bash
# Manage current directory
node src/index.jsx

# Manage a specific directory (e.g. your VS Code project)
node src/index.jsx /path/to/your/project
```

## Features

| Feature | Description |
|---|---|
| 📂 Browse | Navigate your directory tree with arrow keys |
| ➕ Add | Create new files (with optional content) or folders |
| 🗑 Remove | Delete files or folders (with confirmation) |
| ✏️ Rename | Rename any file or folder |

## Navigation

- **↑ ↓** — Move cursor
- **↵ Enter** — Select / confirm
- **← or `-`** — Go up a directory (in browse mode)
- **q / Esc** — Go back to menu

## Tips

- When adding a file, you can use subdirectory paths like `src/utils/helper.js` — the folders will be created automatically.
- Deleting a folder removes **all its contents** — you'll get a warning before confirming.
- The directory path is shown in the header at all times.
