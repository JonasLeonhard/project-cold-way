import styled from 'styled-components';
import { space } from '../../styles/helper';

const StyledWebRTC = styled.div`
    height: 100%;
    padding: ${space('m')};

    .webRTC__media-stream-wrapper {
        display: flex;
        flex-wrap: wrap;
    }

    .webRTC__mediastream {
        background: red;
        max-width: 20%;
    }

    .webRTC__mediastream__is-loading {
        background: grey;
    }

    .webRTC__mediastream__type-local {
        border: 5px solid var(--color-primary);
    }
    .webRTC__mediastream__type-remote {
        border: 5px solid red;
    }
`


export default StyledWebRTC;