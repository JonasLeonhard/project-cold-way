import { useRouter } from 'next/router'
import { WebSocketProvider } from '../../contexts/WebSocketContext';

import Default from '../../templates/default';
import Chat from '../../components/chat/chat';

const UuidPage = ({ uuid }: { uuid: string }) => {
    return (
        <Default title={`Room: ${uuid ? uuid : 'loading...'}`} description={`Raum mit UUID: ${uuid}`} noindex={true} nofollow={true} >
            <WebSocketProvider roomUuid={uuid}>
                <div>
                    <Chat uuid={uuid} />
                </div>
            </WebSocketProvider>
        </Default>
    );
};

export async function getServerSideProps(context) {
    const { uuid } = context.query;

    return {
        props: { uuid: (typeof uuid === 'string') ? uuid : uuid.toString() }
    };
}

export default UuidPage;
