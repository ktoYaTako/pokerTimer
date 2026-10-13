import { describe, it, expect, beforeEach } from 'vitest';
import { TournamentEngine } from '../src/tournament/TournamentEngine';
import { TournamentConfig, Level, BreakLevel } from '../src/tournament/tournament.types';

const createTestConfig = (): TournamentConfig => ({
  name: 'Test Tournament',
  levels: [
    {
      id: '1',
      type: 'level',
      smallBlind: 25,
      bigBlind: 50,
      ante: 50,
      durationSeconds: 10,
    } as Level,
    {
      id: '2',
      type: 'level',
      smallBlind: 50,
      bigBlind: 100,
      ante: 100,
      durationSeconds: 10,
    } as Level,
    {
      id: '3',
      type: 'break',
      durationSeconds: 5,
    } as BreakLevel,
    {
      id: '4',
      type: 'level',
      smallBlind: 100,
      bigBlind: 200,
      ante: 200,
      durationSeconds: 10,
    } as Level,
  ],
});

describe('TournamentEngine', () => {
  let engine: TournamentEngine;

  beforeEach(() => {
    engine = new TournamentEngine('test-1', createTestConfig());
  });

  describe('initialization', () => {
    it('should create tournament in idle state', () => {
      const state = engine.getState();
      expect(state.status).toBe('idle');
      expect(state.currentLevelIndex).toBe(0);
      expect(state.levelStartedAt).toBeNull();
    });

    it('should throw on empty levels', () => {
      expect(() => {
        new TournamentEngine('test', { name: 'Test', levels: [] });
      }).toThrow('Tournament must have at least one level');
    });

    it('should throw on invalid duration', () => {
      expect(() => {
        new TournamentEngine('test', {
          name: 'Test',
          levels: [
            { id: '1', type: 'level', smallBlind: 25, bigBlind: 50, ante: 50, durationSeconds: 0 } as Level,
          ],
        });
      }).toThrow('Level duration must be positive');
    });

    it('should throw on negative blinds', () => {
      expect(() => {
        new TournamentEngine('test', {
          name: 'Test',
          levels: [
            { id: '1', type: 'level', smallBlind: -25, bigBlind: 50, ante: 50, durationSeconds: 10 } as Level,
          ],
        });
      }).toThrow('Blinds and ante cannot be negative');
    });
  });

  describe('start', () => {
    it('should transition to running', () => {
      engine.start();
      expect(engine.getState().status).toBe('running');
      expect(engine.getState().levelStartedAt).not.toBeNull();
    });

    it('should throw if not in idle state', () => {
      engine.start();
      expect(() => engine.start()).toThrow('Tournament must be in idle state to start');
    });
  });

  describe('remaining time calculation', () => {
    it('should return full duration in idle state', () => {
      const remaining = engine.getRemainingSeconds(Date.now());
      expect(remaining).toBe(10);
    });

    it('should calculate remaining time correctly while running', () => {
      const startTime = Date.now();
      engine.start();

      const remaining1 = engine.getRemainingSeconds(startTime + 2000);
      expect(remaining1).toBe(8);

      const remaining2 = engine.getRemainingSeconds(startTime + 5000);
      expect(remaining2).toBe(5);
    });

    it('should return 0 when time expires', () => {
      const startTime = Date.now();
      engine.start();

      const remaining = engine.getRemainingSeconds(startTime + 11000);
      expect(remaining).toBe(0);
    });
  });

  describe('pause and resume', () => {
    it('should pause and preserve remaining time', () => {
      const startTime = Date.now();
      engine.start();

      const pauseTime = startTime + 3000;
      const remainingBefore = engine.getRemainingSeconds(pauseTime);
      engine.pause(pauseTime);

      const state = engine.getState();
      expect(state.status).toBe('paused');
      expect(state.pausedRemainingSeconds).toBe(remainingBefore);
    });

    it('should resume and continue from paused time', () => {
      const startTime = Date.now();
      engine.start();

      const pauseTime = startTime + 3000;
      engine.pause(pauseTime);

      const resumeTime = pauseTime + 1000;
      engine.resume(resumeTime);

      const state = engine.getState();
      expect(state.status).toBe('running');

      const remaining = engine.getRemainingSeconds(resumeTime + 1000);
      expect(remaining).toBe(6); // 10 - 3 - 1 = 6 (elapsed before pause + elapsed after resume)
    });

    it('should throw if pausing non-running tournament', () => {
      expect(() => engine.pause()).toThrow('Tournament must be running to pause');
    });

    it('should throw if resuming non-paused tournament', () => {
      expect(() => engine.resume()).toThrow('Tournament must be paused to resume');
    });
  });

  describe('next and previous level', () => {
    it('should move to next level', () => {
      engine.start();
      engine.nextLevel();

      expect(engine.getState().currentLevelIndex).toBe(1);
      expect(engine.getState().levelStartedAt).not.toBeNull();
    });

    it('should set tournament to finished on last level transition', () => {
      engine.start();
      engine.nextLevel(); // level 2
      engine.nextLevel(); // break
      engine.nextLevel(); // level 4
      engine.nextLevel(); // finished

      expect(engine.getState().status).toBe('finished');
    });

    it('should move to previous level', () => {
      engine.start();
      engine.nextLevel();
      engine.nextLevel();
      engine.previousLevel();

      expect(engine.getState().currentLevelIndex).toBe(1);
    });

    it('should not move before first level', () => {
      engine.start();
      engine.previousLevel();

      expect(engine.getState().currentLevelIndex).toBe(0);
    });

    it('should reset timer on level change', () => {
      const startTime = Date.now();
      engine.start();

      const nextTime = startTime + 5000;
      engine.nextLevel(nextTime);

      const remaining = engine.getRemainingSeconds(nextTime + 1000);
      expect(remaining).toBe(9); // full 10 sec - 1 sec elapsed
    });
  });

  describe('reset', () => {
    it('should reset to idle state and level 0', () => {
      engine.start();
      engine.nextLevel();
      engine.reset();

      const state = engine.getState();
      expect(state.status).toBe('idle');
      expect(state.currentLevelIndex).toBe(0);
      expect(state.levelStartedAt).toBeNull();
    });
  });

  describe('automatic level transition', () => {
    it('should transition to next level when time expires', () => {
      const startTime = Date.now();
      engine.start();

      engine.tick(startTime + 11000);

      expect(engine.getState().currentLevelIndex).toBe(1);
    });

    it('should transition to finished when last level expires', () => {
      engine.start();
      engine.nextLevel(); // level 2
      engine.nextLevel(); // break
      engine.nextLevel(); // level 4

      const startTime = engine.getState().levelStartedAt!;
      engine.tick(startTime + 11000);

      expect(engine.getState().status).toBe('finished');
    });

    it('should not transition while paused', () => {
      const startTime = Date.now();
      engine.start();
      engine.pause();

      engine.tick(startTime + 11000);

      expect(engine.getState().currentLevelIndex).toBe(0);
    });
  });

  describe('update config', () => {
    it('should update tournament name', () => {
      engine.updateConfig({ name: 'New Name' });
      expect(engine.getTournament().name).toBe('New Name');
    });

    it('should update levels', () => {
      const newLevels: Level[] = [
        {
          id: '1',
          type: 'level',
          smallBlind: 100,
          bigBlind: 200,
          ante: 200,
          durationSeconds: 20,
        },
      ];

      engine.updateConfig({ levels: newLevels });
      expect(engine.getTournament().levels).toEqual(newLevels);
    });

    it('should validate new levels', () => {
      expect(() => {
        engine.updateConfig({ levels: [] });
      }).toThrow('Tournament must have at least one level');
    });

    it('should adjust currentLevelIndex if it exceeds new levels length', () => {
      engine.start();
      engine.nextLevel();
      engine.nextLevel();
      engine.nextLevel();

      const newLevels: Level[] = [
        {
          id: '1',
          type: 'level',
          smallBlind: 100,
          bigBlind: 200,
          ante: 200,
          durationSeconds: 20,
        },
      ];

      engine.updateConfig({ levels: newLevels });
      expect(engine.getState().currentLevelIndex).toBe(0);
    });
  });

  describe('get current level', () => {
    it('should return current level config', () => {
      const level = engine.getCurrentLevel();
      expect(level.id).toBe('1');
      expect(level.type).toBe('level');
    });
  });

  describe('break levels', () => {
    it('should handle break levels correctly', () => {
      engine.start();
      engine.nextLevel();
      engine.nextLevel();

      const currentLevel = engine.getCurrentLevel();
      expect(currentLevel.type).toBe('break');
      expect(currentLevel.durationSeconds).toBe(5);
    });
  });
});
