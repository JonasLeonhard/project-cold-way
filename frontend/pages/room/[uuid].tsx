import { WebSocketProvider } from '../../contexts/WebSocketContext';
import styled from 'styled-components';
import { color, space } from '../../styles/helper';

import Default from '../../templates/default';
import WebRTC from '../../components/webRTC/webRTC';
import Chat from '../../components/chat/chat';
import { Tabs, Tooltip } from 'antd';
import {
    CloseSquareTwoTone,
    QuestionCircleTwoTone,
    AudioTwoTone,
    VideoCameraTwoTone
} from '@ant-design/icons';
import { theme } from '../../styles/helper';

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
        display: flex;
        justify-content: flex-start;
        align-items: center;

        .uuidPage__sub-options-left {
            width: 10rem;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .uuidPage__sub-options-right {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: ${space('s')}
        }
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

    .uuidPage__icon {
        cursor: pointer;
    }
    .uuidPage__icon:hover {
        filter: brightness(90%);
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
                        <div className="uuidPage__sub-options-left">
                            <Tooltip
                                trigger={['hover']}
                                title="Show Details."
                                placement="top"
                            >
                                <QuestionCircleTwoTone twoToneColor={theme.colors.info[100]} className="uuidPage__icon"/>
                            </Tooltip>
                        </div>
                        <div className="uuidPage__sub-options-right">
                            <Tooltip
                                trigger={['hover']}
                                title="Exit Call."
                                placement="top"
                            >
                                <CloseSquareTwoTone
                                    className="uuidPage__icon"
                                    twoToneColor={theme.colors.error[100]} />
                            </Tooltip>

                            <Tooltip
                                trigger={['hover']}
                                title="Microfone off / on."
                                placement="top"
                            >
                                <AudioTwoTone twoToneColor={theme.colors.error[100]} className="uuidPage__icon" />
                            </Tooltip>
                            <Tooltip
                                trigger={['hover']}
                                title="Camera off."
                                placement="top"
                            >
                                <VideoCameraTwoTone twoToneColor={theme.colors.error[100]} className="uuidPage__icon" />
                            </Tooltip>
                        </div>
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
