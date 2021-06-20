import React, { createContext, useContext, useState, useEffect } from 'react'
import { AuthContextType, Auth } from '../@types/types';
import { useRouter } from 'next/router'

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
const getAuth: (ctx: any) => Promise<Auth> = async ctx => {
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

export { AuthContext, AuthProvider, useAuthContext, getAuth };