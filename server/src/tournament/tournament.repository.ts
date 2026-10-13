import { Tournament, TournamentConfig } from './tournament.types';
import { TournamentEngine } from './TournamentEngine';

export class TournamentRepository {
  private tournaments = new Map<string, { engine: TournamentEngine; tournament: Tournament }>();

  create(id: string, config: TournamentConfig): Tournament {
    if (this.tournaments.has(id)) {
      throw new Error(`Tournament ${id} already exists`);
    }

    const engine = new TournamentEngine(id, config);
    const tournament = engine.getTournament();

    this.tournaments.set(id, { engine, tournament });
    return tournament;
  }

  get(id: string): Tournament | null {
    const entry = this.tournaments.get(id);
    return entry?.tournament ?? null;
  }

  getEngine(id: string): TournamentEngine | null {
    const entry = this.tournaments.get(id);
    return entry?.engine ?? null;
  }

  update(id: string, tournament: Tournament): void {
    const entry = this.tournaments.get(id);
    if (!entry) {
      throw new Error(`Tournament ${id} not found`);
    }
    this.tournaments.set(id, { ...entry, tournament });
  }

  delete(id: string): void {
    this.tournaments.delete(id);
  }

  list(): Tournament[] {
    return Array.from(this.tournaments.values()).map(entry => entry.tournament);
  }

  exists(id: string): boolean {
    return this.tournaments.has(id);
  }
}

export const tournamentRepository = new TournamentRepository();
