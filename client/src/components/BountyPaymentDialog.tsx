import { useState } from 'react';
import { PlayerBox } from '../types/tournament';
import '../styles/BountyPaymentDialog.css';

interface BountyPaymentDialogProps {
  boxes: PlayerBox[];
  onConfirm: (eliminatedBoxId: string, eliminatorBoxId: string) => void;
  onUndo: () => void;
  onClose: () => void;
  hasPayments: boolean;
}

export function BountyPaymentDialog({
  boxes,
  onConfirm,
  onUndo,
  onClose,
  hasPayments,
}: BountyPaymentDialogProps) {
  const [eliminatedBoxId, setEliminatedBoxId] = useState('');
  const [eliminatorBoxId, setEliminatorBoxId] = useState('');

  const activeBoxes = boxes.filter(b => b.status === 'active');
  const eliminatedBox = boxes.find(b => b.id === eliminatedBoxId);
  const eliminatorBox = boxes.find(b => b.id === eliminatorBoxId);

  const bountyTransfer = eliminatedBox ? eliminatedBox.currentBounty * 0.5 : 0;
  const cashReward = eliminatedBox ? eliminatedBox.currentBounty * 0.5 : 0;

  const handleConfirm = () => {
    if (!eliminatedBoxId || !eliminatorBoxId) {
      alert('Please select both boxes');
      return;
    }
    if (eliminatedBoxId === eliminatorBoxId) {
      alert('A box cannot eliminate itself');
      return;
    }
    onConfirm(eliminatedBoxId, eliminatorBoxId);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Record Bounty Payment</h2>

        <div className="form-group">
          <label>Box Eliminated</label>
          <select
            value={eliminatedBoxId}
            onChange={(e) => setEliminatedBoxId(e.target.value)}
          >
            <option value="">-- Select box --</option>
            {activeBoxes.map(box => (
              <option key={box.id} value={box.id}>
                {box.name} (Bounty: {box.currentBounty.toFixed(0)})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Eliminated By</label>
          <select
            value={eliminatorBoxId}
            onChange={(e) => setEliminatorBoxId(e.target.value)}
          >
            <option value="">-- Select box --</option>
            {boxes
              .filter(b => b.status === 'active' && b.id !== eliminatedBoxId)
              .map(box => (
                <option key={box.id} value={box.id}>
                  {box.name}
                </option>
              ))}
          </select>
        </div>

        {eliminatedBox && (
          <div className="info-section">
            <h4>Payout Calculation</h4>
            <div className="info-row">
              <span>{eliminatorBox?.name} receives:</span>
            </div>
            <div className="info-row indent">
              <span>+ {bountyTransfer.toFixed(0)} bounty</span>
            </div>
            <div className="info-row indent">
              <span>+ {cashReward.toFixed(0)} cash</span>
            </div>
            <div className="info-row">
              <span>{eliminatedBox.name} status:</span>
              <span className="highlight">Eliminated</span>
            </div>
          </div>
        )}

        <div className="modal-actions">
          {hasPayments && (
            <button className="btn-undo" onClick={onUndo}>
              ↶ Undo Last
            </button>
          )}
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-confirm" onClick={handleConfirm} disabled={!eliminatedBoxId || !eliminatorBoxId}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
