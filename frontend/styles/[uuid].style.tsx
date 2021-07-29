import styled from 'styled-components';
import { color, space } from './helper';

const StyledUuidPage = styled.div`
    display: grid;
    grid-template-columns: 3fr 25rem;
    grid-template-rows: 1fr 3rem;
    width: 100%;
    height: calc(100vh - var(--header-height));
    overflow: hidden;

    .uuidPage__main,
    .uuidPage__options,
    .uuidPage__sub-options {
        overflow: auto;
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
        height: 3rem;

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

export default StyledUuidPage;