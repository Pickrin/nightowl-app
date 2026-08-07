import { WebSocketServer } from 'ws';
import { db } from './db.js';

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  const clients = new Map(); // userId -> ws connection

  wss.on('connection', (ws) => {
    let currentUserId = null;

    ws.on('message', (raw) => {
      try {
        const payload = JSON.parse(raw);
        const { type, data } = payload;

        switch (type) {
          case 'auth': {
            currentUserId = data.userId;
            clients.set(currentUserId, ws);
            ws.send(JSON.stringify({ type: 'authenticated', data: { userId: currentUserId } }));
            break;
          }

          case 'send_message': {
            const { chatId, recipientId, text, mediaUrl, isEphemeral, expiresInSeconds } = data;
            
            const savedMsg = db.saveMessage(chatId, {
              senderId: currentUserId,
              recipientId,
              text,
              mediaUrl,
              isEphemeral: isEphemeral || false,
              expiresInSeconds: expiresInSeconds || (isEphemeral ? 6 : 0),
              isOpened: false
            });

            // Send back to sender for immediate confirmation
            ws.send(JSON.stringify({ type: 'message_sent', data: savedMsg }));

            // Dispatch to recipient if online
            const recipientSocket = clients.get(recipientId);
            if (recipientSocket && recipientSocket.readyState === 1) {
              recipientSocket.send(JSON.stringify({
                type: 'new_message',
                data: savedMsg
              }));
            }
            break;
          }

          case 'typing': {
            const { recipientId, isTyping } = data;
            const recipientSocket = clients.get(recipientId);
            if (recipientSocket && recipientSocket.readyState === 1) {
              recipientSocket.send(JSON.stringify({
                type: 'user_typing',
                data: { userId: currentUserId, isTyping }
              }));
            }
            break;
          }

          case 'screenshot_detected': {
            const { recipientId, chatId } = data;
            const recipientSocket = clients.get(recipientId);
            if (recipientSocket && recipientSocket.readyState === 1) {
              recipientSocket.send(JSON.stringify({
                type: 'screenshot_alert',
                data: {
                  chatId,
                  senderId: currentUserId,
                  timestamp: new Date().toISOString(),
                  warning: '⚠️ Privacy Alert: Your chat partner attempted to capture a screenshot or screen recording.'
                }
              }));
            }
            break;
          }

          case 'burn_chat': {
            const { chatId, recipientId } = data;
            db.burnChat(chatId, currentUserId);

            // Notify sender
            ws.send(JSON.stringify({
              type: 'chat_burned',
              data: { chatId, message: 'Conversation was permanently incinerated.' }
            }));

            // Notify recipient
            const recipientSocket = clients.get(recipientId);
            if (recipientSocket && recipientSocket.readyState === 1) {
              recipientSocket.send(JSON.stringify({
                type: 'chat_burned',
                data: { chatId, message: 'Your conversation was permanently incinerated by the other participant.' }
              }));
            }
            break;
          }

          case 'ephemeral_viewed': {
            const { messageId, chatId, recipientId } = data;
            const recipientSocket = clients.get(recipientId);
            if (recipientSocket && recipientSocket.readyState === 1) {
              recipientSocket.send(JSON.stringify({
                type: 'ephemeral_expiring',
                data: { messageId, chatId, duration: 6 }
              }));
            }
            break;
          }

          default:
            console.log('Unknown socket event:', type);
        }
      } catch (e) {
        console.error('Socket message parse error:', e);
      }
    });

    ws.on('close', () => {
      if (currentUserId) {
        clients.delete(currentUserId);
      }
    });
  });

  console.log('⚡ Real-time WebSocket Gateway active on /ws');
  return wss;
}
