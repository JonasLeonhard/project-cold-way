
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
    janusRoom?: {
        id: number;
    }
};

export type WebSocketContextType = {
    ws: Ws;
    messages: WebSocketMessages;
    room: WebSocketRoom;
};

export type AuthUser = {
    email: string,
    password: string,
    displayName: string,
    providerId: string,
    provider: string,
    businessName: string,
    firstName: string,
    lastName: string
}

export type Auth = {
    user: AuthUser,
    status: 'SIGNED_OUT' | 'SIGNED_IN'
}

export type AuthContextType = {
    auth: Auth,
    login: (values: Object) => Promise<boolean>,
    logout: () => Promise<boolean>,
    register: (values: Object)  => Promise<boolean>
}