import React, { createContext, useContext, useState, useEffect } from 'react'
import { AuthContextType } from '../@types/types';

const AuthContext = createContext<AuthContextType>({
    email: null,
    password: null,
    displayName: null,
    providerId: null,
    provider: null,
    businessName: null,
    firstName: null,
    lastName: null
});

/**
 * Sends token to the server to have it validate the auth token
 */
const validateAuthToken = (token: string): boolean => {
    return false;
}

const AuthProvider = ({ children }: { children: any; }) => {
    const [user, setUser] = useState<AuthContextType>(null);
    useEffect(() => {
        setUser({
            email: 'some pdw from cookie!', password: null,
            displayName: null,
            providerId: null,
            provider: null,
            businessName: null,
            firstName: null,
            lastName: null
        });
    }, []);
    return (
        <AuthContext.Provider value={user}>
            {children}
        </AuthContext.Provider>
    )
}

const useAuthContext = (): AuthContextType => {
    return useContext(AuthContext);
}

export { AuthContext, AuthProvider, useAuthContext };