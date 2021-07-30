import React, { useEffect, useState } from 'react';
import StyledWebRTC from './webRTC.style';
import { useWebSocketContext } from '../../contexts/WebSocketContext';
import { StreamManager } from './helper/janus';
import { useAuthContext } from '../../contexts/AuthContext';

type WebRTCProps = {
  uuid: string;
};

const WebRTC: React.FC<WebRTCProps> = ({ uuid }: WebRTCProps) => {
  const { ws, messages, room } = useWebSocketContext();
  const { auth } = useAuthContext();
  const [janusInitialized, setJanusInitialized] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(false);

  useEffect(() => {
    //? Only initialize janus in the browser
    if (!janusInitialized && typeof window !== 'undefined' && room.uuid && room.uuid.length > 0 && room?.janusRoom?.id) {
      new StreamManager(room, auth, setShowConsentDialog);
      setJanusInitialized(true);
    } else {
      console.log('could not initialize janus - room:', room, 'janus initialized already?:', janusInitialized);
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