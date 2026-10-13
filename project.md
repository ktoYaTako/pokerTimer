## Контекст проекта

Я хочу разработать веб-приложение для домашних/live poker games.

Первый MVP — это **конфигурируемый покерный турнирный таймер**, который позволяет управлять уровнями турнира на одном устройстве и отображать текущие блайнды, анте и оставшееся время на отдельном телевизоре, установленном рядом с покерным столом.

В дальнейшем приложение планируется расширять:

- игроки и их стеки;
    
- buy-in;
    
- подсчёт общего банка;
    
- учёт действий игроков;
    
- история раздач;
    
- статистика;
    
- автоматический подсчёт фишек с помощью камеры / computer vision;
    
- возможно, отдельное приложение или PWA.
    

**Важно:** сейчас НЕ реализовывать будущие функции. Но архитектуру нужно построить так, чтобы их можно было добавить без переписывания ядра.

---

# Технологический стек

Использовать:

### Frontend

- React
    
- TypeScript
    
- Vite
    
- современный CSS / выбранный UI подход без чрезмерной зависимости от UI-библиотек
    

### Backend

- Node.js
    
- TypeScript
    
- Fastify
    
- WebSocket или Socket.IO для realtime-связи
    

### Данные

На первом этапе можно использовать in-memory state.

Не добавлять PostgreSQL/Redis/etc. без необходимости.

Но код должен быть организован так, чтобы позже можно было заменить in-memory repository на PostgreSQL без переписывания бизнес-логики.

---

# Главный принцип архитектуры

Сделать отдельное серверное **Tournament Engine**, которое является единственным источником истины.

Frontend не должен самостоятельно управлять состоянием турнира.

Особенно важно:

**таймер не должен зависеть от** `**setInterval()**` **на клиенте.**

Сервер хранит момент начала текущего уровня и состояние турнира.

Например:

```ts
type TournamentState = {
  status: 'idle' | 'running' | 'paused' | 'finished';

  currentLevelIndex: number;

  levelStartedAt: number | null;

  pausedAt: number | null;

  pausedRemainingSeconds: number | null;
};
```

Оставшееся время должно вычисляться на основании серверного состояния и текущего времени.

Клиенты могут визуально обновлять отображение каждую секунду, но это только presentation layer.

Если телевизор перезагрузить или подключить новый клиент, он должен получить актуальное состояние от сервера и продолжить отображение правильного времени.

---

# Структура турнира

Турнир состоит из последовательности уровней.

Тип уровня:

```ts
type LevelType = 'level' | 'break';
```

Обычный уровень содержит:

```ts
type Level = {
  id: string;

  type: 'level';

  smallBlind: number;
  bigBlind: number;
  ante: number;

  durationSeconds: number;
};
```

Break:

```ts
type BreakLevel = {
  id: string;

  type: 'break';

  durationSeconds: number;
};
```

В будущем модель можно расширить, но сейчас этого достаточно.

Пример:

```json
{
  "name": "Friday Poker",
  "levels": [
    {
      "id": "1",
      "type": "level",
      "smallBlind": 25,
      "bigBlind": 50,
      "ante": 50,
      "durationSeconds": 900
    },
    {
      "id": "2",
      "type": "level",
      "smallBlind": 50,
      "bigBlind": 100,
      "ante": 100,
      "durationSeconds": 900
    },
    {
      "id": "3",
      "type": "level",
      "smallBlind": 75,
      "bigBlind": 150,
      "ante": 150,
      "durationSeconds": 900
    },
    {
      "id": "4",
      "type": "break",
      "durationSeconds": 600
    }
  ]
}
```

---

# Tournament Engine

Сделать бизнес-логику отдельно от HTTP/WebSocket и React.

Например:

```text
server/
  src/
    tournament/
      TournamentEngine.ts
      tournament.types.ts
      tournament.repository.ts
      tournament.service.ts
```

Идея:

```text
HTTP/WebSocket
      ↓
Tournament Service
      ↓
Tournament Engine
      ↓
Tournament State
```

Engine должен отвечать за:

- создание турнира;
    
- получение состояния;
    
- start;
    
- pause;
    
- resume;
    
- reset;
    
- next level;
    
- previous level;
    
- изменение конфигурации;
    
- автоматический переход на следующий уровень;
    
- завершение турнира.
    

---

# Команды управления

Админский клиент должен иметь возможность отправлять:

```text
CREATE_TOURNAMENT
START
PAUSE
RESUME
RESET
NEXT_LEVEL
PREVIOUS_LEVEL
UPDATE_CONFIG
```

Можно использовать REST для обычных CRUD-операций и WebSocket для realtime-команд/состояния.

Не нужно искусственно делать всё через WebSocket.

---

# Автоматический переход уровня

Когда время текущего уровня заканчивается:

1. сервер определяет, что уровень завершён;
    
2. если есть следующий уровень — автоматически переключается на него;
    
3. фиксируется новое `levelStartedAt`;
    
4. клиентам отправляется новое состояние;
    
