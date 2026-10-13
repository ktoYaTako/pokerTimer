import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import '../styles/LevelEditorModal.css';

interface LevelEditorModalProps {
  level?: any;
  onSave: (level: any) => void;
  onClose: () => void;
}

export function LevelEditorModal({ level, onSave, onClose }: LevelEditorModalProps) {
  const isNew = !level;
  const [type, setType] = useState<'level' | 'break'>(level?.type || 'level');
  const [smallBlind, setSmallBlind] = useState(level?.smallBlind || 25);
  const [bigBlind, setBigBlind] = useState(level?.bigBlind || 50);
  const [ante, setAnte] = useState(level?.ante || 0);
  const [duration, setDuration] = useState(Math.floor((level?.durationSeconds || 900) / 60));

  const handleSave = () => {
    if (duration <= 0) {
      alert('Duration must be greater than 0');
      return;
    }

    if (type === 'level') {
      if (smallBlind <= 0 || bigBlind <= 0) {
        alert('Blinds must be greater than 0');
        return;
      }
      if (bigBlind < smallBlind) {
        alert('Big blind must be greater than or equal to small blind');
        return;
      }
      if (ante < 0) {
        alert('Ante cannot be negative');
        return;
      }
    }

    const newLevel = {
      id: level?.id || uuidv4(),
      type,
      durationSeconds: duration * 60,
      ...(type === 'level' && { smallBlind, bigBlind, ante }),
    };

    onSave(newLevel);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{isNew ? 'Add Level' : 'Edit Level'}</h2>

        <div className="form-group">
          <label>Type</label>
          <div className="type-toggle">
            <button
              className={`toggle-btn ${type === 'level' ? 'active' : ''}`}
              onClick={() => setType('level')}
            >
              Poker Level
            </button>
            <button
              className={`toggle-btn ${type === 'break' ? 'active' : ''}`}
              onClick={() => setType('break')}
            >
              Break
            </button>
          </div>
        </div>

        {type === 'level' && (
          <>
            <div className="form-group">
              <label>Small Blind</label>
              <input
                type="number"
                min="1"
                value={smallBlind}
                onChange={(e) => setSmallBlind(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Big Blind</label>
              <input
                type="number"
                min="1"
                value={bigBlind}
                onChange={(e) => setBigBlind(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Ante</label>
              <input
                type="number"
                min="0"
                value={ante}
                onChange={(e) => setAnte(Number(e.target.value))}
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label>Duration (minutes)</label>
          <input
            type="number"
            min="1"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-save" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
