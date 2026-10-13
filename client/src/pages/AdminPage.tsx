import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTournament, useTournamentActions } from '../hooks/useTournament';
import * as api from '../api/tournament';
import { BountyConfigModal } from '../components/BountyConfigModal';
import { BountyLeaderboard } from '../components/BountyLeaderboard';
import { BountyPaymentDialog } from '../components/BountyPaymentDialog';
import '../styles/AdminPage.css';

export function AdminPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tournament, loading, error, refetch } = useTournament(id || '');
  const actions = useTournamentActions(id || '');
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [showBountyConfig, setShowBountyConfig] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  if (loading) return <div>Loading...</div>;
  if (error || !tournament) return <div>Error: {error}</div>;

  const handleStart = async () => {
    await actions.start();
    refetch();
  };

  const handlePause = async () => {
    await actions.pause();
    refetch();
  };

  const handleResume = async () => {
    await actions.resume();
    refetch();
  };

  const handleReset = async () => {
    if (confirm('Reset tournament? This will go back to level 1.')) {
      await actions.reset();
      refetch();
    }
  };

  const handleNext = async () => {
    await actions.nextLvl();
    refetch();
  };

  const handlePrevious = async () => {
    await actions.prevLvl();
    refetch();
  };

  const handleSaveName = async () => {
    if (newName.trim()) {
      await api.updateTournamentConfig(id || '', { name: newName });
      setEditingName(false);
      refetch();
    }
  };

  const handleEnableBounty = async (buyInAmount: number, numberOfBoxes: number) => {
    try {
      await api.enableBountyMode(id || '', buyInAmount, numberOfBoxes);
      setShowBountyConfig(false);
      refetch();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDisableBounty = async () => {
    if (confirm('Disable bounty mode? This cannot be undone.')) {
      try {
        await api.disableBountyMode(id || '');
        refetch();
      } catch (err) {
        alert((err as Error).message);
      }
    }
  };

  const handleRecordElimination = async (eliminatedBoxId: string, eliminatorBoxId: string) => {
    try {
      await api.recordBountyPayment(id || '', eliminatedBoxId, eliminatorBoxId);
      setShowPaymentDialog(false);
      refetch();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleUndoElimination = async () => {
    try {
      await api.undoBountyPayment(id || '');
      refetch();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleRenameBox = async (boxId: string, newName: string) => {
    try {
      await api.renameBox(id || '', boxId, newName);
      refetch();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const currentLevel = tournament.levels[tournament.state.currentLevelIndex];
  const displayUrl = `${window.location.origin}/display/${id}`;
  const bountyEnabled = tournament.bountyConfig?.enabled;
  const playerBoxes = tournament.playerBoxes || [];
  const bountyPayments = tournament.bountyPayments || [];

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          {editingName ? (
            <div className="edit-name">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Tournament name"
              />
              <button onClick={handleSaveName}>Save</button>
              <button onClick={() => setEditingName(false)}>Cancel</button>
            </div>
          ) : (
            <h1 onClick={() => {
              setNewName(tournament.name);
              setEditingName(true);
            }}>
              {tournament.name}
            </h1>
          )}
        </div>
        <button onClick={() => navigate('/')}>Back</button>
      </header>

      <section className="tournament-info">
        <div className="info-card">
          <label>Tournament ID</label>
          <code>{id}</code>
        </div>
        <div className="info-card">
          <label>Display URL</label>
          <code onClick={() => window.open(displayUrl, '_blank')} style={{ cursor: 'pointer' }}>
            {displayUrl}
          </code>
        </div>
      </section>

      <section className="tournament-controls">
        <div className="status">
          <strong>Status:</strong> {tournament.state.status.toUpperCase()}
        </div>
        {tournament.state.status === 'idle' && (
          <button onClick={() => navigate(`/edit/${id}`)} className="btn-edit-structure">
            EDIT STRUCTURE
          </button>
        )}
        <div className="control-buttons">
          {tournament.state.status === 'idle' && (
            <button onClick={handleStart} className="btn-start">
              START
            </button>
          )}
          {tournament.state.status === 'running' && (
            <button onClick={handlePause} className="btn-pause">
              PAUSE
            </button>
          )}
          {tournament.state.status === 'paused' && (
            <>
              <button onClick={handleResume} className="btn-resume">
                RESUME
              </button>
              <button onClick={handleReset} className="btn-reset">
                RESET
              </button>
            </>
          )}
          {tournament.state.status !== 'finished' && (
            <>
              <button onClick={handlePrevious} className="btn-nav">
                ← PREVIOUS
              </button>
              <button onClick={handleNext} className="btn-nav">
                NEXT →
              </button>
            </>
          )}
        </div>
      </section>

      <section className="current-level">
        <h2>Current Level: {tournament.state.currentLevelIndex + 1}</h2>
        {currentLevel.type === 'level' ? (
          <div className="level-details">
            <p>
              <strong>Blinds:</strong> {currentLevel.smallBlind} / {currentLevel.bigBlind}
            </p>
            <p>
              <strong>Ante:</strong> {currentLevel.ante}
            </p>
            <p>
              <strong>Duration:</strong> {Math.floor(currentLevel.durationSeconds / 60)} min
            </p>
          </div>
        ) : (
          <div className="break-details">
            <p>
              <strong>Break Duration:</strong> {Math.floor(currentLevel.durationSeconds / 60)} min
            </p>
          </div>
        )}
      </section>

      <section className="bounty-section">
        <div className="bounty-header">
          <h2>Bounty Hunt Mode</h2>
          <div className="bounty-controls">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={bountyEnabled || false}
                onChange={(e) => {
                  if (e.target.checked) {
                    setShowBountyConfig(true);
                  } else {
                    handleDisableBounty();
                  }
                }}
                disabled={tournament.state.status !== 'idle'}
              />
              Enabled
            </label>
            {bountyEnabled && (
              <button className="btn-edit-bounty" onClick={() => setShowBountyConfig(true)}>
                ⚙️ Configure
              </button>
            )}
          </div>
        </div>

        {bountyEnabled && playerBoxes.length > 0 && (
          <>
            <BountyLeaderboard
              boxes={playerBoxes}
              onRenameBox={handleRenameBox}
              onRecordElimination={() => setShowPaymentDialog(true)}
            />

            {bountyPayments.length > 0 && (
              <div className="bounty-actions">
                <button className="btn-undo-bounty" onClick={handleUndoElimination}>
                  ↶ Undo Last Elimination
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <section className="levels-list">
        <h2>Tournament Structure</h2>
        <div className="levels">
          {tournament.levels.map((level, index) => (
            <div
              key={level.id}
              className={`level-item ${index === tournament.state.currentLevelIndex ? 'current' : ''}`}
            >
              <span className="level-index">{index + 1}</span>
              {level.type === 'level' ? (
                <span className="level-info">
                  {level.smallBlind} / {level.bigBlind} (A: {level.ante}) - {level.durationSeconds / 60}m
                </span>
              ) : (
                <span className="level-info break">BREAK - {level.durationSeconds / 60}m</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {showBountyConfig && (
        <BountyConfigModal
          bountyConfig={
            bountyEnabled
              ? {
                  buyInAmount: tournament.bountyConfig?.buyInAmount || 1000,
                  numberOfBoxes: tournament.bountyConfig?.numberOfBoxes || 5,
                }
              : undefined
          }
          onSave={handleEnableBounty}
          onClose={() => setShowBountyConfig(false)}
        />
      )}

      {showPaymentDialog && playerBoxes.length > 0 && (
        <BountyPaymentDialog
          boxes={playerBoxes}
          onConfirm={handleRecordElimination}
          onUndo={handleUndoElimination}
          onClose={() => setShowPaymentDialog(false)}
          hasPayments={bountyPayments.length > 0}
        />
      )}

      {actions.error && <div className="error-message">{actions.error}</div>}
    </div>
  );
}
