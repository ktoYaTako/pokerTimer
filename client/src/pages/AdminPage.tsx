import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTournament, useTournamentActions } from '../hooks/useTournament';
import * as api from '../api/tournament';
import '../styles/AdminPage.css';

export function AdminPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tournament, loading, error, refetch } = useTournament(id || '');
  const actions = useTournamentActions(id || '');
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

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

  const currentLevel = tournament.levels[tournament.state.currentLevelIndex];
  const displayUrl = `${window.location.origin}/display/${id}`;

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

      {actions.error && <div className="error-message">{actions.error}</div>}
    </div>
  );
}
