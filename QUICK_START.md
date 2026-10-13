# Quick Start Guide

## 🚀 За 5 минут до работающего приложения

### Предпосылки
- Node.js 18+ установлен
- Порты 3000 и 5173 свободны

### Шаг 1: Установка (2 мин)

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### Шаг 2: Запуск серверов (1 мин)

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Server running at http://0.0.0.0:3000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# Local: http://localhost:5173
```

### Шаг 3: Тестирование (2 мин)

1. Откройте http://localhost:5173
2. Создайте турнир
3. Откройте Admin и Display в разных вкладках
4. Нажимайте START → Display обновляется в реальном времени ✨

## 📋 Основные URL

| Страница | URL |
|----------|-----|
| Home (создание) | http://localhost:5173 |
| Admin | http://localhost:5173/admin/{ID} |
| Display | http://localhost:5173/display/{ID} |
| API | http://localhost:3000/api |
| WebSocket | ws://localhost:3000/ws/tournaments/{ID} |

## 🧪 Команды для тестирования

### Создать турнир через API

```bash
curl -X POST http://localhost:3000/api/tournaments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Tournament",
    "levels": [
      {"id":"1","type":"level","smallBlind":25,"bigBlind":50,"ante":50,"durationSeconds":900},
      {"id":"2","type":"level","smallBlind":50,"bigBlind":100,"ante":100,"durationSeconds":900}
    ]
  }'
```

### Получить состояние турнира

```bash
curl http://localhost:3000/api/tournaments/{ID}
```

### Запустить турнир

```bash
curl -X POST http://localhost:3000/api/tournaments/{ID}/start
```

### Следующий уровень

```bash
curl -X POST http://localhost:3000/api/tournaments/{ID}/next
```

## 🔍 Отладка

### Проверить здоровье сервера
```bash
curl http://localhost:3000/health
# {"status":"ok"}
```

### Запустить тесты
```bash
cd server
npm run test:run
# 28 passed ✅
```

### Посмотреть логи WebSocket
1. Откройте DevTools (F12)
2. Console tab
3. Вы должны видеть:
   ```
   [WebSocket] Connecting to: ws://localhost:5173/ws/tournaments/...
   [WebSocket] Connected
   ```

## 📂 Структура файлов

```
poker-timer/
├── server/              # Node.js backend
│   ├── src/
│   │   ├── tournament/  # Tournament Engine (ядро)
│   │   ├── api/         # REST routes
│   │   ├── realtime/    # WebSocket gateway
│   │   └── server.ts
│   ├── tests/           # Unit tests (28 тестов)
│   ├── package.json
│   └── tsconfig.json
│
├── client/              # React frontend
│   ├── src/
│   │   ├── pages/       # Home, Admin, Display
│   │   ├── components/  # Timer, LevelDisplay
│   │   ├── hooks/       # WebSocket, state management
│   │   ├── api/         # HTTP client
│   │   └── types/       # TypeScript definitions
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── project.md           # Исходное описание проекта
├── SETUP.md             # Подробная инструкция
├── WEBSOCKET_FIX.md     # Описание fix для WebSocket
└── MVP_CHECKLIST.md     # Полный чек-лист MVP
```

## ✨ Ключевые особенности

- **Server-Authoritative**: Сервер — единственный источник истины
- **Real-time Sync**: WebSocket синхронизирует Admin ↔ Display мгновенно
- **Timer Independence**: Таймер считается от серверного времени, не от клиента
- **Graceful Pause/Resume**: Сохраняет оставшееся время корректно
- **Auto-Transition**: Автоматический переход уровней по времени
- **Reconnection**: Новый клиент получает актуальное состояние при подключении

## 🎯 Дальнейшая разработка

После проверки MVP можно добавить:

1. **Редактирование турнира** - изменять уровни в админке
2. **Сохранение в БД** - PostgreSQL вместо in-memory
3. **Управление игроками** - добавить игроков и стеки
4. **Подсчёт банка** - tracking главного банка
5. **История раздач** - сохранять каждую раздачу
6. **Статистика** - показывать статистику игроков
7. **PWA** - работать offline

## 📞 Поддержка

Если что-то не работает:

1. Проверьте, что оба сервера запущены
2. Откройте DevTools (F12) → Console
3. Ищите ошибки в консоли
4. Смотрите Network tab для WebSocket соединения
5. Запустите `npm run test:run` в server папке

---

**Готово!** Приложение полностью функционально и готово к использованию. 🎉
