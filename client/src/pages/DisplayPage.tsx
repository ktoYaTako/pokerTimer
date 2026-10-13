import { useParams } from 'react-router-dom';
import { useRealtimeTournament } from '../hooks/useTournament';
import { Timer } from '../components/Timer';
import { LevelDisplay } from '../components/LevelDisplay';
import '../styles/DisplayPage.css';

export function DisplayPage() {
  const { id } = useParams<{ id: string }>();
  const { tournament, connected, error } = useRealtimeTournament(id || '');

  if (error && !tournament) {
    return <div className="display-error">{error}</div>;
  }

  if (!tournament) {
    return <div className="display-loading">Loading...</div>;
  }

  const currentLevel = tournament.levels[tournament.state.currentLevelIndex];
  const nextLevel = tournament.levels[tournament.state.currentLevelIndex + 1];
  const isRunning = tournament.state.status === 'running';

  return (
    <div className="display-page">
      <div className="display-container">
        <div className="display-timer-section">
          <Timer remainingSeconds={tournament.remainingSeconds || 0} isRunning={isRunning} />
        </div>

        <div className="display-level-section">
          <LevelDisplay
            level={currentLevel}
            levelIndex={tournament.state.currentLevelIndex}
            nextLevel={nextLevel}
          />
        </div>
      </div>

      <div className={`connection-indicator ${connected ? 'connected' : 'disconnected'}`} />
    </div>
  );
}
