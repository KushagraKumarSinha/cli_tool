import React, { useState } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import ListFiles from './screens/ListFiles.js';
import AddFile from './screens/AddFile.jsx';
import RemoveFile from './screens/RemoveFile.js';
import RenameFile from './screens/RenameFile.js';

const MENU_ITEMS = [
  { label: '📂  Browse Files',         value: 'list'   },
  { label: '➕  Add File / Folder',     value: 'add'    },
  { label: '🗑   Remove File / Folder', value: 'remove' },
  { label: '✏️   Rename File / Folder', value: 'rename' },
  { label: '❌  Exit',                  value: 'exit'   },
];

export default function App({ targetDir }) {
  const [screen, setScreen] = useState('menu');
  const [flash, setFlash] = useState('');

  const goMenu = () => setScreen('menu');

  const showFlash = (msg) => {
    setFlash(msg);
    setScreen('menu');
    setTimeout(() => setFlash(''), 3000);
  };

  const handleMenuSelect = (item) => {
    if (item.value === 'exit') process.exit(0);
    setScreen(item.value);
  };

  return (
    <Box flexDirection="column" paddingY={1}>
      <Box marginBottom={1} paddingX={1}>
        <Text bold color="cyan">⚡ </Text>
        <Text bold color="white"> Ink File Manager  </Text>
        <Text dimColor>→  {targetDir}</Text>
      </Box>

      {flash ? (
        <Box paddingX={2} marginBottom={1}>
          <Text color="green" bold>✅  {flash}</Text>
        </Box>
      ) : null}

      {screen === 'menu' && (
        <Box paddingX={1} flexDirection="column">
          <Text dimColor>What would you like to do?</Text>
          <Box marginTop={1}>
            <SelectInput items={MENU_ITEMS} onSelect={handleMenuSelect} />
          </Box>
        </Box>
      )}

      {screen === 'list'   && <ListFiles   targetDir={targetDir} onBack={goMenu} />}
      {screen === 'add'    && <AddFile     targetDir={targetDir} onBack={goMenu} onSuccess={showFlash} />}
      {screen === 'remove' && <RemoveFile  targetDir={targetDir} onBack={goMenu} onSuccess={showFlash} />}
      {screen === 'rename' && <RenameFile  targetDir={targetDir} onBack={goMenu} onSuccess={showFlash} />}
    </Box>
  );
}
