require('dotenv').config()
import * as express from 'express';
import sequelizeInit from './sequelize';
import * as path from 'path';
import * as createError from 'http-errors';
import * as Websocket from 'ws';
import { v4 as uuidV4, validate } from 'uuid';
import { Socket, SocketMessage, SocketServer } from './types';

const app = express();

const indexRouter = require('./routes/index');
const wsRouter = require('./routes/websocket');

// ? Express Configuration
app.set('port', process.env.PORT || 4000);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

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

//? Sequelize init
sequelizeInit().then(db => {
    db.sequelize.sync();


    const server = app.listen(app.get('port'), () => {
        console.log(`🐲 Server started on port: ${app.get('port')})`);
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
    wss.joinRoom = (ws: Socket, roomUuid: string): Set<Socket> | undefined => {
        if (!validate(roomUuid)) {
            ws.deploy({ type: 'error', data: 'JoinRoomError: Invalid uuid, has to be a valid uuid.' });
            return undefined;
        }
        if (wss.rooms[roomUuid]) {
            return wss.rooms[roomUuid].add(ws)
        }
        wss.rooms[roomUuid] = new Set([ws]);
        return wss.rooms[roomUuid];
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
                wss.rooms[ws.inRoomUuid]?.delete(ws);
                wss.broadcast(wss.rooms[ws.inRoomUuid], { type: 'close', data: ws.uuid });
            }
        });

        ws.on('error', (err: string) => {
            ws.deploy({ type: 'error', data: 'MayPayload exeeded error: Only 100000 bytes allowed in message.' });
        });

        ws.deploy({ type: 'connection', data: true });
    });
});