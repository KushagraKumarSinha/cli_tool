import fs from 'fs';
import path from 'path';

export function listFiles(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    return entries.map((e) => ({
      name: e.name,
      isDir: e.isDirectory(),
      size: e.isDirectory() ? null : fs.statSync(path.join(dir, e.name)).size,
    }));
  } catch {
    return [];
  }
}

export function addFile(dir, filename, content = '') {
  const fullPath = path.join(dir, filename);
  const parentDir = path.dirname(fullPath);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  return fullPath;
}

export function addFolder(dir, folderName) {
  const fullPath = path.join(dir, folderName);
  fs.mkdirSync(fullPath, { recursive: true });
  return fullPath;
}

export function removeFile(filePath) {
  fs.unlinkSync(filePath);
}

export function removeFolder(folderPath) {
  fs.rmSync(folderPath, { recursive: true, force: true });
}

export function renameEntry(oldPath, newPath) {
  fs.renameSync(oldPath, newPath);
}

export function exists(filePath) {
  return fs.existsSync(filePath);
}

export function formatSize(bytes) {
  if (bytes === null) return '';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
