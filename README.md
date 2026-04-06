# ⚡ Ink File Manager

A fully interactive, terminal-based file manager built with **React Ink** — meaning you write actual React components that render in your CLI instead of a browser. Browse directories, create files and folders, delete them, rename them — all without leaving your terminal.

> Built as a learning project to explore React Ink and Node.js filesystem APIs together.

---

## 📸 Preview

```
 ⚡  Ink File Manager  →  /Users/you/my-project

 What would you like to do?

 ❯ 📂  Browse Files
   ➕  Add File / Folder
   🗑   Remove File / Folder
   ✏️   Rename File / Folder
   ❌  Exit
```

---

## 📦 Tech Stack

| Package | Purpose |
|---|---|
| [`ink`](https://github.com/vadimdemedes/ink) | Renders React components to the terminal |
| [`ink-select-input`](https://github.com/vadimdemedes/ink-select-input) | Arrow-key navigable menus |
| [`ink-text-input`](https://github.com/vadimdemedes/ink-text-input) | Text input fields in the terminal |
| [`react`](https://react.dev/) | Component model, hooks, state |
| [`tsx`](https://github.com/privatenumber/tsx) | Runs `.jsx`/`.tsx` files directly in Node.js (no Webpack/Vite needed) |
| Node.js `fs` | Native filesystem operations (read, write, delete, rename) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher (v22 recommended)
- **npm** v8 or higher

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/ink-file-manager.git
cd ink-file-manager

# 2. Install dependencies
npm install

# 3. Run it
npm start
```

### Targeting a Specific Directory

By default the app manages whichever directory you're currently in (`process.cwd()`). You can pass any path as a CLI argument:

```bash
# Manage your current directory
npm start

# Manage a specific project folder
npm start -- /path/to/your/project

# Manage your VS Code workspace
npm start -- ~/code/my-app
```

---

## 🗂 Project Structure

```
ink-file-manager/
│
├── src/
│   ├── index.jsx              # Entry point — reads CLI arg, calls render()
│   ├── App.jsx                # Root component — main menu + screen router
│   │
│   ├── screens/
│   │   ├── ListFiles.jsx      # Browse files with keyboard navigation
│   │   ├── AddFile.jsx        # Create new files or folders
│   │   ├── RemoveFile.jsx     # Delete files or folders (with confirmation)
│   │   └── RenameFile.jsx     # Rename any file or folder
│   │
│   └── utils/
│       └── fileOps.js         # All Node.js fs logic (pure functions, no UI)
│
├── babel.config.json          # Babel config (used internally by tsx)
├── package.json
└── README.md
```

### Why this structure?

- **`screens/`** keeps each "page" of the UI isolated — easy to add new screens later
- **`utils/fileOps.js`** separates filesystem logic from UI completely. If you ever want to test file operations, you can do it without rendering anything
- **`App.jsx`** acts as a simple router using a `screen` state string — no React Router needed for a CLI app

---

## 🔍 How It Works — Concept by Concept

This section explains every key concept used in the project so you can rebuild it from scratch.

---

### 1. What is React Ink?

React Ink lets you use React to build CLI apps. Instead of rendering `<div>` and `<span>` to a browser DOM, it renders `<Box>` and `<Text>` components to your terminal using a layout engine called **Yoga** (the same one React Native uses).

```jsx
import { render, Box, Text } from 'ink';

const App = () => (
  <Box flexDirection="column">
    <Text color="green" bold>Hello from your terminal!</Text>
    <Text dimColor>This is React, but in the CLI.</Text>
  </Box>
);

render(<App />);
```

Running that file prints styled, layout-aware output to your terminal — and it can update dynamically using React state, just like a web app.

**Key Ink components you'll use:**

| Component | What it does |
|---|---|
| `<Box>` | Like a `<div>` — handles layout via flexbox props |
| `<Text>` | Renders text with optional `color`, `bold`, `dimColor`, `backgroundColor` |
| `useInput(fn)` | Hook that fires `fn(input, key)` whenever the user presses a key |
| `render(<App />)` | Mounts your app into the terminal (replaces `ReactDOM.render`) |

---

### 2. Running JSX in Node Without a Bundler

Node.js doesn't understand `.jsx` files or the JSX syntax natively. Normally you'd use Webpack or Vite, but those are browser-focused. For CLI tools, the simplest approach is **tsx** — a zero-config tool that compiles and runs `.jsx`/`.tsx` files on the fly using esbuild.

```bash
# Install tsx as a dev dependency
npm install --save-dev tsx

# Run a JSX file directly
npx tsx src/index.jsx
```

You can also wire it up in `package.json`:

```json
"scripts": {
  "start": "tsx src/index.jsx"
}
```

> **Why not Babel?** Ink v6 uses ES modules with top-level `await`, which conflicts with Babel's CommonJS output. `tsx` handles this seamlessly.

---

### 3. Entry Point — `src/index.jsx`

This file does three things:

1. Reads the directory path from the CLI argument (`process.argv[2]`) or falls back to `process.cwd()`
2. Validates that the path exists and is a directory
3. Calls `render(<App targetDir={...} />)` to start the UI

```jsx
import React from 'react';
import { render } from 'ink';
import App from './App.jsx';
import path from 'path';
import fs from 'fs';

const rawDir = process.argv[2] || process.cwd();
const targetDir = path.resolve(rawDir); // Always resolve to absolute path

if (!fs.existsSync(targetDir)) {
  console.error(`❌ Directory not found: ${targetDir}`);
  process.exit(1);
}

render(<App targetDir={targetDir} />);
```

**Key concepts:**
- `process.argv` is an array where index 0 is `node`, index 1 is the script path, and index 2+ are your custom arguments
- `path.resolve()` converts relative paths like `../my-folder` into absolute paths like `/Users/you/my-folder`
- `process.exit(1)` exits with a non-zero code, signalling failure to the shell

---

### 4. App Router — `src/App.jsx`

There's no React Router here. Instead, a single `screen` state string tracks which screen to show. When a menu item is selected, `screen` is updated and the matching component renders.

```jsx
const [screen, setScreen] = useState('menu'); // 'menu' | 'list' | 'add' | 'remove' | 'rename'

// Conditionally render screens
{screen === 'menu'   && <MainMenu onSelect={setScreen} />}
{screen === 'list'   && <ListFiles targetDir={targetDir} onBack={() => setScreen('menu')} />}
{screen === 'add'    && <AddFile   targetDir={targetDir} onBack={() => setScreen('menu')} onSuccess={showFlash} />}
// ...
```

**Flash messages** are handled the same way — a `flash` state string is set after a successful action, shown in the menu, and cleared after 3 seconds:

```jsx
const showFlash = (msg) => {
  setFlash(msg);
  setScreen('menu');
  setTimeout(() => setFlash(''), 3000);
};
```

---

### 5. Keyboard Input — `useInput`

Ink's `useInput` hook is how you capture keypresses. It fires a callback with two arguments: the raw character typed (`input`) and a `key` object with booleans for special keys.

```jsx
import { useInput } from 'ink';

useInput((input, key) => {
  if (key.upArrow)   setCursor(c => Math.max(0, c - 1));
  if (key.downArrow) setCursor(c => Math.min(items.length - 1, c + 1));
  if (key.return)    handleSelect(items[cursor]);
  if (key.escape || input === 'q') goBack();
});
```

**Available `key` properties:**

| Property | Triggered by |
|---|---|
| `key.upArrow` | ↑ |
| `key.downArrow` | ↓ |
| `key.leftArrow` | ← |
| `key.rightArrow` | → |
| `key.return` | Enter |
| `key.escape` | Escape |
| `key.ctrl` | Ctrl held down |
| `key.tab` | Tab |

For regular letter keys, check the `input` string directly: `if (input === 'y') confirm()`.

---

### 6. Filesystem Operations — `src/utils/fileOps.js`

All Node.js `fs` calls live here, completely separate from the UI. Each function is a pure utility — it either works or throws, and the calling component handles the error.

```js
import fs from 'fs';
import path from 'path';

// List all files and folders in a directory
export function listFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.map(e => ({
    name: e.name,
    isDir: e.isDirectory(),
    size: e.isDirectory() ? null : fs.statSync(path.join(dir, e.name)).size,
  }));
}

// Create a file (creates parent directories automatically)
export function addFile(dir, filename, content = '') {
  const fullPath = path.join(dir, filename);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true }); // creates src/utils/ if needed
  fs.writeFileSync(fullPath, content, 'utf8');
  return fullPath;
}

// Create a folder
export function addFolder(dir, folderName) {
  const fullPath = path.join(dir, folderName);
  fs.mkdirSync(fullPath, { recursive: true });
  return fullPath;
}

// Delete a file
export function removeFile(filePath) {
  fs.unlinkSync(filePath);
}

// Delete a folder and ALL its contents
export function removeFolder(folderPath) {
  fs.rmSync(folderPath, { recursive: true, force: true });
}

// Rename or move a file/folder
export function renameEntry(oldPath, newPath) {
  fs.renameSync(oldPath, newPath);
}
```

**Key `fs` methods used:**

| Method | Does |
|---|---|
| `fs.readdirSync(dir, { withFileTypes: true })` | Lists directory contents as `Dirent` objects (lets you check `.isDirectory()`) |
| `fs.statSync(path)` | Gets file metadata including `.size` in bytes |
| `fs.writeFileSync(path, content)` | Creates or overwrites a file |
| `fs.mkdirSync(path, { recursive: true })` | Creates a folder (and any missing parents) |
| `fs.unlinkSync(path)` | Deletes a single file |
| `fs.rmSync(path, { recursive: true })` | Deletes a folder and everything inside it |
| `fs.renameSync(old, new)` | Renames or moves a file/folder |
| `fs.existsSync(path)` | Returns `true`/`false` — used for collision checks |

---

### 7. Browse Screen — `src/screens/ListFiles.jsx`

This screen maintains two pieces of state: the `cursor` position and the `currentDir` (so you can navigate into subdirectories).

```jsx
const [files, setFiles]       = useState([]);
const [cursor, setCursor]     = useState(0);
const [currentDir, setCurrentDir] = useState(targetDir);

// Reload file list whenever currentDir changes
useEffect(() => {
  setFiles(listFiles(currentDir));
  setCursor(0);
}, [currentDir]);

useInput((input, key) => {
  if (key.return && files[cursor]?.isDir) {
    setCurrentDir(path.join(currentDir, files[cursor].name)); // go deeper
  }
  if (key.leftArrow) {
    setCurrentDir(path.dirname(currentDir)); // go up one level
  }
});
```

The selected item is highlighted using Ink's `backgroundColor` prop:

```jsx
<Text
  color={i === cursor ? 'black' : 'white'}
  backgroundColor={i === cursor ? 'cyan' : undefined}
>
  {i === cursor ? ' ❯ ' : '   '}{f.name}
</Text>
```

---

### 8. Add Screen — `src/screens/AddFile.jsx`

This screen uses a multi-step flow controlled by a `step` state string:

```
'type'  →  'name'  →  'content' (files only)  →  'done'
```

Each step shows different UI. The `TextInput` component from `ink-text-input` handles keyboard input for text fields.

```jsx
import TextInput from 'ink-text-input';

// Controlled input — value + onChange + onSubmit
<TextInput
  value={name}
  onChange={setName}       // fires on every keypress
  onSubmit={handleName}    // fires on Enter
/>
```

Nested path support (e.g. `src/utils/helper.js`) works automatically because `addFile` uses `fs.mkdirSync(..., { recursive: true })` before writing.

---

### 9. Remove Screen — `src/screens/RemoveFile.jsx`

The key UX decision here is the **confirmation step** — when the user hits Enter on an item, a `confirm` boolean flips to `true` and a warning box appears. The actual deletion only happens if they then press `y`.

```jsx
const [confirm, setConfirm] = useState(false);

useInput((input, key) => {
  if (confirm) {
    if (input === 'y') performDelete();
    else setConfirm(false); // any other key cancels
    return;
  }
  if (key.return) setConfirm(true);
});
```

This pattern — guard state that intercepts all input until resolved — is useful any time you need a destructive confirmation in a CLI.

---

### 10. Rename Screen — `src/screens/RenameFile.jsx`

Two steps: `'select'` (arrow-key pick) then `'rename'` (text input). The `TextInput` is pre-seeded with the current filename so the user can edit it rather than retyping from scratch:

```jsx
// When user hits Enter on a file, pre-fill the input with current name
setNewName(selected.name);
setStep('rename');
```

Collision checking prevents overwriting existing files:

```jsx
const handleRename = (val) => {
  if (exists(path.join(targetDir, val))) {
    setError(`"${val}" already exists!`);
    return;
  }
  renameEntry(path.join(targetDir, selected.name), path.join(targetDir, val));
};
```

---

## ⌨️ Keyboard Reference

| Key | Action |
|---|---|
| `↑` `↓` | Move cursor |
| `↵ Enter` | Select item / confirm input |
| `←` or `-` | Go up a directory (Browse screen) |
| `q` or `Esc` | Go back to main menu |
| `y` | Confirm deletion (Remove screen) |
| Any other key | Cancel deletion (Remove screen) |
| `Ctrl+C` | Force quit |

---

## 🧩 Adding a New Screen

Here's the pattern to follow if you want to add a new feature (e.g. a **Move** screen):

**1. Create `src/screens/MoveFile.jsx`:**

```jsx
import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

export default function MoveFile({ targetDir, onBack, onSuccess }) {
  const [destination, setDestination] = useState('');

  const handleSubmit = (dest) => {
    // do your fs work here
    onSuccess(`Moved to ${dest}`);
  };

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text bold color="magenta">📦  Move File</Text>
      <TextInput value={destination} onChange={setDestination} onSubmit={handleSubmit} />
    </Box>
  );
}
```

**2. Add an entry to `MENU_ITEMS` in `App.jsx`:**

```js
{ label: '📦  Move File', value: 'move' }
```

**3. Import and render it in `App.jsx`:**

```jsx
import MoveFile from './screens/MoveFile.jsx';

{screen === 'move' && <MoveFile targetDir={targetDir} onBack={goMenu} onSuccess={showFlash} />}
```

That's it — the router picks it up automatically.

---

## 🐛 Known Issues

| Issue | Detail |
|---|---|
| Duplicate key warning on startup | A cosmetic React warning from `ink-select-input` v6 with React 19. Harmless — does not affect functionality. Will likely be fixed upstream. |
| "Raw mode not supported" in non-TTY environments | Ink requires an interactive terminal. Running inside certain CI environments, pipes, or non-interactive shells will throw this error. Run it in a real terminal. |

---

## 💡 Ideas for Future Features

- [ ] **Move / Copy files** — select a file, type a destination path
- [ ] **File content preview** — peek at text file contents before acting on them
- [ ] **Search** — fuzzy search files by name across the whole directory tree
- [ ] **Multi-select** — select multiple files for batch delete or move
- [ ] **Hidden file toggle** — show/hide dotfiles like `.env`, `.gitignore`
- [ ] **Sort options** — sort by name, size, or modified date
- [ ] **File size display** — show sizes in the browse view (partially done)
- [ ] **Undo** — soft delete with a trash buffer

---

## 📚 Learning Resources

If you want to rebuild this yourself or go deeper:

- [Ink GitHub & Docs](https://github.com/vadimdemedes/ink) — full API reference for all Ink components and hooks
- [ink-select-input](https://github.com/vadimdemedes/ink-select-input) — the dropdown/menu component
- [ink-text-input](https://github.com/vadimdemedes/ink-text-input) — the text field component
- [Node.js `fs` docs](https://nodejs.org/api/fs.html) — everything about reading/writing files
- [Node.js `path` docs](https://nodejs.org/api/path.html) — `join`, `resolve`, `dirname`, `basename`
- [tsx](https://github.com/privatenumber/tsx) — how to run TypeScript/JSX in Node without a bundler

---

## 📄 License

MIT — do whatever you want with it.
