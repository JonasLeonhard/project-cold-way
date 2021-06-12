import styled from 'styled-components';
import { mq } from '../../styles/helper';

const StyledRegisterForm = styled.div`
    width: 90vw;
    margin: auto;

    ${ mq('m')} {
        width: 50vw;
    }
`


export default StyledRegisterForm;