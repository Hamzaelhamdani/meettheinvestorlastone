import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/Common/UI';
import { Users, Rocket, Activity, Heart, TrendingUp, BarChart3, PieChart, Target, Zap, CheckCircle2 } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalInvestors: 0,
        totalStartups: 0,
        totalMatches: 0,
        topStartups: [],
        activeRounds: 0,
        completedRounds: 0,
        avgMatchesPerInvestor: 0,
        topSectors: []
    });
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            // Récupérer les dernières activités
            const { data: recentMatches } = await supabase
                .from('matches')
                .select(`
                    created_at, 
                    investor_id, 
                    startup_id, 
                    is_top_selected, 
                    startups(name, sector),
                    profiles!matches_investor_id_fkey(email)
                `)
                .order('created_at', { ascending: false })
                .limit(20);

            const { data: recentRounds } = await supabase
                .from('rounds')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            // Formater les activités
            const formattedActivities = [];

            // Ajouter les matches récents
            recentMatches?.forEach(match => {
                if (match.is_top_selected && match.startups && match.profiles) {
                    const investorEmail = match.profiles.email.split('@')[0]; // Prendre la partie avant @
                    const startupName = match.startups.name;
                    const sector = match.startups.sector;
                    
                    formattedActivities.push({
                        type: 'match',
                        message: `${investorEmail} a sélectionné ${startupName}`,
                        detail: sector,
                        timestamp: match.created_at,
                        icon: Heart,
                        color: 'red'
                    });
                }
            });

            // Ajouter les rounds récents
            recentRounds?.forEach(round => {
                if (round.status === 'completed') {
                    formattedActivities.push({
                        type: 'round',
                        message: `Round ${round.round_number} complété`,
                        detail: null,
                        timestamp: round.updated_at || round.created_at,
                        icon: CheckCircle2,
                        color: 'green'
                    });
                } else if (round.status === 'active') {
                    formattedActivities.push({
                        type: 'round',
                        message: `Round ${round.round_number} en cours`,
                        detail: null,
                        timestamp: round.created_at,
                        icon: Zap,
                        color: 'blue'
                    });
                }
            });

            // Trier par date et limiter à 8
            formattedActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setActivities(formattedActivities.slice(0, 8));
        } catch (error) {
            console.error('Error fetching activities:', error);
        }
    };

    const fetchStats = async () => {
        try {
            // 1. Basic counts
            const { count: investorsCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'investor');
            const { count: startupsCount } = await supabase.from('startups').select('*', { count: 'exact', head: true });
            const { count: matchesCount } = await supabase.from('matches').select('*', { count: 'exact', head: true }).eq('is_top_selected', true);

            // 2. Rounds stats
            const { count: activeRoundsCount } = await supabase.from('rounds').select('*', { count: 'exact', head: true }).eq('status', 'active');
            const { count: completedRoundsCount } = await supabase.from('rounds').select('*', { count: 'exact', head: true }).eq('status', 'completed');

            // 3. Average matches per investor
            const avgMatches = investorsCount > 0 ? (matchesCount / investorsCount).toFixed(1) : 0;

            // 4. Top Startups (aggregation)
            const { data: selections } = await supabase
                .from('matches')
                .select('startup_id, startups(name, sector)')
                .eq('is_top_selected', true);

            const grouped = selections?.reduce((acc, curr) => {
                const id = curr.startup_id;
                if (!acc[id]) acc[id] = { name: curr.startups?.name, count: 0, sector: curr.startups?.sector };
                acc[id].count += 1;
                return acc;
            }, {});

            const top = Object.values(grouped || {})
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            // 5. Top Sectors
            const { data: startups } = await supabase
                .from('startups')
                .select('sector');

            const sectorCounts = startups?.reduce((acc, curr) => {
                const sector = curr.sector || 'Other';
                acc[sector] = (acc[sector] || 0) + 1;
                return acc;
            }, {});

            const topSectors = Object.entries(sectorCounts || {})
                .map(([sector, count]) => ({ sector, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            setStats({
                totalInvestors: investorsCount || 0,
                totalStartups: startupsCount || 0,
                totalMatches: matchesCount || 0,
                topStartups: top,
                activeRounds: activeRoundsCount || 0,
                completedRounds: completedRoundsCount || 0,
                avgMatchesPerInvestor: avgMatches,
                topSectors
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Total Investors', value: stats.totalInvestors, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Startups Registered', value: stats.totalStartups, icon: Rocket, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { label: 'Total Coups de cœur', value: stats.totalMatches, icon: Heart, color: 'text-red-400', bg: 'bg-red-400/10' },
        { label: 'Avg Matches/Investor', value: stats.avgMatchesPerInvestor, icon: Target, color: 'text-green-400', bg: 'bg-green-400/10' },
    ];

    const getTimeAgo = (timestamp) => {
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} min ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const getActivityColor = (color) => {
        const colors = {
            red: { bg: 'bg-red-500/10', text: 'text-red-500' },
            green: { bg: 'bg-green-500/10', text: 'text-green-500' },
            blue: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
            purple: { bg: 'bg-purple-500/10', text: 'text-purple-500' }
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold text-white tracking-tight">System Analytics</h2>
                <p className="text-slate-400">Real-time overview of the matchmaking performance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <Card key={i} className="relative overflow-hidden group">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <span className="text-sm font-medium text-slate-500">{stat.label}</span>
                                <h4 className="text-2xl font-bold text-white mt-1">{stat.value}</h4>
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                            <stat.icon size={80} />
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card title="Top Performing Startups" subtitle="Most selected by investors" className="lg:col-span-2">
                    <div className="space-y-6">
                        {stats.topStartups.length > 0 ? (
                            stats.topStartups.map((s, i) => (
                                <div key={i} className="flex items-center gap-4 group">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-white font-bold">{s.name}</span>
                                            <span className="text-primary-400 font-mono text-xs">{s.count} Selections</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] uppercase tracking-wider text-slate-600 font-bold">{s.sector}</span>
                                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary-500 shadow-[0_0_10px_rgba(14,165,233,0.5)] transition-all duration-1000"
                                                    style={{ width: `${(s.count / stats.totalInvestors) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center text-slate-600">
                                <TrendingUp size={48} className="mx-auto mb-4 opacity-20" />
                                <p>Waiting for the first selections to appear...</p>
                            </div>
                        )}
                    </div>
                </Card>

                <Card title="Engagement Feed" subtitle="Live matchmaking activity">
                    <div className="space-y-3">
                        {activities.length > 0 ? (
                            activities.map((activity, index) => {
                                const colors = getActivityColor(activity.color);
                                return (
                                    <div key={index} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-start gap-4 hover:bg-white/10 transition-colors">
                                        <div className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center ${colors.text} shrink-0`}>
                                            <activity.icon size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-200 font-medium">{activity.message}</p>
                                            {activity.detail && (
                                                <p className="text-xs text-slate-500 mt-1">
                                                    <span className="inline-flex items-center gap-1">
                                                        <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                                        {activity.detail}
                                                    </span>
                                                </p>
                                            )}
                                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1.5 block">
                                                {getTimeAgo(activity.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-10 text-center text-slate-600">
                                <Activity size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No recent activity</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Additional Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Rounds Statistics */}
                <Card title="Rounds Overview" subtitle="Active and completed sessions">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                                    <CheckCircle2 size={20} className="text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Completed Rounds</p>
                                    <p className="text-2xl font-bold text-white">{stats.completedRounds}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                    <Zap size={20} className="text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Active Rounds</p>
                                    <p className="text-2xl font-bold text-white">{stats.activeRounds}</p>
                                </div>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Total Sessions</span>
                                <span className="text-white font-bold">{stats.activeRounds + stats.completedRounds}</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Top Sectors */}
                <Card title="Top Sectors" subtitle="Startup distribution by industry">
                    <div className="space-y-4">
                        {stats.topSectors.length > 0 ? (
                            stats.topSectors.map((sector, index) => {
                                const maxCount = stats.topSectors[0]?.count || 1;
                                const percentage = (sector.count / maxCount) * 100;
                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-300">{sector.sector}</span>
                                            <span className="text-xs text-slate-500 font-mono">{sector.count} startups</span>
                                        </div>
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all duration-1000"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-10 text-center text-slate-600">
                                <PieChart size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No sector data available</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Performance Metrics */}
            <Card title="Performance Metrics" subtitle="Key performance indicators">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-transparent rounded-xl border border-blue-500/20">
                        <BarChart3 size={32} className="mx-auto mb-3 text-blue-400" />
                        <p className="text-3xl font-bold text-white mb-1">
                            {stats.totalMatches > 0 && stats.totalInvestors > 0 
                                ? ((stats.totalMatches / (stats.totalInvestors * stats.totalStartups)) * 100).toFixed(1)
                                : 0}%
                        </p>
                        <p className="text-sm text-slate-400">Conversion Rate</p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl border border-purple-500/20">
                        <Target size={32} className="mx-auto mb-3 text-purple-400" />
                        <p className="text-3xl font-bold text-white mb-1">{stats.avgMatchesPerInvestor}</p>
                        <p className="text-sm text-slate-400">Avg. Selections</p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-transparent rounded-xl border border-green-500/20">
                        <TrendingUp size={32} className="mx-auto mb-3 text-green-400" />
                        <p className="text-3xl font-bold text-white mb-1">
                            {stats.topStartups.length > 0 ? stats.topStartups[0].count : 0}
                        </p>
                        <p className="text-sm text-slate-400">Top Startup Picks</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AdminDashboard;
