import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/Common/UI';
import { Users, Rocket, Heart, ChevronDown, ChevronUp, Globe, Mail, FileText, Link as LinkIcon } from 'lucide-react';

const AdminMatchmaking = () => {
    const [investors, setInvestors] = useState([]);
    const [matches, setMatches] = useState({});
    const [loading, setLoading] = useState(true);
    const [expandedInvestor, setExpandedInvestor] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch all investors
            const { data: investorData, error: investorError } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'investor')
                .order('created_at', { ascending: false });

            if (investorError) throw investorError;

            // Fetch all matches with startup details
            const { data: matchData, error: matchError } = await supabase
                .from('matches')
                .select(`
                    investor_id,
                    startup_id,
                    is_top_selected,
                    startups (
                        id,
                        name,
                        sector,
                        country,
                        logo_url,
                        one_line_pitch,
                        demo_url,
                        pitch_deck_url
                    )
                `)
                .eq('is_top_selected', true);

            if (matchError) throw matchError;

            // Group matches by investor
            const matchesByInvestor = {};
            matchData?.forEach(match => {
                if (!matchesByInvestor[match.investor_id]) {
                    matchesByInvestor[match.investor_id] = [];
                }
                if (match.startups) {
                    matchesByInvestor[match.investor_id].push(match.startups);
                }
            });

            setInvestors(investorData || []);
            setMatches(matchesByInvestor);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (investorId) => {
        setExpandedInvestor(expandedInvestor === investorId ? null : investorId);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-1 mb-6">
                <h2 className="text-3xl font-bold text-white tracking-tight">Investor Matchmaking</h2>
                <p className="text-slate-400">View each investor's startup selections</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center">
                        <Users className="text-primary-400" size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">{investors.length}</p>
                        <p className="text-slate-400 text-sm">Total Investors</p>
                    </div>
                </Card>
                <Card className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                        <Heart className="text-green-400" size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">
                            {Object.values(matches).reduce((acc, arr) => acc + arr.length, 0)}
                        </p>
                        <p className="text-slate-400 text-sm">Total Selections</p>
                    </div>
                </Card>
                <Card className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                        <Users className="text-purple-400" size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">
                            {investors.filter(i => matches[i.id]?.length > 0).length}
                        </p>
                        <p className="text-slate-400 text-sm">Active Investors</p>
                    </div>
                </Card>
            </div>

            {/* Investor Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xxl:grid-cols-3 gap-6">
                {investors.length === 0 ? (
                    <div className="col-span-full">
                        <Card className="text-center py-12">
                            <Users className="mx-auto text-slate-600 mb-4" size={48} />
                            <p className="text-slate-400">No investors registered yet</p>
                        </Card>
                    </div>
                ) : (
                    investors.map((investor) => {
                        const investorMatches = matches[investor.id] || [];

                        return (
                            <Card
                                key={investor.id}
                                className="flex flex-col h-full border-white/5 hover:border-primary-500/20 transition-all duration-300"
                            >
                                {/* Investor Header */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-primary-400 font-bold text-lg flex-shrink-0">
                                        {investor.email?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-white font-bold truncate" title={investor.email}>
                                            {investor.email}
                                        </h4>
                                        <p className="text-slate-500 text-xs">
                                            Joined: {new Date(investor.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className="mb-6">
                                    <div className={cn(
                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                        investorMatches.length > 0
                                            ? "bg-primary-500/10 text-primary-400 border border-primary-500/20"
                                            : "bg-slate-800/50 text-slate-500 border border-slate-700/30"
                                    )}>
                                        <Heart size={12} className={investorMatches.length > 0 ? "fill-current" : ""} />
                                        {investorMatches.length} selection{investorMatches.length !== 1 ? 's' : ''}
                                    </div>
                                </div>

                                {/* Selections List */}
                                <div className="flex-1 space-y-3">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Startup Selections</div>
                                    {investorMatches.length === 0 ? (
                                        <div className="bg-slate-900/40 rounded-xl p-4 text-center border border-dashed border-slate-800">
                                            <p className="text-slate-600 text-xs italic">No selections yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                            {investorMatches.map((startup) => (
                                                <div
                                                    key={startup.id}
                                                    className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-3 flex items-center gap-3 group/item hover:bg-slate-800/60 transition-colors"
                                                >
                                                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 group-hover/item:scale-110 transition-transform">
                                                        {startup.logo_url ? (
                                                            <img src={startup.logo_url} alt={startup.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Globe size={16} className="text-primary-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start">
                                                            <p className="text-white text-sm font-semibold truncate">{startup.name}</p>
                                                            <div className="flex gap-1.5 ml-2">
                                                                {startup.pitch_deck_url && (
                                                                    <a href={formatUrl(startup.pitch_deck_url)} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-primary-400 transition-colors">
                                                                        <FileText size={14} />
                                                                    </a>
                                                                )}
                                                                {startup.demo_url && (
                                                                    <a href={formatUrl(startup.demo_url)} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-primary-400 transition-colors">
                                                                        <LinkIcon size={14} />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="text-slate-500 text-[10px] truncate">{startup.sector}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>
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

export default AdminMatchmaking;
