import { TournamentEngine } from './TournamentEngine';
export class TournamentRepository {
    constructor() {
        this.tournaments = new Map();
    }
    create(id, config) {
        if (this.tournaments.has(id)) {
            throw new Error(`Tournament ${id} already exists`);
        }
        const engine = new TournamentEngine(id, config);
        const tournament = engine.getTournament();
        this.tournaments.set(id, { engine, tournament });
        return tournament;
    }
    get(id) {
        const entry = this.tournaments.get(id);
        return entry?.tournament ?? null;
    }
    getEngine(id) {
        const entry = this.tournaments.get(id);
        return entry?.engine ?? null;
    }
    update(id, tournament) {
        const entry = this.tournaments.get(id);
        if (!entry) {
            throw new Error(`Tournament ${id} not found`);
        }
        this.tournaments.set(id, { ...entry, tournament });
    }
    delete(id) {
        this.tournaments.delete(id);
    }
    list() {
        return Array.from(this.tournaments.values()).map(entry => entry.tournament);
    }
    exists(id) {
        return this.tournaments.has(id);
    }
}
export const tournamentRepository = new TournamentRepository();
