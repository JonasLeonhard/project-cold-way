import React, { useEffect, useState } from 'react';
import StyledWebRTC from './webRTC.style';
import { useWebSocketContext } from '../../contexts/WebSocketContext';
import { StreamManager, JanusEventType } from './helper/janus';
import { useAuthContext } from '../../contexts/AuthContext';

type WebRTCProps = {
  uuid: string;
};

const WebRTC: React.FC<WebRTCProps> = ({ uuid }: WebRTCProps) => {
  const { ws, messages, room } = useWebSocketContext();
  const { auth } = useAuthContext();
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [streamManager, setStreamManager] = useState<StreamManager>(undefined);

  useEffect(() => {
    window.addEventListener('janus', (e: Event | JanusEventType) => {
      // if(e.event === 'videoroom__publisher__consent-dialog') {
      //   setShowConsentDialog(e.data.on);
      // }
      console.log('e:', e['detail']);
    });
  }, []);
  
  useEffect(() => {
    if (!streamManager && typeof window !== 'undefined' && room.uuid && room.uuid.length > 0 && room?.janusRoom?.id) {
      const localStreamManager = new StreamManager(ws, room, auth)
      setStreamManager(localStreamManager);
    } else {
      console.error('webRTC error, room or janus room not initialized!');
    }
  }, [room]);

  return (
    <StyledWebRTC>
      webRTC... uuid: {uuid}

      {showConsentDialog &&
        <div>
          consent dialog...
        </div>}
    </StyledWebRTC>
  )
}

export default WebRTC