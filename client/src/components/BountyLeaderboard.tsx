import { useState } from 'react';
import { PlayerBox } from '../types/tournament';
import '../styles/BountyLeaderboard.css';

interface BountyLeaderboardProps {
  boxes: PlayerBox[];
  onRenameBox: (boxId: string, newName: string) => void;
  onRecordElimination: () => void;
}

export function BountyLeaderboard({ boxes, onRenameBox, onRecordElimination }: BountyLeaderboardProps) {
  const [editingBoxId, setEditingBoxId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleStartEdit = (boxId: string, currentName: string) => {
    setEditingBoxId(boxId);
    setEditingName(currentName);
  };

  const handleSaveName = (boxId: string) => {
    if (editingName.trim()) {
      onRenameBox(boxId, editingName);
    }
    setEditingBoxId(null);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return '🏆';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return `${index + 1}`;
    }
  };

  const sortedBoxes = [...boxes].sort((a, b) => b.currentBounty - a.currentBounty);

  return (
    <div className="bounty-leaderboard">
      <div className="leaderboard-header">
        <h3>Bounty Leaderboard</h3>
        <button className="btn-record" onClick={onRecordElimination}>
          Record Elimination
        </button>
      </div>

      <div className="leaderboard-table">
        <div className="table-header">
          <div className="col-rank">Rank</div>
          <div className="col-name">Box Name</div>
          <div className="col-bounty">Bounty</div>
          <div className="col-cash">Cash</div>
          <div className="col-elims">Elims</div>
          <div className="col-percent">% of Start</div>
          <div className="col-status">Status</div>
        </div>

        {sortedBoxes.map((box, index) => (
          <div key={box.id} className={`table-row ${box.status === 'eliminated' ? 'eliminated' : ''}`}>
            <div className="col-rank">{getRankIcon(index)}</div>

            <div className="col-name">
              {editingBoxId === box.id ? (
                <input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => handleSaveName(box.id)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveName(box.id)}
                />
              ) : (
                <span onClick={() => handleStartEdit(box.id, box.name)} className="editable">
                  {box.name}
                </span>
              )}
            </div>

            <div className="col-bounty">{box.currentBounty.toFixed(0)}</div>
            <div className="col-cash">{box.cashEarned.toFixed(0)}</div>
            <div className="col-elims">{box.eliminations}</div>
            <div className="col-percent">{((box.currentBounty / box.startingBounty) * 100).toFixed(0)}%</div>
            <div className="col-status">{box.status === 'eliminated' ? '❌' : '✓'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
