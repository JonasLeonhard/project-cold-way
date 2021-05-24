import { useState, useEffect } from 'react';
import { useRouter } from 'next/router'

import { WebSocketProvider } from '../../contexts/WebSocketContext';
import Default from '../../templates/default';

import { Spin, Alert } from 'antd';

const UuidPage = () => {
    const router = useRouter()
    const { uuid } = router.query
    const [loadingMsg, setLoadingMsg] = useState('...Loading');

   
    
    useEffect(() => {
        setLoadingMsg('...Initialize Websocket');
    }, []);

    return (
        <WebSocketProvider>
            <Default title={`Room: ${uuid}`} description={`Raum mit UUID: ${uuid}`} noindex={true} nofollow={true} >
                <div>
                    uuid: {uuid}
                    <Spin tip={loadingMsg} />

                    <noscript>
                        <div>
                            *You need to have Javascript enabled for this functionality to load.
                        </div>
                    </noscript>
                </div>
            </Default>
        </WebSocketProvider>
    );
};

export default UuidPage;
