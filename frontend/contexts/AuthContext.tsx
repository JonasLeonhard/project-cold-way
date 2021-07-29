import React, { createContext, useContext, useEffect } from 'react'
import { AuthContextType, Auth } from '../@types/types';
import { useRouter } from 'next/router';
import { NextPageContext } from 'next';

const RouteTypes = {
    'INCLUDES': 1,
    'EQUALS': 2
};
/**
 * Object Containing routes that cannot be accessed by a user without being signed in.
 * Routes inside of protectedRoutes redirect the user to the /login page.
 */
const protectedRoutes = {
    '/room/': RouteTypes.INCLUDES
};

const AuthContext = createContext<AuthContextType>({
    auth: {
        user: {
            email: null,
            password: null,
            displayName: null,
            providerId: null,
            provider: null,
            businessName: null,
            firstName: null,
            lastName: null
        },
        status: 'SIGNED_OUT'
    },
    login: null,
    logout: null,
    register: null
});

/**
 * Sends the users current user jwt cookie to be validated on the auth server.
 * If the getAuth is called on the serverSide, the req.headers.cookie is send instead of the server cookies
 */
const getAuth: (ctx: NextPageContext) => Promise<Auth> = async ctx => {
    const backendUrl = typeof window === 'undefined' ? process.env.NEXT_PUBLIC_SERVERSIDE_AUTH_URL : process.env.NEXT_PUBLIC_CLIENT_AUTH_URL;
    const response = await fetch(`${backendUrl}/auth/token`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            forwarded_user_cookie: ctx?.req?.headers?.cookie ? ctx.req.headers.cookie : undefined 
        },
        credentials: 'include'
    })
    .then(response => response.json())
    .catch(err => {
        console.log(`Login error while fetching from auth server (${backendUrl}):`, err);
        return { status: 'SIGNED_OUT', user: null };
    });
    return response;
}

/**
 * Returns whether or not the given url is contained in const protectedRoutes {}
 */
const isProtectedRoute = (url: string) => { 
    let isProtected = false;   
    Object.entries(protectedRoutes).forEach(protectedRouteEntry => {
        if (protectedRouteEntry[1] === RouteTypes.INCLUDES && url.includes(protectedRouteEntry[0])) {
            isProtected = true;
        } else if (protectedRouteEntry[1] === RouteTypes.EQUALS && protectedRouteEntry[0] === url) {
            isProtected = true;
        }
    });
    return isProtected;
};
/**
 * redirects to /login if auth?.user is not set &&isProtectedRoute(currentUrl) === true
 * see const protectedRoutes in AuthContext.tsx.
 * requires: process.env.NEXT_PUBLIC_CLIENT_URL to be set.
 * returns whether the user was redirected or not.
 */

const redirectProtectedRoutesOnAuthMissing = async (ctx: NextPageContext, auth: Auth): Promise<boolean> => {
    if (typeof window !== "undefined") {
        if (!window.location.pathname.includes('/login') && !auth?.user && isProtectedRoute(window.location.pathname)) {
            console.log('csr', window.location.pathname);
            const from = window.location.pathname;
            window.location.assign(`${process.env.NEXT_PUBLIC_CLIENT_URL}/login?from=${from}`);
            // While the page is loading, code execution will
            // continue, so we'll await a never-resolving
            // promise to make sure our page never
            // gets rendered.
            await new Promise((resolve) => {});
            return true;
        }
    } else {
        if (!ctx.asPath.includes('/login') && !auth?.user && isProtectedRoute(ctx.asPath)) {
            console.log('ssr', ctx.asPath);
            const from = ctx.asPath;
            ctx.res.writeHead(302, { Location: `${process.env.NEXT_PUBLIC_CLIENT_URL}/login?from=${from}` });
            ctx.res.end();
            return true
        }   
    }
    return false
};

const AuthProvider = ({ children, auth }: { children: any; auth: any }) => {
    const router = useRouter();

    /**
     * values = { email: string; password: string; }
     */
    const login = async (values: Object) => {
         const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_AUTH_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                no_redirect: 'true'
            },
            credentials: 'include',
            body: JSON.stringify(values)
        })
        .then(response => response.json())
        .catch(err => {
            console.error('Login error fetch', err);
            router.push('/login?error="Login error. Please try again."')
            return Promise.resolve(false);
        });

        console.log('Login response:', router.query);
        if (router.query.from) {
            router.push(router.query.from as any);
        } else {
            router.push(response.data);
        }
        return Promise.resolve(true);
    };

    const logout = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_AUTH_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                no_redirect: 'true'
            },
            credentials: 'include',
        })
        .then(response => response.json())
        .catch(err => {
            console.error('Logout error fetch', err);
            return Promise.resolve(false);
        });

        console.log('Logout response', response);
        router.push(response.data);
        return Promise.resolve(true);
    }

    /**
     * values = { email: string; password: string; confirm: string; displayName: string; businessName?: string | undefined; firstName?: string | undefined; lastName?: string | undefined; }
     */
    const register = async (values: Object) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_AUTH_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                no_redirect: 'true'
            },
            credentials: 'include',
            body: JSON.stringify(values)
        })
        .then(response => response.json())
        .catch(err => {
            console.error('Register error fetch', err);
            return Promise.resolve(false);
        });

        console.log('register response', response);
        router.push(response.data);
        return Promise.resolve(true);
    }

    return (
        <AuthContext.Provider value={{ auth: auth ? auth : { status: 'SIGNED_OUT', user: null }, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    )
}

const useAuthContext = (): AuthContextType => {
    return useContext(AuthContext);
}

export { AuthContext, AuthProvider, useAuthContext, getAuth, isProtectedRoute, redirectProtectedRoutesOnAuthMissing };