import React from 'react';
import StyledWebRTC from './webRTC.style';

type WebRTCProps = {
    uuid: string;
};

const WebRTC: React.FC<WebRTCProps> = ({ uuid }: WebRTCProps) => {
  return (
    <StyledWebRTC>
        webRTC... uuid: {uuid}
    </StyledWebRTC>
  )
}

export default WebRTC