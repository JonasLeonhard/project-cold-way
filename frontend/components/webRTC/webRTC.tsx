import React, { useEffect } from 'react';
import StyledWebRTC from './webRTC.style';
import { useWebSocketContext } from '../../contexts/WebSocketContext';
import { initJanus, initSession, attachVideoRoom } from './helper/janus';

type WebRTCProps = {
    uuid: string;
};

const WebRTC: React.FC<WebRTCProps> = ({ uuid }: WebRTCProps) => {
  const { ws, messages, room } = useWebSocketContext();

  useEffect(() => {
    //? Only initialize janus in the browser
    if (typeof window !== 'undefined' && room.uuid && room.uuid.length > 0) {
      initJanus().then(() => initSession().then(janus => {
        attachVideoRoom(janus, uuid);
      }));
    }
  }, [room]);

  return (
    <StyledWebRTC>
        webRTC... uuid: {uuid}
    </StyledWebRTC>
  )
}

export default WebRTC