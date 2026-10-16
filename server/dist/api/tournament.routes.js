import { tournamentService } from '../tournament/tournament.service';
export async function registerTournamentRoutes(app) {
    app.post('/api/tournaments', async (req, reply) => {
        try {
            const tournament = tournamentService.createTournament(req.body);
            return reply.code(201).send(tournament);
        }
        catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
    app.get('/api/tournaments/:id', async (req, reply) => {
        try {
            const tournament = tournamentService.getTournament(req.params.id);
            const withTime = tournamentService.getTournamentWithRemainingTime(req.params.id, Date.now());
            return reply.send(withTime);
        }
        catch (error) {
            return reply.code(404).send({ error: error.message });
        }
    });
    app.put('/api/tournaments/:id/config', async (req, reply) => {
        try {
            const tournament = tournamentService.updateTournamentConfig(req.params.id, req.body);
            return reply.send(tournament);
        }
        catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
    app.post('/api/tournaments/:id/start', async (req, reply) => {
        try {
            const tournament = tournamentService.start(req.params.id);
            return reply.send(tournament);
        }
        catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
    app.post('/api/tournaments/:id/pause', async (req, reply) => {
        try {
            const tournament = tournamentService.pause(req.params.id);
            return reply.send(tournament);
        }
        catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
    app.post('/api/tournaments/:id/resume', async (req, reply) => {
        try {
            const tournament = tournamentService.resume(req.params.id);
            return reply.send(tournament);
        }
        catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
    app.post('/api/tournaments/:id/reset', async (req, reply) => {
        try {
            const tournament = tournamentService.reset(req.params.id);
            return reply.send(tournament);
        }
        catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
    app.post('/api/tournaments/:id/next', async (req, reply) => {
        try {
            const tournament = tournamentService.nextLevel(req.params.id);
            return reply.send(tournament);
        }
        catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
    app.post('/api/tournaments/:id/previous', async (req, reply) => {
        try {
            const tournament = tournamentService.previousLevel(req.params.id);
            return reply.send(tournament);
        }
        catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
    app.get('/api/tournaments', async (req, reply) => {
        const tournaments = tournamentService.listTournaments();
        return reply.send(tournaments);
    });
    app.delete('/api/tournaments/:id', async (req, reply) => {
        try {
            tournamentService.deleteTournament(req.params.id);
            return reply.code(204).send();
        }
        catch (error) {
            return reply.code(404).send({ error: error.message });
        }
    });
    app.post('/api/tournaments/:id/levels', async (req, reply) => {
        try {
            const tournament = tournamentService.addLevel(req.params.id, req.body.level, req.body.index);
            return reply.code(201).send(tournament);
        }
        catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
    app.patch('/api/tournaments/:id/levels/:levelIndex', async (req, reply) => {
        try {
            const index = parseInt(req.params.levelIndex, 10);
            const tournament = tournamentService.updateLevel(req.params.id, index, req.body);
            return reply.send(tournament);
        }
        catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
    app.delete('/api/tournaments/:id/levels/:levelIndex', async (req, reply) => {
        try {
            const index = parseInt(req.params.levelIndex, 10);
            const tournament = tournamentService.removeLevel(req.params.id, index);
            return reply.send(tournament);
        }
        catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
    app.post('/api/tournaments/:id/levels/reorder', async (req, reply) => {
        try {
            const tournament = tournamentService.reorderLevels(req.params.id, req.body.levels);
            return reply.send(tournament);
        }
        catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
    app.post('/api/tournaments/:id/bounty/enable', async (req, reply) => {
        try {
            const tournament = tournamentService.enableBountyMode(req.params.id, {
                enabled: true,
                buyInAmount: req.body.buyInAmount,
                numberOfBoxes: req.body.numberOfBoxes,
            });
            return reply.send(tournament);
        }
        catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
    app.delete('/api/tournaments/:id/bounty', async (req, reply) => {
        try {
            const tournament = tournamentService.disableBountyMode(req.params.id);
            return reply.send(tournament);
        }
        catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
    app.post('/api/tournaments/:id/bounty/rebuy', async (req, reply) => {
        try {
            const tournament = tournamentService.addBountyBox(req.params.id);
            return reply.code(201).send(tournament);
        }
        catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
    app.post('/api/tournaments/:id/bounty/payments', async (req, reply) => {
        try {
            const payment = tournamentService.recordBountyPayment(req.params.id, req.body.eliminatedBoxId, req.body.eliminatorBoxId);
            return reply.code(201).send(payment);
        }
        catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
    app.post('/api/tournaments/:id/bounty/undo', async (req, reply) => {
        try {
            const payment = tournamentService.undoBountyPayment(req.params.id);
            return reply.send(payment);
        }
        catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
    app.get('/api/tournaments/:id/bounty/leaderboard', async (req, reply) => {
        try {
            const leaderboard = tournamentService.getBountyLeaderboard(req.params.id);
            return reply.send(leaderboard);
        }
        catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
    app.patch('/api/tournaments/:id/bounty/boxes/:boxId', async (req, reply) => {
        try {
            const tournament = tournamentService.renameBox(req.params.id, req.params.boxId, req.body.name);
            return reply.send(tournament);
        }
        catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
}
