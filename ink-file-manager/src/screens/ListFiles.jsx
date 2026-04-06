import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { listFiles, formatSize } from '../utils/fileOps.js';
import path from 'path';

export default function ListFiles({ targetDir, onBack }) {
  const [files, setFiles] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [currentDir, setCurrentDir] = useState(targetDir);

  useEffect(() => {
    setFiles(listFiles(currentDir));
    setCursor(0);
  }, [currentDir]);

  useInput((input, key) => {
    if (input === 'q' || key.escape) return onBack();
    if (key.upArrow) setCursor((c) => Math.max(0, c - 1));
    if (key.downArrow) setCursor((c) => Math.min(files.length - 1, c + 1));
    if (key.return) {
      const selected = files[cursor];
      if (selected?.isDir) setCurrentDir(path.join(currentDir, selected.name));
    }
    if (key.leftArrow || input === '-') {
      const parent = path.dirname(currentDir);
      if (parent !== currentDir) setCurrentDir(parent);
    }
  });

  return (
    <Box flexDirection="column" paddingX={1}>
      <Box borderStyle="round" borderColor="cyan" paddingX={1} marginBottom={1}>
        <Text bold color="cyan">📂  </Text>
        <Text color="white">{currentDir}</Text>
      </Box>

      <Box marginBottom={1}>
        <Text dimColor>↑↓ navigate  ↵ open folder  ← go up  q quit</Text>
      </Box>

      {files.length === 0 ? (
        <Text color="yellow">  (empty directory)</Text>
      ) : (
        files.map((f, i) => (
          <Box key={f.name}>
            <Text color={i === cursor ? 'black' : 'white'}
                  backgroundColor={i === cursor ? 'cyan' : undefined}>
              {i === cursor ? ' ❯ ' : '   '}
              {f.isDir ? '📁 ' : '📄 '}
              {f.name.padEnd(40)}
              <Text dimColor>{f.isDir ? 'DIR' : formatSize(f.size)}</Text>
            </Text>
          </Box>
        ))
      )}

      <Box marginTop={1}>
        <Text dimColor>{files.length} item{files.length !== 1 ? 's' : ''}</Text>
      </Box>
    </Box>
  );
}
