import { useState, useEffect } from 'react';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import { Button, Input, Card } from '../../components/Common/UI';
import { UserPlus, User, Mail, Shield, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';

const AdminInvestors = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [investors, setInvestors] = useState([]);

    useEffect(() => {
        fetchInvestors();
    }, []);

    const fetchInvestors = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'investor')
            .order('created_at', { ascending: false });

        if (!error) setInvestors(data);
    };

    const handleCreateInvestor = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (!supabaseAdmin) {
                throw new Error('Supabase Service Role Key is missing! Check your .env file.');
            }

            // 1. Create user in Auth using Service Role
            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true
            });

            if (authError) throw authError;

            // 2. Insert into profiles table
            // (Optionally: A trigger in Postgres could handle this, but let's do it manually for clarity)
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .insert([
                    { id: authData.user.id, email: email, role: 'investor' }
                ]);

            if (profileError) throw profileError;

            setMessage({ type: 'success', text: `Investor created successfully! ID: ${authData.user.id}` });
            setEmail('');
            setPassword('');
            fetchInvestors();
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteInvestor = async (investorId, investorEmail) => {
        if (!confirm(`Are you sure you want to delete investor ${investorEmail}? This action cannot be undone.`)) {
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            if (!supabaseAdmin) {
                throw new Error('Supabase Service Role Key is missing! Check your .env file.');
            }

            // 1. Delete from profiles table
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .delete()
                .eq('id', investorId);

            if (profileError) throw profileError;

            // 2. Delete user from Auth
            const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(investorId);

            if (authError) throw authError;

            setMessage({ type: 'success', text: `Investor ${investorEmail} deleted successfully!` });
            fetchInvestors();
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold text-white tracking-tight">Investor Management</h2>
                <p className="text-slate-400">Create and monitor investor access accounts</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Creation Form */}
                <div className="lg:col-span-1">
                    <Card
                        title="Create New Account"
                        subtitle="Investor ID will be generated automatically"
                        className="sticky top-8"
                    >
                        <form onSubmit={handleCreateInvestor} className="space-y-4">
                            {message && (
                                <div className={cn(
                                    "px-4 py-3 rounded-xl text-sm flex items-start gap-2 border",
                                    message.type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                                )}>
                                    {message.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertTriangle size={18} className="shrink-0 mt-0.5" />}
                                    <span>{message.text}</span>
                                </div>
                            )}

                            <Input
                                label="Email address"
                                type="email"
                                placeholder="investor@domain.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <Input
                                label="Initial Password"
                                type="password"
                                placeholder="Min 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    isLoading={loading}
                                    disabled={!supabaseAdmin}
                                >
                                    <UserPlus className="mr-2" size={18} />
                                    Authorize Investor
                                </Button>
                                {!supabaseAdmin && (
                                    <p className="text-[10px] text-red-400 mt-2 text-center uppercase tracking-wider font-bold">
                                        Service Key Required
                                    </p>
                                )}
                            </div>
                        </form>
                    </Card>
                </div>

                {/* Investor List */}
                <div className="lg:col-span-2">
                    <Card title="Authorized Investors" subtitle={`${investors.length} registered profiles`}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 text-slate-500 text-sm">
                                        <th className="pb-4 font-medium px-4">Investor ID</th>
                                        <th className="pb-4 font-medium px-4">Email</th>
                                        <th className="pb-4 font-medium px-4 text-right">Registered</th>
                                        <th className="pb-4 font-medium px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {investors.map((inv) => (
                                        <tr key={inv.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                            <td className="py-4 px-4 font-mono text-xs text-primary-400">{inv.id.slice(0, 8)}...</td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                                                        <User size={14} />
                                                    </div>
                                                    <span className="text-slate-200">{inv.email}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-right text-slate-500">
                                                {new Date(inv.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteInvestor(inv.id, inv.email)}
                                                    disabled={loading || !supabaseAdmin}
                                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Delete investor"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {investors.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="py-10 text-center text-slate-500 italic">
                                                No investors found. Create your first one on the left.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

// Simple helper inside since I don't want to import it everywhere if possible
const cn = (...inputs) => inputs.filter(Boolean).join(' ');

export default AdminInvestors;
