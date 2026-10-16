import fastifyWebsocket from '@fastify/websocket';
import { tournamentService } from '../tournament/tournament.service';
const clients = [];
export async function registerTournamentGateway(app) {
    await app.register(fastifyWebsocket);
    app.get('/ws/tournaments/:id', { websocket: true }, (socket, request) => {
        const tournamentId = request.params.id;
        console.log(`[WS] New connection attempt for: ${tournamentId}`);
        try {
            const tournament = tournamentService.getTournament(tournamentId);
            if (!tournament) {
                console.log(`[WS] Tournament not found: ${tournamentId}`);
                socket.close(1008, 'Tournament not found');
                return;
            }
            const client = { ws: socket, tournamentId };
            clients.push(client);
            console.log(`[WS] Client connected. Total clients: ${clients.length}`);
            socket.on('close', () => {
                const idx = clients.indexOf(client);
                if (idx > -1)
                    clients.splice(idx, 1);
                console.log(`[WS] Client disconnected. Total clients: ${clients.length}`);
            });
            socket.on('error', (err) => {
                console.error(`[WS] Socket error:`, err);
            });
        }
        catch (err) {
            console.error(`[WS] Handler error:`, err);
            socket.close(1011, 'Server error');
        }
    });
}
export function broadcastTournamentUpdate(tournamentId) {
    try {
        const withTime = tournamentService.getTournamentWithRemainingTime(tournamentId, Date.now());
        const message = JSON.stringify({
            type: 'tournament_update',
            data: withTime,
        });
        let count = 0;
        for (const client of clients) {
            try {
                if (client.tournamentId === tournamentId && client.ws) {
                    client.ws.send(message);
                    count++;
                }
            }
            catch (err) {
                console.error(`[WS] Send failed:`, err);
            }
        }
        if (count > 0) {
            console.log(`[WS] Sent update to ${count} clients`);
        }
    }
    catch (err) {
        console.error('[WS] Broadcast error:', err);
    }
}
export function startAutoTick(app) {
    setInterval(() => {
        const tournaments = new Set();
        for (const client of clients) {
            tournaments.add(client.tournamentId);
        }
        for (const tournamentId of tournaments) {
            try {
                tournamentService.tick(tournamentId, Date.now());
                broadcastTournamentUpdate(tournamentId);
            }
            catch (err) {
                console.error(`[WS] Tick error for ${tournamentId}:`, err);
            }
        }
    }, 1000);
}
