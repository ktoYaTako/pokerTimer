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
