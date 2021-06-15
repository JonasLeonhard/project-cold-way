import styled from 'styled-components';

const StyledLoginForm = styled.div`
    max-width: 30rem;
    min-width: 30vw;
    margin: auto;

    .login-form__login-opts {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;

        button {
            width: 100%;
        }
    }
`


export default StyledLoginForm;