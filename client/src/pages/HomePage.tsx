import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api/tournament';
import { getDefaultTournamentLevels } from '../utils';
import '../styles/HomePage.css';

export function HomePage() {
  const navigate = useNavigate();
  const [tournamentName, setTournamentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!tournamentName.trim()) {
      setError('Tournament name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const tournament = await api.createTournament({
        name: tournamentName,
        levels: getDefaultTournamentLevels(),
      });
      navigate(`/admin/${tournament.id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <h1>Poker Tournament Timer</h1>

        <div className="create-tournament">
          <input
            type="text"
            placeholder="Tournament name"
            value={tournamentName}
            onChange={(e) => setTournamentName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
          />
          <button onClick={handleCreate} disabled={loading}>
            {loading ? 'Creating...' : 'Create Tournament'}
          </button>
        </div>

        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}
