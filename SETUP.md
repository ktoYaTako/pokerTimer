# Poker Tournament Timer - Первый этап

## Архитектура

Проект состоит из двух частей:

### Server (Node.js + Fastify)
- **Tournament Engine** — ядро приложения, источник истины
- **REST API** — управление турниром
- **WebSocket** — real-time синхронизация состояния
- **In-memory repository** — хранилище турниров

### Client (React + TypeScript)
- **Admin Page** (`/admin/:id`) — управление турниром
- **Display Page** (`/display/:id`) — TV-дисплей
- **Home Page** (`/`) — создание турнира

## Структура файлов

```
server/
  src/
    tournament/
      TournamentEngine.ts        # Ядро логики
      tournament.types.ts        # Типы данных
      tournament.repository.ts   # Хранилище
      tournament.service.ts      # Бизнес-логика
    api/
      tournament.routes.ts       # REST API
    realtime/
      tournament.gateway.ts      # WebSocket
    server.ts                    # Точка входа
  tests/
    tournament.test.ts           # Unit-тесты
  package.json
  tsconfig.json

client/
  src/
    types/
      tournament.ts              # Типы данных
    api/
      tournament.ts              # HTTP клиент
    hooks/
      useTournament.ts           # React хуки
    components/
      Timer.tsx
      LevelDisplay.tsx
    pages/
      HomePage.tsx
      AdminPage.tsx
      DisplayPage.tsx
    styles/
      index.css
      HomePage.css
      AdminPage.css
      DisplayPage.css
      App.css
    utils.ts
    App.tsx
    index.tsx
  index.html
  vite.config.ts
  tsconfig.json
  package.json
```

## Установка и запуск

### Server

```bash
cd server
npm install
npm test          # Запустить тесты
npm run dev       # Запустить сервер
```

Сервер слушает на `http://localhost:3000`

### Client

```bash
cd client
npm install
npm run dev       # Запустить dev-сервер на port 5173
```

## Компоненты Tournament Engine

### Основные операции

- `start()` — начать турнир
- `pause()` — пауза
- `resume()` — возобновить
- `reset()` — сброс на уровень 1
- `nextLevel()` — следующий уровень
- `previousLevel()` — предыдущий уровень
- `updateConfig()` — изменить конфигурацию
- `tick()` — проверка автоматического перехода
- `getRemainingSeconds()` — получить оставшееся время

### Состояние

```typescript
type TournamentStatus = 'idle' | 'running' | 'paused' | 'finished';

interface TournamentState {
  status: TournamentStatus;
  currentLevelIndex: number;
  levelStartedAt: number | null;
  pausedAt: number | null;
  pausedRemainingSeconds: number | null;
}
```

## REST API

```
POST   /api/tournaments                 # Создать турнир
GET    /api/tournaments                 # Список турниров
GET    /api/tournaments/:id             # Получить турнир + оставшееся время
PUT    /api/tournaments/:id/config      # Изменить конфигурацию
POST   /api/tournaments/:id/start       # Старт
POST   /api/tournaments/:id/pause       # Пауза
POST   /api/tournaments/:id/resume      # Возобновить
POST   /api/tournaments/:id/reset       # Сброс
POST   /api/tournaments/:id/next        # Следующий уровень
POST   /api/tournaments/:id/previous    # Предыдущий уровень
DELETE /api/tournaments/:id             # Удалить турнир
```

## WebSocket

```
ws://localhost:3000/ws/tournaments/:id
```

Отправляет обновления в формате:
```json
{
  "type": "tournament_update",
  "data": { Tournament object with remainingSeconds }
}
```

## Полный сценарий MVP (должен работать)

1. ✅ Создать турнир на Home Page
2. ✅ Открыть Admin Page
3. ✅ Открыть Display Page в отдельной вкладке
4. ✅ Нажать START в админке
5. ✅ Таймер начинает отсчёт на Display
6. ✅ Нажать PAUSE
7. ✅ Таймер остановился с правильным временем
8. ✅ Нажать RESUME
9. ✅ Таймер продолжается
10. ✅ Нажать NEXT LEVEL
11. ✅ Display показывает новые блайнды и полный таймер
12. ✅ Перезагрузить Display
13. ✅ Display восстановил актуальное состояние
14. ✅ Дождаться окончания уровня
15. ✅ Сервер автоматически переключил на следующий уровень

## Важные особенности

- **Server-authoritative**: сервер хранит все состояние
- **Timer не зависит от setInterval()**: вычисляется из `levelStartedAt` + текущее время
- **Graceful pause/resume**: время сохраняется и восстанавливается корректно
- **Realtime sync**: WebSocket broadcasts обновления всем клиентам
- **Reconnection**: новый клиент получает актуальное состояние при подключении
- **Auto-tick**: сервер каждую секунду проверяет, нужно ли переключить уровень

## Что дальше

После проверки MVP можно:
1. Добавить редактирование структуры турнира
2. Улучшить UI
3. Добавить более изящную обработку ошибок
4. Расширить функционал (игроки, банк, статистика)
