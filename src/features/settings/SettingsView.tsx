import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Panel } from '../shared/Panel';

export function SettingsView() {
  const exportSave = useGameStore((state) => state.exportSave);
  const importSave = useGameStore((state) => state.importSave);
  const resetGame = useGameStore((state) => state.resetGame);
  const [saveCode, setSaveCode] = useState('');
  const [message, setMessage] = useState('');

  return (
    <div className="view-grid">
      <Panel title="存档">
        <button type="button" onClick={() => setSaveCode(exportSave())}>
          导出存档码
        </button>
        <textarea value={saveCode} onChange={(event) => setSaveCode(event.target.value)} rows={6} />
        <button
          type="button"
          onClick={() => {
            try {
              importSave(saveCode);
              setMessage('导入成功');
            } catch (error) {
              setMessage(error instanceof Error ? error.message : '导入失败');
            }
          }}
        >
          导入存档码
        </button>
        <button type="button" onClick={() => resetGame(Date.now())}>
          重置存档
        </button>
        {message ? <p>{message}</p> : null}
      </Panel>
    </div>
  );
}
