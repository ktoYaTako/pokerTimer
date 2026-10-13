import { Tournament, TournamentState, TournamentConfig, LevelConfig, BountyConfig, PlayerBox, BountyPayment } from './tournament.types';
import { v4 as uuidv4 } from 'uuid';

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

  initializeBountyMode(config: BountyConfig): void {
    if (this.tournament.state.status !== 'idle') {
      throw new Error('Cannot initialize bounty mode while tournament is running');
    }

    const startingBountyPerBox = config.buyInAmount * 0.5;
    const boxes: PlayerBox[] = [];

    for (let i = 1; i <= config.numberOfBoxes; i++) {
      boxes.push({
        id: uuidv4(),
        name: `Box ${i}`,
        currentBounty: startingBountyPerBox,
        cashEarned: 0,
        eliminations: 0,
        startingBounty: startingBountyPerBox,
        status: 'active',
      });
    }

    this.tournament.bountyConfig = { ...config, startedAt: Date.now() };
    this.tournament.playerBoxes = boxes;
    this.tournament.bountyPayments = [];
  }

  disableBountyMode(): void {
    this.tournament.bountyConfig = undefined;
    this.tournament.playerBoxes = undefined;
    this.tournament.bountyPayments = undefined;
  }

  addBountyBox(): PlayerBox {
    if (!this.tournament.bountyConfig || !this.tournament.playerBoxes) {
      throw new Error('Bounty mode not enabled');
    }

    const startingBountyPerBox = this.tournament.bountyConfig.buyInAmount * 0.5;
    const newBox: PlayerBox = {
      id: uuidv4(),
      name: `Box ${this.tournament.playerBoxes.length + 1}`,
      currentBounty: startingBountyPerBox,
      cashEarned: 0,
      eliminations: 0,
      startingBounty: startingBountyPerBox,
      status: 'active',
    };

    this.tournament.playerBoxes.push(newBox);
    return newBox;
  }

  recordElimination(eliminatedBoxId: string, eliminatorBoxId: string): { bountyTransferred: number; cashReward: number } {
    if (!this.tournament.playerBoxes) {
      throw new Error('Bounty mode not enabled');
    }

    const eliminatedBox = this.tournament.playerBoxes.find(b => b.id === eliminatedBoxId);
    const eliminatorBox = this.tournament.playerBoxes.find(b => b.id === eliminatorBoxId);

    if (!eliminatedBox || !eliminatorBox) {
      throw new Error('Invalid box ID');
    }

    if (eliminatedBox.status === 'eliminated') {
      throw new Error('Cannot eliminate already eliminated box');
    }

    if (eliminatedBox.id === eliminatorBox.id) {
      throw new Error('A box cannot eliminate itself');
    }

    const bountyTransferred = eliminatedBox.currentBounty * 0.5;
    const cashReward = eliminatedBox.currentBounty * 0.5;

    eliminatorBox.currentBounty += bountyTransferred;
    eliminatorBox.cashEarned += cashReward;
    eliminatorBox.eliminations += 1;

    eliminatedBox.status = 'eliminated';

    const payment: BountyPayment = {
      id: uuidv4(),
      eliminatedBoxId,
      eliminatedBoxName: eliminatedBox.name,
      eliminatorBoxId,
      eliminatorBoxName: eliminatorBox.name,
      bountyTransferred,
      cashReward,
      timestamp: Date.now(),
      levelIndex: this.tournament.state.currentLevelIndex,
    };

    this.tournament.bountyPayments!.push(payment);

    return { bountyTransferred, cashReward };
  }

  getBountyLeaderboard(): Array<{
    id: string;
    name: string;
    currentBounty: number;
    cashEarned: number;
    eliminations: number;
    startingBounty: number;
    status: string;
    percentageOfStarting: number;
  }> {
    if (!this.tournament.playerBoxes) {
      return [];
    }

    return this.tournament.playerBoxes
      .map(box => ({
        id: box.id,
        name: box.name,
        currentBounty: box.currentBounty,
        cashEarned: box.cashEarned,
        eliminations: box.eliminations,
        startingBounty: box.startingBounty,
        status: box.status,
        percentageOfStarting: (box.currentBounty / box.startingBounty) * 100,
      }))
      .sort((a, b) => b.currentBounty - a.currentBounty);
  }

  undoLastElimination(): BountyPayment | null {
    if (!this.tournament.bountyPayments || this.tournament.bountyPayments.length === 0) {
      return null;
    }

    const lastPayment = this.tournament.bountyPayments.pop()!;
    const eliminatorBox = this.tournament.playerBoxes!.find(b => b.id === lastPayment.eliminatorBoxId);
    const eliminatedBox = this.tournament.playerBoxes!.find(b => b.id === lastPayment.eliminatedBoxId);

    if (eliminatorBox) {
      eliminatorBox.currentBounty -= lastPayment.bountyTransferred;
      eliminatorBox.cashEarned -= lastPayment.cashReward;
      eliminatorBox.eliminations -= 1;
    }

    if (eliminatedBox) {
      eliminatedBox.status = 'active';
    }

    return lastPayment;
  }

  renameBox(boxId: string, newName: string): void {
    if (!this.tournament.playerBoxes) {
      throw new Error('Bounty mode not enabled');
    }

    const box = this.tournament.playerBoxes.find(b => b.id === boxId);
    if (!box) {
      throw new Error('Box not found');
    }

    if (!newName || newName.trim().length === 0) {
      throw new Error('Box name cannot be empty');
    }

    box.name = newName.trim();
  }
}
