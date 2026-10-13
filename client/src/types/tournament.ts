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

export interface Tournament {
  id: string;
  name: string;
  levels: LevelConfig[];
  state: TournamentState;
  createdAt: number;
  remainingSeconds?: number;
}

export interface TournamentConfig {
  name: string;
  levels: LevelConfig[];
}
