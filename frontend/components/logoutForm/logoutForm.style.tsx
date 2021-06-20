import styled from 'styled-components';
import { color } from '../../styles/helper';

const StyledLogoutForm = styled.div`
    max-width: 30rem;
    min-width: 30vw;
    margin: auto;

    .logout-form__display-name {
        color: ${color('primary')};
    } 
`


export default StyledLogoutForm;