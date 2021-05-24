import * as Websocket from 'ws';

export type Rooms = {
    [uuid: string]: Array<{ client: Websocket}>;
};

export type SocketMessage = {
    type: string;
    data: any;
}

export interface Socket extends Websocket {
    /**
     * uuid v4 created when connecting to wss.
     */
    uuid: string;

    /**
     * uuid of the room the Socket is currently inside of.
     */
    inRoomUuid?: string;

    /**
     * uses ws.send(JSON.stringify(socketMessage));
     */
     deploy: (socketMessage: SocketMessage) => void;
}

export interface SocketServer extends Websocket.Server {
        /**
     * SocketMessage to send to all sockets excluding the broadcasting socket if it is included in the sockets set
     * @return this broadcasts: socket.send(JSON.stringify(socketMessage));
     */
    broadcast: (sockets: Set<Socket>, socketMessage: SocketMessage, broadcasting?: Socket) => void;
    clients: Set<Socket>
    rooms: { [uuid: string]: Set<Socket> };
    /**
     * Adds Socket to wss.rooms[roomUuid] or creates a new room if it doesn't exist yet. 
     * @return {boolean} Returns the joined room or undefined if the uuid is not valid.
     */
    joinRoom: (ws: Socket, roomUuid: string) => Set<Socket> | undefined;
}