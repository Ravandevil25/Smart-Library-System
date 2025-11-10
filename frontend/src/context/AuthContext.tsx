import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { getStoredUser, getStoredToken, setStoredAuth, clearStoredAuth, authApi } from '../api/auth';
import { bookApi } from '../api/books';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = getStoredUser();
    const storedToken = getStoredToken();
    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
      
      // Fetch fresh user data from server to get latest wishlist/reserves
      (async () => {
        try {
          const me = await authApi.getMe();
          setUser(me);
          setStoredAuth(storedToken, me);
          
          // Sync any local wishlist/reserves that aren't on server
          const wlRaw = localStorage.getItem('bookWishlist');
          const reservesRaw = localStorage.getItem('bookReserves');
          const localWl = wlRaw ? (JSON.parse(wlRaw) as string[]) : [];
          const localRs = reservesRaw ? (JSON.parse(reservesRaw) as string[]) : [];
          
          // Only sync items that aren't already on server
          const serverWl = me.wishlist || [];
          const serverRs = me.reserves || [];
          
          for (const barcode of localWl) {
            if (!serverWl.includes(barcode)) {
              try {
                await bookApi.addToWishlist(barcode);
              } catch (err) {
                console.warn('Failed to sync wishlist item', barcode, err);
              }
            }
          }
          
          for (const barcode of localRs) {
            if (!serverRs.includes(barcode)) {
              try {
                await bookApi.addToReserve(barcode);
              } catch (err) {
                console.warn('Failed to sync reserve item', barcode, err);
              }
            }
          }
          
          // After syncing, fetch fresh data again
          const updatedMe = await authApi.getMe();
          setUser(updatedMe);
          setStoredAuth(storedToken, updatedMe);
          
          // Clear localStorage after successful sync
          localStorage.removeItem('bookWishlist');
          localStorage.removeItem('bookReserves');
        } catch (err) {
          console.warn('Failed to fetch fresh user data on mount', err);
          // Keep using stored user data if server fetch fails
        }
      })();
    }
  }, []);

  const login = (userData: User, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    setStoredAuth(userToken, userData);
    // After storing auth, attempt to sync any locally saved wishlist/reserves to the server
    (async () => {
      try {
        const wlRaw = localStorage.getItem('bookWishlist');
        const reservesRaw = localStorage.getItem('bookReserves');
        const wishlist = wlRaw ? (JSON.parse(wlRaw) as string[]) : [];
        const reserves = reservesRaw ? (JSON.parse(reservesRaw) as string[]) : [];

        for (const barcode of wishlist) {
          try { await bookApi.addToWishlist(barcode); } catch (err) { console.warn('sync wishlist failed', barcode, err); }
        }
        for (const barcode of reserves) {
          try { await bookApi.addToReserve(barcode); } catch (err) { console.warn('sync reserve failed', barcode, err); }
        }

        // clear local copies after attempting sync
        localStorage.removeItem('bookWishlist');
        localStorage.removeItem('bookReserves');

        // fetch fresh user from server and store it
        try {
          const me = await authApi.getMe();
          setUser(me);
          setStoredAuth(userToken, me);
        } catch (err) {
          // non-fatal
          console.warn('Failed to fetch /auth/me after login', err);
        }
      } catch (err) {
        console.warn('Failed to sync local wishlist/reserves', err);
      }
    })();
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    clearStoredAuth();
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    if (token) {
      setStoredAuth(token, userData);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

