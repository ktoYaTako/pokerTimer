import { useState } from 'react';
import '../styles/BountyConfigModal.css';

interface BountyConfigModalProps {
  onSave: (buyInAmount: number, numberOfBoxes: number) => void;
  onClose: () => void;
  bountyConfig?: { buyInAmount: number; numberOfBoxes: number };
}

export function BountyConfigModal({ onSave, onClose, bountyConfig }: BountyConfigModalProps) {
  const [buyInAmount, setBuyInAmount] = useState(bountyConfig?.buyInAmount || 1000);
  const [numberOfBoxes, setNumberOfBoxes] = useState(bountyConfig?.numberOfBoxes || 5);

  const startingBountyPerBox = (buyInAmount * 0.5) / numberOfBoxes;
  const prizePool = buyInAmount * 0.5;

  const handleSave = () => {
    if (buyInAmount <= 0) {
      alert('Buy-in amount must be greater than 0');
      return;
    }
    if (numberOfBoxes < 1 || numberOfBoxes > 10) {
      alert('Number of boxes must be between 1 and 10');
      return;
    }
    onSave(buyInAmount, numberOfBoxes);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Bounty Hunt Configuration</h2>

        <div className="form-group">
          <label>Buy-in Amount</label>
          <input
            type="number"
            min="1"
            value={buyInAmount}
            onChange={(e) => setBuyInAmount(Number(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label>Number of Boxes (1-10)</label>
          <input
            type="range"
            min="1"
            max="10"
            value={numberOfBoxes}
            onChange={(e) => setNumberOfBoxes(Number(e.target.value))}
          />
          <div className="slider-value">{numberOfBoxes} boxes</div>
        </div>

        <div className="info-section">
          <div className="info-row">
            <span>Prize Pool (50%):</span>
            <span className="value">{prizePool.toFixed(2)}</span>
          </div>
          <div className="info-row">
            <span>Bounty Pool (50%):</span>
            <span className="value">{(buyInAmount * 0.5).toFixed(2)}</span>
          </div>
          <div className="info-row highlight">
            <span>Starting Bounty per Box:</span>
            <span className="value">{startingBountyPerBox.toFixed(2)}</span>
          </div>
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
