import { WebSocketProvider } from '../../contexts/WebSocketContext';
import styled from 'styled-components';
import { color, space } from '../../styles/helper';

import Default from '../../templates/default';
import WebRTC from '../../components/webRTC/webRTC';
import Chat from '../../components/chat/chat';
import { Tabs } from 'antd';

const StyledUuidPage = styled.div`
    display: grid;
    grid-template-columns: 3fr 25rem;
    grid-template-rows: 1fr 2rem;
    width: 100vw;
    height: calc(100vh - var(--header-height));
    overflow: hidden;

    .uuidPage__main,
    .uuidPage__options,
    .uuidPage__sub-options {
        overflow: scroll;
    }

    .uuidPage__options {
        border-left: 1px solid ${color('grey', 50)};
    }
    .uuidPage__sub-options {
        grid-column: 1 / span 2;
        box-shadow: 0 2px 8px ${color('shadow')};
    }
    .uuidPage__tabs {
        height: 100%;

        .ant-tabs-content {
            height: 100%;
        }

        .ant-tabs-nav-list {
            padding: 0 ${space('m')};
        }
    }
`;

const UuidPage = ({ uuid }: { uuid: string }) => {
    const { TabPane } = Tabs;

    const onTabChange = key => {
        console.log('onTabChange: ', key);
    };

    return (
        <Default title={`Room: ${uuid ? uuid : 'loading...'}`} description={`Raum mit UUID: ${uuid}`} noindex={true} nofollow={true} >
            <WebSocketProvider roomUuid={uuid}>
                <StyledUuidPage className="uuidPage__ui">
                    <div className="uuidPage__main">
                        <WebRTC uuid={uuid} />
                    </div>
                    <div className="uuidPage__options">
                        <Tabs defaultActiveKey="1" onChange={onTabChange} className="uuidPage__tabs">
                            <TabPane tab="Chat" key="1">
                                <Chat uuid={uuid} />
                            </TabPane>
                            <TabPane tab="Users" key="2">
                                ... users here ...
                            </TabPane>
                        </Tabs>
                    </div>
                    <div className="uuidPage__sub-options">
                        sub-options...
                    </div>
                </StyledUuidPage>
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
