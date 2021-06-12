import { WebSocketProvider } from '../../contexts/WebSocketContext';

import StyledUuidPage from '../../styles/[uuid].style';
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
