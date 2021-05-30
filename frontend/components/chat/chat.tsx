import React, { useState, useEffect } from 'react';
import StyledChat from './chat.style';
import { useWebSocketContext } from '../../contexts/WebSocketContext';
import { Spin, Button, Tooltip, Input } from 'antd';
import { v4 as uuidV4 } from 'uuid';
import { WebSocketSendRequest } from '../../@types/types';

type ChatPropTypes = {
    className?: string;
    uuid: string;
};

const Chat: React.FC<ChatPropTypes> = ({ className, uuid }: ChatPropTypes) => {
    const { ws, messages, room } = useWebSocketContext();
    const [loadingMsg, setLoadingMsg] = useState('...Loading');
    const [loading, setLoading] = useState(true);
    const [inputValue, setInputValue] = useState('');

    const sendMessage = (msg: string) => {
        ws.deploy({ type: 'message-room', data: msg });
    };

    const renderMessage = (msg: WebSocketSendRequest) => {
        switch (msg.type) {
            case 'message-room':
                return msg.data.message;
            case 'messaged-room':
                return msg.data;
            default:
                return msg.type
        }
    }

    useEffect(() => {
        setLoadingMsg(messages.mostRecent.type);
        if (messages.mostRecent.type === 'joined-room') {
            setLoading(false);
        }
    }, [messages]);

    return (
        <StyledChat className={className} open>
            <div className="chat__content">
                uuid: {uuid}
                {loading && <Spin tip={loadingMsg} />}
                {!loading && <>
                    {messages.queue.map(msg => {
                        return <div key={uuidV4()}>{renderMessage(msg)}</div>;
                    })}
                </>}
            </div>
            <div className="chat__controls">
                <Tooltip
                    trigger={['focus']}
                    title="Send a message to the room"
                    placement="top"
                >
                    <Input
                        placeholder="message..."
                        className="chat__message-input"
                        name="message"
                        value={inputValue}
                        allowClear
                        onChange={e => { setInputValue(e.target.value) }}
                        onKeyDown={e => { if (e.key === 'Enter') sendMessage(inputValue) }}
                    />
                </Tooltip>
                <Button type="primary" block className="chat-message-button" onClick={() => sendMessage(inputValue)}>Send</Button>
            </div>

            <noscript>
                <div>
                    *You need to have Javascript enabled for this functionality to load.
                    </div>
            </noscript>
        </StyledChat>
    )
}

export default Chat