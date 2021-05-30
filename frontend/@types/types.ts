
export type WebSocketSendRequest = {
    type: string;
    data: any;
};

export interface Ws extends WebSocket {
    deploy: (msg: WebSocketSendRequest) => void;
};

export type WebSocketMessages = {
    queue: Array<WebSocketSendRequest>;
    mostRecent: WebSocketSendRequest;
};

export type WebSocketRoom = {
    uuid: string | undefined;
};

export type WebSocketContextType = {
    ws: Ws;
    messages: WebSocketMessages;
    room: WebSocketRoom;
};