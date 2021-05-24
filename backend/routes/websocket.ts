import { Socket, SocketServer, SocketMessage, Rooms } from '../types';
import { validate } from 'uuid';
/**
 * wsRouter gets called wss.on('connection', ...).on('message') , protocol, sub-protocol: 'connection' -> 'message'
 *  */ 
const wsRouter = (ws: Socket, wss: SocketServer, request: SocketMessage) => {
  switch (request.type) {
    case 'join-room':
      return joinRoom(ws, wss, request);
    case 'exit-room':
      return exitRoom(ws, wss, request);
    case 'message-room':
      return messageRoom(ws, wss, request);
    default:
      return ws.deploy({ type: 'error', data: 'DataType error: Data.type is not supported'});
  }
};


function joinRoom(ws: Socket, wss: SocketServer, request: SocketMessage) {
  if (!request.data.roomUuid) {
    ws.deploy({ type: 'error', data: 'Data error: invalid data - join-room requires SocketMessage<{ "type": "join-room", "data": { "roomUuid": "valid-uuid-string" }}'})
  }
  if (ws.inRoomUuid) {
    ws.deploy({ type: 'error', data: `JoinRoomError: Your socket is already in the room ${ws.inRoomUuid}. Please use type: 'exit-room' instead`});
  }
  
  const room = wss.joinRoom(ws, request.data.roomUuid);
  if (room) {
    wss.broadcast(room, { type: 'connection', data: request.data.roomUuid }, ws);
    ws.inRoomUuid = request.data.roomUuid;
  }
};

function exitRoom(ws: Socket, wss: SocketServer, request: SocketMessage) {
  if (ws.inRoomUuid) {
    wss.rooms[ws.inRoomUuid]?.delete(ws);
    wss.broadcast(wss.rooms[ws.inRoomUuid], { type: 'close', data: ws.uuid }, ws);
    ws.inRoomUuid = undefined;
  }
  ws.deploy({ type: 'exit-room', data: { success: !ws.inRoomUuid }});
}

function messageRoom(ws: Socket, wss: SocketServer, request: SocketMessage) {
  if (typeof request.data !== 'string') {
    ws.deploy({ type: 'error', data: 'MessageRoomError: request.data is not a string. requires SocketMessage<{ "type": "message-room", "data": "<string>"'})
  }
  if (!ws.inRoomUuid) {
    ws.deploy({ type: 'error', data: 'MessageRoomError: Socket is not in a room. Use type: "join-room" first, to broadcast a message to a room'});
  } else {
    wss.broadcast(wss.rooms[ws.inRoomUuid], { type: request.type, data: { message: request.data, sender: ws.uuid }}, ws);
  }
}

module.exports = wsRouter;