5. если уровней больше нет — турнир получает статус `finished`.
    

Не полагаться на то, что клиент сообщит серверу:

> "таймер закончился".

Сервер должен сам быть способен определить окончание уровня.

---

# Pause / Resume

Pause должен работать корректно.

Например:

```text
Level duration = 900 sec

remaining = 423 sec

PAUSE

remaining = 423 sec
```

После:

```text
RESUME
```

должно продолжиться:

```text
423 → 422 → 421...
```

а не пересчитываться с первоначального времени.

---

# Next / Previous

`NEXT_LEVEL`:

- сразу переключает на следующий уровень;
    
- сбрасывает его таймер на полную длительность;
    
- устанавливает новый `levelStartedAt`;
    
- отправляет обновлённое состояние клиентам.
    

`PREVIOUS_LEVEL` работает аналогично.

Если текущий уровень первый — ничего не ломается.

Если текущий уровень последний — состояние остаётся валидным.

---

# Frontend

Frontend состоит минимум из двух основных режимов.

## 1. Admin

URL:

```text
/admin/:tournamentId
```

Admin позволяет:

- создать/открыть турнир;
    
- редактировать название;
    
- редактировать структуру уровней;
    
- добавлять уровень;
    
- удалять уровень;
    
- менять SB;
    
- менять BB;
    
- менять Ante;
    
- менять длительность;
    
- добавлять break;
    
- Start;
    
- Pause;
    
- Resume;
    
- Next Level;
    
- Previous Level;
    
- Reset.
    

Интерфейс должен быть удобным для управления с ноутбука или телефона.

---

# 2. TV Display

URL:

```text
/display/:tournamentId
```

Это отдельный минималистичный интерфейс для телевизора.

Он НЕ должен показывать:

- админские кнопки;
    
- настройки;
    
- техническую информацию;
    
- лишние панели.
    

Главная информация:

```text
LEVEL 4

100 / 200
ANTE 200

12:47

NEXT
200 / 400
```

Для break:

```text
BREAK

08:32

NEXT LEVEL

200 / 400
ANTE 400
```

---

# Требования к TV Display

TV Display должен быть рассчитан на просмотр с расстояния.

Поэтому:

- очень крупный таймер;
    
- крупные SB/BB;
    
- крупный Ante;
    
- высокий контраст;
    
- минимальное количество текста;
    
- отсутствие мелких UI-элементов;
    
- responsive layout;
    
- нормально работать на 1080p и 4K;
    
- желательно поддержать landscape;
    
- dark theme по умолчанию.
    

Не делать интерфейс похожим на обычную админку.

Это должен выглядеть как специализированный poker tournament display.

---

# Синхронизация

При подключении любого клиента:

```text
Client
  ↓
GET current tournament state
  ↓
Server
  ↓
current state
```

После подключения клиент подписывается на realtime updates.

Когда админ нажимает:

```text
NEXT LEVEL
```

происходит:

```text
Admin
  ↓
Server
  ↓
Tournament Engine
  ↓
new state
  ↓
WebSocket broadcast
  ↓
TV
```

Телевизор должен обновиться практически мгновенно.

---

# Reconnection

Если телевизор потерял соединение:

```text
disconnect
    ↓
reconnect
    ↓
request current state
    ↓
continue displaying correct timer
```

Не должно быть необходимости перезапускать турнир.

---

# Создание турнира

На первом этапе достаточно простой формы:

```text
Tournament name

[ Create Tournament ]
```

После создания:

```text
Tournament ID
Admin URL
Display URL
```

В дальнейшем можно сделать room code, но сейчас достаточно нормального уникального ID.

---

# Default tournament structure

При создании нового турнира использовать разумную структуру по умолчанию, например:

```text
25 / 50     ante 50      15 min
50 / 100    ante 100     15 min
75 / 150    ante 150     15 min
100 / 200   ante 200     15 min
200 / 400   ante 400     15 min
300 / 600   ante 600     15 min
break                     10 min
400 / 800   ante 800     15 min
500 / 1000  ante 1000    15 min
```

Но это только default.

Пользователь должен иметь возможность полностью изменить структуру.

---

# Валидация

Необходимо валидировать:

- SB >= 0;
    
- BB >= 0;
    
- Ante >= 0;
    
- duration > 0;
    
- корректность индекса уровня;
    
- корректность ID турнира;
    
- недопустимые команды;
    
- попытки изменения несуществующего турнира.
    

Не допускать:

```text
NaN
Infinity
negative duration
undefined state
```

---

# Состояния

Минимально поддерживать:

```text
idle
running
paused
finished
```

Поведение:

### idle

Турнир создан, но не запущен.

### running

Таймер идёт.

### paused

Таймер остановлен.

### finished

Последний уровень закончился.

---

# API

Сделать понятный REST API.

Пример:

```text
POST   /api/tournaments
GET    /api/tournaments/:id
PUT    /api/tournaments/:id/config
POST   /api/tournaments/:id/start
POST   /api/tournaments/:id/pause
POST   /api/tournaments/:id/resume
POST   /api/tournaments/:id/reset
POST   /api/tournaments/:id/next
POST   /api/tournaments/:id/previous
```

