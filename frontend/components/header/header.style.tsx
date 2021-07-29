import styled from 'styled-components';
import { color, space } from '../../styles/helper';

const StyledHeader = styled.div`
    height: var(--header-height);
    box-shadow: 0 2px 8px ${color('shadow', 50)};
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 ${space('m')};

    .ant-breadcrumb {
        border-right: 1px solid ${color('grey', 50)};
        border-left: 1px solid ${color('grey', 50)};
        max-width: 50vw;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        overflow: hidden;
        height: 1.5rem;
        margin-right: 1rem;
        padding: 0.5rem;

        span {
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }

    .header__breadcrumb-inactive {
        color: black;
        cursor: default;
    }

    .header__options {
        .header__noscript-menu {
            position: absolute;
            top: var(--header-height);
            right: 0;
            z-index: 1000;
            opacity: 0;
            transition: all 0.5s linear 2s;
        }
    }

    .header__options:hover .header__noscript-menu {
        opacity: 1;
        transition: all 0.5s linear 0s;
    }
`


export default StyledHeader;