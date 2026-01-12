import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Button, Input, Card } from '../components/Common/UI';
import { Rocket, ShieldCheck, Mail, Lock, Wrench } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, user, profile, loading: authLoading, logout } = useAuth();
    const navigate = useNavigate();

    // Specific case: User is logged into Supabase Auth but has no entry in public.profiles
    const hasNoRole = user && !profile && !authLoading;

    const handleInitAdmin = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.from('profiles').insert([
                { id: user.id, email: user.email, role: 'admin' }
            ]);
            if (error) throw error;
            window.location.reload();
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data, error: loginError } = await login(email, password);
            if (loginError) throw loginError;
        } catch (err) {
            setError(err.message || 'Failed to login');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] animate-pulse-soft" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 overflow-hidden">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">MeetTheInvestor</h1>
                    <p className="text-slate-400 mt-2">Enter your credentials to access the platform</p>
                </div>

                <Card className="border-white/10">
                    {hasNoRole ? (
                        <div className="space-y-6 text-center py-4">
                            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500">
                                <ShieldCheck size={32} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold text-white">Setup Required</h2>
                                <p className="text-sm text-slate-400">
                                    Your account is authenticated but has no profile.
                                    <br />
                                    <strong>Is this the first admin account?</strong>
                                </p>
                            </div>

                            {error && <p className="text-red-500 text-xs">{error}</p>}

                            <div className="space-y-3 pt-2">
                                <Button
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 border-emerald-500"
                                    onClick={handleInitAdmin}
                                    isLoading={loading}
                                >
                                    <Wrench className="mr-2" size={18} />
                                    Initialize as Admin
                                </Button>
                                <Button variant="ghost" className="w-full text-slate-500" onClick={() => logout()}>
                                    Sign Out
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-5">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                                    <ShieldCheck size={16} />
                                    {error}
                                </div>
                            )}

                            <div className="relative">
                                <Mail className="absolute left-3.5 top-10 text-slate-500 z-10" size={18} />
                                <Input
                                    label="Email address"
                                    type="email"
                                    placeholder="investor@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-11"
                                    autoComplete="email"
                                    required
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3.5 top-10 text-slate-500 z-10" size={18} />
                                <Input
                                    label="Password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-11"
                                    autoComplete="current-password"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full py-3 text-lg mt-2"
                                isLoading={loading}
                            >
                                Sign In
                            </Button>
                        </form>
                    )}
                </Card>

                <p className="text-center text-slate-500 mt-8 text-sm">
                    Platform version 2.0
                </p>
            </div>
        </div>
    );
};

export default Login;