WebSocket использовать для realtime synchronization.

---

# Кодовая архитектура

Не смешивать:

```text
React components
business logic
HTTP handlers
WebSocket handlers
timer calculations
data storage
```

Каждый слой должен иметь понятную ответственность.

Frontend примерно:

```text
src/
  app/
  pages/
    AdminPage/
    DisplayPage/
  components/
    Timer/
    LevelDisplay/
    LevelEditor/
    TournamentControls/
    TournamentStructure/
  hooks/
    useTournament/
    useRealtimeTournament/
  api/
  types/
```

Backend примерно:

```text
src/
  server.ts

  tournament/
    TournamentEngine.ts
    TournamentService.ts
    TournamentRepository.ts
    tournament.types.ts

  api/
    tournament.routes.ts

  realtime/
    tournament.gateway.ts
```

Не создавать огромное количество файлов без необходимости.

Главное — понятное разделение ответственности.

---

# Важные архитектурные правила

## 1. Server is authoritative

Никогда не считать React-клиент источником истины.

## 2. Timer must survive reload

Перезагрузка браузера не должна сбрасывать таймер.

## 3. TV is read-only

TV Display не управляет турниром.

## 4. Admin controls tournament

Admin — основной интерфейс управления.

## 5. Configuration != State

Структура турнира и текущее состояние должны быть разными сущностями.

## 6. Business logic != transport

Tournament Engine не должен зависеть от Fastify, Socket.IO или React.

## 7. Future extensibility

В будущем должны безболезненно добавляться:

```text
Players
Stacks
Buy-in
Pot
Hands
Chip tracking
Camera / Computer Vision
Statistics
Tournament history
```

Но пока ничего из этого НЕ реализовывать.

---

# UX

Интерфейс должен быть современным, аккуратным и минималистичным.

Не нужен сложный enterprise dashboard.

Приоритет:

1. Надёжность таймера.
    
2. Читаемость TV Display.
    
3. Простота управления.
    
4. Быстрая реакция.
    
5. Корректная realtime-синхронизация.
    

---

# Что НЕ делать сейчас

Не реализовывать:

- регистрацию пользователей;
    
- OAuth;
    
- платежи;
    
- multiplayer accounts;
    
- игроков;
    
- банк;
    
- poker hand tracking;
    
- camera;
    
- AI;
    
- computer vision;
    
- chip recognition;
    
- статистику;
    
- мобильное native-приложение;
    
- сложную авторизацию;
    
- PostgreSQL, если для MVP достаточно in-memory storage.
    

---

# Разработка

Работать итеративно.

Сначала создать рабочий минимальный vertical slice:

```text
Node.js server
       ↓
Tournament Engine
       ↓
WebSocket
       ↓
React Admin
       ↓
React TV Display
```

И добиться следующего сценария:

1. Создать турнир.
    
2. Открыть Admin.
    
3. Открыть Display в другой вкладке.
    
4. Нажать Start.
    
5. Таймер пошёл.
    
6. Display показывает правильное время.
    
7. Нажать Pause.
    
8. Display остановился.
    
9. Нажать Resume.
    
10. Таймер продолжился.
    
11. Нажать Next Level.
    
12. На Display появились новые блайнды и полный таймер нового уровня.
    
13. Перезагрузить Display.
    
14. Display восстановил актуальное состояние.
    
15. Дождаться окончания уровня.
    
16. Сервер автоматически переключил уровень.
    

Только после того, как этот сценарий полностью работает, переходить к улучшению UI и дополнительным функциям.

---

# Качество кода

Писать production-oriented TypeScript.

Использовать:

- strict TypeScript;
    
- явные типы;
    
- небольшие функции;
    
- понятные имена;
    
- минимум magic numbers;
    
- обработку ошибок;
    
- базовые unit tests для Tournament Engine.
    

Особенно протестировать:

- start;
    
- pause;
    
- resume;
    
- next;
    
- previous;
    
- reset;
    
- automatic level transition;
    
- timer calculation;
    
- break;
    
- last level;
    
- reload/reconnect.
    

---

# Первый этап работы

Не пытайся сразу написать весь проект.

Сначала:

1. Предложи краткую структуру проекта.
    
2. Зафиксируй основные типы.
    
3. Реализуй Tournament Engine.
    
4. Напиши unit tests для него.
    
5. Реализуй Node.js API.
    
6. Реализуй realtime synchronization.
    
7. Реализуй Admin.
    
8. Реализуй TV Display.
    
9. Проверь полный сценарий MVP.
    

После каждого крупного этапа показывай, что было сделано и какие файлы изменены.

Если какое-либо архитектурное решение существенно влияет на дальнейшую разработку — сначала объясни его и предложи вариант, но не усложняй проект без необходимости.

Главная цель первого этапа:

**получить простой, надёжный и реально используемый poker tournament timer, который можно поставить на телевизор возле стола и управлять им с ноутбука/телефона.**