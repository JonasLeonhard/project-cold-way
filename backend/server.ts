import * as express from 'express';
import * as path from 'path';
import * as createError from 'http-errors';
import * as Websocket from 'ws';
import { v4 as uuidV4 } from 'uuid';
import { Socket } from './types';

const app = express();

const indexRouter = require('./routes/index');
const wsRouter = require('./routes/websocket');

// Express Configuration
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

const server = app.listen(app.get('port'), () => {
    console.log(`Server started on port: ${app.get('port')})`);
});

/**
 * Setup Websocket Server and Listen for connections
 * messages have to be a JSON string of types.ts {SocketMessage}
 */
const wss = new Websocket.Server({ server: server, path: undefined, maxPayload: 100000 });
wss.on('connection', (ws: Socket) => { 
    ws.uuid = uuidV4();

    ws.on('message', (data: any) => {
        try {

            const request: { type?: string, data?: any } = JSON.parse(data);
            if (request?.type && request?.data ) {
                wsRouter(ws, wss, request);
            } else {
                ws.send(JSON.stringify({ error: 'Message payload error. Try sending request message in json format { "type": "string", "data": "any" }', 'msg': 'Invalid Json format.'}))
            }
        } catch (err) {
            ws.send(JSON.stringify({ error: 'Catch Message payload error. Try sending request message in json format { "type": "string", "data": "any" }', 'msg': 'Invalid Json format.'}));
        }
    });
    
    ws.on('error' , (err: string) => {
        ws.send(JSON.stringify({ error: 'Max payload size exceeded', 'msg': 'Only 100000 bytes allowed in message.', maxPayload: true }));
    });

    ws.send('connected');
})