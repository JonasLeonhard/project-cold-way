import { Socket, SocketServer, SocketMessage, Rooms } from '../types';

const chatRooms: Rooms = {};

/**
 * wsRouter gets called wss.on('connection', ...).on('message') , protocol, sub-protocol: 'connection' -> 'message'
 *  */ 
const wsRouter = (ws: Socket, wss: SocketServer, request: SocketMessage) => {
  switch (request.type) {
    case 'rooms':
      rooms(ws, wss, request);
      break;
    default:
      ws.send(JSON.stringify({ error: 'Data.type not supported'}));
  }
};

function rooms(ws: Socket, wss: SocketServer, request: SocketMessage) {
  if (typeof(request.data) !== 'string') {
    return ws.send(JSON.stringify({ error: 'Invalid type of data. Required: data: string;'}))
  }
  wss.clients.forEach(client => {
    if (ws !== client && client.readyState === ws.OPEN) {
      client.send(request.data);
    }
  })
}

module.exports = wsRouter;
