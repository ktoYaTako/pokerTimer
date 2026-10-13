import { FastifyInstance } from 'fastify';
import { tournamentService } from '../tournament/tournament.service';
import { TournamentConfig } from '../tournament/tournament.types';

export async function registerTournamentRoutes(app: FastifyInstance) {
  app.post<{ Body: TournamentConfig }>('/api/tournaments', async (req, reply) => {
    try {
      const tournament = tournamentService.createTournament(req.body);
      return reply.code(201).send(tournament);
    } catch (error) {
      return reply.code(400).send({ error: (error as Error).message });
    }
  });

  app.get<{ Params: { id: string } }>('/api/tournaments/:id', async (req, reply) => {
    try {
      const tournament = tournamentService.getTournament(req.params.id);
      const withTime = tournamentService.getTournamentWithRemainingTime(req.params.id, Date.now());
      return reply.send(withTime);
    } catch (error) {
      return reply.code(404).send({ error: (error as Error).message });
    }
  });

  app.put<{ Params: { id: string }; Body: Partial<TournamentConfig> }>(
    '/api/tournaments/:id/config',
    async (req, reply) => {
      try {
        const tournament = tournamentService.updateTournamentConfig(req.params.id, req.body);
        return reply.send(tournament);
      } catch (error) {
        return reply.code(400).send({ error: (error as Error).message });
      }
    }
  );

  app.post<{ Params: { id: string } }>('/api/tournaments/:id/start', async (req, reply) => {
    try {
      const tournament = tournamentService.start(req.params.id);
      return reply.send(tournament);
    } catch (error) {
      return reply.code(400).send({ error: (error as Error).message });
    }
  });

  app.post<{ Params: { id: string } }>('/api/tournaments/:id/pause', async (req, reply) => {
    try {
      const tournament = tournamentService.pause(req.params.id);
      return reply.send(tournament);
    } catch (error) {
      return reply.code(400).send({ error: (error as Error).message });
    }
  });

  app.post<{ Params: { id: string } }>('/api/tournaments/:id/resume', async (req, reply) => {
    try {
      const tournament = tournamentService.resume(req.params.id);
      return reply.send(tournament);
    } catch (error) {
      return reply.code(400).send({ error: (error as Error).message });
    }
  });

  app.post<{ Params: { id: string } }>('/api/tournaments/:id/reset', async (req, reply) => {
    try {
      const tournament = tournamentService.reset(req.params.id);
      return reply.send(tournament);
    } catch (error) {
      return reply.code(400).send({ error: (error as Error).message });
    }
  });

  app.post<{ Params: { id: string } }>('/api/tournaments/:id/next', async (req, reply) => {
    try {
      const tournament = tournamentService.nextLevel(req.params.id);
      return reply.send(tournament);
    } catch (error) {
      return reply.code(400).send({ error: (error as Error).message });
    }
  });

  app.post<{ Params: { id: string } }>('/api/tournaments/:id/previous', async (req, reply) => {
    try {
      const tournament = tournamentService.previousLevel(req.params.id);
      return reply.send(tournament);
    } catch (error) {
      return reply.code(400).send({ error: (error as Error).message });
    }
  });

  app.get('/api/tournaments', async (req, reply) => {
    const tournaments = tournamentService.listTournaments();
    return reply.send(tournaments);
  });

  app.delete<{ Params: { id: string } }>('/api/tournaments/:id', async (req, reply) => {
    try {
      tournamentService.deleteTournament(req.params.id);
      return reply.code(204).send();
    } catch (error) {
      return reply.code(404).send({ error: (error as Error).message });
    }
  });
}
