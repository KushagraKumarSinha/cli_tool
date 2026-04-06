import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { listFiles, removeFile, removeFolder } from '../utils/fileOps.js';
import path from 'path';

export default function RemoveFile({ targetDir, onBack, onSuccess }) {
  const [files, setFiles] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFiles(listFiles(targetDir));
  }, []);

  const selected = files[cursor];

  useInput((input, key) => {
    if (confirm) {
      if (input === 'y' || input === 'Y') {
        try {
          if (selected.isDir) {
            removeFolder(path.join(targetDir, selected.name));
          } else {
            removeFile(path.join(targetDir, selected.name));
          }
          onSuccess(`"${selected.name}" deleted.`);
        } catch (e) {
          setError(e.message);
          setConfirm(false);
        }
      } else {
        setConfirm(false);
      }
      return;
    }

    if (input === 'q' || key.escape) return onBack();
    if (key.upArrow) setCursor((c) => Math.max(0, c - 1));
    if (key.downArrow) setCursor((c) => Math.min(files.length - 1, c + 1));
    if (key.return && selected) setConfirm(true);
  });

  return (
    <Box flexDirection="column" paddingX={1}>
      <Box borderStyle="round" borderColor="red" paddingX={1} marginBottom={1}>
        <Text bold color="red">🗑   Remove File / Folder</Text>
      </Box>

      <Box marginBottom={1}>
        <Text dimColor>↑↓ navigate  ↵ select  q quit</Text>
      </Box>

      {error ? <Text color="red">⚠  {error}</Text> : null}

      {files.length === 0 ? (
        <Text color="yellow">  (directory is empty)</Text>
      ) : (
        files.map((f, i) => (
          <Box key={f.name}>
            <Text
              color={i === cursor ? 'black' : 'white'}
              backgroundColor={i === cursor ? 'red' : undefined}
            >
              {i === cursor ? ' ❯ ' : '   '}
              {f.isDir ? '📁 ' : '📄 '}
              {f.name}
            </Text>
          </Box>
        ))
      )}

      {confirm && selected && (
        <Box borderStyle="round" borderColor="yellow" paddingX={2} marginTop={1} flexDirection="column">
          <Text color="yellow" bold>⚠  Are you sure you want to delete "{selected.name}"?</Text>
          {selected.isDir && <Text color="red">This will delete the folder AND all its contents!</Text>}
          <Text>Press <Text color="green" bold>y</Text> to confirm or any other key to cancel.</Text>
        </Box>
      )}
    </Box>
  );
}
