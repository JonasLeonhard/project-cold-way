import styled from 'styled-components';
import { space } from '../../styles/helper';

type ChatProps = {
    open: boolean;
};
const StyledChat = styled.div<Pick<ChatProps, 'open'>>`
    display: grid;
    grid-template-rows: 1fr auto;
    height: 100%;
    background: ${props => props.open};

    .chat__content {
        padding: 0 ${space('m')};
        overflow: scroll;
    }

    .chat__controls {
        padding: ${space('xs')};
        display: grid;
        grid-template-columns: 1fr auto;
    }
`


export default StyledChat;