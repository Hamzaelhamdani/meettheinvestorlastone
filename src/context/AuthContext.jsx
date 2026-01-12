import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        // Safety timeout to prevent infinite spinner
        const timeout = setTimeout(() => {
            if (mounted) {
                setLoading(false);
            }
        }, 8000);

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!mounted) return;
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id).then(() => clearTimeout(timeout));
            } else {
                setLoading(false);
                clearTimeout(timeout);
            }
        }).catch(err => {
            if (!mounted) return;
            console.error('Session check failed:', err);
            setLoading(false);
            clearTimeout(timeout);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;
            const currentUser = session?.user ?? null;

            // Avoid duplicate state updates if getSession handled it
            setUser(currentUser);

            if (event === 'SIGNED_OUT') {
                setProfile(null);
                setLoading(false);
            } else if (currentUser && event !== 'INITIAL_SESSION') {
                // INITIAL_SESSION is often redundant with getSession
                await fetchProfile(currentUser.id);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    const fetchProfile = async (userId) => {
        try {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            const response = await fetch(
                `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*`,
                {
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data && data.length > 0) {
                setProfile(data[0]);
            } else {
                setProfile(null);
            }
        } catch (error) {
            console.error('Error fetching profile:', error.message || error);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    const login = (email, password) => {
        return supabase.auth.signInWithPassword({ email, password });
    };

    const logout = () => {
        return supabase.auth.signOut();
    };

    const isAdmin = profile?.role === 'admin';
    const isInvestor = profile?.role === 'investor';

    return (
        <AuthContext.Provider value={{ user, profile, loading, login, logout, isAdmin, isInvestor }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
