import styled from 'styled-components';

const StyledIndexForm = styled.div`
.indexForm__join-input {
    display: none;
}

.indexForm__join-form:focus-within .indexForm__join-input {
    display: flex;
}
.indexForm__join-form:focus-within .indexForm__join-button {
    display: none;
}
`


export default StyledIndexForm;