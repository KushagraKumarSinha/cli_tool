#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import App from './App.jsx';
import path from 'path';
import fs from 'fs';

// Resolve target directory from CLI arg or default to cwd
const rawDir = process.argv[2] || process.cwd();
const targetDir = path.resolve(rawDir);

if (!fs.existsSync(targetDir)) {
  console.error(`❌  Directory not found: ${targetDir}`);
  process.exit(1);
}

if (!fs.statSync(targetDir).isDirectory()) {
  console.error(`❌  Not a directory: ${targetDir}`);
  process.exit(1);
}

render(<App targetDir={targetDir} />);
