import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { addFile, addFolder, exists } from '../utils/fileOps.js';
import path from 'path';

export default function AddFile({ targetDir, onBack, onSuccess }) {
  const [step, setStep]       = useState('type');
  const [type, setType]       = useState('file');
  const [name, setName]       = useState('');
  const [content, setContent] = useState('');
  const [typeInput, setTypeInput] = useState('');
  const [error, setError]     = useState('');
  const [created, setCreated] = useState('');

  const handleTypeSubmit = (val) => {
    if (val === '1') { setType('file');   setStep('name'); }
    else if (val === '2') { setType('folder'); setStep('name'); }
    else if (val.toLowerCase() === 'q') { onBack(); }
    else { setError('Enter 1, 2, or q'); }
    setTypeInput('');
  };

  const handleName = (val) => {
    if (!val) return;
    const fullPath = path.join(targetDir, val);
    if (exists(fullPath)) { setError(`"${val}" already exists!`); return; }
    setError('');
    setName(val);
    if (type === 'folder') {
      try {
        addFolder(targetDir, val);
        setCreated(fullPath);
        setStep('done');
        setTimeout(() => onSuccess(`Folder "${val}" created!`), 600);
      } catch (e) { setError(e.message); }
    } else {
      setStep('content');
    }
  };

  const handleContent = (val) => {
    try {
      const fullPath = addFile(targetDir, name, val);
      setCreated(fullPath);
      setStep('done');
      setTimeout(() => onSuccess(`File "${name}" created!`), 600);
    } catch (e) { setError(e.message); }
  };

  if (step === 'done') {
    return (
      <Box paddingX={1}>
        <Text color="green" bold>✅  Created: {created}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingX={1}>
      <Box borderStyle="round" borderColor="green" paddingX={1} marginBottom={1}>
        <Text bold color="green">➕  Add New Entry</Text>
      </Box>

      {step === 'type' && (
        <Box flexDirection="column">
          <Text>What would you like to create?</Text>
          <Text>  <Text color="cyan">1</Text> — File</Text>
          <Text>  <Text color="cyan">2</Text> — Folder</Text>
          <Text>  <Text color="cyan">q</Text> — Cancel</Text>
          {error ? <Text color="red">⚠  {error}</Text> : null}
          <Box marginTop={1}>
            <Text>› </Text>
            <TextInput value={typeInput} onChange={setTypeInput} onSubmit={handleTypeSubmit} />
          </Box>
        </Box>
      )}

      {step === 'name' && (
        <Box flexDirection="column">
          <Text>Enter {type} name <Text dimColor>(e.g. src/utils/helper.js)</Text>:</Text>
          {error ? <Text color="red">⚠  {error}</Text> : null}
          <Box marginTop={1}>
            <Text color="green">› </Text>
            <TextInput value={name} onChange={setName} onSubmit={handleName} />
          </Box>
          <Text dimColor>Press Ctrl+C to cancel</Text>
        </Box>
      )}

      {step === 'content' && (
        <Box flexDirection="column">
          <Text>Initial content for <Text color="cyan">{name}</Text> <Text dimColor>(leave blank for empty)</Text>:</Text>
          <Box marginTop={1}>
            <Text color="green">› </Text>
            <TextInput value={content} onChange={setContent} onSubmit={handleContent} />
          </Box>
        </Box>
      )}
    </Box>
  );
}
