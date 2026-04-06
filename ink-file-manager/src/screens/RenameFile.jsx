import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { listFiles, renameEntry, exists } from '../utils/fileOps.js';
import path from 'path';

export default function RenameFile({ targetDir, onBack, onSuccess }) {
  const [files, setFiles] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [step, setStep] = useState('select'); // select | rename
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setFiles(listFiles(targetDir));
  }, []);

  const selected = files[cursor];

  useInput((input, key) => {
    if (step !== 'select') return;
    if (input === 'q' || key.escape) return onBack();
    if (key.upArrow) setCursor((c) => Math.max(0, c - 1));
    if (key.downArrow) setCursor((c) => Math.min(files.length - 1, c + 1));
    if (key.return && selected) {
      setNewName(selected.name);
      setStep('rename');
    }
  });

  const handleRename = (val) => {
    if (!val || val === selected.name) { setStep('select'); return; }
    const newPath = path.join(targetDir, val);
    if (exists(newPath)) {
      setError(`"${val}" already exists!`);
      return;
    }
    try {
      renameEntry(path.join(targetDir, selected.name), newPath);
      onSuccess(`"${selected.name}" renamed to "${val}"`);
    } catch (e) {
      setError(e.message);
      setStep('select');
    }
  };

  return (
    <Box flexDirection="column" paddingX={1}>
      <Box borderStyle="round" borderColor="yellow" paddingX={1} marginBottom={1}>
        <Text bold color="yellow">✏️   Rename File / Folder</Text>
      </Box>

      {step === 'select' && (
        <>
          <Box marginBottom={1}>
            <Text dimColor>↑↓ navigate  ↵ select  q quit</Text>
          </Box>
          {files.length === 0 ? (
            <Text color="yellow">  (directory is empty)</Text>
          ) : (
            files.map((f, i) => (
              <Box key={f.name}>
                <Text
                  color={i === cursor ? 'black' : 'white'}
                  backgroundColor={i === cursor ? 'yellow' : undefined}
                >
                  {i === cursor ? ' ❯ ' : '   '}
                  {f.isDir ? '📁 ' : '📄 '}
                  {f.name}
                </Text>
              </Box>
            ))
          )}
        </>
      )}

      {step === 'rename' && selected && (
        <Box flexDirection="column">
          <Text>Renaming: <Text color="yellow">{selected.name}</Text></Text>
          <Text dimColor>Enter new name (submit empty to cancel):</Text>
          {error ? <Text color="red">⚠  {error}</Text> : null}
          <Box marginTop={1}>
            <Text color="yellow">› </Text>
            <TextInput value={newName} onChange={setNewName} onSubmit={handleRename} />
          </Box>
        </Box>
      )}
    </Box>
  );
}
