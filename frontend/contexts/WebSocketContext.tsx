import React, { createContext, useContext, useState, useEffect } from 'react'
import { WebSocketContextType, WebSocketSendRequest, WebSocketRoom, WebSocketMessages, Ws } from '../@types/types';

const WebSocketContext = createContext<WebSocketContextType>({ 
    ws: null, 
    messages: {
        queue: undefined,
        mostRecent: undefined
    },
    room: undefined 
});


const WebSocketProvider = ({ children, roomUuid }: { children: any; roomUuid: string}) => {
    const [ ws, setWs ] = useState<Ws>(undefined); // can only be instantiated in the client
    const [messages, setMessages] = useState<WebSocketMessages>({
        queue: [{ type: 'connecting', data: true }],
        mostRecent: { type: 'connecting', data: true }
    });
    const [ room, setRoom ] = useState<WebSocketRoom>({
        uuid: undefined
    });

    const handleMessage = (jsonData: WebSocketSendRequest) => {
        switch(jsonData.type) {
            case 'connection': 
                ws.send(JSON.stringify({ type: 'join-room', data: { roomUuid }}))
                break;
            case 'joined-room':
                setRoom(jsonData.data.uuid);
                break;
            default:
                console.error('WebsocketContext - HandleMessageError: unhandled type: ', jsonData);
        }

    };

    useEffect(() => {
        if (messages.queue.length > 1) {
            handleMessage(messages.mostRecent);
        }
    }, [messages])

    if (!ws && typeof window !== 'undefined') {
        const wsHost = 'localhost:4000';
        const socket = new WebSocket(`ws://${wsHost}`) as Ws;
        socket.addEventListener('message', wsData => {
            try {
                setMessages(prev => {     
                    const parsed = JSON.parse(wsData.data);  
                    return { 
                        ...prev, 
                        queue: [...prev.queue, parsed], 
                        mostRecent: parsed 
                    }; 
                });              
            } catch (err) {
                console.log('WebsocketContext - parse err', err);
                setMessages(prev => { 
                    return { 
                        ...prev, 
                        queue: [...prev.queue, { type: 'connection', data: false }], 
                        mostRecent: { type: 'connection', data: false } 
                    }
                });
            }
        });

        socket.deploy = (message: WebSocketSendRequest) => {
            socket.send(JSON.stringify(message));
        }
        setWs(socket)
    }

    return (
        <WebSocketContext.Provider value={{ ws, messages, room }}>
            {children}
        </WebSocketContext.Provider>
    )
}

const useWebSocketContext = (): WebSocketContextType => {
	return useContext(WebSocketContext);
}

export { WebSocketContext, WebSocketProvider, useWebSocketContext };