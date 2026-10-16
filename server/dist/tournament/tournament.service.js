import { tournamentRepository } from './tournament.repository';
function generateShortId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}
let broadcastCallback = null;
export function setBroadcastCallback(callback) {
    broadcastCallback = callback;
}
function broadcast(id) {
    if (broadcastCallback) {
        broadcastCallback(id);
    }
}
export class TournamentService {
    createTournament(config) {
        const id = generateShortId();
        return tournamentRepository.create(id, config);
    }
    getTournament(id) {
        const tournament = tournamentRepository.get(id);
        if (!tournament) {
            throw new Error(`Tournament ${id} not found`);
        }
        return tournament;
    }
    getTournamentWithRemainingTime(id, nowMs) {
        const tournament = this.getTournament(id);
        const engine = tournamentRepository.getEngine(id);
        if (!engine) {
            throw new Error(`Tournament engine for ${id} not found`);
        }
        return {
            ...tournament,
            remainingSeconds: engine.getRemainingSeconds(nowMs),
        };
    }
    updateTournamentConfig(id, config) {
        const engine = tournamentRepository.getEngine(id);
        if (!engine) {
            throw new Error(`Tournament ${id} not found`);
        }
        engine.updateConfig(config);
        const tournament = engine.getTournament();
        tournamentRepository.update(id, tournament);
        return tournament;
    }
    start(id) {
        const engine = tournamentRepository.getEngine(id);
        if (!engine) {
            throw new Error(`Tournament ${id} not found`);
        }
        engine.start();
        const tournament = engine.getTournament();
        tournamentRepository.update(id, tournament);
        broadcast(id);
        return tournament;
    }
    pause(id) {
        const engine = tournamentRepository.getEngine(id);
        if (!engine) {
            throw new Error(`Tournament ${id} not found`);
        }
        engine.pause();
        const tournament = engine.getTournament();
        tournamentRepository.update(id, tournament);
        broadcast(id);
        return tournament;
    }
    resume(id) {
        const engine = tournamentRepository.getEngine(id);
        if (!engine) {
            throw new Error(`Tournament ${id} not found`);
        }
        engine.resume();
        const tournament = engine.getTournament();
        tournamentRepository.update(id, tournament);
        broadcast(id);
        return tournament;
    }
    reset(id) {
        const engine = tournamentRepository.getEngine(id);
        if (!engine) {
            throw new Error(`Tournament ${id} not found`);
        }
        engine.reset();
        const tournament = engine.getTournament();
        tournamentRepository.update(id, tournament);
        broadcast(id);
        return tournament;
    }
    nextLevel(id) {
        const engine = tournamentRepository.getEngine(id);
        if (!engine) {
            throw new Error(`Tournament ${id} not found`);
        }
        engine.nextLevel();
        const tournament = engine.getTournament();
        tournamentRepository.update(id, tournament);
        broadcast(id);
        return tournament;
    }
    previousLevel(id) {
        const engine = tournamentRepository.getEngine(id);
        if (!engine) {
            throw new Error(`Tournament ${id} not found`);
        }
        engine.previousLevel();
        const tournament = engine.getTournament();
        tournamentRepository.update(id, tournament);
        broadcast(id);
        return tournament;
    }
    deleteTournament(id) {
        tournamentRepository.delete(id);
    }
    listTournaments() {
        return tournamentRepository.list();
    }
    tick(id, nowMs) {
        const engine = tournamentRepository.getEngine(id);
        if (!engine) {
            return;
        }
        engine.tick(nowMs);
        const tournament = engine.getTournament();
        tournamentRepository.update(id, tournament);
    }
    addLevel(id, level, index) {
        const engine = tournamentRepository.getEngine(id);
        if (!engine) {
            throw new Error(`Tournament ${id} not found`);
        }
        engine.addLevel(level, index);
        const tournament = engine.getTournament();
        tournamentRepository.update(id, tournament);
        broadcast(id);
        return tournament;
    }
    removeLevel(id, index) {
        const engine = tournamentRepository.getEngine(id);
        if (!engine) {
            throw new Error(`Tournament ${id} not found`);
        }
        engine.removeLevel(index);
        const tournament = engine.getTournament();
        tournamentRepository.update(id, tournament);
        broadcast(id);
        return tournament;
    }
    updateLevel(id, index, updates) {
        const engine = tournamentRepository.getEngine(id);
        if (!engine) {
            throw new Error(`Tournament ${id} not found`);
        }
        engine.updateLevel(index, updates);
        const tournament = engine.getTournament();
        tournamentRepository.update(id, tournament);
        broadcast(id);
        return tournament;
    }
    reorderLevels(id, newOrder) {
        const engine = tournamentRepository.getEngine(id);
        if (!engine) {
            throw new Error(`Tournament ${id} not found`);
        }
        engine.reorderLevels(newOrder);
        const tournament = engine.getTournament();
        tournamentRepository.update(id, tournament);
        broadcast(id);
        return tournament;
    }
    enableBountyMode(id, config) {
        const engine = tournamentRepository.getEngine(id);
        if (!engine) {
            throw new Error(`Tournament ${id} not found`);
        }
        engine.initializeBountyMode(config);
        const tournament = engine.getTournament();
        tournamentRepository.update(id, tournament);
        broadcast(id);
        return tournament;
    }
    disableBountyMode(id) {
        const engine = tournamentRepository.getEngine(id);
        if (!engine) {
            throw new Error(`Tournament ${id} not found`);
        }
        engine.disableBountyMode();
        const tournament = engine.getTournament();
        tournamentRepository.update(id, tournament);
        broadcast(id);
        return tournament;
    }
    addBountyBox(id) {
        const engine = tournamentRepository.getEngine(id);
        if (!engine) {
            throw new Error(`Tournament ${id} not found`);
        }
        try {
            engine.addBountyBox();
            const tournament = engine.getTournament();
            tournamentRepository.update(id, tournament);
            broadcast(id);
            return tournament;
        }
        catch (error) {
            console.error('addBountyBox error:', error);
            throw error;
        }
    }
    recordBountyPayment(id, eliminatedBoxId, eliminatorBoxId) {
        const engine = tournamentRepository.getEngine(id);
        if (!engine) {
            throw new Error(`Tournament ${id} not found`);
        }
        engine.recordElimination(eliminatedBoxId, eliminatorBoxId);
        const tournament = engine.getTournament();
        tournamentRepository.update(id, tournament);
        broadcast(id);
        const lastPayment = tournament.bountyPayments?.[tournament.bountyPayments.length - 1];
        return lastPayment;
    }
    undoBountyPayment(id) {
        const engine = tournamentRepository.getEngine(id);
        if (!engine) {
            throw new Error(`Tournament ${id} not found`);
        }
        const payment = engine.undoLastElimination();
        const tournament = engine.getTournament();
        tournamentRepository.update(id, tournament);
        broadcast(id);
        return payment;
    }
    getBountyLeaderboard(id) {
        const engine = tournamentRepository.getEngine(id);
        if (!engine) {
            throw new Error(`Tournament ${id} not found`);
        }
        return engine.getBountyLeaderboard();
    }
    renameBox(id, boxId, newName) {
        const engine = tournamentRepository.getEngine(id);
        if (!engine) {
            throw new Error(`Tournament ${id} not found`);
        }
        engine.renameBox(boxId, newName);
        const tournament = engine.getTournament();
        tournamentRepository.update(id, tournament);
        broadcast(id);
        return tournament;
    }
}
export const tournamentService = new TournamentService();
