import * as Websocket from 'ws';

export type Rooms = {
    [uuid: string]: Array<{ client: Websocket}>;
};

export type SocketMessage = {
    type: string;
    data: any;
}

export interface Socket extends Websocket {
    uuid: string;
}

export interface SocketServer extends Websocket.Server {
    clients: Set<Socket>
}