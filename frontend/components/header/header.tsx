import React, { useState, useEffect } from 'react'
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../contexts/AuthContext';
import StyledHeader from './header.style';
import { Breadcrumb, Dropdown, Menu, Button } from 'antd';
import { HomeOutlined, UserOutlined, LogoutOutlined, ProfileOutlined } from '@ant-design/icons';

export type Breadcrumbs = Array<{ href?: string, breadcrumb: string }>;

const Header: React.FC = () => {
    const router = useRouter();
    const [breadcrumbs, setBreadcrumbs] = useState<Array<{ breadcrumb: string; href: string; active?: boolean }>>(null);
    const auth = useAuthContext();

    // Paths to exlude beeing clickable in Breadcrumbs:
    const excludePaths = {
        'room': true,
        '[uuid]': true
    };

    const menu = (
        <Menu>
            {auth?.auth?.user ? <>
                <Menu.Item key="1" icon={<UserOutlined />}>
                    <Link href="/profile">
                        <a>
                            Profile
                        </a>
                    </Link>
                </Menu.Item>
                <Menu.Item key="2" icon={<ProfileOutlined />}>
                    <Link href="/profile">
                        <a>
                            Settings
                        </a>
                    </Link>
                </Menu.Item>
                <Menu.Item key="3" icon={<LogoutOutlined />}>
                    <Link href="/logout">
                        <a>
                            Logout
                        </a>
                    </Link>
                </Menu.Item>
            </> : <>
                <Menu.Item key="1" icon={<UserOutlined />}>
                    <Link href="/login">
                        <a>
                            Login
                        </a>
                    </Link>
                </Menu.Item>
                <Menu.Item key="2" icon={<ProfileOutlined />}>
                    <Link href="/register">
                        <a>
                            Register
                        </a>
                    </Link>
                </Menu.Item>
            </>}
        </Menu>
    );

    useEffect(() => {
        if (router) {
            const linkPath = router.pathname.split('/');
            linkPath.shift();

            const pathArray = linkPath.map((path, i) => {
                const breadcrumb: { breadcrumb: string; href: string; active?: boolean } = {
                    breadcrumb: path,
                    href: '/' + linkPath.slice(0, i + 1).join('/'),
                    active: true
                };

                if (excludePaths[path]) {
                    breadcrumb.active = false;
                }

                if (path === '[uuid]') {
                    const asLinkPath = router.asPath.split('/');
                    asLinkPath.shift();
                    breadcrumb.breadcrumb = asLinkPath[i];
                    breadcrumb.href = asLinkPath[i];
                }
                return breadcrumb;
            });

            setBreadcrumbs(pathArray);
        }
    }, [router]);

    return (
        <StyledHeader>
            <Breadcrumb>
                <Breadcrumb.Item href="/" key="/">
                    <HomeOutlined />
                </Breadcrumb.Item>
                {breadcrumbs?.map(breadcrumb => {
                    return <Breadcrumb.Item
                        className={`header__breadcrumb header__breadcrumb-${breadcrumb.active ? 'active' : 'inactive'}`}
                        key={breadcrumb.active ? breadcrumb.href : undefined}
                        href={breadcrumb.active ? breadcrumb.href : undefined}>
                        {breadcrumb.breadcrumb}
                    </Breadcrumb.Item>
                })}
                <Breadcrumb.Item key='javascript-disabled'>
                    <noscript>
                        *You need to have Javascript enabled for this functionality to load.
                    </noscript>
                </Breadcrumb.Item>
            </Breadcrumb>

            <div className="header__options">
                <Dropdown overlay={menu}>
                    <Button>
                        <Link href="/profile">
                            <a>
                                <UserOutlined />
                            </a>
                        </Link>
                    </Button>
                </Dropdown>
                <noscript>
                    <div className="header__noscript-menu">
                        {menu}
                    </div>
                </noscript>
            </div>
        </StyledHeader>
    )
}

export default Header;