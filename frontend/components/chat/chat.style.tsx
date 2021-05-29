import styled from 'styled-components';

type ChatProps = {
    open: boolean;
};
const StyledChat = styled.div<Pick<ChatProps, 'open'>>`
    background: ${props => props.open};
`


export default StyledChat;