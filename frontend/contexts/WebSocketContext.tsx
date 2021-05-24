import React, { createContext, useContext, useState, useEffect } from 'react'

const WebSocketContext = createContext({});

export default WebSocketContext;

export function useWebSocketContext() {
	return useContext(WebSocketContext);
}

export function WebSocketProvider({ children }) {
    const [context, setContext] = useState<{ ws: WebSocket }>(); 
    const [dataQueue, setDataQueue] = useState([]);

    const handleMessage = (jsonData: { type: string, data: any }) => {
        switch(jsonData.type) {
            case 'connection': 
                console.log('onConnection')
                context.ws.send(JSON.stringify({ type: 'join-room', data: { roomUuid: '8a826070-611c-4f35-afb9-586a83d9cef9'}}))
                break;
            case 'message-room':
                console.log('messageRoom');
            default:
                console.error('HandleMessageError: unhandled type: ', jsonData);
        }
    };

    useEffect(() => {
        console.log('dataQueue', dataQueue);
        if (dataQueue.length > 0) {
            handleMessage(dataQueue[dataQueue.length - 1]);
        }
    }, [dataQueue])

    if (!context && typeof window !== 'undefined') {
        const wsHost = 'localhost:4000';
        const ws = new WebSocket(`ws://${wsHost}`);
   
        ws.addEventListener('message', data => {
            try {
                setDataQueue(oldDataQueue => [...oldDataQueue, JSON.parse(data.data)]);
            } catch (err) {
                console.log('err', err);
            }
        });

        setContext({ ws });
    }

    return (
        <WebSocketContext.Provider value={context}>
            {children}
        </WebSocketContext.Provider>
    )
}