import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Button, Card } from '../../components/Common/UI';
import { FileText, Link as LinkIcon, Heart, Globe, X } from 'lucide-react';

const InvestorSelections = () => {
    const { user } = useAuth();
    const [selectedStartups, setSelectedStartups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [removingId, setRemovingId] = useState(null);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        fetchMySelections();
    }, []);

    const fetchMySelections = async () => {
        if (!user) return;

        try {
            // Get all matches for this investor
            const { data: matches, error: matchError } = await supabase
                .from('matches')
                .select('startup_id')
                .eq('investor_id', user.id)
                .eq('is_top_selected', true);

            if (matchError) throw matchError;

            if (matches && matches.length > 0) {
                const startupIds = matches.map(m => m.startup_id);

                // Fetch the startup details
                const { data: startups, error: startupError } = await supabase
                    .from('startups')
                    .select('*')
                    .in('id', startupIds);

                if (startupError) throw startupError;
                setSelectedStartups(startups || []);
            } else {
                setSelectedStartups([]);
            }
        } catch (error) {
            console.error('Error fetching selections:', error);
        } finally {
            setInitialLoading(false);
        }
    };

    const handleRemoveSelection = async (startupId) => {
        if (!user) return;
        setRemovingId(startupId);
        setLoading(true);

        try {
            await supabase
                .from('matches')
                .delete()
                .eq('investor_id', user.id)
                .eq('startup_id', startupId);

            // Remove from local state
            setSelectedStartups(prev => prev.filter(s => s.id !== startupId));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRemovingId(null);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-1 mb-6">
                <h2 className="text-3xl font-bold text-white tracking-tight">My Selections</h2>
                <p className="text-slate-400">
                    Startups you've marked as favorites for potential meetings
                </p>
            </div>

            {selectedStartups.length === 0 ? (
                <div className="h-[50vh] flex flex-col items-center justify-center text-center px-6">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 relative">
                        <Heart className="text-slate-700 w-12 h-12" />
                        <div className="absolute inset-0 border-2 border-slate-800 border-dashed rounded-full animate-[spin_10s_linear_infinite]" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-3">No selections yet</h2>
                    <p className="text-slate-400 max-w-md mx-auto">
                        You haven't selected any startups yet. Go to the Dashboard to browse startups and click "I want to meet them" to add them here.
                    </p>
                </div>
            ) : (
                <>
                    <div className="bg-primary-500/10 border border-primary-500/20 rounded-2xl p-4 flex items-center gap-3">
                        <Heart className="text-primary-400 fill-current" size={24} />
                        <div>
                            <p className="text-white font-semibold">
                                {selectedStartups.length} startup{selectedStartups.length > 1 ? 's' : ''} selected
                            </p>
                            <p className="text-slate-400 text-sm">
                                These startups will be notified for potential meeting arrangements
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {selectedStartups.map((s) => (
                            <Card
                                key={s.id}
                                className="group transition-all border-primary-500/30 bg-primary-500/5 hover:border-primary-500/50"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform overflow-hidden">
                                        {s.logo_url ? (
                                            <img src={s.logo_url} alt={s.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Globe size={28} />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-primary-400 text-xs font-bold">
                                        <Heart className="fill-current" size={14} />
                                        Selected
                                    </div>
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
                                        <a href={formatUrl(s.pitch_deck_url)} target="_blank" rel="noreferrer"
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors">
                                            <FileText size={14} />
                                            Deck
                                        </a>
                                    )}
                                    {s.demo_url && (
                                        <a href={formatUrl(s.demo_url)} target="_blank" rel="noreferrer"
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors">
                                            <LinkIcon size={14} />
                                            Demo
                                        </a>
                                    )}
                                </div>

                                <Button
                                    onClick={() => handleRemoveSelection(s.id)}
                                    isLoading={loading && removingId === s.id}
                                    variant="outline"
                                    className="w-full border-red-500 text-red-400 hover:bg-red-500/10"
                                >
                                    <X className="mr-2" size={16} />
                                    Remove from Selection
                                </Button>
                            </Card>
                        ))}
                    </div>
                </>
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

export default InvestorSelections;
