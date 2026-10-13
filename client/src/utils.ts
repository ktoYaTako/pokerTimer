export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function getDefaultTournamentLevels() {
  return [
    { id: '1', type: 'level' as const, smallBlind: 25, bigBlind: 50, ante: 50, durationSeconds: 900 },
    { id: '2', type: 'level' as const, smallBlind: 50, bigBlind: 100, ante: 100, durationSeconds: 900 },
    { id: '3', type: 'level' as const, smallBlind: 75, bigBlind: 150, ante: 150, durationSeconds: 900 },
    { id: '4', type: 'level' as const, smallBlind: 100, bigBlind: 200, ante: 200, durationSeconds: 900 },
    { id: '5', type: 'level' as const, smallBlind: 200, bigBlind: 400, ante: 400, durationSeconds: 900 },
    { id: '6', type: 'level' as const, smallBlind: 300, bigBlind: 600, ante: 600, durationSeconds: 900 },
    { id: '7', type: 'break' as const, durationSeconds: 600 },
    { id: '8', type: 'level' as const, smallBlind: 400, bigBlind: 800, ante: 800, durationSeconds: 900 },
    { id: '9', type: 'level' as const, smallBlind: 500, bigBlind: 1000, ante: 1000, durationSeconds: 900 },
  ];
}
