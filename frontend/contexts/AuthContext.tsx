import React, { createContext, useContext } from 'react'
import { AuthContextType, Auth } from '../@types/types';
import { useRouter } from 'next/router';
import { NextPageContext } from 'next';

/**
 * Object Containing routes that cannot be accessed by a user without being signed in.
 * Routes inside of protectedRoutes redirect the user to the /login page.
 */
const protectedRoutes = {
    '/': true
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
    const backendUrl = typeof window === 'undefined' ? process.env.NEXT_PUBLIC_SERVERSIDE_BACKEND_URL : process.env.NEXT_PUBLIC_CLIENT_BACKEND_URL;
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
 * redirects to /login if auth?.user is not set
 * requires: process.env.NEXT_PUBLIC_CLIENT_URL to be set.
 */
const redirectProtectedRoutesOnAuthMissing = async (ctx: NextPageContext, auth: Auth) => {
    if (typeof window !== "undefined") {
        if (!auth?.user && protectedRoutes[window.location.pathname]) {
            console.log('redirectOnAuthMissing: protectedRoutes contains window.location.pathname');
            window.location.assign(`${process.env.NEXT_PUBLIC_CLIENT_URL}/login`);
            // While the page is loading, code execution will
            // continue, so we'll await a never-resolving
            // promise to make sure our page never
            // gets rendered.
            await new Promise((resolve) => {});
        }
    } else {
        if (!auth?.user && protectedRoutes[ctx.req.url]) {
            console.log('redirectOnAuthMissing: protectedRoutes contains ctx.req.url');
            ctx.res.writeHead(302, { Location: `${process.env.NEXT_PUBLIC_CLIENT_URL}/login` });
            ctx.res.end();
        }   
    }
};

const AuthProvider = ({ children, auth }: { children: any; auth: any }) => {
    const router = useRouter();

    /**
     * values = { email: string; password: string; }
     */
    const login = async (values: Object) => {
         const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(values)
        })
        .then(response => response.json())
        .catch(err => {
            console.error('Login error fetch', err);
            return Promise.reject(false);
        });

        console.log('Login response:', response);
        router.push(response.data);

        return Promise.resolve(true);
    };

    const logout = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_BACKEND_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        })
        .then(response => response.json())
        .catch(err => {
            console.error('Logout error fetch', err);
            return Promise.reject(false);
        });

        console.log('Logout response', response);
        router.push(response.data);
        return Promise.resolve(true);
    }

    /**
     * values = { email: string; password: string; confirm: string; displayName: string; businessName?: string | undefined; firstName?: string | undefined; lastName?: string | undefined; }
     */
    const register = async (values: Object) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_BACKEND_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(values)
        })
        .then(response => response.json())
        .catch(err => {
            console.error('Register error fetch', err);
            return Promise.reject(false);
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

export { AuthContext, AuthProvider, useAuthContext, getAuth, redirectProtectedRoutesOnAuthMissing };