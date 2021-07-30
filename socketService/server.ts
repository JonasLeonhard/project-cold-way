require('dotenv').config()
import * as express from 'express';
import * as createError from 'http-errors';
import * as Websocket from 'ws';
import { v4 as uuidV4, validate } from 'uuid';
import { Socket, SocketMessage, SocketServer, JanusRoom } from './types';

const cors = require('cors');

const app = express();

const indexRouter = require('./routes/index');
const wsRouter = require('./routes/websocket');

// ? Express Configuration
app.set('port', process.env.PORT || 4001);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

// Routes
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err: any, req: any, res: any, next: any) => {
    // only providing error in development
    const errRes: { status: any, error?: any } = {
        status: err.status || 500
    };
    if (req.app.get('env') === 'development') {
        errRes.error = err;
    }

    res.status(err.status || 500);
    res.send(errRes);
});

const server = app.listen(app.get('port'), () => {
    console.log(`🐲 Server started on port: (${app.get('port')})`);
});

/**
 * ? Setup Websocket Server and Listen for connections
 * messages have to be a JSON string of types.ts {SocketMessage}
 */
const wss = new Websocket.Server({ server: server, path: undefined, maxPayload: 100000 }) as SocketServer;
/**
 * Define wss helper functions:
 */
wss.broadcast = (sockets: Set<Socket>, socketMessage: SocketMessage, broadcasting?: Socket) => {
    sockets?.forEach(client => {
        if (broadcasting !== client && client.readyState === client.OPEN) {
            client.deploy(socketMessage);
        }
    });
};
wss.rooms = {};

//? JANUS SETUP
wss.janus = {
    /**
     * Create a Janus Video Room, returns the roomId
     */
    ws: undefined, // undefined if there is no webrtc_server available
    connected: false, // wether or not the socket connection is open
    sessionId: null, // id of the session of janus
    handleId: null, // id of the plugin handle of janus
    init: () => {
        wss.janus.ws = new Websocket(process.env.WEBRTC_SERVER || 'ws://localhost:8188', 'janus-protocol');
        
        wss.janus.ws?.on('open', () => {
            wss.janus.connected = true;
            console.log('🐲 Janus WebRTC - Websocket adapter Connected! using', process.env.WEBRTC_SERVER || 'ws://localhost:8188');
            wss.janus.establishSession();
        });
        wss.janus.ws?.on('close', () => {
            console.log('🐲 Janus WebRTC - Websocket adapter connection dropped. Is your janus instance running? using:', process.env.WEBRTC_SERVER || 'ws://localhost:8188')
            wss.janus.connected = false;
            wss.janus.sessionId = null;
            wss.janus.handleId = null;
        });
        wss.janus.ws?.on('error', (err) => {
            console.log('🐲 Continuing without Janus WebRTC adapter Support. This is most likely because the connection to the janus instance could not be established. Error:', err, " using:", process.env.WEBRTC_SERVER || 'ws://localhost:8188');
        });

        // Handle Incoming messages from janus server
        wss.janus.ws?.on('message', (data: any) => {
            const parsed = JSON.parse(data);
            console.log('got message', parsed);
            // Janus Session is established, connect to plugin
            if (parsed.transaction === 'socketService_establishSession') {
                wss.janus.sessionId = parsed.data.id;
                wss.janus.connectSessionToVideoPlugin();
            // connected to plugin successfully
            } else if (parsed.transaction === 'socketService_connectSessionToVideoPlugin') {
                wss.janus.handleId = parsed.data.id;
            // a new room was created by janus
            } else if (parsed.transaction?.includes('socketService_createRoom::')) {
                const janusRoomUUID = parsed.transaction.split('::')[1];
                wss.broadcast(wss.rooms[janusRoomUUID].connectedClients, { 
                        type: 'janus-created-room', 
                        data: { 
                            uuid: janusRoomUUID, 
                            janusRoom: { id: parsed.plugindata.data.room }
                        }
                });
            // on close empty rooms successfully
            } else if (parsed.transaction?.includes('socketService_closeRoom::')) {
                const janusRoomUUID = parsed.transaction.split('::')[1];
                console.log('Destroyed empty room: ', janusRoomUUID);
            }
        });

        // send keepalive, otherwise janus will drop the session.
        setInterval(() => {
            if (wss.janus.sessionId) {
                wss.janus.ws?.send(JSON.stringify({
                    "janus": "keepalive",
                    "session_id": wss.janus.sessionId,
                    "transaction": "socketService_keepalive"
                }));
            }
        }, 10000);// <- change this interval according to janus.jcfg session_timeout
    },
    establishSession: () => {
        console.log('🐲 Janus WebRTC - establish session ...');
        wss.janus.ws?.send(JSON.stringify({
            "janus": "create",
            "transaction": "socketService_establishSession"
        }));
    },
    connectSessionToVideoPlugin: () => {
        console.log('🐲 Janus WebRTC - connect to video plugin handle ...');
        wss.janus.ws?.send(JSON.stringify({
            "janus": "attach",
            "session_id": wss.janus.sessionId,
            "plugin": "janus.plugin.videoroom",
            "transaction": "socketService_connectSessionToVideoPlugin"
        }));
    },
    createRoom: (uuid: string) => {
        console.log('called janus createRoom', wss.janus.handleId, wss.janus.sessionId);
        wss.janus.ws?.send(JSON.stringify({
            "janus": "message",
            "session_id": wss.janus.sessionId,
            "handle_id": wss.janus.handleId,
            "transaction": `socketService_createRoom::${uuid}`,
            "body": {
                "admin_key": process.env.JANUS_ADMIN_KEY,
                "request": "create",
                "permanent": false,
                "description": `Room for UUID::${uuid}`,
                "pin": uuid,
                "is_private": true
            }
        }));
    },
    closeRoom: (uuid: string) => {
        const janusRoomId = wss.rooms[uuid]?.janusRoom?.id
        wss.janus.ws?.send(JSON.stringify({
            "janus": "message",
            "session_id": wss.janus.sessionId,
            "handle_id": wss.janus.handleId,
            "transaction": `socketService_closeRoom::${uuid}`,
            "body": {
                "admin_key": process.env.JANUS_ADMIN_KEY,
                "request": "destroy",
                "room": janusRoomId
            }
        }));
    }
};
wss.janus.init();


