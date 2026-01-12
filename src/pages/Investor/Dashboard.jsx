import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Button, Card } from '../../components/Common/UI';
import { Rocket, FileText, Link as LinkIcon, Heart, Globe, Clock, CheckCircle2 } from 'lucide-react';
import Timer from '../../components/Common/Timer';

const InvestorDashboard = () => {
    const { user } = useAuth();
    const [currentRound, setCurrentRound] = useState(null);
    const [startup, setStartup] = useState(null);
    const [allStartups, setAllStartups] = useState([]);
    const [mySelections, setMySelections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedStartupId, setSelectedStartupId] = useState(null);

    useEffect(() => {
        fetchCurrentRound();
        fetchAllStartups();
        fetchMySelections();

        // Subscribe to live round changes
        const channel = supabase
            .channel('investor_round_sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rounds' }, () => {
                fetchCurrentRound();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchCurrentRound = async () => {
        const { data: round } = await supabase
            .from('rounds')
            .select('*, startups(*)')
            .eq('is_active', true)
            .maybeSingle();

        setCurrentRound(round);
        if (round?.startups) {
            setStartup(round.startups);
        } else {
            setStartup(null);
        }
    };

    const fetchAllStartups = async () => {
        const { data, error } = await supabase
            .from('startups')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error) setAllStartups(data || []);
    };

    const fetchMySelections = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('matches')
            .select('startup_id')
            .eq('investor_id', user.id)
            .eq('is_top_selected', true);

        if (!error && data) {
            setMySelections(data.map(m => m.startup_id));
        }
    };

    const handleToggleSelection = async (startupId) => {
        if (!user) return;
        setSelectedStartupId(startupId);
        setLoading(true);

        const isAlreadySelected = mySelections.includes(startupId);

        try {
            if (isAlreadySelected) {
                await supabase
                    .from('matches')
                    .delete()
                    .eq('investor_id', user.id)
                    .eq('startup_id', startupId);
                setMySelections(prev => prev.filter(id => id !== startupId));
            } else {
                await supabase
                    .from('matches')
                    .upsert({
                        investor_id: user.id,
                        startup_id: startupId,
                        round_id: currentRound?.id || null,
                        is_top_selected: true
                    });
                setMySelections(prev => [...prev, startupId]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setSelectedStartupId(null);
        }
    };

    // When there's an active round, show the live pitching view
    if (currentRound && startup) {
        return (
            <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-4 mb-2">
                            <span className="px-3 py-1 bg-primary-500/10 text-primary-400 rounded-full text-xs font-bold uppercase tracking-widest border border-primary-500/20">
                                Live Pitching
                            </span>
                            <span className="text-slate-500 text-sm font-medium">Round {currentRound.current_round_number}</span>
                        </div>

                        <div className="flex flex-col gap-1 mb-8">
                            <h1 className="text-5xl font-black text-white tracking-tight leading-tight">
                                {startup.name}
                            </h1>
                            <p className="text-xl text-slate-400 font-medium">
                                {startup.one_line_pitch}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Sector</span>
                                <span className="text-white font-semibold">{startup.sector}</span>
                            </div>
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Stage</span>
                                <span className="text-white font-semibold">{startup.category}</span>
                            </div>
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Location</span>
                                <span className="text-white font-semibold">{startup.country}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            {startup.pitch_deck_url && (
                                <a href={formatUrl(startup.pitch_deck_url)} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-3 px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-bold transition-all border border-slate-700/50">
                                    <FileText className="text-primary-400" />
                                    View Pitch Deck
                                </a>
                            )}
                            {startup.demo_url && (
                                <a href={formatUrl(startup.demo_url)} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-3 px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-bold transition-all border border-slate-700/50">
                                    <LinkIcon className="text-primary-400" />
                                    Live Demo
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <Card className="sticky top-8 overflow-visible border-primary-500/20">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <div className="bg-slate-900 border border-slate-800 rounded-full p-2 shadow-xl">
                                    <Rocket className="text-primary-500" size={24} />
                                </div>
                            </div>

                            <div className="pt-4 text-center">
                                <Timer startsAt={currentRound.starts_at} durationMinutes={currentRound.duration_minutes} />

                                <div className="mt-8 space-y-4">
                                    <Button
                                        onClick={() => handleToggleSelection(startup.id)}
                                        isLoading={loading && selectedStartupId === startup.id}
                                        className={cn(
                                            "w-full py-5 text-xl rounded-2xl border-2 transition-all group",
                                            mySelections.includes(startup.id)
                                                ? "bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500/20"
                                                : "bg-primary-600 border-primary-500 text-white hover:scale-[1.02]"
                                        )}
                                    >
                                        <Heart className={cn("mr-3 transition-all", mySelections.includes(startup.id) ? "fill-current scale-125" : "group-hover:scale-110")} size={28} />
                                        {mySelections.includes(startup.id) ? "Coup de cœur !" : "Love this startup?"}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    // Browse all startups view
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-1 mb-6">
                <h2 className="text-3xl font-bold text-white tracking-tight">All Startups</h2>
                <p className="text-slate-400">Browse all participating startups and mark your favorites</p>
            </div>

            {allStartups.length === 0 ? (
                <div className="h-[50vh] flex flex-col items-center justify-center text-center px-6">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 relative">
                        <Clock className="text-slate-700 w-12 h-12" />
                        <div className="absolute inset-0 border-2 border-slate-800 border-dashed rounded-full animate-[spin_10s_linear_infinite]" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-3">No startups yet</h2>
                    <p className="text-slate-400 max-w-md mx-auto">
                        The administrator hasn't added any startups to the platform yet.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {allStartups.map((s) => {
                        const isSelected = mySelections.includes(s.id);
                        return (
                            <Card
                                key={s.id}
                                className={cn(
                                    "group transition-all",
                                    isSelected ? "border-primary-500/50 bg-primary-500/5" : "hover:border-white/20"
                                )}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform overflow-hidden">
                                        {s.logo_url ? (
                                            <img src={s.logo_url} alt={s.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Globe size={28} />
                                        )}
                                    </div>
                                    {isSelected && (
                                        <div className="flex items-center gap-1 text-primary-400 text-xs font-bold">
                                            <CheckCircle2 size={16} />
                                            Selected
                                        </div>
                                    )}
                                </div>

                                <h4 className="text-xl font-bold text-white mb-1">{s.name}</h4>
                                <div className="flex gap-2 mb-3 flex-wrap">
                                    <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-primary-500/10 text-primary-400 rounded-md border border-primary-500/20">
                                        {s.sector}
                                    </span>
                                    <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded-md border border-orange-500/20">
                                        {s.category}
                                    </span>
                                    <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md">
                                        {s.country}
                                    </span>
                                </div>

                                <p className="text-slate-400 text-sm line-clamp-2 mb-6">
                                    {s.one_line_pitch}
                                </p>

                                <div className="flex items-center gap-2 mb-4">
                                    {s.pitch_deck_url && (
                                        <a href={formatUrl(s.pitch_deck_url)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors">
                                            <FileText size={14} />
                                            Deck
                                        </a>
                                    )}
                                    {s.demo_url && (
                                        <a href={formatUrl(s.demo_url)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors">
                                            <LinkIcon size={14} />
                                            Demo
                                        </a>
                                    )}
                                </div>

                                <Button
                                    onClick={() => handleToggleSelection(s.id)}
                                    isLoading={loading && selectedStartupId === s.id}
                                    variant={isSelected ? "outline" : "primary"}
                                    className={cn("w-full", isSelected && "border-red-500 text-red-400 hover:bg-red-500/10")}
                                >
                                    <Heart className={cn("mr-2", isSelected && "fill-current")} size={16} />
                                    {isSelected ? "Remove Selection" : "I want to meet them"}
                                </Button>
                            </Card>
                        );
                    })}
                </div>
            )}

            {mySelections.length > 0 && (
                <div className="fixed bottom-6 right-6 bg-primary-600 text-white px-6 py-3 rounded-2xl shadow-2xl shadow-primary-500/30 flex items-center gap-3 animate-in slide-in-from-bottom-4">
                    <Heart className="fill-current" size={20} />
                    <span className="font-bold">{mySelections.length} startup{mySelections.length > 1 ? 's' : ''} selected</span>
                </div>
            )}
        </div>
    );
};

const formatUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:') || url.startsWith('tel:')) {
        return url;
    }
    return `https://${url}`;
};

const cn = (...inputs) => inputs.filter(Boolean).join(' ');

export default InvestorDashboard;
