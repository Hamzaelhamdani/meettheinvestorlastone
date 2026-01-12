import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button, Input, Card } from '../../components/Common/UI';
import { Play, Square, Clock, AlertCircle, ChevronRight, CheckCircle2 } from 'lucide-react';
import Timer from '../../components/Common/Timer';

const AdminRounds = () => {
    const [startups, setStartups] = useState([]);
    const [currentRound, setCurrentRound] = useState(null);
    const [loading, setLoading] = useState(false);

    // New Round Form
    const [selectedStartupId, setSelectedStartupId] = useState('');
    const [duration, setDuration] = useState(5);

    useEffect(() => {
        fetchStartups();
        fetchCurrentRound();

        // Subscribe to round changes
        const channel = supabase
            .channel('round_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rounds' }, () => {
                fetchCurrentRound();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchStartups = async () => {
        const { data } = await supabase.from('startups').select('id, name').order('name');
        if (data) setStartups(data);
    };

    const fetchCurrentRound = async () => {
        const { data } = await supabase
            .from('rounds')
            .select('*, startups(name)')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        setCurrentRound(data);
    };

    const handleStartRound = async () => {
        if (!selectedStartupId) return alert('Select a startup first');
        setLoading(true);

        try {
            // 1. Deactivate old rounds
            await supabase.from('rounds').update({ is_active: false }).eq('is_active', true);

            // 2. Start new round
            const newRoundNumber = currentRound ? currentRound.current_round_number + 1 : 1;

            const { error } = await supabase.from('rounds').insert([{
                current_round_number: newRoundNumber,
                duration_minutes: duration,
                starts_at: new Date().toISOString(),
                is_active: true,
                startup_id: selectedStartupId
            }]);

            if (error) throw error;

            setSelectedStartupId('');
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStopRound = async () => {
        if (!currentRound) return;
        setLoading(true);

        const { error } = await supabase
            .from('rounds')
            .update({ is_active: false })
            .eq('id', currentRound.id);

        if (error) alert(error.message);
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold text-white tracking-tight">Round Controller</h2>
                <p className="text-slate-400">Live orchestration of the pitch sessions</p>
            </div>

            {currentRound ? (
                <Card className="border-primary-500/30 bg-primary-500/5">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-sm font-bold text-green-500 uppercase tracking-widest">Live Round {currentRound.current_round_number}</span>
                        </div>

                        <h3 className="text-4xl font-black text-white mb-2">{currentRound.startups?.name}</h3>

                        <div className="flex items-center gap-6 mb-8 text-slate-400">
                            <div className="flex items-center gap-2">
                                <Clock size={16} />
                                <span>{currentRound.duration_minutes}m Duration</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <AlertCircle size={16} />
                                <span>Session in progress</span>
                            </div>
                        </div>

                        <Timer
                            startsAt={currentRound.starts_at}
                            durationMinutes={currentRound.duration_minutes}
                            onExpire={() => console.log('Round expired')}
                        />

                        <div className="mt-8">
                            <Button variant="danger" onClick={handleStopRound} isLoading={loading}>
                                <Square className="mr-2 fill-current" size={18} />
                                Terminate Session
                            </Button>
                        </div>
                    </div>
                </Card>
            ) : (
                <Card title="Launch Next Session" subtitle="Prepare the stage for the next startup">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5 focus-within:z-10">
                                <label className="text-sm font-medium text-slate-400 ml-1">Featured Startup</label>
                                <select
                                    value={selectedStartupId}
                                    onChange={(e) => setSelectedStartupId(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 outline-none transition-all appearance-none"
                                >
                                    <option value="">Select a company...</option>
                                    {startups.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                label="Duration (Minutes)"
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(parseInt(e.target.value))}
                                min="1"
                            />
                        </div>

                        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400 shrink-0">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-1">Ready to sync?</h4>
                                <p className="text-sm text-slate-400">
                                    Starting a round will automatically update the interface for all
                                    connected investors and start their local synchronized timers.
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={handleStartRound}
                            isLoading={loading}
                            className="w-full py-4 text-lg"
                            disabled={!selectedStartupId}
                        >
                            <Play className="mr-2 fill-current" size={20} />
                            Open the Floor
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default AdminRounds;
