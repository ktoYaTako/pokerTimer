import { Level, BreakLevel } from '../types/tournament';

interface LevelDisplayProps {
  level: Level | BreakLevel;
  levelIndex: number;
  nextLevel?: Level | BreakLevel;
}

export function LevelDisplay({ level, levelIndex, nextLevel }: LevelDisplayProps) {
  return (
    <div className="level-display">
      <div className="level-number">LEVEL {levelIndex + 1}</div>

      {level.type === 'level' ? (
        <div className="level-info">
          <div className="blinds">
            <span className="small-blind">{level.smallBlind}</span>
            <span className="separator">/</span>
            <span className="big-blind">{level.bigBlind}</span>
          </div>
          <div className="ante">ANTE {level.ante}</div>
        </div>
      ) : (
        <div className="break-info">BREAK</div>
      )}

      {nextLevel && (
        <div className="next-level">
          <div className="next-label">NEXT</div>
          {nextLevel.type === 'level' ? (
            <div className="next-blinds">
              {nextLevel.smallBlind} / {nextLevel.bigBlind}
            </div>
          ) : (
            <div className="next-break">BREAK</div>
          )}
        </div>
      )}
    </div>
  );
}
