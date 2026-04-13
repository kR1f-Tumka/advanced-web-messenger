import { WebSocketServer, WebSocket } from 'ws';
import { z } from 'zod';

// --- Схема сообщения (валидация Zod) ---
const MessageSchema = z.object({
  type: z.enum(['auth', 'message', 'typing', 'stop_typing', 'user_list', 'error']),
  payload: z.any(),
});

const AuthPayloadSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
});

const MessagePayloadSchema = z.object({
  text: z.string().min(1).max(500),
});

// --- Типы на основе схем ---
type Message = z.infer<typeof MessageSchema>;
type AuthPayload = z.infer<typeof AuthPayloadSchema>;
type MessagePayload = z.infer<typeof MessagePayloadSchema>;

// --- Хранилище активных соединений (без БД) ---
interface Client {
  ws: WebSocket;
  username: string;
}

const clients = new Map<WebSocket, Client>();

// --- Вспомогательные функции ---
function broadcast(message: Message, exclude?: WebSocket) {
  const data = JSON.stringify(message);
  clients.forEach((client, ws) => {
    if (ws !== exclude && ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });
}

function sendTo(ws: WebSocket, message: Message) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function getUserList(): string[] {
  return Array.from(clients.values()).map(c => c.username);
}

// --- Запуск сервера ---
const wss = new WebSocketServer({ port: 8080 });
console.log('🚀 WebSocket server started on ws://localhost:8080');

wss.on('connection', (ws) => {
  console.log('🔗 New client connected');

  ws.on('message', (data) => {
    try {
      const rawMessage = JSON.parse(data.toString());
      const parsedMessage = MessageSchema.parse(rawMessage);

      switch (parsedMessage.type) {
        case 'auth': {
          const authPayload = AuthPayloadSchema.parse(parsedMessage.payload);
          const username = authPayload.username;

          // Проверка на уникальность имени
          const isUsernameTaken = Array.from(clients.values()).some(c => c.username === username);
          if (isUsernameTaken) {
            sendTo(ws, { type: 'error', payload: { message: 'Username is already taken' } });
            return;
          }

          // Регистрируем клиента
          clients.set(ws, { ws, username });
          console.log(`✅ User "${username}" authenticated`);

          // Отправляем клиенту подтверждение и список пользователей
          sendTo(ws, { type: 'user_list', payload: getUserList() });

          // Уведомляем остальных о новом пользователе
          broadcast({
            type: 'message',
            payload: {
              system: true,
              text: `${username} joined the chat`,
            },
          }, ws);
          broadcast({ type: 'user_list', payload: getUserList() });
          break;
        }

        case 'message': {
          const client = clients.get(ws);
          if (!client) {
            sendTo(ws, { type: 'error', payload: { message: 'Not authenticated' } });
            return;
          }

          const messagePayload = MessagePayloadSchema.parse(parsedMessage.payload);
          broadcast({
            type: 'message',
            payload: {
              username: client.username,
              text: messagePayload.text,
              timestamp: Date.now(),
            },
          });
          break;
        }

        case 'typing': {
          const client = clients.get(ws);
          if (!client) return;
          broadcast({
            type: 'typing',
            payload: { username: client.username },
          }, ws);
          break;
        }

        case 'stop_typing': {
          const client = clients.get(ws);
          if (!client) return;
          broadcast({
            type: 'stop_typing',
            payload: { username: client.username },
          }, ws);
          break;
        }
      }
    } catch (error) {
      console.error('❌ Invalid message received:', error);
      sendTo(ws, { type: 'error', payload: { message: 'Invalid message format' } });
    }
  });

  ws.on('close', () => {
    const client = clients.get(ws);
    if (client) {
      console.log(`👋 User "${client.username}" disconnected`);
      clients.delete(ws);
      broadcast({
        type: 'message',
        payload: {
          system: true,
          text: `${client.username} left the chat`,
        },
      });
      broadcast({ type: 'user_list', payload: getUserList() });
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});