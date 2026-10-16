import Fastify from 'fastify';
import cors from '@fastify/cors';
import { registerTournamentRoutes } from './api/tournament.routes';
import { registerTournamentGateway, startAutoTick, broadcastTournamentUpdate } from './realtime/tournament.gateway';
import { setBroadcastCallback } from './tournament/tournament.service';
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
async function start() {
    const app = Fastify({
        logger: true,
    });
    await app.register(cors, {
        origin: true,
    });
    setBroadcastCallback(broadcastTournamentUpdate);
    await registerTournamentRoutes(app);
    await registerTournamentGateway(app);
    app.get('/health', async () => {
        return { status: 'ok' };
    });
    startAutoTick(app);
    try {
        await app.listen({ port: PORT, host: HOST });
        console.log(`Server running at http://${HOST}:${PORT}`);
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}
start();
