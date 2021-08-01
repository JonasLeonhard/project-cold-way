import React, { useEffect, useState } from 'react';
import StyledWebRTC from './webRTC.style';
import { useWebSocketContext } from '../../contexts/WebSocketContext';
import { StreamManager, JanusEventType } from './helper/janus';
import { useAuthContext } from '../../contexts/AuthContext';

type WebRTCProps = {
  uuid: string;
};

const WebRTC: React.FC<WebRTCProps> = ({ uuid }: WebRTCProps) => {
  const { room } = useWebSocketContext();
  const { auth } = useAuthContext();
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [streamManager, setStreamManager] = useState<StreamManager>(undefined);

  useEffect(() => {
    if (!streamManager && typeof window !== 'undefined' && room.uuid && room.uuid.length > 0 && room?.janusRoom?.id) {
      const localStreamManager = new StreamManager(room, auth)
      setStreamManager(localStreamManager);

      window.addEventListener('janus', (e: Event) => {
        const jEvent: JanusEventType = e['detail'];
        switch (jEvent.event) {
          case 'videoroom__publisher__consent-dialog':
            setShowConsentDialog(jEvent.data.on);
            break;
          case 'videoroom__publisher__published-feed':
            console.debug('publishedFeed id: ', localStreamManager.publisherJanusId);
            break;
          case 'videoroom__subscriber__remote-stream':
            console.debug('feeds subscribed to are:', localStreamManager.subscribedToPublishers);
            break;
          case 'janus-ui':
            if (jEvent.data.handle === 'exit-call') {
              localStreamManager.unpublishFeed();
            } else if (jEvent.data.handle === 'microphone-toggle') {
              console.log('microphone-toggle');
            } else if (jEvent.data.handle === 'video-toggle') {
              console.log('video-toggle');
            } else if (jEvent.data.handle === 'details-toggle') {
              console.log('details-toggle');
            }
            break;
          default:
            console.debug('unhandled janus event', jEvent);
            break;
        }
      });
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

        <div className="webRTC__media-stream-wrapper"></div>


      {streamManager && streamManager?.subscribedToPublishers && Object.values(streamManager?.subscribedToPublishers).map(publisher => {
        return <div>
            id: {publisher.id} <br/>
            talking: {publisher.talking.toString()}<br/>
            display: {publisher.display}<br/>
            video_codec: {publisher.video_codec}<br/>
            audio_codec: {publisher.audio_codec}<br/>
            mediaStream: {(!!publisher.mediaStream).toString()}<br/>
        </div>
      })}
    </StyledWebRTC>
  )
}

export default WebRTC