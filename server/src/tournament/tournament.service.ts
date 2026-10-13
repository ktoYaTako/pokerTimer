import { v4 as uuidv4 } from 'uuid';
import { tournamentRepository } from './tournament.repository';
import { TournamentConfig, Tournament } from './tournament.types';

let broadcastCallback: ((id: string) => void) | null = null;

export function setBroadcastCallback(callback: (id: string) => void) {
  broadcastCallback = callback;
}

function broadcast(id: string) {
  if (broadcastCallback) {
    broadcastCallback(id);
  }
}

export class TournamentService {
  createTournament(config: TournamentConfig): Tournament {
    const id = uuidv4();
    return tournamentRepository.create(id, config);
  }

  getTournament(id: string): Tournament {
    const tournament = tournamentRepository.get(id);
    if (!tournament) {
      throw new Error(`Tournament ${id} not found`);
    }
    return tournament;
  }

  getTournamentWithRemainingTime(id: string, nowMs: number): Tournament & { remainingSeconds: number } {
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

  updateTournamentConfig(id: string, config: Partial<TournamentConfig>): Tournament {
    const engine = tournamentRepository.getEngine(id);
    if (!engine) {
      throw new Error(`Tournament ${id} not found`);
    }

    engine.updateConfig(config);
    const tournament = engine.getTournament();
    tournamentRepository.update(id, tournament);

    return tournament;
  }

  start(id: string): Tournament {
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

  pause(id: string): Tournament {
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

  resume(id: string): Tournament {
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

  reset(id: string): Tournament {
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

  nextLevel(id: string): Tournament {
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

  previousLevel(id: string): Tournament {
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

  deleteTournament(id: string): void {
    tournamentRepository.delete(id);
  }

  listTournaments(): Tournament[] {
    return tournamentRepository.list();
  }

  tick(id: string, nowMs: number): void {
    const engine = tournamentRepository.getEngine(id);
    if (!engine) {
      return;
    }

    engine.tick(nowMs);
    const tournament = engine.getTournament();
    tournamentRepository.update(id, tournament);
  }

  addLevel(id: string, level: any, index?: number): Tournament {
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

  removeLevel(id: string, index: number): Tournament {
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

  updateLevel(id: string, index: number, updates: Partial<any>): Tournament {
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

  reorderLevels(id: string, newOrder: any[]): Tournament {
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

  enableBountyMode(id: string, config: any): Tournament {
    const engine = tournamentRepository.getEngine(id);
    if (!engine) {
      throw new Error(`Tournament ${id} not found`);
    }

    engine.initializeBountyMode(config);
    const tournament = engine.getTournament();
    console.log('enableBountyMode - tournament after init:', {
      bountyConfig: tournament.bountyConfig,
      playerBoxesCount: tournament.playerBoxes?.length,
      playerBoxes: tournament.playerBoxes
    });
    tournamentRepository.update(id, tournament);
    broadcast(id);

    return tournament;
  }

  disableBountyMode(id: string): Tournament {
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

  recordBountyPayment(id: string, eliminatedBoxId: string, eliminatorBoxId: string): any {
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

  undoBountyPayment(id: string): any {
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

  getBountyLeaderboard(id: string): any {
    const engine = tournamentRepository.getEngine(id);
    if (!engine) {
      throw new Error(`Tournament ${id} not found`);
    }

    return engine.getBountyLeaderboard();
  }

  renameBox(id: string, boxId: string, newName: string): Tournament {
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
