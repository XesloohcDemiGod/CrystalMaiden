import { WebSocketServer } from 'ws';
import { Server } from 'http';

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', ws => {
    ws.on('message', message => {
      const data = JSON.parse(message.toString());

      // Broadcast updates to all connected clients
      wss.clients.forEach(client => {
        if (client !== ws) {
          client.send(
            JSON.stringify({
              type: 'update',
              data: data,
            })
          );
        }
      });
    });
  });

  return wss;
}