wss.joinRoom = (ws: Socket, roomUuid: string): Set<Socket> | undefined => {
    if (!validate(roomUuid)) {
        ws.deploy({ type: 'error', data: 'JoinRoomError: Invalid uuid, has to be a valid uuid.' });
        return undefined;
    }
    //? Room exists:
    if (wss.rooms[roomUuid]) {
        return wss.rooms[roomUuid].connectedClients.add(ws)
    }
    //? Create the room:
    wss.rooms[roomUuid] = { connectedClients: new Set([ws]), janusRoom: undefined };
    //? Set janus to create the Webrtc room
    wss.janus.createRoom(roomUuid);
    return wss.rooms[roomUuid].connectedClients;
};

wss.on('connection', (ws: Socket) => {
    /**
     * Define ws helper functions:
     */
    ws.uuid = uuidV4();
    ws.deploy = (socketMessage: SocketMessage) => {
        ws.send(JSON.stringify(socketMessage));
    }

    /**
     * Sub-protocols
     */
    ws.on('message', (data: any) => {
        try {
            const request: { type?: string, data?: any } = JSON.parse(data);
            if (request?.type && request?.data) {
                wsRouter(ws, wss, request);
            } else {
                ws.deploy({ type: 'error', data: 'Payload error: Try sending request message in json format { "type": "string", "data": "any" }' });
            }
        } catch (err) {
            ws.deploy({ type: 'error', data: 'Catch Payload error: Try sending request message in valid json format { "type": "string", "data": "any" }' });
        }
    });

    ws.on('close', () => {
        if (ws.inRoomUuid) {
            wss.rooms[ws.inRoomUuid]?.connectedClients?.delete(ws);
            wss.broadcast(wss.rooms[ws.inRoomUuid].connectedClients, { type: 'close', data: ws.uuid });
            
            // send close request to janus if room is empty now
            if (wss.rooms[ws.inRoomUuid]?.connectedClients.size === 0) {
                // @ts-ignore
                wss.janus.closeRoom(ws.inRoomUuid);
            }
        }

    });

    ws.on('error', (err: string) => {
        ws.deploy({ type: 'error', data: 'MayPayload exeeded error: Only 100000 bytes allowed in message.' });
    });

    ws.deploy({ type: 'connection', data: true });
});