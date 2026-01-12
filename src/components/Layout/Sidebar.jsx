import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Rocket,
    Settings,
    LogOut,
    Heart,
    Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const Sidebar = () => {
    const { logout, isAdmin, isInvestor } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        {
            label: 'Dashboard',
            icon: LayoutDashboard,
            path: isAdmin ? '/admin' : '/investor',
            show: true
        },
        {
            label: 'Investors',
            icon: Users,
            path: '/admin/investors',
            show: isAdmin
        },
        {
            label: 'Startups',
            icon: Rocket,
            path: '/admin/startups',
            show: isAdmin
        },
        {
            label: 'Rounds',
            icon: Clock,
            path: '/admin/rounds',
            show: isAdmin
        },
        {
            label: 'Matchmaking',
            icon: Heart,
            path: '/admin/matchmaking',
            show: isAdmin
        },
        {
            label: 'Selections',
            icon: Heart,
            path: '/investor/selections',
            show: isInvestor
        },
    ];

    return (
        <div className="w-64 h-screen glass-dark flex flex-col p-4 fixed left-0 top-0 z-50">
            <div className="flex items-center gap-3 px-2 mb-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    MeetTheInvestor
                </h1>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.filter(item => item.show).map((item) => (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                            location.pathname === item.path
                                ? "bg-primary-500/10 text-primary-400 border border-primary-500/20"
                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <item.icon size={20} className={cn(
                            "transition-colors",
                            location.pathname === item.path ? "text-primary-400" : "group-hover:text-white"
                        )} />
                        <span className="font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="mt-auto border-t border-white/10 pt-4">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
