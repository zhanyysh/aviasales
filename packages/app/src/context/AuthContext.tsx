"use client";
"use client";
import { createContext } from 'react';

export interface AuthContextType {
	user: null | { id: string; email: string; full_name?: string; role?: string };
	logout: () => void;
	setUser: (user: AuthContextType['user']) => void;
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	logout: () => {},
	setUser: () => {},
});

export default AuthContext;
