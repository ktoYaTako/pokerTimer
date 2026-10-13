import { Tournament, TournamentState, TournamentConfig, LevelConfig } from './tournament.types';

export class TournamentEngine {
  private tournament: Tournament;

  constructor(id: string, config: TournamentConfig) {
    this.tournament = {
      id,
      name: config.name,
      levels: config.levels,
      state: {
        status: 'idle',
        currentLevelIndex: 0,
        levelStartedAt: null,
        pausedAt: null,
        pausedRemainingSeconds: null,
      },
      createdAt: Date.now(),
    };
    this.validate();
  }

  private validate(): void {
    if (!this.tournament.levels || this.tournament.levels.length === 0) {
      throw new Error('Tournament must have at least one level');
    }

    for (const level of this.tournament.levels) {
      if (level.durationSeconds <= 0) {
        throw new Error('Level duration must be positive');
      }
      if (level.type === 'level') {
        if (level.smallBlind < 0 || level.bigBlind < 0 || level.ante < 0) {
          throw new Error('Blinds and ante cannot be negative');
        }
      }
    }
  }

  private validateLevelIndex(index: number): void {
    if (index < 0 || index >= this.tournament.levels.length) {
      throw new Error('Invalid level index');
    }
  }

  private getElapsedSeconds(nowMs: number): number {
    const state = this.tournament.state;
    if (state.status === 'idle' || state.status === 'finished') return 0;
    if (state.levelStartedAt === null) return 0;

    return Math.floor((nowMs - state.levelStartedAt) / 1000);
  }

  private getCurrentLevelDuration(): number {
    const level = this.tournament.levels[this.tournament.state.currentLevelIndex];
    return level.durationSeconds;
  }

  getRemainingSeconds(nowMs: number): number {
    const state = this.tournament.state;

    if (state.status === 'idle') {
      return this.getCurrentLevelDuration();
    }

    if (state.status === 'finished') {
      return 0;
    }

    if (state.status === 'paused') {
      return state.pausedRemainingSeconds ?? 0;
    }

    // running
    const elapsed = this.getElapsedSeconds(nowMs);
    const duration = this.getCurrentLevelDuration();
    const remaining = duration - elapsed;
    return Math.max(0, remaining);
  }

  start(): void {
    if (this.tournament.state.status !== 'idle') {
      throw new Error('Tournament must be in idle state to start');
    }

    this.tournament.state.status = 'running';
    this.tournament.state.levelStartedAt = Date.now();
    this.tournament.state.pausedAt = null;
    this.tournament.state.pausedRemainingSeconds = null;
  }

  pause(nowMs: number = Date.now()): void {
    if (this.tournament.state.status !== 'running') {
      throw new Error('Tournament must be running to pause');
    }

    const remaining = this.getRemainingSeconds(nowMs);

    this.tournament.state.status = 'paused';
    this.tournament.state.pausedAt = nowMs;
    this.tournament.state.pausedRemainingSeconds = remaining;
  }

  resume(nowMs: number = Date.now()): void {
    if (this.tournament.state.status !== 'paused') {
      throw new Error('Tournament must be paused to resume');
    }

    const remaining = this.tournament.state.pausedRemainingSeconds ?? 0;

    this.tournament.state.status = 'running';
    this.tournament.state.levelStartedAt = nowMs - (this.getCurrentLevelDuration() - remaining) * 1000;
    this.tournament.state.pausedAt = null;
    this.tournament.state.pausedRemainingSeconds = null;
  }

  reset(): void {
    this.tournament.state = {
      status: 'idle',
      currentLevelIndex: 0,
      levelStartedAt: null,
      pausedAt: null,
      pausedRemainingSeconds: null,
    };
  }

  nextLevel(nowMs: number = Date.now()): void {
    const nextIndex = this.tournament.state.currentLevelIndex + 1;

    if (nextIndex >= this.tournament.levels.length) {
      this.tournament.state.status = 'finished';
      return;
    }

    this.tournament.state.currentLevelIndex = nextIndex;
    this.tournament.state.levelStartedAt = nowMs;
    this.tournament.state.pausedAt = null;
    this.tournament.state.pausedRemainingSeconds = null;

    if (this.tournament.state.status === 'idle') {
      this.tournament.state.status = 'running';
    }
  }

  previousLevel(): void {
    const prevIndex = this.tournament.state.currentLevelIndex - 1;

    if (prevIndex < 0) {
      return;
    }

    this.tournament.state.currentLevelIndex = prevIndex;
    this.tournament.state.levelStartedAt = Date.now();
    this.tournament.state.pausedAt = null;
    this.tournament.state.pausedRemainingSeconds = null;

    if (this.tournament.state.status === 'idle') {
      this.tournament.state.status = 'running';
    }
  }

  updateConfig(config: Partial<TournamentConfig>): void {
    if (config.name) {
      this.tournament.name = config.name;
    }
    if (config.levels) {
      this.tournament.levels = config.levels;
      this.validate();

      if (this.tournament.state.currentLevelIndex >= this.tournament.levels.length) {
        this.tournament.state.currentLevelIndex = this.tournament.levels.length - 1;
      }
    }
  }

  addLevel(level: LevelConfig, index?: number): void {
    if (this.tournament.state.status !== 'idle') {
      throw new Error('Cannot add levels while tournament is running');
    }

    if (index === undefined) {
      this.tournament.levels.push(level);
    } else {
      if (index < 0 || index > this.tournament.levels.length) {
        throw new Error('Invalid level index for insertion');
      }
      this.tournament.levels.splice(index, 0, level);
    }

    this.validate();
  }

  removeLevel(index: number): void {
    if (this.tournament.state.status !== 'idle') {
      throw new Error('Cannot remove levels while tournament is running');
    }

    this.validateLevelIndex(index);

    if (this.tournament.levels.length === 1) {
      throw new Error('Tournament must have at least one level');
    }

    this.tournament.levels.splice(index, 1);

    if (this.tournament.state.currentLevelIndex >= this.tournament.levels.length) {
      this.tournament.state.currentLevelIndex = this.tournament.levels.length - 1;
    }

    this.validate();
  }

  updateLevel(index: number, updates: Partial<LevelConfig>): void {
    if (this.tournament.state.status !== 'idle') {
      throw new Error('Cannot update levels while tournament is running');
    }

    this.validateLevelIndex(index);

    const level = this.tournament.levels[index];
    const updated = { ...level, ...updates };

    this.tournament.levels[index] = updated;
    this.validate();
  }

  reorderLevels(newOrder: LevelConfig[]): void {
    if (this.tournament.state.status !== 'idle') {
      throw new Error('Cannot reorder levels while tournament is running');
    }

    if (newOrder.length !== this.tournament.levels.length) {
      throw new Error('Invalid level count for reordering');
    }

    this.tournament.levels = newOrder;
    this.validate();
  }

  tick(nowMs: number): void {
    if (this.tournament.state.status !== 'running') {
      return;
    }

    const remaining = this.getRemainingSeconds(nowMs);
    if (remaining <= 0) {
      this.nextLevel();
    }
  }

  getState(): TournamentState {
    return { ...this.tournament.state };
  }

  getTournament(): Tournament {
    return JSON.parse(JSON.stringify(this.tournament));
  }

  getCurrentLevel(): LevelConfig {
    return this.tournament.levels[this.tournament.state.currentLevelIndex];
  }

  setStateFromExternal(state: TournamentState): void {
    this.tournament.state = { ...state };
  }
}
