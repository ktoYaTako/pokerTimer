import { Tournament, TournamentConfig } from '../types/tournament';

const API_BASE = '/api';

export async function createTournament(config: TournamentConfig): Promise<Tournament> {
  const res = await fetch(`${API_BASE}/tournaments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getTournament(id: string): Promise<Tournament> {
  const res = await fetch(`${API_BASE}/tournaments/${id}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateTournamentConfig(id: string, config: Partial<TournamentConfig>): Promise<Tournament> {
  const res = await fetch(`${API_BASE}/tournaments/${id}/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function startTournament(id: string): Promise<Tournament> {
  const res = await fetch(`${API_BASE}/tournaments/${id}/start`, { method: 'POST' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function pauseTournament(id: string): Promise<Tournament> {
  const res = await fetch(`${API_BASE}/tournaments/${id}/pause`, { method: 'POST' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function resumeTournament(id: string): Promise<Tournament> {
  const res = await fetch(`${API_BASE}/tournaments/${id}/resume`, { method: 'POST' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function resetTournament(id: string): Promise<Tournament> {
  const res = await fetch(`${API_BASE}/tournaments/${id}/reset`, { method: 'POST' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function nextLevel(id: string): Promise<Tournament> {
  const res = await fetch(`${API_BASE}/tournaments/${id}/next`, { method: 'POST' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function previousLevel(id: string): Promise<Tournament> {
  const res = await fetch(`${API_BASE}/tournaments/${id}/previous`, { method: 'POST' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteTournament(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/tournaments/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
}

export async function listTournaments(): Promise<Tournament[]> {
  const res = await fetch(`${API_BASE}/tournaments`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function addLevel(id: string, level: any, index?: number): Promise<Tournament> {
  const res = await fetch(`${API_BASE}/tournaments/${id}/levels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ level, index }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function removeLevel(id: string, levelIndex: number): Promise<Tournament> {
  const res = await fetch(`${API_BASE}/tournaments/${id}/levels/${levelIndex}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateLevel(id: string, levelIndex: number, updates: Partial<any>): Promise<Tournament> {
  const res = await fetch(`${API_BASE}/tournaments/${id}/levels/${levelIndex}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function reorderLevels(id: string, levels: any[]): Promise<Tournament> {
  const res = await fetch(`${API_BASE}/tournaments/${id}/levels/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ levels }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function enableBountyMode(id: string, buyInAmount: number, numberOfBoxes: number): Promise<Tournament> {
  const res = await fetch(`${API_BASE}/tournaments/${id}/bounty/enable`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ buyInAmount, numberOfBoxes }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function disableBountyMode(id: string): Promise<Tournament> {
  const res = await fetch(`${API_BASE}/tournaments/${id}/bounty`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function recordBountyPayment(id: string, eliminatedBoxId: string, eliminatorBoxId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/tournaments/${id}/bounty/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eliminatedBoxId, eliminatorBoxId }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function undoBountyPayment(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/tournaments/${id}/bounty/undo`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getBountyLeaderboard(id: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/tournaments/${id}/bounty/leaderboard`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function renameBox(id: string, boxId: string, name: string): Promise<Tournament> {
  const res = await fetch(`${API_BASE}/tournaments/${id}/bounty/boxes/${boxId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function addBountyBox(id: string): Promise<Tournament> {
  const res = await fetch(`${API_BASE}/tournaments/${id}/bounty/rebuy`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
