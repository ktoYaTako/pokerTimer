export type LevelType = 'level' | 'break';

export interface Level {
  id: string;
  type: 'level';
  smallBlind: number;
  bigBlind: number;
  ante: number;
  durationSeconds: number;
}

export interface BreakLevel {
  id: string;
  type: 'break';
  durationSeconds: number;
}

export type LevelConfig = Level | BreakLevel;

export type TournamentStatus = 'idle' | 'running' | 'paused' | 'finished';

export interface TournamentState {
  status: TournamentStatus;
  currentLevelIndex: number;
  levelStartedAt: number | null;
  pausedAt: number | null;
  pausedRemainingSeconds: number | null;
}

export interface BountyConfig {
  enabled: boolean;
  buyInAmount: number;
  numberOfBoxes: number;
  startedAt?: number;
}

export interface PlayerBox {
  id: string;
  name: string;
  currentBounty: number;
  cashEarned: number;
  eliminations: number;
  startingBounty: number;
  status: 'active' | 'eliminated';
}

export interface BountyPayment {
  id: string;
  eliminatedBoxId: string;
  eliminatedBoxName: string;
  eliminatorBoxId: string;
  eliminatorBoxName: string;
  bountyTransferred: number;
  cashReward: number;
  timestamp: number;
  levelIndex?: number;
}

export interface Tournament {
  id: string;
  name: string;
  levels: LevelConfig[];
  state: TournamentState;
  createdAt: number;
  bountyConfig?: BountyConfig;
  playerBoxes?: PlayerBox[];
  bountyPayments?: BountyPayment[];
}

export interface TournamentConfig {
  name: string;
  levels: LevelConfig[];
}
